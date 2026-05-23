# AGENTS.md

## Project

- Repository: `https://github.com/timkok/iris-butterfly-adventure`
- Live site: `https://timkok.github.io/iris-butterfly-adventure/`
- Long-term goal: continuously improve `/v4/` as a child-friendly rainbow garden flying game while preserving all older versions.

## Workflow

- The primary workflow is to modify the GitHub repository files and commit/push the changes to the actual GitHub Pages publishing source.
- Local files may be used as a backup or temporary work area, but do not treat local-first validation as the main source of truth.
- Final acceptance should be based on the latest GitHub repository files, latest commit, and GitHub Pages build/deploy status.
- Do not use a stale `github.io` page as the primary success signal, because GitHub Pages/CDN/browser cache may lag.
- If CSS or JavaScript changes are made, increment the cache-buster versions in the relevant HTML files.

## Protected Areas

- Do not modify `/legacy-v1/`.
- Do not modify root V2 files unless explicitly requested.
- Do not modify `/v3/` unless explicitly requested.
- Default active scope is `/v4/`.

## Allowed

- Modify files under `/v4/`.
- Add documentation under `/v4/`.
- Add tests under `/v4/`.
- Update `/v4/index.html` and `/v4/test.html` cache-buster versions.

## Forbidden

- Do not delete files or directories without explicit user confirmation.
- Do not add frameworks or build tools.
- Do not change the GitHub Pages source.
- Do not touch secrets, tokens, SSH keys, or credentials.
- Do not run dangerous commands:
  - `rm -rf /`
  - `rm -rf ~`
  - `rm -rf /Users`
  - `find / -delete`
  - `git clean -fdx`
  - `sudo rm`

## Required Before Coding

1. Read `/v4/AGENT_HANDOFF.md`.
2. Read `/v4/index.html`.
3. Read relevant files in `/v4/js/`.
4. Check `git status`.
5. Identify the task type:
   - hotfix
   - QA
   - product improvement
   - UI improvement
   - accessibility
   - refactor
   - release

## Required For Every Code Change

1. Keep changes scoped to `/v4/`.
2. Run existing tests.
3. If the task touches gameplay startup, UI binding, or scripts, perform browser QA.
4. Increment asset versions in:
   - `/v4/index.html`
   - `/v4/test.html`
5. Update `/v4/AGENT_HANDOFF.md`.
6. Commit with a clear message.
7. Push to `main` only after tests pass.

## Required QA

- `/v4/` loads.
- "开始飞行" starts the game.
- HUD appears.
- Space key works.
- Mouse/touch works.
- Pause/resume works.
- Treasure opens.
- Settings opens.
- Game Over path works or is simulated.
- `/v4/test.html` passes.
- Console has no errors.

## Stop And Ask Only If

- Deleting files is required.
- Protected versions must be modified.
- An external dependency is required.
- The GitHub Pages source must change.
- Tests fail after two repair attempts.
- `git push` fails.
- Sensitive file access is needed.
- Task requirements conflict.

## Final Response Checklist

Always include:

- Modified files.
- Commit hash.
- Branch pushed to.
- GitHub Pages source.
- Current CSS/JS version numbers.
