import { motion } from "framer-motion";
import { useState } from "react";

export interface AccordionItem {
    title: string;
    jsx: React.ReactNode;
}

interface Props {
    items: AccordionItem[];
    /** Indexes that should start expanded. Defaults to the first item. */
    defaultExpanded?: number[];
    /** When true, only one item can be open at a time. */
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion = ({
    items,
    defaultExpanded = [0],
    allowMultiple = true,
    className = "",
}: Props) => {
    const [expandedSections, setExpandedSections] = useState<Set<number>>(
        new Set(defaultExpanded)
    );

    const toggleSection = (index: number) => {
        setExpandedSections(prev => {
            const newSet = allowMultiple ? new Set(prev) : new Set<number>();
            if (prev.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const isExpanded = (index: number) => expandedSections.has(index);

    return (
        <div className={`w-full divide-y ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="group">
                    <button
                        type="button"
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(index);
                        }}
                        aria-expanded={isExpanded(index)}
                        aria-controls={`accordion-section-${index}`}
                    >
                        <h4 className="font-medium text-gray-700 dark:text-gray-50">{item.title}</h4>
                        <motion.div
                            animate={{ rotate: isExpanded(index) ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5 text-gray-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                />
                            </svg>
                        </motion.div>
                    </button>

                    <motion.div
                        initial={false}
                        animate={{
                            height: isExpanded(index) ? "auto" : 0,
                            opacity: isExpanded(index) ? 1 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div
                            id={`accordion-section-${index}`}
                            className="px-4 pb-4"
                        >
                            {item.jsx}
                        </div>
                    </motion.div>
                </div>
            ))}
        </div>
    );
};

export default Accordion;
