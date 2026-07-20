import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { ButtonLoader } from "@common/CustomLoader";
import SpaceParticipantRow from "./SpaceParticipantRow";
import { stopPropagationOnClick } from "@utils/index";

// The live room: roster, host queue, and the speak/mute/leave controls.
// Media and presence state live in spaceStore; this component only reflects
// role state — the backend decides who may speak.
const SpaceRoom = observer(() => {
  const { spaceStore } = useStore();
  const {
    activeSpace,
    connection,
    localRole,
    localMuted,
    speakers,
    listeners,
    raisedHands,
    isHost,
    localUserId,
    participantRegistry,
    toggleMute,
    raiseHand,
    leaveSpace,
    endSpace,
    loadingAction,
  } = spaceStore;


  if (!activeSpace) return null;

  const isListener = localRole === "listener";
  const handRaised = participantRegistry.get(localUserId)?.handRaised ?? false;

  return (
    <div
      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1517] p-4 my-3"
      data-testid="spaceroom"
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" aria-hidden />
        <h3 className="font-semibold text-black dark:text-gray-50">{activeSpace.title}</h3>
        <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
          {connection === "live" ? "Live" : connection}
        </span>
        <div className="ml-auto flex gap-2">
          {isHost && (
            <button
              type="button"
              disabled={loadingAction}
              className="rounded-full bg-red-700 px-4 py-1 text-sm text-white hover:bg-red-600"
              data-testid="endspacebutton"
              onClick={e => stopPropagationOnClick(e, () => void endSpace())}
            >
              {loadingAction ? <ButtonLoader /> : "End space"}
            </button>
          )}
          <button
            type="button"
            className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-1 text-sm text-black dark:text-gray-50"
            data-testid="leavespacebutton"
            onClick={e => stopPropagationOnClick(e, () => void leaveSpace())}
          >
            Leave
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!isListener && (
          <button
            type="button"
            className={`rounded-full px-4 py-1 text-sm text-white ${localMuted ? 'bg-gray-500' : 'bg-[#55a8c2]'}`}
            data-testid="mutebutton"
            onClick={(e) => stopPropagationOnClick(e, toggleMute)}
          >
            {localMuted ? "Unmute" : "Mute"}
          </button>
        )}
        {isListener && (
          <button
            type="button"
            className="rounded-full border border-[#55a8c2] px-4 py-1 text-sm text-[#55a8c2]"
            data-testid="raisehandbutton"
            onClick={(e) => stopPropagationOnClick(e, () => void raiseHand(!handRaised))}
          >
            {handRaised ? "Lower hand ✋" : "Raise hand ✋"}
          </button>
        )}
      </div>

      {isHost && raisedHands.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Requests to speak
          </h4>
          <ul data-testid="raisedhandslist">
            {raisedHands.map(p => (
              <SpaceParticipantRow key={p.userId} participant={p} />
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Speakers ({speakers.length})
        </h4>
        <ul data-testid="spacespeakerslist">
          {speakers.map(p => (
            <SpaceParticipantRow key={p.userId} participant={p} />
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Listeners ({listeners.length})
        </h4>
        <ul data-testid="spacelistenerslist">
          {listeners.map(p => (
            <SpaceParticipantRow key={p.userId} participant={p} />
          ))}
        </ul>
      </div>
    </div>
  );
});

export default SpaceRoom;
