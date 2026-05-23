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
- Do not run endless autonomous changes in one session. Prefer small commits and reviewable diffs.

## Multi-Agent Cycle

Work on `/v4/` must proceed cycle-by-cycle in this order:

1. **Planner**
   - Writes issues, backlog items, and acceptance criteria.
   - Does not modify implementation files.
2. **Builder**
   - Implements only selected Planner issues.
   - Keeps changes small, scoped, and testable.
   - Must stop feature work if a P0 bug exists.
3. **QA**
   - Performs browser validation, regression checks, and evidence capture.
   - Does not add product features.
   - May update `/v4/QA_EVIDENCE.md` or tests only when necessary.
4. **Release Manager**
   - Checks diff scope, asset versions, tests, QA evidence, commits, pushes, Pages source, and release notes.
   - Releases only if QA says `PASS TO RELEASE`.

Do not continue to another cycle in the same session unless the user or Planner explicitly asks.

Every cycle must complete these gates:

1. Planner picks at most 3 tasks and records acceptance criteria.
2. Builder implements only those approved tasks.
3. QA verifies:
   - `/v4/` loads.
   - "开始飞行" starts the game.
   - HUD appears.
   - Canvas updates.
   - Space key works.
   - Mouse/touch works.
   - Pause/resume works.
   - Treasure opens.
   - Settings opens.
   - Game Over path works or is simulated.
   - `/v4/test.html` passes.
   - Console has no errors.
4. Release Manager checks diff scope, asset versions, tests, QA evidence, protected areas, dependencies, and Pages source before pushing.
5. Release Manager writes the next cycle proposal in `/v4/AGENT_HANDOFF.md`.

"开始飞行" is a hard release gate. If it does not work, stop feature work and run a hotfix cycle first.

## Required First-Time Setup Sequence

For a new Codex agent or fresh repository setup, follow this sequence before ordinary feature work:

1. Create or update `AGENTS.md` with the project rules.
2. Run the V4 start-failure hotfix if "开始飞行" does not work.
3. After the hotfix, create or update `/v4/CODEX_BACKLOG.md`.
4. Proceed cycle-by-cycle: Planner -> Builder -> QA -> Release Manager.

The current V4 baseline has already completed the start-failure hotfix, backlog, QA evidence, and Cycle 14 release notes. The next sequential work cycle is Cycle 15 unless `/v4/AGENT_HANDOFF.md` says otherwise. Future agents should verify the latest files instead of assuming this note is still current.

## Simplification Audit

Every 5 cycles, run a Simplification Audit before continuing feature work:

1. Are there too many effects?
2. Is the game still easy to understand?
3. Does `/v4/` start reliably?
4. Is browser QA still passing?
5. Did any feature increase child frustration?
6. Did any animation bypass reduced motion?
7. Can code be simplified without deleting protected versions?

Record the audit outcome in `/v4/AGENT_HANDOFF.md` and, when useful, `/v4/CODEX_BACKLOG.md`.

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
