# QA Evidence — Cycle 12 Browser Validation

This document compiles the browser validation results and screenshot evidence captured for the game under Cycle 12.

## Summary of QA Run
- **Date**: 2026-05-23
- **Branch**: `main`
- **Scope**: `/v4/`
- **App Version**: `v=17`
- **Overall Status**: **PASS**
- **Console Errors**: None (aside from expected mock warnings under simulation/JSDOM). All assets loaded with HTTP 200.

---

## Test Cases & Results

| Screen / Feature | Tested URL | Result | Notes / Visual Check |
|---|---|---|---|
| **Home (Start) Screen** | `http://localhost:8000/v4/` | **PASS** | Title, start button, settings button, and layout render correctly. |
| **Debug Mode Home** | `http://localhost:8000/v4/?debug=1` | **PASS** | Debug overlay shows up correctly on the right. |
| **Game Playing** | `http://localhost:8000/v4/?screen=playing` | **PASS** | Canvas initializes, player butterfly starts flying, stars and obstacles spawn. |
| **Pause Screen** | `http://localhost:8000/v4/?screen=pause` | **PASS** | Game freezes, pause dialog overlay overlay shows resume/restart/home buttons. |
| **Treasure Screen** | `http://localhost:8000/v4/?screen=treasure` | **PASS** | Stickers tab and cosmetics tab show, unlocked items active, locked items styled as locked. |
| **Settings Screen** | `http://localhost:8000/v4/?screen=settings` | **PASS** | Assistive settings, volume control, and parental controls display correctly. |
| **Game Over Screen** | `http://localhost:8000/v4/?screen=gameover` | **PASS** | Displays final score, best performance summary, and restart buttons. |
| **Calm Mode** | `http://localhost:8000/v4/?screen=settings&calm=1` | **PASS** | Particle multipliers and speed adjustments are set under calm mode settings. |
| **Reduced Motion** | `http://localhost:8000/v4/?screen=settings&reduced=1` | **PASS** | Motion settings are properly detected and reduced motion flags are active. |
| **Smoke Tests** | `http://localhost:8000/v4/test.html` | **PASS** | Verification suite renders green and runs all 16 test cases successfully. |

---

## Visual Evidence

### 1. Home Screen
![Home Screen](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/home.png)

### 2. Debug Mode Home Screen
![Debug Mode Home](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/debug_home.png)

### 3. Game Playing Screen
![Game Playing](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/playing.png)

### 4. Pause Screen
![Pause Screen](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/pause.png)

### 5. Treasure Screen
![Treasure Screen](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/treasure.png)

### 6. Settings Screen
![Settings Screen](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/settings.png)

### 7. Game Over Screen
![Game Over Screen](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/gameover.png)

### 8. Calm Mode Screen
![Settings Screen Calm Mode](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/settings_calm.png)

### 9. Reduced Motion Screen
![Settings Screen Reduced Motion](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/settings_reduced.png)

### 10. Smoke Tests
![Smoke Tests](/Users/tian/.gemini/antigravity/brain/2de3b5ec-9c72-4eac-b6b4-2711ecdcf195/screenshots/test.png)
