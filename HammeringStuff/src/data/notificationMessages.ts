const HAMMER_NOTIFICATION_MESSAGES = [
  "Whack it good",
  "Fix it your way",
  "Don't think — smash",
  "Hammer: 1, Logic: 0",
  "There goes nuance",
  "Subtlety is overrated anyway",
  "You're consistent, at least",
  "Knock sense into it",
  "Nail your destiny",
  "This isn’t therapy",
  "Disruption achieved",
  "Roadblock? What roadblock?",
  "Louder than insight",
  "Don’t overthink — overpower",
  "Big impact. Zero nuance",
  "Feedback loop terminated",
  "Crisis downgraded to “handled”",
  "Good ideas died so this could happen",
  "You simplified it. Into rubble",
  "Never let complexity get in your way",
  "You call that broken? Not yet",
  "Subtle as a landslide",
  "The tool chose you",
  "When in doubt, smash",
  "Use excessive confidence",
  "Minimum viable damage",
  "You brought alignment. With impact",
  "No blockers left",
  "Pain points resolved"
];

export const getRandomHammerMessage = (usedMessages: string[] = []): string => {
  const availableMessages = HAMMER_NOTIFICATION_MESSAGES.filter(
    message => !usedMessages.includes(message)
  );
  
  const randomIndex = Math.floor(Math.random() * availableMessages.length);
  return availableMessages[randomIndex];
};

export const getAllHammerMessages = (): readonly string[] => {
  return HAMMER_NOTIFICATION_MESSAGES;
};