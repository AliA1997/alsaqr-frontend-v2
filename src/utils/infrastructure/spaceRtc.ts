import agent from "@utils/api/agent";
import {
  PublishSpaceAudioResultDto,
  SubscribeSpaceAudioResultDto,
} from "@models/space";

// WebRTC plumbing for spaces. Cloudflare provides TURN; the client only sets
// STUN/ICE config. All SDP exchange goes through the .NET proxy (spaceApiClient).

export function createPeer(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
    bundlePolicy: "max-bundle",
  });
}

export interface PublishResult {
  pc: RTCPeerConnection;
  stream: MediaStream;
  sessionId: string;
  trackName: string;
}

// Publish (speaker): grab the mic, OFFER to the backend, apply the SFU's
// ANSWER. The backend registers the track and announces it to everyone else.
export async function publishAudio(spaceId: string): Promise<PublishResult> {
  const pc = createPeer();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const tx = pc.addTransceiver(stream.getAudioTracks()[0], {
    direction: "sendonly",
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const { sessionId, trackName, answer }: PublishSpaceAudioResultDto =
    await agent.spaceApiClient.publish({ sdp: offer.sdp!, mid: tx.mid }, spaceId);

  await pc.setRemoteDescription(answer); // SFU answers on publish

  return { pc, stream, sessionId, trackName };
}

// Subscribe (listener): the SFU OFFERS (the reverse of publishing), we answer.
// Renegotiation ordering is strict: setRemoteDescription -> createAnswer ->
// setLocalDescription -> send. No reordering, no skipping.
export async function subscribeToSpeaker(
  spaceId: string,
  pc: RTCPeerConnection,
  pubSessionId: string,
  trackName: string,
  onTrack: (stream: MediaStream) => void
): Promise<void> {
  pc.ontrack = (e) => onTrack(e.streams[0]);

  const { sessionId, offer }: SubscribeSpaceAudioResultDto =
    await agent.spaceApiClient.subscribe({ pubSessionId, trackName }, spaceId);

  await pc.setRemoteDescription(offer); // SFU OFFERS on subscribe
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await agent.spaceApiClient.renegotiate({ sessionId, sdp: answer.sdp! }, spaceId);
}

// Hidden <audio> elements per speaker. Playback must be unlocked by a prior
// user gesture (the "Join" tap) or el.play() rejects — the autoplay gate.
const hiddenAudioRegistry = new Map<string, HTMLAudioElement>();

export function attachHiddenAudio(userId: string, stream: MediaStream) {
  removeHiddenAudio(userId);

  const el = document.createElement("audio");
  el.srcObject = stream;
  el.autoplay = true;
  (el as any).playsInline = true;
  el.style.display = "none";
  document.body.appendChild(el);
  el.play().catch(() => {/* needs a prior user gesture — join is gated behind a tap */});

  hiddenAudioRegistry.set(userId, el);
}

export function removeHiddenAudio(userId: string) {
  const el = hiddenAudioRegistry.get(userId);
  if (el) {
    el.srcObject = null;
    el.remove();
    hiddenAudioRegistry.delete(userId);
  }
}

export function removeAllHiddenAudio() {
  Array.from(hiddenAudioRegistry.keys()).forEach(removeHiddenAudio);
}

// Teardown must run on EVERY exit path (unmount, explicit leave, network
// death, tab close) — otherwise audio keeps being pulled for nobody.
export function teardownPeer(pc?: RTCPeerConnection, stream?: MediaStream) {
  stream?.getTracks().forEach(t => t.stop());
  pc?.getSenders().forEach(s => s.track?.stop());
  pc?.close();
}
