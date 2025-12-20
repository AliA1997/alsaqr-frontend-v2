import { EmojiHappyIcon, PhotographIcon } from "@heroicons/react/outline";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { PostRecord } from "@typings";
import {
  defaultSearchParams
} from "@utils/index";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { faker } from "@faker-js/faker";
import { FilterKeys } from "@stores/index";
import { XIcon } from "@heroicons/react/solid"; // Import the XMarkIcon

import { loadData } from "@utils/mobx";
import { useStore } from "@stores/index";
import FeedStore from "@stores/feedStore";
import ListFeedStore from "@stores/listFeedStore";
import CommunityFeedStore from "@stores/communityFeedStore";
import agent from "@utils/api/agent";
import { OptimizedImage } from "@common/Image";
import { checkNsfwInImage, initializeClient } from "@utils/infrastructure/gradio";
import { NOT_ALLOWED_NSFW_CHECKER_RESULTS } from "@utils/constants";
import { DangerAlert } from "@common/Alerts";
import { CommonBoxButton } from "@common/Buttons";

interface Props {
  filterKey: FilterKeys;
}

function PostBox({ filterKey }: Props) {
  const { authStore, feedStore, listFeedStore, communityFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const [input, setInput] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [nsfwAlert, setNsfwAlert] = useState<string>('');

  const storeToUse: FeedStore | ListFeedStore | CommunityFeedStore = useMemo(
    () => {
      if (filterKey == FilterKeys.Lists)
        return listFeedStore;
      else if (filterKey == FilterKeys.Community)
        return communityFeedStore;
      else
        return feedStore;
    },
    [filterKey]
  );
  const { setSearchQry } = storeToUse;

  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleShowEmojiPicker = useCallback(
    () => setShowEmojiPicker(!showEmojiPicker),
    []
  );
  const handleEmojiSelect = useCallback(
    (iValue: string) => (emoji: any) => {
      const newInputValue = iValue + emoji.native;
      setInput(newInputValue);
      setShowEmojiPicker(false);
    },
    []
  );
  const handleEmojiSelectClickOutside = useCallback(
    () => setShowEmojiPicker(false),
    []
  );

  const handleUploadImage = useCallback(() => {
    imageInputRef?.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const postNewPost = async () => {
    const postInfo: PostRecord = {
      id: faker.datatype.uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _rev: "",
      _type: "post",
      blockTweet: true,
      text: input,
      image: image,
      userId: currentSessionUser?.id,
      tags: hashtags ?? []
    };

    await agent.postApiClient.addPost(postInfo);

    setSearchQry(defaultSearchParams.search_term);
    await loadData(storeToUse);

    toast("Post Posted", {
      icon: "🚀",
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const gradioClient = await initializeClient();
        debugger;
        if(!!image.trim()) {
          const nsfwStatus = await checkNsfwInImage(gradioClient, image);
          if (nsfwStatus === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Somewhat Explicit'] || nsfwStatus === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Very Explicit']) {
            setNsfwAlert("Please choose a different photo — explicit images aren’t allowed in posts.");
            setImage('');
            setSubmitting(false);
            return;
          }
        }

        await postNewPost();

        setInput("");
        setImage("");
        setHashtags([]);
      } catch(err: any) {
        console.log("Error posting data:", err);
      } finally {
        setSubmitting(false);
      }

    },
    [input, image, hashtags]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const hashtagMatches = e.target.value.match(/#[\w\-_]+/g) || [];
      setInput(e.target.value);
      setHashtags(Array.from(new Set(hashtagMatches)));
    },
    []
  );

  const buttonText = useMemo(() => filterKey === FilterKeys.Lists ? "Create New List" : "Post", [filterKey])
  const inputPlaceholder = useMemo(() => filterKey === FilterKeys.Lists ? "New List..." : "What's Happening", [filterKey])

  return (
    <>
      {nsfwAlert && (
        <DangerAlert
          title="NSFW Photos Not Allowed"
          message={nsfwAlert}
          onClose={() => setNsfwAlert('')}
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex space-x-2 p-5"
      >
        <OptimizedImage
          classNames="h-8 w-8 md:h-10 md:w-10 lg:h-14 lg:w-14 rounded-full object-cover mt-4"
          src={currentSessionUser?.avatar ?? ""}
          alt=""
        />
        <div className="flex flex-1 item-center pl-2">
          <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
            <textarea
              data-testid="postboxinput"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setInput(prev => prev + '\n'); // Add newline character
                }
              }}
              placeholder={inputPlaceholder}
              className={`
                h-18 lg:h-24 w-full text-sm text-md lg:text-xl outline-none placeholder:text-sm md:placeholder:text-md lg:placeholder:text-xl 
                dark:text-gray-50 dark:bg-[#000000] resize-none p-2 lg:p-5  
              `}
            />
            {image && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className='relative'
              >
                <button
                  type="button"
                  onClick={() => setImage("")} // Replace with your close logic
                  className="absolute left-2 top-2 z-10 rounded-full bg-red-800 p-2 text-white hover:bg-red-700 focus:outline-none"
                  aria-label="Close"
                >
                  <XIcon className="h-5 w-5" />
                </button>
                <img
                  className="mt-10 h-40 w-full rounded-xl object-contain shadow-lg"
                  src={image}
                  width={20}
                  height={20}
                  alt="image/tweet"
                />
              </motion.div>
            )}
            <div style={{ display: 'flex', gap: '4px' }}>
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center mt-2">
              <div className="flex flex-1 space-x-2 text-[#55a8c2]">
                <PhotographIcon
                  onClick={handleUploadImage}
                  className="h-5 w-5 cursor-pointer
                transition-transform duration-150 ease-out
                hover:scale-150"
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  hidden
                  onChange={handleFileChange}
                />
                <EmojiHappyIcon
                  onClick={handleShowEmojiPicker}
                  className="h-5 w-5 cursor-pointer
                transition-transform duration-150 ease-out
                hover:scale-150"
                />
                {showEmojiPicker && (
                  <div style={{ position: "absolute", zIndex: 1000 }}>
                    <Picker
                      data={emojiData}
                      onEmojiSelect={handleEmojiSelect(input)}
                      onClickOutside={handleEmojiSelectClickOutside}
                    />
                  </div>
                )}
              </div>
              <CommonBoxButton 
                testId="postboxbutton"
                disabled={!input || submitting}
                submitting={submitting}
                buttonText={buttonText}
              />
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

export default PostBox;
