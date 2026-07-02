import { YumnaChatMessage } from "@models/yumna";
import { YUMNA_AVATAR_URL } from "@utils/constants";

type Props = {
    messageToDisplay: YumnaChatMessage;
};

function YumnaMessageItem({ messageToDisplay }: Props) {
    const isAssistant = messageToDisplay.role === 'assistant';

    return (
        <div
            className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
            data-testid="yumnamessagecard"
        >
            {isAssistant && (
                <img
                    src={YUMNA_AVATAR_URL}
                    alt="Yumna AI"
                    className="w-8 h-8 rounded-full mr-2 mt-1 self-start shrink-0"
                />
            )}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isAssistant ? '' : 'flex flex-col items-end'}`}>
                <div
                    className={`p-3 rounded-lg ${isAssistant ? 'bg-[#55a8c2] text-white' : 'bg-blue-500 text-white'}`}
                >
                    <p data-testid="yumnamessagetext" className="whitespace-pre-wrap break-words">
                        {messageToDisplay.text}
                    </p>
                </div>
                <span data-testid="yumnamessagedate" className="text-sm text-gray-500">
                    {new Date(messageToDisplay.createdAt).toLocaleString()}
                </span>
            </div>
        </div>
    );
}

export default YumnaMessageItem;
