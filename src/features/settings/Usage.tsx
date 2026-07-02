import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PageTitle } from "@common/Titles";
import { SkeletonLoader } from "@common/CustomLoader";
import ProSubscriptionModal from "@components/yumna/ProSubscriptionModal";
import agent from "@utils/api/agent";
import { SubscriptionUsageToDisplay } from "@models/yumna";
import { BASIC_SUBSCRIPTION_DAILY_LIMIT, YUMNA_AVATAR_URL } from "@utils/constants";

const Usage = observer(() => {
    const { authStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const { showModal } = modalStore;

    // Daily subscription use is local state, unique to this page.
    const [usage, setUsage] = useState<SubscriptionUsageToDisplay | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!currentSessionUser?.id)
            return;

        setLoading(true);
        agent.subscriptionApiClient.getSubscriptionDailyUse(undefined)
            .then((dailyUsage: SubscriptionUsageToDisplay) => setUsage(dailyUsage))
            .catch(() => setUsage(undefined))
            .finally(() => setLoading(false));
    }, [currentSessionUser]);

    const dailyUse = usage?.numberOfRequests ?? 0;
    const dailyLimit = usage?.dailyRequestLimit ?? BASIC_SUBSCRIPTION_DAILY_LIMIT;
    const usagePercent = useMemo(
        () => Math.min(Math.round((dailyUse / dailyLimit) * 100), 100),
        [dailyUse, dailyLimit]
    );

    return (
        <div className='mb-[10rem]'>
            <PageTitle>Usage</PageTitle>
            <div className={`
                relative flex flex-1 flex-col border-y border-gray-100 p-5
                hover:shadow-lg dark:text-gray-50
            `}>
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <img
                                src={YUMNA_AVATAR_URL}
                                alt="Yumna AI"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <h3 className="font-semibold">
                                    {usage?.subscriptionName ?? 'Basic'} Subscription
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Daily Yumna AI prompt usage
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-2xl font-bold" data-testid="usagedailyuse">
                            ({dailyUse}/{dailyLimit})
                        </p>

                        <div className="mt-2 w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                            <div
                                className="h-2 rounded-full bg-[#55a8c2]"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>

                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Want to keep prompting past your daily limit? Upgrade to the pro tier.
                        </p>
                        <button
                            type="button"
                            data-testid="usageupgradebutton"
                            onClick={() => showModal(<ProSubscriptionModal />)}
                            className="mt-3 self-start rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white cursor-pointer"
                        >
                            View Pro Tier
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default Usage;
