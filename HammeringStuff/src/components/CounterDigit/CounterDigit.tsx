import React from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./CounterDigit.module.css";

interface CounterDigitProps {
  digit: string;
  digitIndex: number;
}

const CounterDigit: React.FC<CounterDigitProps> = ({ digit, digitIndex }) => {
  return (
    <div className={styles.digit_container}>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${digitIndex}-${digit}`}
          className={styles.digit}
          initial={{
            y: 20,
            opacity: 0.7,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -20,
            opacity: 0.7,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default CounterDigit;
