import { useNavigate } from "react-router-dom";
import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import TimeAgo from "react-timeago";

import type { ListToDisplay } from "@typings";
import {
  stopPropagationOnClick,
} from "@utils/index";
import { TrashIcon } from "@heroicons/react/solid";
import { useStore } from "@stores/index";
import { convertDateToDisplay } from "@utils/index";
import MoreSection from "@common/MoreSection";
import { ConfirmModal } from "@common/Modal";

interface Props {
  listToDisplay: ListToDisplay;
  onlyDisplay?: boolean;
}

function ListItemComponent({
  listToDisplay,
}: Props) {
  const navigate = useNavigate();
  const { authStore, modalStore, listFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const { closeModal, showModal } = modalStore;
  const { deleteList } = listFeedStore;

  const initiallyBooleanValues = useRef<{
    alreadySaved: boolean;
    commented: boolean;
  }>({
    alreadySaved: false,
    commented: false,
  });


  const listInfo = listToDisplay.list;
  const founder = listToDisplay.savedBy;

  useLayoutEffect(() => {
    
    if (currentSessionUser) {
      const savedLists: any[] = [];

      const listAlreadySaved =
        savedLists?.some((listSavedById: string) => listSavedById === listToDisplay.list.id) ?? false;

      initiallyBooleanValues.current = {
        alreadySaved: listAlreadySaved,
        commented: false,
      };
    }
  }, [currentSessionUser]);

  const navigateToTweetUser = (username: string) => {
    navigate(`users/${username}`);
  };

  const navigateToList = () => {
    navigate(`lists/${listInfo.id}`);
  };

  const userId = useMemo(() => currentSessionUser ? currentSessionUser.id : "", [currentSessionUser]);

  const moreOptions = useMemo(() => {
    const defaultOpts = [];

    if (listInfo.userId === currentSessionUser?.id)
      defaultOpts.push({
        title: 'Delete Your List',
        onClick: async () => {
          showModal(
            <ConfirmModal
              title="Delete this List"
              confirmButtonClassNames="bg-red-700 text-gray-100"
              onClose={() => closeModal()}
              declineButtonText="Cancel"
              confirmFunc={async () => {
                await deleteList(listInfo.userId, listInfo.id);
                closeModal();
              }}
              confirmMessage="Are you sure you want to delete this list forever?"
              confirmButtonText="Delete List"
            >
              <ListItemComponent
                listToDisplay={listToDisplay}
              />
            </ConfirmModal>
          )

        },
        Icon: TrashIcon,
      });

    return defaultOpts;
  }, [listInfo.id]);

  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 
          p-5 mr-1 mb-2 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] h-[8.5rem] w-[30rem] lg:w-[20rem]
          hover:cursor-pointer`}
        style={{ backgroundImage: `url('${listInfo.bannerImage}')`, objectFit: "scale-down" }}
      >
        <div className="absolute m-0 inset-0 bg-gradient-to-t from-gray-900/40 to-gray-900/20"></div>
        <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
          <div className="flex item-center space-x-1 z-10">
            <img
              className="h-10 w-10 rounded-full object-cover hover:underline"
              src={founder.avatar}
              alt={founder.username}
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}

            />
            {userId === listInfo.listCreator && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#00ADED] mr-1 mt-auto mb-auto"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`font-bold text-gray-100 mr-1 hover:underline`}
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            >
              {founder.username}
            </p>
            <p
              className="hidden text-sm text-gray-100 sm:inline dark:text-gray-400 hover:underline"
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            >
              @
              {founder.username ? founder.username.replace(/\s+/g, "") : ""}
              .
            </p>
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(listInfo.createdAt)}
            />
            {moreOptions.length ?
              (
                <MoreSection
                  moreOptions={moreOptions}
                />
              )
              : null
            }
          </div>
          <p className="pt-1 text-gray-100 text-2xl hover:underline  z-10" onClick={e => stopPropagationOnClick(e, navigateToList)}>{listInfo.name}</p>
        </div>
      </div>

    </>
  );
}

export default ListItemComponent;
