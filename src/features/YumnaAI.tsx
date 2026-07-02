import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { LoginModal } from "@common/AuthModals";
import { DangerAlert, WarningAlert } from "@common/Alerts";
import YumnaHeader from "@components/yumna/YumnaHeader";
import YumnaMessageItem from "@components/yumna/YumnaMessageItem";
import YumnaTypingIndicator from "@components/yumna/YumnaTypingIndicator";
import YumnaEmptyState from "@components/yumna/YumnaEmptyState";
import YumnaInput from "@components/yumna/YumnaInput";
import ProSubscriptionModal from "@components/yumna/ProSubscriptionModal";
import { inTestMode, YUMNA_MAX_PROMPT_LENGTH } from "@utils/constants";

export default observer(function YumnaAI() {
    const { authStore, modalStore, yumnaFeedStore } = useStore();
    const { auth, currentSessionUser, processingUserCheck } = authStore;
    const { showModal } = modalStore;
    const {
        currentYumnaChat,
        loadingPrompt,
        promptError,
        setPromptError,
        numberOfRequestsToday,
        dailyRequestLimit,
        requestsRemaining,
        showRemainingRequestsWarning,
        getSubscriptionDailyUse,
        promptYumna
    } = yumnaFeedStore;

    const [input, setInput] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isLoggedIn = inTestMode() ? !!auth?.isLoggedIn() : !!currentSessionUser?.id;

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        });
    };

    // Check if the user is logged in; if not, return a login modal.
    useEffect(() => {
        if (processingUserCheck)
            return;

        if (!isLoggedIn) {
            showModal(<LoginModal />);
            return;
        }

        getSubscriptionDailyUse().catch(() => {});
    }, [isLoggedIn, processingUserCheck]);

    const handlePrompt = async (e: React.FormEvent) => {
        e.preventDefault();

        const prompt = input.trim();
        if (!prompt || prompt.length > YUMNA_MAX_PROMPT_LENGTH || yumnaFeedStore.loadingPrompt)
            return;

        if (!isLoggedIn) {
            showModal(<LoginModal />);
            return;
        }

        // Get their daily usage when they prompt.
        await getSubscriptionDailyUse().catch(() => {});

        if (yumnaFeedStore.isOverDailyLimit) {
            if (yumnaFeedStore.overLimitAlertShown) {
                // They kept prompting after the danger alert: show the pro tier modal.
                showModal(<ProSubscriptionModal />);
            } else {
                yumnaFeedStore.setPromptError("You are over your daily usage limit. Subscribe to the pro tier to continue prompting Yumna.");
                yumnaFeedStore.setOverLimitAlertShown(true);
            }
            return;
        }

        setInput('');
        scrollToBottom();

        await promptYumna(prompt);

        if (yumnaFeedStore.promptError && yumnaFeedStore.isOverDailyLimit)
            yumnaFeedStore.setOverLimitAlertShown(true);

        scrollToBottom();
    };

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            <YumnaHeader
                numberOfRequestsToday={numberOfRequestsToday}
                dailyRequestLimit={dailyRequestLimit}
            />

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentYumnaChat.length === 0 && !loadingPrompt
                    ? <YumnaEmptyState />
                    : currentYumnaChat.map((yumnaMessage) => (
                        <YumnaMessageItem
                            key={yumnaMessage.yumnaMessageId}
                            messageToDisplay={yumnaMessage}
                        />
                    ))}

                {loadingPrompt && <YumnaTypingIndicator />}
            </div>

            <div className="px-4 shrink-0 space-y-2">
                {promptError && (
                    <DangerAlert
                        title="Daily Usage Limit"
                        message={promptError}
                        onClose={() => setPromptError('')}
                    />
                )}
                {!promptError && showRemainingRequestsWarning && (
                    <WarningAlert
                        title="Prompts Running Out"
                        message={`Your prompting requests are about to run out — only ${requestsRemaining} of your daily requests left.`}
                    />
                )}
            </div>

            <YumnaInput
                onSubmit={handlePrompt}
                input={input}
                setInput={setInput}
                loading={loadingPrompt}
            />
        </div>
    );
});
