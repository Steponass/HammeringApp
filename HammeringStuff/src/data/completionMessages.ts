const COMPLETION_MESSAGES = [
  "What a beautiful mess you've made. Reset to relive it ↗️",
  "You nailed it. And everything else. Want more? Reset ↗️", 
  "Another masterpiece in blunt force. Go smash again ↗️",
  "No lessons learned. That's commitment. Reset ↗️",
  "Brute force wins again. Replay the glory ↗️",
  "Another step on your journey of blunt growth. Smash on ↗️",
  "Believe. Achieve. Hammer. Repeat ↗️",
  "Greatness requires friction. You removed it all. Go again ↗️",
  "No one asked. You hammered anyway. Hit Reset ↗️",
  "You crushed it. Along with everything else. Again? ↗️"
];

export const getRandomCompletionMessage = (): string => {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
};