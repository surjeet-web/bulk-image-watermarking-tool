import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

export function TrueFocus({
  sentence = 'True Focus',
  manualMode = false,
  blurAmount = 5,
  borderColor = 'green',
  glowColor = 'rgba(0, 255, 0, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1
}: TrueFocusProps) {
  const words = sentence.split(' ');
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  useEffect(() => {
    if (manualMode) return;

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const animate = () => {
      setActiveWordIndex(currentIndex);
      currentIndex = (currentIndex + 1) % words.length;

      timeoutId = setTimeout(
        animate,
        (animationDuration + pauseBetweenAnimations) * 1000
      );
    };

    animate();

    return () => clearTimeout(timeoutId);
  }, [manualMode, words.length, animationDuration, pauseBetweenAnimations]);

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 p-4">
      {words.map((word, index) => (
        <motion.div
          key={`${word}-${index}`}
          className="relative"
          animate={{
            filter: activeWordIndex === index ? 'blur(0px)' : `blur(${blurAmount}px)`,
          }}
          transition={{ duration: animationDuration }}
        >
          <AnimatePresence>
            {activeWordIndex === index && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 -m-2"
                style={{
                  border: `2px solid ${borderColor}`,
                  boxShadow: `0 0 10px ${glowColor}`,
                  borderRadius: '4px',
                }}
              />
            )}
          </AnimatePresence>
          <span
            className="text-4xl md:text-5xl font-bold cursor-pointer"
            onClick={() => manualMode && setActiveWordIndex(index)}
          >
            {word}
          </span>
        </motion.div>
      ))}
    </div>
  );
}