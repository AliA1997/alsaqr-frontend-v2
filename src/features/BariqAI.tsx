import { useRef, useState } from "react";
import toast from "react-hot-toast";

/**
 * BariqAI — lightweight Google Gemini chatbot.
 *
 * Setup:
 *  1. Add to your .env:  VITE_PUBLIC_GEMINI_API_KEY=<your gemini api key>
 *     (get a key at https://aistudio.google.com/apikey)
 *  2. Default model is `gemini-2.0-flash` — Google's low-cost / high-speed tier.
 *     Swap GEMINI_MODEL below for `gemini-2.0-flash-lite` for the cheapest option.
 *
 * Everything (state, API call, JSX) lives in this file so it's easy to edit later.
 * For production, move the API call behind your own backend so the key isn't exposed.
 */

// --- Config (edit here) ---------------------------------------------------
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_KEY = import.meta.env.VITE_PUBLIC_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const SYSTEM_PROMPT =
  "You are Bariq, the friendly AI assistant for the Alsaqr app. Be concise and helpful.";
// -------------------------------------------------------------------------

type ChatImage = { dataUrl: string; mimeType: string; base64: string };

type ChatMessage = {
  role: "user" | "model";
  text: string;
  image?: string; // dataUrl for display only
};

// Gemini expects raw base64 (no `data:...;base64,` prefix).
function readImageFile(file: File): Promise<ChatImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve({
        dataUrl,
        mimeType: file.type,
        base64: dataUrl.split(",")[1] ?? "",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BariqAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<ChatImage | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    try {
      setPendingImage(await readImageFile(file));
    } catch {
      toast.error("Couldn't read that image.");
    } finally {
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  async function callGemini(
    history: ChatMessage[],
    userImage: ChatImage | null,
  ) {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Missing VITE_PUBLIC_GEMINI_API_KEY in your environment.",
      );
    }

    // Map our chat history into Gemini's `contents` shape.
    const contents = history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }] as Array<Record<string, unknown>>,
    }));

    // Attach the uploaded image to the latest user turn.
    if (userImage && contents.length) {
      contents[contents.length - 1].parts.push({
        inline_data: { mime_type: userImage.mimeType, data: userImage.base64 },
      });
    }

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(
        err?.error?.message ?? `Gemini request failed (${res.status})`,
      );
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text)
        .join("") ?? "";
    return text || "Sorry, I couldn't generate a response.";
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!input.trim() && !pendingImage) || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: input.trim(),
      image: pendingImage?.dataUrl,
    };
    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput("");
    const imageForRequest = pendingImage;
    setPendingImage(null);
    setLoading(true);
    scrollToBottom();

    try {
      const reply = await callGemini(nextHistory, imageForRequest);
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "⚠️ I ran into an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        {/* Assistant avatar — drop the Bariq image here */}
        <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden shrink-0">
          {/* TODO: replace with <img src={assistantImage} alt="Bariq" className="size-full object-cover" /> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight">Bariq AI</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Google Gemini
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 px-6">
            <p className="text-lg font-semibold mb-1">Ask Bariq anything</p>
            <p className="text-sm">
              Type a message or upload an image to get started.
            </p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              }`}
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="upload"
                  className="mb-2 rounded-lg max-h-48 w-auto object-cover"
                />
              )}
              {m.text && (
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-2 rounded-full bg-gray-400 animate-bounce" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 dark:border-gray-800 p-3 shrink-0"
      >
        {pendingImage && (
          <div className="relative inline-block mb-2">
            <img
              src={pendingImage.dataUrl}
              alt="preview"
              className="h-20 w-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -top-2 -right-2 size-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-gray-700"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Upload image / screenshot */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 shrink-0"
            aria-label="Upload image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Bariq…"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !pendingImage)}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
