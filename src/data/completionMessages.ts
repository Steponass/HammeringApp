const COMPLETION_MESSAGES = [
  "Success, by any means necessary. Go again ↗️",
  "You took initiative. The world adjusted. Again? ↗️", 
  "Another masterpiece in blunt force. Go again ↗️",
  "No lessons learned. That's commitment. Reset ↗️",
  "Brute force wins again. Replay the glory ↗️",
  "Simplicity achieved through pressure. Smash on ↗️",
  "Believe. Achieve. Hammer. Repeat ↗️",
  "Greatness requires friction. You removed it all. Reset ↗️",
  "No one asked. You hammered anyway. Hit Reset ↗️",
  "You crushed it. Along with everything else. Again? ↗️",
  "That wasn’t subtle. But it worked. Retry ↗️",
  "Another triumph in forced resolution. Reset ↗️",
  "You brought the vision. And the impact. Replay ↗️",
  "That solution screamed leadership. Go again ↗️",
  "Another win for decisive execution. Replay ↗️",
  "Strategy aligned with momentum. Repeat ↗️",
  "You challenged the status quo. With force. Replay ↗️",
  "Another chapter in impact-oriented leadership. Repeat ↗️",
];

export const getRandomCompletionMessage = (): string => {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
};