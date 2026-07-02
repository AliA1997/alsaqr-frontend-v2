import { YUMNA_AVATAR_URL } from "@utils/constants";

type Props = {
    numberOfRequestsToday: number;
    dailyRequestLimit: number;
};

function YumnaHeader({ numberOfRequestsToday, dailyRequestLimit }: Props) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center shrink-0">
            <img
                data-testid="yumnaavatar"
                src={YUMNA_AVATAR_URL}
                alt="Yumna AI"
                className="w-10 h-10 rounded-full shrink-0"
            />
            <div className="ml-3 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-50 leading-tight">
                    Yumna AI
                </h2>
                <p className="text-xs text-gray-500">
                    Your personal AI assistant
                </p>
            </div>
            <span
                data-testid="yumnadailyuse"
                className="ml-auto text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
            >
                {numberOfRequestsToday}/{dailyRequestLimit} prompts today
            </span>
        </div>
    );
}

export default YumnaHeader;
