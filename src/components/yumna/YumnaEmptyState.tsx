import { YUMNA_AVATAR_URL } from "@utils/constants";

function YumnaEmptyState() {
    return (
        <div
            className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 px-6"
            data-testid="yumnaemptystate"
        >
            {/* Chat bubble illustration holding the yumna avatar */}
            <div className="relative mb-4">
                <div className="flex items-center justify-center w-28 h-24 rounded-3xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <img
                        src={YUMNA_AVATAR_URL}
                        alt="Yumna AI"
                        className="w-16 h-16 rounded-full"
                    />
                </div>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 left-6 w-5 h-5 rotate-45 bg-gray-100 dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-800" />
            </div>
            <p className="text-lg font-semibold mb-1">Ask Yumna anything</p>
            <p className="text-sm">
                Yumna is your personal AI assistant. Type a message to get started.
            </p>
        </div>
    );
}

export default YumnaEmptyState;
