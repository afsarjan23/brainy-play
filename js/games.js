// Every game on the site. To add a game: build it in games/<id>/ and add an entry here.
// Set comingSoon: true to show a greyed-out teaser tile instead of a playable one.

const GAMES = [
  {
    id: "word-builder",
    title: "Word Builder",
    icon: "🔤",
    description: "Spell the picture. Letters included, brains required.",
    ageGroups: ["3-5", "6-8"],
    url: "games/word-builder/",
    color: "#FFD166",
  },

  // ----- Coming soon -----
  {
    id: "count-critters",
    title: "Count the Critters",
    icon: "🐞",
    description: "How many ladybugs? No, they won't sit still.",
    ageGroups: ["3-5"],
    comingSoon: true,
  },
  {
    id: "shape-sorter",
    title: "Shape Sorter",
    icon: "🔺",
    description: "Squares go here. Circles go… not there.",
    ageGroups: ["3-5"],
    comingSoon: true,
  },
  {
    id: "balloon-pop-math",
    title: "Balloon Pop Math",
    icon: "🎈",
    description: "Pop the right answer. Very loud maths.",
    ageGroups: ["6-8"],
    comingSoon: true,
  },
  {
    id: "memory-match",
    title: "Memory Match",
    icon: "🃏",
    description: "Find the twins before they wander off.",
    ageGroups: ["6-8", "9-12"],
    comingSoon: true,
  },
  {
    id: "clock-reader",
    title: "Clock Reader",
    icon: "⏰",
    description: "Tell the time like it's 1985.",
    ageGroups: ["9-12"],
    comingSoon: true,
  },
  {
    id: "flag-explorer",
    title: "Flag Explorer",
    icon: "🌍",
    description: "Name that flag, globe-trotter.",
    ageGroups: ["9-12"],
    comingSoon: true,
  },
];
