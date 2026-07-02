import { makeAutoObservable, runInAction } from "mobx";
import { SubscriptionUsageToDisplay, YumnaChatMessage, YumnaPromptFormDto, YumnaPromptResponseDto } from "@models/yumna";
import { BASIC_SUBSCRIPTION_DAILY_LIMIT, YUMNA_DEFAULT_CONTEXT, YUMNA_REMAINING_REQUESTS_WARNING_THRESHOLD } from "@utils/constants";
import agent from "@utils/api/agent";

const newYumnaMessageId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? `yumna_message_${crypto.randomUUID()}`
        : `yumna_message_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export default class YumnaFeedStore {
    constructor() {
        makeAutoObservable(this);
    }
    loadingPrompt = false;
    loadingDailyUse = false;
    // Chat messages persist across rerendering of pages since the store is a singleton.
    currentYumnaChatRegistry: Map<string, YumnaChatMessage> = new Map<string, YumnaChatMessage>();
    subscriptionUsage: SubscriptionUsageToDisplay | undefined = undefined;
    promptError: string = '';
    overLimitAlertShown = false;

    setLoadingPrompt = (val: boolean) => {
        this.loadingPrompt = val;
    }
    setLoadingDailyUse = (val: boolean) => {
        this.loadingDailyUse = val;
    }
    setSubscriptionUsage = (val: SubscriptionUsageToDisplay | undefined) => {
        this.subscriptionUsage = val;
    }
    setPromptError = (val: string) => {
        this.promptError = val;
    }
    setOverLimitAlertShown = (val: boolean) => {
        this.overLimitAlertShown = val;
    }
    setYumnaChatMessage = (message: YumnaChatMessage) => {
        this.currentYumnaChatRegistry.set(message.yumnaMessageId, message);
    }

    resetFeedState = () => {
        this.currentYumnaChatRegistry.clear();
        this.subscriptionUsage = undefined;
        this.promptError = '';
        this.overLimitAlertShown = false;
    }

    get currentYumnaChat() {
        return Array.from(this.currentYumnaChatRegistry.values());
    }

    get numberOfRequestsToday() {
        return this.subscriptionUsage?.numberOfRequests ?? 0;
    }

    get dailyRequestLimit() {
        return this.subscriptionUsage?.dailyRequestLimit ?? BASIC_SUBSCRIPTION_DAILY_LIMIT;
    }

    get requestsRemaining() {
        return Math.max(this.dailyRequestLimit - this.numberOfRequestsToday, 0);
    }

    get isOverDailyLimit() {
        return this.numberOfRequestsToday >= this.dailyRequestLimit;
    }

    get showRemainingRequestsWarning() {
        return !this.isOverDailyLimit && this.requestsRemaining < YUMNA_REMAINING_REQUESTS_WARNING_THRESHOLD;
    }

    getSubscriptionDailyUse = async () => {
        this.setLoadingDailyUse(true);
        try {
            const usage: number = await agent.subscriptionApiClient.getSubscriptionDailyUse(undefined);
            debugger;
            runInAction(() => {
                this.setSubscriptionUsage({
                    subscriptionName: 'Basic',
                    dailyRequestLimit: 30,
                    numberOfRequests: usage
                });
            });
        } finally {
            this.setLoadingDailyUse(false);
        }
    }

    promptYumna = async (prompt: string) => {
        this.setPromptError('');
        this.setLoadingPrompt(true);
        this.setYumnaChatMessage({
            yumnaMessageId: newYumnaMessageId(),
            role: 'user',
            text: prompt,
            createdAt: new Date()
        });

        try {
            const yumnaPromptForm: YumnaPromptFormDto = { 
                prompt,
                context: YUMNA_DEFAULT_CONTEXT
            };
            const { result, dailyUse, dailyLimit }: YumnaPromptResponseDto = await agent.yumnaApiClient.promptYumna(yumnaPromptForm);
            

            runInAction(() => {
                this.setYumnaChatMessage({
                    yumnaMessageId: newYumnaMessageId(),
                    role: 'assistant',
                    text: result,
                    createdAt: new Date()
                });

                if (dailyUse)
                    this.setSubscriptionUsage({
                        subscriptionName: this.subscriptionUsage?.subscriptionName ?? 'Basic',
                        dailyRequestLimit: dailyLimit,
                        numberOfRequests: dailyUse
                    });
            });
        } catch (error) {
            runInAction(() => {
                this.setPromptError(this.isOverDailyLimit
                    ? "You are over your daily usage limit. Subscribe to the pro tier to continue prompting Yumna."
                    : "Yumna couldn't process your prompt. Please try again.");
            });
        } finally {
            this.setLoadingPrompt(false);
        }
    }
}
