import { ModalBody, ModalPortal } from "@common/Modal";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { PRO_SUBSCRIPTION_DAILY_LIMIT, YUMNA_AVATAR_URL } from "@utils/constants";

// Placeholder for the pro tier: price is TBD and the subscribe button is disabled.
export const ProSubscriptionModal = observer(() => {
    const { modalStore } = useStore();
    const { closeModal } = modalStore;

    return (
        <ModalPortal>
            <ModalBody onClose={closeModal}>
                <div
                    data-testid="prosubscriptionmodal"
                    className="flex flex-col items-center text-center gap-3 dark:text-gray-50"
                >
                    <img
                        src={YUMNA_AVATAR_URL}
                        alt="Yumna AI"
                        className="w-16 h-16 rounded-full"
                    />
                    <h2 className="text-xl font-bold">Upgrade to the Pro Tier</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        You've hit your basic tier daily limit. The pro tier lets you prompt Yumna up
                        to {PRO_SUBSCRIPTION_DAILY_LIMIT.toLocaleString()} messages per day.
                    </p>
                    <p className="font-semibold" data-testid="prosubscriptionprice">
                        Price: TBD
                    </p>
                    <button
                        type="button"
                        disabled
                        data-testid="prosubscribebutton"
                        className="rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        TBD
                    </button>
                </div>
            </ModalBody>
        </ModalPortal>
    );
});

export default ProSubscriptionModal;
