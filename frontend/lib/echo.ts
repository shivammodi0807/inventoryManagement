import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosApi from "./axiosApi";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null; // SSR guard
  if (echoInstance) return echoInstance;

  window.Pusher = Pusher;

  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
  const host = process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost";
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080);
  const isTLS = scheme === "https";

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: host,
    wsPort: isTLS ? undefined : port,
    wssPort: isTLS ? port : undefined,
    forceTLS: isTLS,
    enabledTransports: ["ws", "wss"],
    authorizer: (channel: { name: string }) => {
      return {
        authorize: (socketId: string, callback: (error: Error | null, data: unknown) => void) => {
          axiosApi
            .post("/api/broadcasting/auth", {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) => {
              callback(null, response.data);
            })
            .catch((error) => {
              callback(error, null);
            });
        },
      };
    },
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
