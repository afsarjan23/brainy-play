// Word Builder: look at the picture, tap the letters in order to spell it.

(() => {
  const GAME_ID = "word-builder";
  const ROUND_SIZE = 10;
  const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVWY"; // no Q, X, Z as decoys — too sneaky
  const TILE_COLORS = ["#EF6C3B", "#3A86FF", "#8338EC", "#06B584", "#E83E9B", "#F4A300"];

  // Difficulty is set by the age group chosen on the homepage.
  const SETTINGS = {
    "3-5": { words: WORDS.easy, decoys: 0, autoSpeak: true, sayLetters: true },
    "6-8": { words: WORDS.medium, decoys: 2, autoSpeak: false, sayLetters: false },
  };

  const PRAISE = [
    "Spell-tacular! 🎉",
    "Word wizard alert! 🧙",
    "Nailed it! 🔨",
    "Your brain is showing off! 😎",
    "Dictionary, is that you? 📚",
    "Boom! Spelled it! 💥",
    "Letter-ly amazing! ✨",
  ];
  const OOPS = [
    "Oops! The letters got shy. Try again! 🙈",
    "So close! The letters are giggling. 🤭",
    "Hmm, that one's wiggly. Have another go! 🐛",
    "Not quite — the letters did a silly dance! 💃",
  ];

  const age = SETTINGS[BrainyPlay.getAge()] ? BrainyPlay.getAge() : "3-5";
  const settings = SETTINGS[age];

  const el = {
    picture: document.getElementById("picture"),
    slots: document.getElementById("slots"),
    tiles: document.getElementById("tiles"),
    message: document.getElementById("message"),
    wordNum: document.getElementById("word-num"),
    wordTotal: document.getElementById("word-total"),
    roundStars: document.getElementById("round-stars"),
    hint: document.getElementById("btn-hint"),
    results: document.getElementById("results"),
    confetti: document.getElementById("confetti"),
  };

  // Round state
  let roundWords = [];
  let index = 0;
  let score = 0;

  // Word state
  let target = "";
  let tiles = [];     // [{ letter, used, color }]
  let slots = [];     // tile index in each slot, or null
  let locked = [];    // slots filled by a hint can't be removed
  let clean = true;   // solved with no mistakes or hints → earns a star
  let busy = false;   // ignore taps during feedback animations

  function startRound() {
    roundWords = BrainyPlay.shuffle(settings.words).slice(0, ROUND_SIZE);
    index = 0;
    score = 0;
    el.wordTotal.textContent = roundWords.length;
    el.roundStars.textContent = score;
    el.results.hidden = true;
    loadWord();
  }

  function loadWord() {
    const { word, emoji } = roundWords[index];
    target = word;

    const decoys = [];
    const pool = [...ALPHABET].filter((l) => !word.includes(l));
    for (let i = 0; i < settings.decoys; i++) decoys.push(BrainyPlay.pick(pool));

    let letters;
    do {
      letters = BrainyPlay.shuffle([...word, ...decoys]);
    } while (letters.join("").startsWith(word) && word.length > 1);

    tiles = letters.map((letter, i) => ({
      letter,
      used: false,
      color: TILE_COLORS[i % TILE_COLORS.length],
    }));
    slots = Array(word.length).fill(null);
    locked = Array(word.length).fill(false);
    clean = true;
    busy = false;

    el.wordNum.textContent = index + 1;
    el.picture.textContent = emoji;
    el.picture.setAttribute("aria-label", word.toLowerCase());
    el.picture.classList.remove("pop");
    void el.picture.offsetWidth; // restart the animation
    el.picture.classList.add("pop");
    el.message.textContent = settings.autoSpeak
      ? "Listen, then spell it! 👂"
      : "What's this? Spell it! 🤔";

    render();
    if (settings.autoSpeak) setTimeout(() => BrainyPlay.speak(word.toLowerCase()), 400);
  }

  function render() {
    el.slots.innerHTML = "";
    slots.forEach((tileIndex, i) => {
      const slot = document.createElement("button");
      slot.className = "slot";
      if (tileIndex !== null) {
        slot.classList.add("filled");
        slot.textContent = tiles[tileIndex].letter;
        slot.setAttribute("aria-label", `Remove ${tiles[tileIndex].letter}`);
      } else {
        slot.setAttribute("aria-label", `Empty spot ${i + 1}`);
      }
      if (locked[i]) slot.classList.add("locked");
      slot.addEventListener("click", () => removeFromSlot(i));
      el.slots.appendChild(slot);
    });

    el.tiles.innerHTML = "";
    tiles.forEach((tile, i) => {
      const button = document.createElement("button");
      button.className = "tile" + (tile.used ? " used" : "");
      button.textContent = tile.letter;
      button.style.setProperty("--tile-color", tile.color);
      button.setAttribute("aria-label", `Letter ${tile.letter}`);
      button.addEventListener("click", () => placeTile(i));
      el.tiles.appendChild(button);
    });
  }

  function placeTile(tileIndex) {
    if (busy || tiles[tileIndex].used) return;
    const empty = slots.indexOf(null);
    if (empty === -1) return;

    slots[empty] = tileIndex;
    tiles[tileIndex].used = true;
    if (settings.sayLetters) BrainyPlay.speak(tiles[tileIndex].letter);
    render();
    if (!slots.includes(null)) checkWord();
  }

  function removeFromSlot(i) {
    if (busy || locked[i] || slots[i] === null) return;
    tiles[slots[i]].used = false;
    slots[i] = null;
    render();
  }

  function checkWord() {
    const attempt = slots.map((t) => tiles[t].letter).join("");
    if (attempt === target) celebrate();
    else tryAgain();
  }

  function celebrate() {
    busy = true;
    if (clean) {
      score++;
      BrainyPlay.addStars(GAME_ID, 1);
      el.roundStars.textContent = score;
    }
    [...el.slots.children].forEach((s) => s.classList.add("correct"));
    el.message.textContent = clean ? BrainyPlay.pick(PRAISE) : "You got it! 👏";
    BrainyPlay.speak(target.toLowerCase());
    confetti();

    setTimeout(() => {
      index++;
      if (index < roundWords.length) loadWord();
      else showResults();
    }, 1900);
  }

  function tryAgain() {
    busy = true;
    clean = false;
    el.message.textContent = BrainyPlay.pick(OOPS);

    const wrong = slots.map((t, i) => tiles[t].letter !== target[i]);
    [...el.slots.children].forEach((s, i) => wrong[i] && s.classList.add("wrong"));

    // Send only the wrong letters back; keep the right ones in place.
    setTimeout(() => {
      wrong.forEach((isWrong, i) => {
        if (isWrong && !locked[i]) {
          tiles[slots[i]].used = false;
          slots[i] = null;
        }
      });
      busy = false;
      render();
    }, 900);
  }

  function giveHint() {
    if (busy) return;
    const i = slots.findIndex((t, pos) => t === null || tiles[t].letter !== target[pos]);
    if (i === -1) return;

    clean = false;
    const needed = target[i];

    if (slots[i] !== null) {
      tiles[slots[i]].used = false;
      slots[i] = null;
    }

    let tileIndex = tiles.findIndex((t) => !t.used && t.letter === needed);
    if (tileIndex === -1) {
      // The letter we need is sitting in the wrong spot — borrow it back.
      const from = slots.findIndex((t, pos) =>
        t !== null && !locked[pos] && tiles[t].letter === needed && target[pos] !== needed);
      tileIndex = slots[from];
      slots[from] = null;
    }

    slots[i] = tileIndex;
    tiles[tileIndex].used = true;
    locked[i] = true;
    el.message.textContent = "Psst… here's a clue! 🤫";
    render();
    if (!slots.includes(null)) checkWord();
  }

  function confetti() {
    const bits = ["🎉", "⭐", "✨", "🎈", "💛", "🌟"];
    for (let i = 0; i < 26; i++) {
      const bit = document.createElement("span");
      bit.textContent = BrainyPlay.pick(bits);
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.animationDelay = `${Math.random() * 0.4}s`;
      el.confetti.appendChild(bit);
      setTimeout(() => bit.remove(), 2100);
    }
  }

  function showResults() {
    const best = BrainyPlay.recordBest(GAME_ID, age, score);
    const total = roundWords.length;
    let icon, title;
    if (score === total) { icon = "🏆"; title = "PERFECT! Are you secretly a dictionary?"; }
    else if (score >= total * 0.7) { icon = "🌟"; title = "Spell-tacular job!"; }
    else if (score >= total * 0.4) { icon = "🚀"; title = "Nice work, word wizard!"; }
    else { icon = "🌱"; title = "Every champion starts somewhere!"; }

    document.getElementById("results-icon").textContent = icon;
    document.getElementById("results-title").textContent = title;
    document.getElementById("results-text").textContent =
      `You earned ${score} ⭐ out of ${total}. Your best: ${best} ⭐`;
    el.results.hidden = false;
    confetti();
    BrainyPlay.speak(title.replace(/[^\w\s!?,']/g, ""));
  }

  // Keyboard play: type a letter to place it, Backspace to take one back.
  document.addEventListener("keydown", (e) => {
    if (!el.results.hidden) return;
    if (e.key === "Backspace") {
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i] !== null && !locked[i]) return removeFromSlot(i);
      }
      return;
    }
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      const tileIndex = tiles.findIndex((t) => !t.used && t.letter === letter);
      if (tileIndex !== -1) placeTile(tileIndex);
    }
  });

  document.getElementById("btn-speak").addEventListener("click", () => BrainyPlay.speak(target.toLowerCase()));
  el.hint.addEventListener("click", giveHint);
  document.getElementById("btn-again").addEventListener("click", startRound);

  startRound();
})();
