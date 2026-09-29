// Shared helpers for Brainy Play: saved progress, age choice, speech and small utilities.

const BrainyPlay = (() => {
  const STORE_KEY = "brainyplay";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
      // Storage blocked (private mode etc.) — the games still work, progress just isn't kept.
    }
  }

  // The age in the URL (?age=3-5) wins over the saved one, so links can be shared.
  function getAge() {
    const fromUrl = new URLSearchParams(location.search).get("age");
    return fromUrl || load().age || null;
  }

  function setAge(age) {
    const data = load();
    if (age) data.age = age;
    else delete data.age;
    save(data);
  }

  function getStars(gameId) {
    return (load().stars || {})[gameId] || 0;
  }

  function addStars(gameId, count) {
    const data = load();
    data.stars = data.stars || {};
    data.stars[gameId] = (data.stars[gameId] || 0) + count;
    save(data);
  }

  function totalStars() {
    return Object.values(load().stars || {}).reduce((sum, n) => sum + n, 0);
  }

  // Saves a round score if it beats the previous best. Returns the best score.
  function recordBest(gameId, age, score) {
    const data = load();
    data.best = data.best || {};
    const key = `${gameId}:${age}`;
    data.best[key] = Math.max(data.best[key] || 0, score);
    save(data);
    return data.best[key];
  }

  let voice = null;
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    voice = voices.find((v) => v.lang === "en-US" && /samantha|google|female/i.test(v.name))
      || voices.find((v) => v.lang.startsWith("en"))
      || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.pitch = 1.15;
    speechSynthesis.speak(utterance);
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  return { getAge, setAge, getStars, addStars, totalStars, recordBest, speak, shuffle, pick };
})();
