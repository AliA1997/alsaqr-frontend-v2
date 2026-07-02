
// Yumna AI prompt sent to the backend, which proxies the Google Gemini api.
export interface YumnaPromptForm {
    prompt: string;
    context: string;
}

export interface YumnaPromptFormDto extends YumnaPromptForm {}

// A single message held in the currentYumnaChatRegistry.
export interface YumnaChatMessage {
    yumnaMessageId: string;
    role: 'user' | 'assistant';
    text: string;
    createdAt: Date;
}

// Response returned from the backend after prompting yumna.
export interface YumnaPromptResponseDto {
    result: string;
    dailyUse: number;
    dailyLimit: number;
}

// Maps to "alsaqr-2026".subscriptions
export interface UserSubscription {
    id: string;
    name: string;
    dailyRequestLimit: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Maps to "alsaqr-2026".subscription_daily_use
export interface SubscriptionDailyUse {
    id: string;
    userId: string;
    date: string;
    numberOfRequests: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Dashboard display interface for the settings Usage page (daily use/limit).
export interface SubscriptionUsageToDisplay {
    subscriptionName: string;
    numberOfRequests: number;
    dailyRequestLimit: number;
}
