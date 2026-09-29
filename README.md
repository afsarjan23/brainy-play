# 🧠 Brainy Play

Free, ad-free learning games for kids aged 3–12. Plain HTML, CSS and JavaScript: no build step, no backend.

## Run locally
Open `index.html` in a browser.

## Add a game
1. Create a folder in `games/<game-id>/` with an `index.html`.
2. Add an entry to `js/games.js` with the age groups it belongs to (`"3-5"`, `"6-8"`, `"9-12"`).
3. In the game, include `../../js/utils.js` to use shared helpers (`BrainyPlay.speak`, `BrainyPlay.addStars`, `BrainyPlay.getAge`, …).

## Games
| Game | Ages |
|---|---|
| 🔤 Word Builder | 3–5 (3-letter words), 6–8 (4–5 letters + decoys) |
