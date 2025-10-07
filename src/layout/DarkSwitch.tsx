import React from "react";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";
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
        <SunIcon className="w-5 h-5 md:w-6 md:h-6" />
      ) : (
        <MoonIcon className="w-5 h-5 md:w-6 md:h-6" />
      )}
      {/* Simplified display classes: removed redundant 'display-none' and fixed order */}
      <p className="hidden md:inline-flex dark:text-gray-50 font-light group-hover:text-black dark:group-hover:text-[#1d2a2e] text-[#1d2a2e]">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </p>
    </motion.button>
  );
};
export default DarkSwitch;
