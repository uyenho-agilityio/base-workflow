#!/usr/bin/env node
// PreToolUse hook for the Bash tool. Blocks git and shell commands that the workflow must never run.
//
// Exit 2 blocks the call and prints the reason to stderr. Exit 0 allows it.
//
// Behaviour when there is no .claude/workflow.config.json: the project is not a workflow project,
// so the hook allows everything. When the config exists but cannot be read or validated, the hook
// blocks every Bash call and says why (fail closed).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CONFIG_PATH = '.claude/workflow.config.json';

// Secret files that must never be staged. .env.example is allowed.
const SECRET_FILE = /(^|\/)\.env(\.[^/]+)?$/;
const SECRET_EXCEPTIONS = /(^|\/)\.env\.example$/;
const SECRET_DIRS = /(^|\/)playwright\/\.auth\//;

export function loadConfig(projectDir) {
  const path = join(projectDir, CONFIG_PATH);
  if (!existsSync(path)) return { state: 'absent' };
  try {
    const config = JSON.parse(readFileSync(path, 'utf8'));
    if (!Array.isArray(config.protectedBranches) || config.protectedBranches.length === 0) {
      return { state: 'invalid', reason: 'protectedBranches must be a non-empty array' };
    }
    if (typeof config.baseBranch !== 'string' || typeof config.remote !== 'string') {
      return { state: 'invalid', reason: 'remote and baseBranch must be strings' };
    }
    return { state: 'ok', config };
  } catch (error) {
    return { state: 'invalid', reason: `cannot read ${CONFIG_PATH}: ${error.message}` };
  }
}

// Splits a command into simple commands at &&, ||, ;, |, and newlines.
function segments(command) {
  return command
    .split(/&&|\|\||;|\||\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function tokens(segment) {
  return segment.split(/\s+/).filter(Boolean);
}

// Finds the args of a git subcommand inside one segment. Handles `git -C <path> <sub>`.
function gitCall(segment) {
  const t = tokens(segment);
  const i = t.indexOf('git');
  if (i === -1) return null;
  let j = i + 1;
  if (t[j] === '-C') j += 2;
  if (j >= t.length) return null;
  return { sub: t[j], args: t.slice(j + 1) };
}

// Returns a reason string when the command must be blocked, or null when it may run.
// `currentBranch` is passed in so tests do not need a real repo.
export function checkCommand(command, { config, currentBranch = '' }) {
  const protectedSet = new Set(config.protectedBranches);

  // Whole-command checks first, because they span pipes.
  if (/\b(curl|wget)\b[^|]*\|\s*(sh|bash|zsh)\b/.test(command)) {
    return 'piping a download into a shell is not allowed';
  }

  for (const seg of segments(command)) {
    const git = gitCall(seg);

    if (git && git.sub === 'push') {
      if (git.args.some((a) => a === '--force' || a === '-f' || a.startsWith('--force-') || a === '--mirror' || a === '--all')) {
        return 'force push and push --all/--mirror are not allowed';
      }
      if (git.args.includes('--no-verify')) return '--no-verify is not allowed';

      const positional = git.args.filter((a) => !a.startsWith('-'));
      const refspecs = positional.slice(1); // first positional is the remote
      if (refspecs.length === 0) {
        if (protectedSet.has(currentBranch)) {
          return `bare git push while on protected branch '${currentBranch}'`;
        }
        continue;
      }
      for (const spec of refspecs) {
        const [src, dstRaw] = spec.includes(':') ? spec.split(':', 2) : [spec, spec];
        let dst = dstRaw.replace(/^refs\/heads\//, '');
        if (dst === 'HEAD' || dst === '') {
          dst = (src === 'HEAD' || src === '') ? currentBranch : src;
        }
        if (protectedSet.has(dst)) {
          return `push to protected branch '${dst}' is not allowed`;
        }
      }
    }

    if (git && git.sub === 'commit' && (git.args.includes('--no-verify') || git.args.includes('-n'))) {
      return '--no-verify is not allowed';
    }

    if (git && git.sub === 'add') {
      for (const a of git.args) {
        if (a.startsWith('-')) continue;
        if (SECRET_EXCEPTIONS.test(a)) continue;
        if (SECRET_FILE.test(a) || SECRET_DIRS.test(a)) {
          return `staging secret file '${a}' is not allowed`;
        }
      }
    }

    const t = tokens(seg);
    if (t[0] === 'rm') {
      const flags = t.filter((x) => x.startsWith('-')).join('');
      const recursive = /r/i.test(flags) || t.includes('--recursive');
      const force = /f/.test(flags) || t.includes('--force');
      const targets = t.slice(1).filter((x) => !x.startsWith('-'));
      const dangerous = targets.some((x) => ['/', '/*', '~', '~/', '$HOME', '${HOME}', '.'].includes(x));
      if (recursive && force && dangerous) {
        return 'rm -rf on a root, home, or current directory is not allowed';
      }
    }
  }

  return null;
}

function currentBranchOf(projectDir) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: projectDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function main() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const loaded = loadConfig(projectDir);

  if (loaded.state === 'absent') return 0;

  if (loaded.state === 'invalid') {
    process.stderr.write(`BLOCKED (workflow guard): ${loaded.reason}. Fix ${CONFIG_PATH} or remove it.\n`);
    return 2;
  }

  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    process.stderr.write('BLOCKED (workflow guard): cannot read the hook input\n');
    return 2;
  }

  const command = input?.tool_input?.command;
  if (!command) return 0;

  const reason = checkCommand(command, {
    config: loaded.config,
    currentBranch: currentBranchOf(projectDir),
  });

  if (reason) {
    process.stderr.write(`BLOCKED (workflow guard): ${reason}\n`);
    return 2;
  }
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`BLOCKED (workflow guard): ${error.message}\n`);
    process.exitCode = 2;
  }
}
