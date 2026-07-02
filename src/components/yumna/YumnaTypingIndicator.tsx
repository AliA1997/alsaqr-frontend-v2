import { YUMNA_AVATAR_URL } from "@utils/constants";

function YumnaTypingIndicator() {
    return (
        <div className="flex justify-start" data-testid="yumnatypingindicator">
            <img
                src={YUMNA_AVATAR_URL}
                alt="Yumna AI"
                className="w-8 h-8 rounded-full mr-2 mt-1 self-start shrink-0"
            />
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-3">
                <span className="inline-flex gap-1">
                    <span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 rounded-full bg-gray-400 animate-bounce" />
                </span>
            </div>
        </div>
    );
}

export default YumnaTypingIndicator;
