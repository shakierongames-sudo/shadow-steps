# Shadow Steps

Shadow Steps is a dark-fantasy, solo-leveling inspired progression tracker. The app is honesty-based in v0.3: users complete daily quests, gain XP, improve stats, build streaks, unlock ranks, and challenge boss gates from local device progress.

## v0.3 Visual Identity Update

This version adds a branded presentation layer:

- Shadow Steps logo and launcher icon.
- First-load splash screen with system initialisation copy.
- Hunter Omen avatar art on the dashboard and profile screen.
- Fenrir's Echo boss banner for the Gates presentation.
- Boss result modal styling for `GATE CLEARED` and `RETREAT FORCED`.
- Improved badge and title display in the profile/settings screen.

## Asset Structure

```text
public/assets/brand/shadow-steps-logo.png
public/assets/brand/shadow-steps-icon.png
public/assets/characters/hunter-omen.png
public/assets/bosses/fenrir-echo-banner.png
public/assets/concept/shadow-steps-boss-lineup-poster.png
```

The concept poster is used only as a future Boss Codex preview.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

The production build is written to `dist`.

## Netlify

Netlify is configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

The app also includes an SPA redirect fallback to `index.html`.

## Current MVP Features

- Daily quests for movement, exercise, hydration, nutrition, recovery, and focus.
- XP, levels, rank tiers, player power, streaks, stats, system log, badges, and titles.
- Gates tab with boss challenge presentation and honesty-based outcomes.
- Local persistence with `localStorage` under `shadowStepsProgress`.
- PWA manifest, branded app icon, service worker, and offline fallback.
- Mobile-first dark system interface.

## Future Planned Features

- Supabase leaderboards.
- Optional verification.
- Boss Codex.
- Extra avatar styles.
- Additional boss gates and rank-up trials.
