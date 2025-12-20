import { DangerAlert } from "@common/Alerts";
import UpsertBoxIconButton from "@common/UpsertBoxIconButtons";
import { faker } from "@faker-js/faker";
import { XIcon } from "@heroicons/react/solid";
import { useStore } from "@stores/index";
import { NOT_ALLOWED_NSFW_CHECKER_RESULTS } from "@utils/constants";
import { checkNsfwInImage, initializeClient } from "@utils/infrastructure/gradio";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import toast from "react-hot-toast";
import { CommentForm } from "typings";


type CommentBoxProps = {
    postId: string;
    userId: string;
    setCommentBoxOpen: (val: boolean) => void;
}

export default observer(function CommentBox({
    postId,
    userId,
    setCommentBoxOpen
}: CommentBoxProps) {
    const { commentFeedStore } = useStore();
    const {
        addComment,
    } = commentFeedStore;
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [commentNsfwAlert, setCommentNsfwAlert] = useState<string>("");

    const handleSubmitComment = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);

        const gradioClient = await initializeClient();
        const nsfwStatus = await checkNsfwInImage(gradioClient, image);
        if (nsfwStatus === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Somewhat Explicit'] || nsfwStatus === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Very Explicit']) {
            setCommentNsfwAlert("Please choose a different photo — explicit images aren’t allowed in comments.");
            setImage('');
            setSubmitting(false);
            return;
        }

        const commentToast = toast.loading("Posting Comment...");

        const newComment: CommentForm = {
            id: `comment_${faker.datatype.uuid()}`,
            postId: postId,
            userId: userId!,
            text: input,
            image: image
        }

        toast.success("Comment Posted!", {
            id: commentToast,
        });

        await addComment(newComment);
        setInput("");
        setImage("");
        setCommentBoxOpen(false);
        setSubmitting(false);
    };

    return (
        <>
            {commentNsfwAlert && (
                <DangerAlert
                    title="NSFW Photos Not Allowed"
                    message={commentNsfwAlert}
                    onClose={() => setCommentNsfwAlert('')}
                />
            )}
            <motion.div
                data-testid="commentbox"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className='flex flex-col justify-items-start'
            >
                <form
                    onSubmit={handleSubmitComment}
                    className="mt-3 flex flex-1 flex-col space-x-3"
                >
                    {image && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className='relative'
                        >
                            <button
                                onClick={() => setImage("")} // Replace with your close logic
                                className="absolute left-2 top-2 z-10 rounded-full bg-red-800 p-2 text-white hover:bg-red-700 focus:outline-none"
                                aria-label="Close"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                            <div className='w-[300px] h-[200px] overflow-hidden flex justify-center items-center'>
                                <img
                                    className="mt-10 w-[10rem] h-[10rem] object-cover shadow-lg"
                                    src={image}
                                    width={20}
                                    height={20}
                                    alt="image/tweet"
                                />
                            </div>
                        </motion.div>
                    )}
                    <div className="flex flex-col md:flex-row">

                        <input
                            data-testid="postcommentinput"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 rounded-lg bg-gray-100 p-2 outline-none dark:text-gray-50 dark:bg-gray-700"
                            type="text"
                            placeholder="Write a comment..."
                        />
                        <button
                            data-testid="postcommentbutton"
                            disabled={!input || submitting}
                            type="submit"
                            className={`
                                rounded-full bg-[#55a8c2] px-5 py-2 
                                font-bold text-white cursor-pointer
                                disabled:opacity-40`}
                        >
                            {submitting ? (
                                <svg
                                    aria-hidden="true"
                                    className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-[#55a8c2]"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                            ) : (
                                <>Post Comment</>
                            )}
                        </button>
                    </div>
                </form>
                <UpsertBoxIconButton setInput={setInput} input={input} setImage={setImage} />
            </motion.div>
        </>
    );
})