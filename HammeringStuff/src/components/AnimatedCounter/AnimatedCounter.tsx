import React from "react";
import CounterDigit from "../CounterDigit/CounterDigit";
import styles from "./AnimatedCounter.module.css";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  className = "" 
}) => {
  const valueString = value.toString();
  
  // Split into individual digits and reverse for easier indexing
  // (rightmost digit gets index 0)
  const digits = valueString.split('').reverse();

  return (
    <span className={`${styles.counter} ${className}`}>
      {digits.reverse().map((digit, index) => {
        const digitIndex = digits.length - 1 - index;
        return (
          <CounterDigit
            key={digitIndex}
            digit={digit}
            digitIndex={digitIndex}
          />
        );
      })}
    </span>
  );
};

export default AnimatedCounter;