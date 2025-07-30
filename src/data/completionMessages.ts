const COMPLETION_MESSAGES = [
  "Success, by any means necessary.",
  "You took initiative. The world adjusted.", 
  "No lessons learned. That's commitment.",
  "Brute force wins!",
  "Simplicity achieved through pressure.",
  "Believe. Achieve. Hammer. Repeat.",
  "Greatness requires friction. You removed it all.",
  "No one asked. You hammered anyway.",
  "You crushed it. Along with everything else.",
  "That wasn’t subtle… But it worked!",
  "Another triumph in forced resolution.",
  "You brought the vision. And the impact.",
  "That solution screamed leadership.",
  "Another win for decisive execution.",
  "Strategy aligned with momentum.",
  "You challenged the status quo. With force.",
  "Another chapter in impact-oriented leadership.",
];

export const getRandomCompletionMessage = (): string => {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
};