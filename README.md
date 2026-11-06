# SorteGol

Sorteos de equipos, partidos y torneos parejos para jugar al FC 26 con amigos.
React + TypeScript + Tailwind CSS + Vite + PWA (vite-plugin-pwa) + Local Storage.

## Cómo correrlo

```bash
npm install
npm run dev        # desarrollo
npm run build      # versión final en /dist
npm run preview    # probar la versión final (acá funciona la PWA)
```

Necesitás Node 18 o superior.

## Tu imagen de fondo

Reemplazá `public/fondo.jpg` por tu imagen (mismo nombre). Se muestra con un velo azul
oscuro encima para que los textos se lean bien. Recomendado: 1920×1080 o más, JPG.

## Editar equipos y valoraciones

Todo está en `src/teams.ts`. Cada línea es `['Nombre', 'LIGA', valoración]`.
Los números son aproximados, no oficiales.

## Estructura

```
index.html, package.json, vite.config.ts, tailwind.config.js, postcss.config.js, tsconfig.json
public/   icon.svg, pwa-192.png, pwa-512.png, apple-touch-icon.png, fondo.jpg
src/      main.tsx, App.tsx, index.css, types.ts, storage.ts, teams.ts, draw.ts, tournament.ts,
          ui.tsx, TeamBadge.tsx, Reel.tsx, Confetti.tsx,
          MatchPage.tsx, TournamentPage.tsx, TournamentView.tsx, TeamsPage.tsx, vite-env.d.ts
```
