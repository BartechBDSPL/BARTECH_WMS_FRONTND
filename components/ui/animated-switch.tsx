"use client"
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnimatedSwitchProps {
  onComplete: () => Promise<boolean>;  // Modified to return Promise<boolean>
}

const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const constraintsRef = useRef(null);

  const handleDragEnd = async (event: any, info: any) => {
    const threshold = 150; // Adjust this value as needed
    if (info.offset.x > threshold && !isCompleted) {
      setIsCompleted(true);
      const success = await onComplete();
      if (!success) {
        // Reset the switch if the operation failed
        setIsCompleted(false);
      }
    }
  };

  return (
    <div
      ref={constraintsRef}
      className="relative w-64 h-14 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
    >
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={isCompleted ? { x: 200 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="cursor-grab active:cursor-grabbing w-12 h-12 bg-primary rounded-full absolute left-1 top-1"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isCompleted ? "Release to confirm" : "Slide to approve"}
        </span>
      </div>
    </div>
  );
};

export default AnimatedSwitch;
