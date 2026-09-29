// Homepage: pick an age group, then see the games for it.

(() => {
  const ageScreen = document.getElementById("age-screen");
  const gamesScreen = document.getElementById("games-screen");
  const ageGrid = document.getElementById("age-grid");
  const gameGrid = document.getElementById("game-grid");

  document.getElementById("total-stars").textContent = BrainyPlay.totalStars();

  function renderAgeCards() {
    ageGrid.innerHTML = "";
    AGE_GROUPS.forEach((group) => {
      const card = document.createElement("button");
      card.className = "age-card";
      card.style.setProperty("--card-color", group.color);
      card.innerHTML = `
        <span class="age-icon">${group.icon}</span>
        <span class="age-name">${group.name}</span>
        <span class="age-range">${group.ages}</span>
        <span class="age-tagline">${group.tagline}</span>
      `;
      card.addEventListener("click", () => showGames(group.id));
      ageGrid.appendChild(card);
    });
  }

  function gameTile(game, ageId) {
    const tile = document.createElement(game.comingSoon ? "div" : "a");
    tile.className = "game-tile" + (game.comingSoon ? " coming-soon" : "");
    tile.style.setProperty("--tile-color", game.color || "#E4E1F0");

    const badge = game.comingSoon
      ? `<span class="badge">Still baking 🧁</span>`
      : `<span class="badge">⭐ ${BrainyPlay.getStars(game.id)}</span>`;

    tile.innerHTML = `
      <span class="tile-icon">${game.icon}</span>
      <span class="tile-body">
        <span class="tile-title">${game.title}</span>
        <span class="tile-desc">${game.description}</span>
        ${badge}
      </span>
    `;
    if (!game.comingSoon) tile.href = `${game.url}?age=${ageId}`;
    return tile;
  }

  function showGames(ageId) {
    const group = AGE_GROUPS.find((g) => g.id === ageId);
    if (!group) return showAges();

    BrainyPlay.setAge(ageId);
    history.replaceState(null, "", `?age=${ageId}`);

    document.getElementById("games-title").textContent = `${group.icon} ${group.name}`;
    document.getElementById("games-subtitle").textContent =
      `${group.ages}. Pick a game — the brain warms up on its own.`;

    const games = GAMES.filter((g) => g.ageGroups.includes(ageId));
    const playable = games.filter((g) => !g.comingSoon);
    // Playable games first, teasers after.
    gameGrid.innerHTML = "";
    [...playable, ...games.filter((g) => g.comingSoon)].forEach((game) => {
      gameGrid.appendChild(gameTile(game, ageId));
    });

    document.getElementById("empty-note").hidden = playable.length > 0;
    ageScreen.hidden = true;
    gamesScreen.hidden = false;
    document.documentElement.style.setProperty("--age-color", group.color);
  }

  function showAges() {
    BrainyPlay.setAge(null);
    history.replaceState(null, "", location.pathname);
    gamesScreen.hidden = true;
    ageScreen.hidden = false;
  }

  document.getElementById("change-age").addEventListener("click", showAges);

  renderAgeCards();
  const savedAge = BrainyPlay.getAge();
  if (AGE_GROUPS.some((g) => g.id === savedAge)) showGames(savedAge);
})();
