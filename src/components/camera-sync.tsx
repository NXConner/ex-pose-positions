import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShared } from "@/hooks/use-shared";
import { useCameraSession } from "@/hooks/use-camera-session";
import { cn } from "@/utils/cn";

type MediaDeviceOption = {
  deviceId: string;
  label: string;
};

type LocalFeed = {
  id: string;
  label: string;
  stream: MediaStream;
};

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // ignore
    }
  });
}

function VideoTile({
  stream,
  label,
  muted,
}: {
  stream: MediaStream;
  label: string;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const element = videoRef.current;
      if ("srcObject" in element) {
        element.srcObject = stream;
      } else {
        element.src = URL.createObjectURL(stream);
      }
    }
  }, [stream]);

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-300">
        {label}
      </div>
      <div className="relative aspect-video overflow-hidden rounded-md bg-black/80">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="h-full w-full object-cover"
        />
        {muted && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
            Muted locally
          </span>
        )}
      </div>
    </div>
  );
}

export function CameraSync() {
  const { docId, me } = useShared();
  const participantLabel = useMemo(
    () => (me ? `Camera ${me.slice(-6).toUpperCase()}` : "Primary Camera"),
    [me]
  );

  const {
    shareCode,
    shareLink,
    participants,
    remoteFeeds,
    localCameras,
    countdown,
    isRecording,
    isConnected,
    registerLocalCamera,
    unregisterLocalCamera,
    startSyncedRecording,
    stopSyncedRecording,
  } = useCameraSession(docId, participantLabel);

  const [devices, setDevices] = useState<MediaDeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("default");
  const [isEnumerating, setIsEnumerating] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [localFeeds, setLocalFeeds] = useState<LocalFeed[]>([]);

  const localStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      setIsEnumerating(true);
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
      setDevices(cams);
    } catch {
      setErrorMessage(
        "Unable to enumerate cameras. Ensure you have granted camera permissions."
      );
    } finally {
      setIsEnumerating(false);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
    if (!navigator.mediaDevices) return;

    const handler = () => {
      refreshDevices();
    };

    if (typeof navigator.mediaDevices.addEventListener === "function") {
      navigator.mediaDevices.addEventListener("devicechange", handler);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", handler);
      };
    }

    navigator.mediaDevices.ondevicechange = handler;
    return () => {
      navigator.mediaDevices.ondevicechange = null;
    };
  }, [refreshDevices]);

  useEffect(() => {
    setLocalFeeds((prev) =>
      prev.filter((feed) => localCameras.some((local) => local.id === feed.id))
    );
  }, [localCameras]);

  const teardownAllLocalStreams = useCallback(() => {
    localStreamsRef.current.forEach((stream) => stopStream(stream));
    localStreamsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      teardownAllLocalStreams();
    };
  }, [teardownAllLocalStreams]);

  const attachCamera = useCallback(
    async (deviceId: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage("Camera access is not supported in this browser.");
        return;
      }
      setIsCapturing(true);
      try {
        const includeAudio = localCameras.length === 0;
        const constraints: MediaStreamConstraints = {
          video:
            deviceId === "default"
              ? { width: { ideal: 1280 }, height: { ideal: 720 } }
              : { deviceId: { exact: deviceId } },
          audio: includeAudio,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoTrack = stream.getVideoTracks()[0];
        const computedLabel =
          videoTrack?.label ||
          devices.find((device) => device.deviceId === deviceId)?.label ||
          (deviceId === "default"
            ? "Primary Camera"
            : `Camera ${localCameras.length + 1}`);

        const cameraId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `camera-${Date.now()}`;

        registerLocalCamera({
          id: cameraId,
          label: computedLabel,
          stream,
          deviceId: deviceId === "default" ? null : deviceId,
        });

        localStreamsRef.current.set(cameraId, stream);
        setLocalFeeds((prev) => [
          ...prev,
          {
            id: cameraId,
            label: computedLabel,
            stream,
          },
        ]);

        setErrorMessage(null);
        await refreshDevices();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to access the selected camera."
        );
      } finally {
        setIsCapturing(false);
      }
    },
    [devices, localCameras.length, refreshDevices, registerLocalCamera]
  );

  const handleEnableCamera = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      await attachCamera(selectedDeviceId);
    },
    [attachCamera, selectedDeviceId]
  );

  const handleRemoveCamera = useCallback(
    (cameraId: string) => {
      const stream = localStreamsRef.current.get(cameraId);
      if (stream) {
        stopStream(stream);
        localStreamsRef.current.delete(cameraId);
      }
      unregisterLocalCamera(cameraId);
      setLocalFeeds((prev) => prev.filter((feed) => feed.id !== cameraId));
    },
    [unregisterLocalCamera]
  );

  const handleCopyShare = useCallback(async () => {
    if (!shareLink || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage(
        "Unable to copy link to clipboard. Copy manually if needed."
      );
    }
  }, [shareLink]);

  const remoteVideoTiles = useMemo(
    () =>
      remoteFeeds.map((feed) => (
        <VideoTile
          key={feed.streamId}
          stream={feed.stream}
          label={`Remote · ${feed.label}`}
        />
      )),
    [remoteFeeds]
  );

  const localVideoTiles = useMemo(
    () =>
      localFeeds.map((feed, index) => (
        <VideoTile
          key={feed.id}
          stream={feed.stream}
          label={`Local · ${feed.label}${index === 0 ? " (Primary)" : ""}`}
          muted
        />
      )),
    [localFeeds]
  );

  const showEmptyState = localVideoTiles.length + remoteVideoTiles.length === 0;

  return (
    <section className="w-full rounded-lg border border-slate-800/60 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">
            Camera Sync Control Center
          </h4>
          <p className="text-sm text-slate-300">
            Link multiple cameras, preview every angle in real time, and start
            perfectly synced recordings with a single tap.
          </p>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              isConnected ? "text-emerald-400" : "text-amber-300"
            )}
          >
            {isConnected ? "Realtime link online" : "Waiting for Supabase realtime"}
          </div>
          <div className="text-xs text-slate-400">
            Session Code:{" "}
            <span className="font-semibold text-slate-200">
              {shareCode ?? "—"}
            </span>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleEnableCamera}
        className="mt-5 flex flex-col gap-3 md:flex-row md:items-end"
      >
        <div className="md:w-64">
          <label
            htmlFor="camera-select"
            className="block text-xs font-semibold uppercase tracking-wide text-slate-300"
          >
            Select Camera
          </label>
          <select
            id="camera-select"
            value={selectedDeviceId}
            onChange={(event) => setSelectedDeviceId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="default">Default Camera</option>
            {devices.map((device) => (
              <option key={device.deviceId || device.label} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-600/40"
            disabled={isCapturing}
          >
            {isCapturing ? "Enabling…" : "Enable Selected Camera"}
          </button>
          <button
            type="button"
            onClick={() => startSyncedRecording()}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-600/50"
            disabled={!localFeeds.length || isRecording}
          >
            Start Synced Recording
          </button>
          <button
            type="button"
            onClick={() => stopSyncedRecording()}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isRecording}
          >
            Stop &amp; Save Clips
          </button>
          <button
            type="button"
            onClick={refreshDevices}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isEnumerating}
          >
            {isEnumerating ? "Refreshing…" : "Refresh Cameras"}
          </button>
        </div>
      </form>

      {countdown > 0 && (
        <div className="mt-3 rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-sm font-semibold text-emerald-200">
          Recording kicks off in {countdown}s — all linked cameras will start
          automatically.
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 rounded-md border border-rose-500/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Local Cameras ({localFeeds.length})
            </h5>
            <span className="text-xs text-slate-400">
              Audio enabled on first camera for shared capture.
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {localFeeds.map((feed, index) => (
              <li
                key={feed.id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2"
              >
                <div>
                  <div className="font-medium">
                    {feed.label}
                    {index === 0 && (
                      <span className="ml-1 rounded bg-emerald-600/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">ID: {feed.id.slice(0, 8)}</div>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-transparent px-3 py-1 text-xs font-semibold text-rose-200 hover:border-rose-600 hover:bg-rose-600/20"
                  onClick={() => handleRemoveCamera(feed.id)}
                >
                  Remove
                </button>
              </li>
            ))}
            {!localFeeds.length && (
              <li className="rounded-md border border-dashed border-slate-700 bg-slate-900/60 px-3 py-6 text-center text-sm text-slate-400">
                No local camera active yet. Enable one to start syncing.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Linked Devices ({participants.length})
            </h5>
            <button
              type="button"
              onClick={handleCopyShare}
              className="rounded-md border border-emerald-500/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300 transition hover:bg-emerald-500/10"
              disabled={!shareLink}
            >
              {copied ? "Link Copied" : "Copy Join Link"}
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Share the join link with any device on the same network (or remote) to
            add additional camera angles. As soon as they open the link and enable a
            camera, it appears here instantly.
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {participants.map((participant) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2"
              >
                <div>
                  <div className="font-medium">{participant.label}</div>
                  <div className="text-xs text-slate-400">
                    {participant.isSelf ? "This device" : `Remote ID: ${participant.id.slice(0, 8)}`}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    participant.connected ? "text-emerald-300" : "text-slate-500"
                  )}
                >
                  {participant.connected ? "Online" : "Offline"}
                </span>
              </li>
            ))}
            {!participants.length && (
              <li className="rounded-md border border-dashed border-slate-700 bg-slate-900/60 px-3 py-6 text-center text-sm text-slate-400">
                Waiting for realtime session ↺
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {localVideoTiles}
        {remoteVideoTiles}
        {showEmptyState && (
          <div className="rounded-lg border border-dashed border-slate-700/70 bg-slate-900/50 p-6 text-center text-sm text-slate-400 lg:col-span-2">
            Activate a local camera or share the join link to see live feeds here.
          </div>
        )}
      </div>
    </section>
  );
}

