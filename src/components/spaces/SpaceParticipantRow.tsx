import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { SpaceParticipant } from "@models/space";
import { OptimizedImage } from "@common/Image";
import { TagOrLabel } from "@common/Titles";
import { stopPropagationOnClick } from "@utils/index";

interface Props {
  participant: SpaceParticipant;
}

// Row stays an observer so a single participant update (mute, hand raise,
// role) re-renders one row instead of the whole roster.
const SpaceParticipantRow = observer(({ participant }: Props) => {
  const { spaceStore } = useStore();
  const { isHost, localUserId, approveSpeaker, demoteSpeaker, loadingAction } = spaceStore;

  const isSpeaking = participant.role === "host" || participant.role === "speaker";
  const isSelf = participant.userId === localUserId;

  return (
    <li
      className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800"
      data-testid="spaceparticipantrow"
    >
      <OptimizedImage
        src={participant.avatar ?? ''}
        alt={participant.username}
        classNames="h-8 w-8 rounded-full object-cover"
      />
      <div className="flex flex-col text-left">
        <span className="text-sm text-black dark:text-gray-50">
          {participant.username}{isSelf ? ' (you)' : ''}
        </span>
        <TagOrLabel
          color={participant.role === 'host' ? 'gold' : isSpeaking ? 'primary' : 'neutral'}
          size="sm"
          className="max-w-fit"
        >
          {participant.role.toUpperCase()}
        </TagOrLabel>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {participant.handRaised && participant.role === 'listener' && (
          <span title="Raised hand" aria-label="Raised hand">✋</span>
        )}
        {isSpeaking && (
          <span
            title={participant.muted ? 'Muted' : 'Speaking'}
            aria-label={participant.muted ? 'Muted' : 'Speaking'}
            className={participant.muted ? 'opacity-50' : ''}
          >
            {participant.muted ? '🔇' : '🎙️'}
          </span>
        )}
        {isHost && !isSelf && participant.role === 'listener' && participant.handRaised && (
          <button
            type="button"
            disabled={loadingAction}
            className="rounded-full bg-[#55a8c2] px-3 py-1 text-xs text-white hover:bg-[#4995ad]"
            data-testid="approvespeakerbutton"
            onClick={(e) => stopPropagationOnClick(e, () => void approveSpeaker(participant.userId))}
          >
            Approve
          </button>
        )}
        {isHost && !isSelf && participant.role === 'speaker' && (
          <button
            type="button"
            disabled={loadingAction}
            className="rounded-full bg-red-700 px-3 py-1 text-xs text-white hover:bg-red-600"
            data-testid="demotespeakerbutton"
            onClick={(e) => stopPropagationOnClick(e, () => void demoteSpeaker(participant.userId))}
          >
            Move to listener
          </button>
        )}
      </div>
    </li>
  );
});

export default SpaceParticipantRow;
