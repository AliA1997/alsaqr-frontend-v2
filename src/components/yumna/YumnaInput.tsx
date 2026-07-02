import React from "react";
import { ButtonLoader } from "@common/CustomLoader";
import { YUMNA_MAX_PROMPT_LENGTH } from "@utils/constants";

type Props = {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    input: string;
    setInput: (val: string) => void;
    loading: boolean;
};

// Text-only composer: no file or image uploads are allowed on the Yumna chatbot.
function YumnaInput({ onSubmit, input, setInput, loading }: Props) {
    const overMaxLength = input.length > YUMNA_MAX_PROMPT_LENGTH;
    const cantSubmit = !input.trim() || overMaxLength || loading;

    return (
        <div className="bg-white p-4 border-t border-gray-200 dark:border-none dark:bg-[#0e1517] shrink-0">
            <form onSubmit={onSubmit} className="flex flex-col items-start">
                <div className="flex w-full">
                    <input
                        type="text"
                        className={`
                            flex-1 border border-gray-300 rounded-full py-2 px-1 md:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            dark:bg-gray-900 ${overMaxLength ? 'bg-red-200 dark:bg-red-950' : ''}
                        `}
                        placeholder="Message Yumna..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        data-testid="yumnainput"
                    />
                    <button
                        data-testid="yumnasubmitbutton"
                        type="submit"
                        className="ml-0 md:ml-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={cantSubmit}
                    >
                        {loading ? (
                            <ButtonLoader />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="flex w-full justify-end pr-16 pt-1">
                    <span
                        data-testid="yumnacharcount"
                        className={`text-xs ${overMaxLength ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {input.length}/{YUMNA_MAX_PROMPT_LENGTH}
                    </span>
                </div>
            </form>
        </div>
    );
}

export default YumnaInput;
