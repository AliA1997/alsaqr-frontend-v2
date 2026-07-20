import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { SpaceKind, SpaceListItem, SpaceToDisplay } from "@models/space";
import { ButtonLoader } from "@common/CustomLoader";
import SpaceRoom from "./SpaceRoom";

interface Props {
  kind: SpaceKind;
  communityId: string;
  communityDiscussionId?: string;
  // Whether the logged-in user is a member of the community / discussion.
  // Only reflected in the UI — the backend enforces who may start or join.
  isMember: boolean;
}

// One live space per community and per discussion is a database invariant
// (partial unique indexes in spaces.sql), so a community page's list is its own
// space plus at most one per discussion — never a page of many.
const SpacePanel = observer(({ kind, communityId, communityDiscussionId, isMember }: Props) => {
  const { spaceStore } = useStore();
  const {
    activeSpace,
    connection,
    loadingInitial,
    loadingAction,
    primarySpaceItem,
    otherSpaceItems,
    loadCommunitySpaces,
    loadLiveCommunityDiscussionSpace,
    startSpace,
    joinSpace,
  } = spaceStore;

  const [title, setTitle] = useState("");
  const [starting, setStarting] = useState(false);
  // The space the user has asked to switch to, pending confirmation. Switching
  // tears down live audio, so it is never implicit.
  const [pendingSwitch, setPendingSwitch] = useState<SpaceToDisplay | undefined>(undefined);


  useEffect(() => {
    if (kind === "community")
      void loadCommunitySpaces(communityId);
    else if (communityDiscussionId)
      void loadLiveCommunityDiscussionSpace(communityId, communityDiscussionId);
  }, [kind, communityId, communityDiscussionId]);

  // Non-members never see join/start affordances (and the backend would reject
  // them anyway). Every hook above runs unconditionally — this is the first
  // early return in the component.
  if (!isMember) return null;

  const inPrimarySpace =
    !!activeSpace &&
    activeSpace.spaceId === primarySpaceItem?.space.spaceId &&
    connection !== "idle";

  const requestJoin = async (space: SpaceToDisplay) => {
    // Already in another space: confirm before tearing that session down.
    if (activeSpace && activeSpace.spaceId !== space.spaceId) {
      setPendingSwitch(space);
      return;
    }
    await joinSpace(space);
  };

  const subtitleFor = (item: SpaceListItem) =>
    item.discussionTitle
      ? `${item.discussionTitle} · ${item.space.participantCount} listening`
      : `Live audio · ${item.space.participantCount} listening`;

  // A joinable row for a space the user is not in.
  const renderSpaceRow = (item: SpaceListItem, testId: string) => (
    <div key={item.space.spaceId} className="flex items-center gap-3" data-testid={testId}>
      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" aria-hidden />
      <div className="text-left">
        <p className="text-sm font-semibold text-black dark:text-gray-50">{item.space.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitleFor(item)}</p>
      </div>
      <button
        type="button"
        disabled={connection === "connecting"}
        className="ml-auto rounded-full bg-[#55a8c2] px-5 py-1.5 text-sm text-white hover:bg-[#4995ad] disabled:opacity-60"
        data-testid={`${testId}joinbutton`}
        onClick={() => void requestJoin(item.space)}
      >
        {connection === "connecting" ? <ButtonLoader /> : "Join"}
      </button>
    </div>
  );

  return (
    <div
      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1517] p-4 my-3"
      data-testid="spacepanel"
    >
      {/* Confirming a switch: the current space is still live behind this. */}
      {pendingSwitch && (
        <div
          className="mb-3 rounded-md border border-[#55a8c2] p-3"
          data-testid="switchspaceconfirm"
        >
          <p className="text-sm text-black dark:text-gray-50">
            Leave <span className="font-semibold">{activeSpace?.title}</span> and join{" "}
            <span className="font-semibold">{pendingSwitch.title}</span>?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={connection === "connecting"}
              className="rounded-full bg-[#55a8c2] px-5 py-1.5 text-sm text-white hover:bg-[#4995ad] disabled:opacity-60"
              data-testid="confirmswitchspacebutton"
              onClick={async () => {
                const target = pendingSwitch;
                setPendingSwitch(undefined);
                await joinSpace(target);
              }}
            >
              {connection === "connecting" ? <ButtonLoader /> : "Switch"}
            </button>
            <button
              type="button"
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              data-testid="cancelswitchspacebutton"
              onClick={() => setPendingSwitch(undefined)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Top slot: the space the user is in, else this entity's live space. */}
      {inPrimarySpace ? (
        <SpaceRoom />
      ) : primarySpaceItem ? (
        renderSpaceRow(primarySpaceItem, "primaryspace")
      ) : starting ? (
        <form
          className="flex items-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim()) return;
            await startSpace(kind, { title: title.trim() }, communityId, communityDiscussionId);
            setStarting(false);
            setTitle("");
          }}
        >
          <input
            type="text"
            className="flex-1 rounded-full border border-gray-300 px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#55a8c2] dark:bg-gray-900 dark:border-gray-700"
            placeholder="What do you want to talk about?"
            value={title}
            data-testid="spacetitleinput"
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={!title.trim() || loadingAction}
            className="rounded-full bg-[#55a8c2] px-5 py-1.5 text-sm text-white hover:bg-[#4995ad]"
            data-testid="confirmstartspacebutton"
          >
            {loadingAction ? <ButtonLoader /> : "Go live"}
          </button>
          <button
            type="button"
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            onClick={() => setStarting(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loadingInitial ? "Looking for live audio…" : "No audio discussion is live right now."}
          </p>
          <button
            type="button"
            className="ml-auto rounded-full border border-[#55a8c2] px-5 py-1.5 text-sm text-[#55a8c2] hover:bg-[#55a8c2] hover:text-white"
            data-testid="startspacebutton"
            onClick={() => setStarting(true)}
          >
            Start a space 🎙️
          </button>
        </div>
      )}

      {/* Below: the community's other live spaces — the ones the user is not
          in. Discussion pages are scoped to a single space, so this is empty
          there. */}
      {otherSpaceItems.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-3">
          <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Other live spaces ({otherSpaceItems.length})
          </h4>
          <ul className="flex flex-col gap-3" data-testid="otherspaceslist">
            {otherSpaceItems.map((item) => (
              <li key={item.space.spaceId}>{renderSpaceRow(item, "otherspace")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default SpacePanel;
