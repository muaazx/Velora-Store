import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggleFAB: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      className={`
        fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50
        w-11 h-11 rounded-full
        flex items-center justify-center
        shadow-lg shadow-black/20
        border
        transition-colors duration-300
        cursor-pointer
        ${isDark
          ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
          : 'bg-white border-zinc-200 hover:bg-zinc-50'
        }
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-[18px] h-[18px] text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-[18px] h-[18px] text-zinc-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
