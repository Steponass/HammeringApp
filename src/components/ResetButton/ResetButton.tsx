import { motion } from "motion/react";
import styles from "./ResetButton.module.css";

interface ResetButtonProps {
  resetGame: () => void;
  buttonText?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({
  resetGame,
  buttonText = "Reset",
}) => {
  return (
    <>
      <motion.button
        className={styles.reset_button}
        onClick={resetGame}
        whileHover={{
          scale: 1.05,
          rotate: [2, -2],
          boxShadow: "0 2px 4px -1px hsla(225, 42%, 5%, 1)",
          transition: {
            scale: { duration: 0.3 },
            boxShadow: { duration: 0.3 },
            rotate: {
              duration: 1.6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          },
        }}
        whileTap={{ scale: 0.95, rotate: 3 }}
        type="button"
      >
        {buttonText}
      </motion.button>
    </>
  );
};

export default ResetButton;
export type { ResetButtonProps };
