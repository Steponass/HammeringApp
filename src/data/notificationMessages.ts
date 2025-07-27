const HAMMER_NOTIFICATION_MESSAGES = [
  "Consider it “addressed”",
  "Fix it your way",
  "Form follows force",
  "Hammer: 1, Logic: 0",
  "There goes nuance",
  "Subtlety is overrated anyway",
  "You're consistent, at least",
  "Knock sense into it",
  "Nail your destiny",
  "This isn’t therapy",
  "No finesse? No problem.",
  "Roadblock? What roadblock?",
  "Louder than insight",
  "Don’t overthink — overpower",
  "Big impact. Zero nuance",
  "Broken? Or redefined?",
  "Crisis downgraded to “handled”",
  "Good ideas died so this could happen",
  "If it resists, it’s wrong",
  "Never let complexity get in your way",
  "You call that broken? Not yet",
  "Subtle as a landslide",
  "The tool chose you",
  "A teachable moment. For the object.",
  "Use excessive confidence",
  "Minimum viable damage",
  "You brought alignment. With impact",
  "No blockers left",
  "Pain points resolved",
  "Nothing subtle ever scaled",
  "Iteration by force",
  "Efficiency redefined",
  "Elegant isn’t for everyone"
];

export const getRandomHammerMessage = (
  usedMessages: string[] = []
): { message: string; shouldResetUsed: boolean } => {
  const availableMessages = HAMMER_NOTIFICATION_MESSAGES.filter(
    (message) => !usedMessages.includes(message)
  );

  // If no available messages, start fresh cycle
  if (availableMessages.length === 0) {
    const randomIndex = Math.floor(
      Math.random() * HAMMER_NOTIFICATION_MESSAGES.length
    );
    return {
      message: HAMMER_NOTIFICATION_MESSAGES[randomIndex],
      shouldResetUsed: true,
    };
  }

  const randomIndex = Math.floor(Math.random() * availableMessages.length);
  return {
    message: availableMessages[randomIndex],
    shouldResetUsed: false,
  };
};

export const getAllHammerMessages = (): readonly string[] => {
  return HAMMER_NOTIFICATION_MESSAGES;
};
