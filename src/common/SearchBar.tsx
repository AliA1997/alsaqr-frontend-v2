import { stopPropagationOnClick } from "@utils/index";
import { motion } from "framer-motion";
import { useState } from "react";
import { ButtonLoader } from "./CustomLoader";

interface SearchBarProps {
    fullWidth?: boolean;
    value?: string;
    onChange?: (value: string) => void;
    onSearch: () => void | Promise<void>;
    placeholder?: string;
    classNames?: string;
}

function SearchBar({ fullWidth, value, onChange, onSearch, placeholder = "Search...", classNames }: SearchBarProps) {
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    setLoading(true);
    // Trigger the search only when the Enter key is pressed
    try {
      if (e.key === "Enter") {
        // Prevent the default form submit behavior if inside a form
        e.preventDefault();
        await onSearch();
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative text-gray-800 ${fullWidth ? "w-full" : "w-64 xl:w-80"} p-5 dark:text-gray-500 flex ${classNames ? classNames : ''}`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`flex cursor-pointer item-center space-x-3 text-gray-400 hover:text-[#55a8c2] ${loading ? 'p-2' : 'p-0'}`}
        onClick={(e) => stopPropagationOnClick(e, onSearch)}
      >
        {loading ? <ButtonLoader /> : null}
      </motion.div>

      <input
        onKeyDown={handleSearchKeyDown}
        onChange={handleSearchChange}
        value={value}
        type="search"
        name="search"
        placeholder={placeholder}
        className="bg-dim-700 h-10 px-10 pr-5 w-full rounded-full text-sm focus:outline-none bg-[#55a8c2]-white shadow border-0 dark:bg-gray-800 dark:text-gray-200"
      />
    </div>
  );
}

export default SearchBar;
