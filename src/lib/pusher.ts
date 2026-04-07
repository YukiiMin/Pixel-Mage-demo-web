import Pusher from "pusher-js";

const SOKETI_KEY = process.env.NEXT_PUBLIC_SOKETI_KEY || 'app-key';
const SOKETI_HOST = process.env.NEXT_PUBLIC_SOKETI_HOST || '127.0.0.1';
const SOKETI_PORT = Number(process.env.NEXT_PUBLIC_SOKETI_PORT ?? 6001);

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(SOKETI_KEY, {
      wsHost: SOKETI_HOST,
      wsPort: SOKETI_PORT,
      forceTLS: false, // Set to true if your Soketi handles SSL
      enabledTransports: ["ws"],
      disableStats: true,
      cluster: "mt1", // Irrelevant for Soketi but required by pusher-js
    });
  }
  return pusherInstance;
}

export function disconnectPusher() {
  pusherInstance?.disconnect();
  pusherInstance = null;
}
