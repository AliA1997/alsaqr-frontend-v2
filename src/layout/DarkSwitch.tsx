import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

type DarkSwitchProps = {};

const DarkSwitch: React.FC<DarkSwitchProps> = () => {
  const { theme, setTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="group flex max-w-fit
        cursor-pointer items-center space-x-2 rounded-full px-2 py-1 mx-1 lg:px-6 my-1 md:mt-6 lg:py-3
        transition-all duration-200 hover:bg-[#55a8c2] dark:bg-[#1d2a2e] dark:text-gray-50
        bg-gray-50 dark:hover:opacity-80 dark:hover:text-[#1d2a2e]
      "
      onClick={() => theme === 'dark' ? setTheme('light') : setTheme('dark')}
    >
      {theme === "dark" ? (
        <img
          src="/icons/light-mode.svg"
          alt="Light Mode Icon"
          className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
        />
      ) : (
        <img
          src="/icons/dark-mode.svg"
          alt="Dark Mode Icon"
          className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
        />
      )}
      {/* Simplified display classes: removed redundant 'display-none' and fixed order */}
      <p className="hidden md:inline-flex dark:text-gray-50 font-light group-hover:text-black dark:group-hover:text-[#1d2a2e] text-[#1d2a2e]">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </p>
    </motion.button>
  );
};
export default DarkSwitch;
