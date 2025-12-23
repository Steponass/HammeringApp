const COMPLETION_MESSAGES = [
  "You took initiative. The world adjusted.", 
  "No lessons learned. That's commitment.",
  "Believe. Achieve. Hammer. Repeat.",
  "Greatness requires friction. You removed it all.",
  "No one asked. You hammered anyway.",
  "Another triumph in forced resolution.",
  "You brought the vision. And the impact.",
  "That solution screamed leadership.",
  "Another win for decisive execution.",
  "Another chapter in impact-oriented leadership.",
];

export const getRandomCompletionMessage = (): string => {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
};