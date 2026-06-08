import { NoRecordsTitle } from '@common/Titles';
import { convertDateToDisplay } from '@utils/index';
import { useState, useEffect, useRef, useMemo } from 'react';
import TimeAgo from "react-timeago";
import { SkeletonLoader } from '@common/CustomLoader';
import toast from 'react-hot-toast';
import { MessageFormDto, User } from 'typings.d';
import { ModalBody, ModalPortal } from './Modal';
import { observer } from 'mobx-react-lite';
import { useStore } from '@stores/index';
import { MessagesImagePreview } from './Containers';
import MessageInput from '@components/message/MessageInput';
import { OptimizedImage, OptimizedPostImage } from './Image';
import { checkNsfwInImage, initializeClient } from '@utils/infrastructure/gradio';
import { NOT_ALLOWED_NSFW_CHECKER_RESULTS } from '@utils/constants';

type Props = {
    loggedInUser: User;
    usersInMessageModal: any[];
}

const MessageModal = ({
    loggedInUser,
    usersInMessageModal,
}: Props) => {
    const { messageStore, modalStore } = useStore();
    const { closeModal } = modalStore;
    const {
        loadingUpsert,
        loadingInitial, 
        loadDirectMessages, 
        sendDirectMessage ,
        directMessages
    } = messageStore;
    const [submitting, setSubmitting] = useState<boolean>(false);
    const sender = useMemo(() => usersInMessageModal[0], [usersInMessageModal]);
    const senderUserId = useMemo(() => sender.id ?? sender.userId, [usersInMessageModal]);
    const receiver = useMemo(() => usersInMessageModal[1], [usersInMessageModal]);
    const receiverUserId = useMemo(() => receiver.id ?? receiver.userId, [usersInMessageModal]);

    const [input, setInput] = useState('');
    const [image, setImage] = useState('');
    const [hasError, setHasError] = useState(false);
    const [nsfwAlert, setNsfwAlert] = useState('');
    const [processNsfwCheck, setProcessNsfwCheck] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [directMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(sender)
            loadDirectMessages(senderUserId, receiverUserId);
    }, [receiver])


    useEffect(() => {
        if (processNsfwCheck) {
            initializeClient()
                .then((gradioClient) => checkNsfwInImage(gradioClient, image))
                .then((resolvedNsfwStatus: string) => {
                    if (resolvedNsfwStatus === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Somewhat Explicit'] || resolvedNsfwStatus === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Very Explicit']) {
                        setNsfwAlert(`Please choose a different photo — explicit images aren’t allowed in messages.`);
                        setHasError(true);
                    } else {
                        setNsfwAlert('');
                        setHasError(false);
                    }
                })
                .catch(err => {
                    console.log("Error:", err);
                    setHasError(true);
                })
                .finally(() => {
                    setProcessNsfwCheck(false);
                });
        }

        return () => { }
    }, [processNsfwCheck]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        if (!input.trim()) return;

        const messageForm: MessageFormDto = {
          senderId: senderUserId,
          senderUsername: sender.username,
          senderProfileImg: sender.avatar,
          recipientId: receiverUserId,
          recipientUsername: receiver.username,
          recipientProfileImg: receiver.avatar,
          image: image,
          text: input
        };

        try {
            await sendDirectMessage(messageForm);

            setInput('');
            setImage('');

              toast("Message Posted!", {
                icon: "🚀",
              });

            await loadDirectMessages(senderUserId, receiverUserId);
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalPortal>
            <ModalBody
                classNames=""
                onClose={() => closeModal()}
                headerChildren={
                    <div className="flex justify-between bg-transparent p-4 flex items-center dark:bg-[#0e1517]">
                        <div className="flex space-x-2">
                            {usersInMessageModal.map((user: User, index: number) => (
                                <MessagesImagePreview key={index} user={user} index={index} />
                                ))}
                        </div>
                        <div className="ml-3">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-50">
                                Direct Message to {receiver.username}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {/* {users.filter(user => user.isOnline).length} online */}
                            </p>
                        </div>
                        <button
                            onClick={() => closeModal()}
                            className="text-gray-400 hover:text-gray-600 block float-right"
                        >
                            <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                            </svg>
                        </button>
                    </div>
                }
            >
                <div className="h-[60vh] flex flex-col bg-gray-50 dark:bg-[#0e1517]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingInitial ? (
                            <SkeletonLoader />
                        ) : (
                            <>
                                {directMessages && directMessages.length
                                    ? directMessages.map((messageToDisplay) => (
                                        <div
                                            key={messageToDisplay.messageId}
                                            className={`flex ${messageToDisplay.senderId === loggedInUser.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!(messageToDisplay.senderId === loggedInUser.id) && (
                                                <OptimizedImage
                                                    src={messageToDisplay.senderAvatar ?? ''}
                                                    alt={messageToDisplay.senderUsername ?? ''}
                                                    classNames="w-8 h-8 rounded-full mr-2 mt-1"
                                                />
                                            )}
                                            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${(messageToDisplay.senderId === loggedInUser.id) ? 'flex flex-col items-end' : ''}`}>
                                                
                                                <div
                                                    className={`p-3 max-h-[50] rounded-lg ${(messageToDisplay.senderId === loggedInUser.id) ? 'bg-blue-500 text-white' : 'bg-[#55a8c2] text-white'} max-w-xs`}
                                                >
                                                    <p className="overflow-x-auto whitespace-nowrap">{messageToDisplay.messageContent}</p>
                                                    {messageToDisplay.messageMedia && (
                                                        <OptimizedPostImage
                                                            src={messageToDisplay.messageMedia}
                                                            alt="img/tweet"
                                                            classNames="m-5 ml-0 max-h-60 rounded-lg object-cover shadow-sm"
                                                        />
                                                    )}
                                                </div>
                                                <TimeAgo
                                                    className="text-sm text-gray-500"
                                                    date={convertDateToDisplay(messageToDisplay.messageCreatedAt)}
                                                />
                                            </div>
                                        </div>
                                    ))
                                    : <NoRecordsTitle>No Messages to Display</NoRecordsTitle>}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    <MessageInput 
                        onSubmit={handleSendMessage}
                        image={image}
                        setImage={(val: string) => {
                            setImage(val);
                            if(val){
                                setProcessNsfwCheck(true);
                            } else {
                                setHasError(false);
                            }

                        }}
                        input={input}
                        setInput={setInput}
                        loading={loadingUpsert}
                        submitting={submitting}
                        processNsfwCheck={processNsfwCheck}
                        nsfwAlert={nsfwAlert}
                        setNsfwAlert={setNsfwAlert}
                        hasError={hasError}
                    />
                </div>
            </ModalBody>
        </ModalPortal>
    );
};

export default observer(MessageModal);