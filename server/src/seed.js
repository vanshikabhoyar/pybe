const { resetData } = require('./data/store');
require('dotenv').config();

const scenarios = [
  // 🗝️ Ali Baba and 40 Thieves (Ali Baba & 40 Chor)
  {
    title: 'Ali Baba & The 40 Thieves: Secret Treasure Register',
    difficulty: 'Beginner',
    concepts: ['lists'],
    context: 'Ali Baba finds a hidden cave in the forest filled with chest after chest of gold coins and jewels left behind by the 40 thieves. He needs a way to keep an ordered list of all stolen treasure items discovered inside the cave.',
    prompt: 'How would you use a Python List to store the order of treasures found inside the secret cave?',
    objectives: ['Store multiple items in an ordered sequence', 'Use bracket notation [] for lists', 'Append new treasures as they are discovered'],
    sampleReasoning: 'I will store all treasure item names inside a single Python List, using list.append() to add each new treasure chest.',
    effectivenessScore: 98
  },
  {
    title: 'Ali Baba & The Secret Passwords',
    difficulty: 'Explorer',
    concepts: ['dictionaries'],
    context: 'The magic door of the 40 Thieves only opens when you speak the exact matching magical command phrase. Ali Baba wants to store key magic locations and their corresponding secret password phrases.',
    prompt: 'How would a Python Dictionary help Ali Baba map location names (keys) to their secret password phrases (values)?',
    objectives: ['Understand Key-Value pairs', 'Use curly braces {} for dictionaries', 'Lookup passwords by location key'],
    sampleReasoning: 'A Python Dictionary lets me pair key names like "Cave Door" directly with values like "Open Sesame" for instant lookup.',
    effectivenessScore: 97
  },

  // 🐦 Panchatantra: The Thirsty Crow
  {
    title: 'Panchatantra: The Thirsty Crow & Pebble Collection',
    difficulty: 'Beginner',
    concepts: ['lists'],
    context: 'A thirsty crow finds a pitcher with water at the bottom, but cannot reach it. The crow decides to collect pebbles from the ground one by one and drop them into the pitcher until the water rises.',
    prompt: 'How would you represent the pebbles collected in a Python List and check how many pebbles have been added?',
    objectives: ['Initialize an empty list', 'Add items using .append()', 'Check total pebble count using len()'],
    sampleReasoning: 'I will start with an empty list pebbles = [] and append each pebble collected. Using len(pebbles) will tell us if enough water raised.',
    effectivenessScore: 96
  },

  // 🐢 Panchatantra: The Tortoise & The Hare
  {
    title: 'Panchatantra: The Tortoise & Hare Race Checkpoints',
    difficulty: 'Beginner',
    concepts: ['lists'],
    context: 'During the famous forest race, the judge monkey marks down each checkpoint the steady tortoise reaches in sequential order from Start to Finish line.',
    prompt: 'How can a Python List store the race checkpoints in order and find out which checkpoint the tortoise is currently at?',
    objectives: ['Access list elements by index', 'Understand 0-based indexing', 'Track sequential progress in lists'],
    sampleReasoning: 'A Python List preserves the exact order of race checkpoints. Using checkpoints[0] gives the start line and checkpoints[-1] gives the finish line.',
    effectivenessScore: 95
  },

  // 🧠 Tenali Rama & King Krishnadevaraya's Clues
  {
    title: 'Tenali Rama: Royal Palace Inventory Map',
    difficulty: 'Explorer',
    concepts: ['dictionaries'],
    context: 'King Krishnadevaraya asks Tenali Rama to audit the royal vault. Tenali Rama needs a data structure where each room name is mapped to the count of gold vessels stored inside that room.',
    prompt: 'Why is a Python Dictionary better than a simple list when searching for item counts by room name?',
    objectives: ['Assign counts to unique keys', 'Update values associated with keys', 'Retrieve values instantly without searching line by line'],
    sampleReasoning: 'A Python Dictionary allows instant lookup vault["Treasury Room"] to get the exact count of gold vessels without looping through everything.',
    effectivenessScore: 94
  },

  // 🍲 Akshaya Patra Legend
  {
    title: 'Akshaya Patra: The Infinite Feast Container',
    difficulty: 'Builder',
    concepts: ['lists', 'dictionaries'],
    context: 'The legendary vessel Akshaya Patra yields endless varieties of food during a feast. The royal chef wants to maintain a list of menu items and a dictionary mapping each dish to its spice rating.',
    prompt: 'How can you combine a Python List of menu items with a Python Dictionary of dish attributes?',
    objectives: ['Combine Lists and Dictionaries', 'Store complex attributes in dictionaries', 'Iterate over list of dishes'],
    sampleReasoning: 'I will keep a list of dish names and use a dictionary menu_spices = {"Kheer": "Sweet", "Curry": "Spicy"} to store their details.',
    effectivenessScore: 93
  }
];

function seed() {
  resetData(scenarios);
  console.log(`Seeded ${scenarios.length} story-driven Python Data Structure scenarios (Ali Baba, Panchatantra, Tenali Rama)`);
}

if (require.main === module) {
  seed();
}

module.exports = seed;
