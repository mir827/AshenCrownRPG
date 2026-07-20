# Project Coding Guide

This is a browser-only Three.js fantasy RPG built with Vite. Keep it dependency-light and preserve its original setting and procedural asset approach.

- Think before coding and state assumptions that materially change game behavior.
- Make focused changes tied to an observable player outcome.
- Do not introduce external art, audio, story, characters, trademarks, or copied examples without explicit approval and license review.
- Keep gameplay state in `src/gameState.js` testable without WebGL; keep rendering and input in `src/main.js`.
- Preserve keyboard play, legible responsive HUD, and browser compatibility.
- Before completion run `npm test` and `npm run build`; for interaction changes also perform a browser smoke test.
- Do not claim visual or interaction behavior without runtime evidence.
