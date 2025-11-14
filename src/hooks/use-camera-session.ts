import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/services/supabase-client";
import { logger } from "@/services/logging";

type SignalPayload =
  | {
      type: "offer";
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "answer";
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "candidate";
      from: string;
      to: string;
      candidate: RTCIceCandidateInit;
    };

type CommandPayload =
  | {
      action: "start";
      from: string;
      startAt: number;
      issuedAt: number;
    }
  | {
      action: "stop";
      from: string;
      issuedAt: number;
    };

export interface LocalCameraDescriptor {
  id: string;
  label: string;
  stream: MediaStream;
  deviceId?: string | null;
}

export interface LocalCameraSnapshot {
  id: string;
  label: string;
  active: boolean;
}

export interface RemoteCameraFeed {
  participantId: string;
  streamId: string;
  label: string;
  stream: MediaStream;
}

export interface ParticipantInfo {
  id: string;
  label: string;
  isSelf: boolean;
  connected: boolean;
}

export interface CameraSessionState {
  sessionId: string | null;
  shareCode: string | null;
  shareLink: string | null;
  participants: ParticipantInfo[];
  remoteFeeds: RemoteCameraFeed[];
  localCameras: LocalCameraSnapshot[];
  countdown: number;
  isRecording: boolean;
  isConnected: boolean;
}

export interface CameraSessionControls extends CameraSessionState {
  registerLocalCamera: (camera: LocalCameraDescriptor) => void;
  unregisterLocalCamera: (cameraId: string) => void;
  startSyncedRecording: (leadTimeMs?: number) => void;
  stopSyncedRecording: (options?: { broadcast?: boolean }) => void;
  participantId: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
};

const CAMERA_SESSION_STORAGE_KEY = "ics.camera.session";

function buildShareLink(sessionId: string | null): string | null {
  if (!sessionId || typeof window === "undefined") {
    return null;
  }
  const { origin, pathname } = window.location;
  const separator = pathname.endsWith("/") ? "" : "/";
  return `${origin}${separator}?cameraSession=${encodeURIComponent(sessionId)}`;
}

export function useCameraSession(
  docKey: string | null,
  participantLabel: string
): CameraSessionControls {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const participantIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  const channelRef = useRef<RealtimeChannel | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<
    Map<
      string,
      {
        stream: MediaStream;
        participantId: string;
        label: string;
      }
    >
  >(new Map());
  const localStreamsRef = useRef<
    Map<
      string,
      {
        descriptor: LocalCameraDescriptor;
        trackIds: Set<string>;
      }
    >
  >(new Map());
  const recordersRef = useRef<
    Map<
      string,
      {
        recorder: MediaRecorder;
        chunks: Blob[];
        label: string;
        streamId: string;
      }
    >
  >(new Map());
  const countdownTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (docKey) return docKey;
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(CAMERA_SESSION_STORAGE_KEY);
    if (stored) return stored;
    const generated =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(CAMERA_SESSION_STORAGE_KEY, generated);
    return generated;
  });

  useEffect(() => {
    if (docKey) {
      setSessionId(docKey);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CAMERA_SESSION_STORAGE_KEY, docKey);
      }
    }
  }, [docKey]);

  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [remoteFeeds, setRemoteFeeds] = useState<RemoteCameraFeed[]>([]);
  const [localCameraSnapshots, setLocalCameraSnapshots] = useState<
    LocalCameraSnapshot[]
  >([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const shareLink = useMemo(() => buildShareLink(sessionId), [sessionId]);
  const shareCode = sessionId;

  const cleanupCountdownTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      window.clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(0);
  }, []);

  const updateLocalSnapshots = useCallback(() => {
    setLocalCameraSnapshots(
      Array.from(localStreamsRef.current.values()).map(({ descriptor }) => ({
        id: descriptor.id,
        label: descriptor.label,
        active: descriptor.stream
          .getTracks()
          .some((track) => track.readyState === "live"),
      }))
    );
  }, []);

const removeRemoteStream = useCallback((streamId: string) => {
  if (!remoteStreamsRef.current.has(streamId)) return;
  remoteStreamsRef.current.delete(streamId);
  const recorderKey = `remote-${streamId}`;
  if (recordersRef.current.has(recorderKey)) {
    const entry = recordersRef.current.get(recorderKey);
    if (entry) {
      try {
        if (entry.recorder.state !== "inactive") {
          entry.recorder.stop();
        }
      } catch {
        // ignore
      }
    }
    recordersRef.current.delete(recorderKey);
  }
  setRemoteFeeds(
    Array.from(remoteStreamsRef.current.entries()).map(([id, entry]) => ({
      participantId: entry.participantId,
      streamId: id,
      label: entry.label,
      stream: entry.stream,
    }))
  );
}, []);

  const ensurePeer = useCallback(
    (remoteId: string) => {
      let peer = peersRef.current.get(remoteId);
      if (peer) {
        return peer;
      }
      peer = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set(remoteId, peer);

      peer.onicecandidate = (event) => {
        if (!event.candidate || !channelRef.current) return;
        const payload: SignalPayload = {
          type: "candidate",
          from: participantIdRef.current,
          to: remoteId,
          candidate: event.candidate.toJSON(),
        };
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload,
        });
      };

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) return;
        const label =
          participants.find((p) => p.id === remoteId)?.label ??
          `Remote ${remoteId.slice(0, 6)}`;
        remoteStreamsRef.current.set(stream.id, {
          stream,
          participantId: remoteId,
          label,
        });
        setRemoteFeeds(
          Array.from(remoteStreamsRef.current.entries()).map(([id, entry]) => ({
            participantId: entry.participantId,
            streamId: id,
            label: entry.label,
            stream: entry.stream,
          }))
        );
        stream.getTracks().forEach((track) => {
          track.onended = () => removeRemoteStream(stream.id);
        });
      };

      peer.onconnectionstatechange = () => {
        if (
          peer.connectionState === "disconnected" ||
          peer.connectionState === "failed" ||
          peer.connectionState === "closed"
        ) {
          peersRef.current.delete(remoteId);
          Array.from(remoteStreamsRef.current.entries()).forEach(
            ([streamId, entry]) => {
              if (entry.participantId === remoteId) {
                removeRemoteStream(streamId);
              }
            }
          );
          try {
            peer.close();
          } catch (error) {
            logger.warn("camera-peer-close-error", {
              error: String(error),
              remoteId,
            });
          }
        }
      };

      localStreamsRef.current.forEach(({ descriptor }) => {
        descriptor.stream
          .getTracks()
          .forEach((track) => peer?.addTrack(track, descriptor.stream));
      });

      return peer;
    },
    [participants, removeRemoteStream]
  );

  const handlePresenceSync = useCallback(() => {
    if (!channelRef.current) return;
    const state = channelRef.current.presenceState<Record<string, { displayName?: string }>>();
    const entries: ParticipantInfo[] = [];
    Object.entries(state).forEach(([key, sessions]) => {
      if (!sessions.length) return;
      const latest = sessions.at(-1);
      entries.push({
        id: key,
        label: latest?.displayName || `Participant ${key.slice(0, 6)}`,
        isSelf: key === participantIdRef.current,
        connected: true,
      });
    });
    setParticipants(entries);

    const remoteIds = entries
      .filter((entry) => !entry.isSelf)
      .map((entry) => entry.id);

    peersRef.current.forEach((peer, remoteId) => {
      if (!remoteIds.includes(remoteId)) {
        peer.getSenders().forEach((sender) => {
          try {
            peer.removeTrack(sender);
          } catch {
            // ignore
          }
        });
        try {
          peer.close();
        } catch {
          // ignore
        }
        peersRef.current.delete(remoteId);
      }
    });

    remoteIds.forEach((remoteId) => {
      const shouldInitiate =
        participantIdRef.current.localeCompare(remoteId) === 1;
      const peer = ensurePeer(remoteId);
      if (shouldInitiate && peer) {
        peer
          .createOffer()
          .then(async (offer) => {
            await peer.setLocalDescription(offer);
            if (!channelRef.current) return;
            const payload: SignalPayload = {
              type: "offer",
              from: participantIdRef.current,
              to: remoteId,
              sdp: offer,
            };
            channelRef.current.send({
              type: "broadcast",
              event: "signal",
              payload,
            });
          })
          .catch((error) => {
            logger.error("camera-offer-failed", {
              error: String(error),
              remoteId,
            });
          });
      }
    });
  }, [ensurePeer]);

  const processSignal = useCallback(
    async (payload: SignalPayload) => {
      if (payload.to !== participantIdRef.current) return;
      const peer = ensurePeer(payload.from);
      try {
        if (payload.type === "offer") {
          await peer.setRemoteDescription(payload.sdp);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          if (!channelRef.current) return;
          const response: SignalPayload = {
            type: "answer",
            from: participantIdRef.current,
            to: payload.from,
            sdp: answer,
          };
          channelRef.current.send({
            type: "broadcast",
            event: "signal",
            payload: response,
          });
        } else if (payload.type === "answer") {
          if (!peer.currentRemoteDescription) {
            await peer.setRemoteDescription(payload.sdp);
          }
        } else if (payload.type === "candidate") {
          await peer.addIceCandidate(payload.candidate);
        }
      } catch (error) {
        logger.error("camera-signal-error", {
          type: payload.type,
          error: String(error),
          from: payload.from,
        });
      }
    },
    [ensurePeer]
  );

  const startLocalRecording = useCallback(() => {
    recordersRef.current.forEach((entry) => {
      entry.recorder.stop();
    });
    recordersRef.current.clear();

    const startRecorderForStream = (
      stream: MediaStream,
      label: string,
      streamId: string
    ) => {
      try {
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data?.size > 0) {
            chunks.push(event.data);
          }
        };
        recorder.onstop = () => {
          if (!chunks.length) return;
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `${label.replace(/\\s+/g, \"-\")}-${new Date()
            .toISOString()
            .replace(/[:.]/g, \"\")}.webm`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        };
        recorder.start();
        recordersRef.current.set(streamId, {
          recorder,
          chunks,
          label,
          streamId,
        });
      } catch (error) {
        logger.warn("camera-recorder-error", {
          label,
          error: String(error),
        });
      }
    };

    localStreamsRef.current.forEach(({ descriptor }) => {
      startRecorderForStream(
        descriptor.stream,
        descriptor.label,
        `local-${descriptor.id}`
      );
    });
    remoteStreamsRef.current.forEach((entry) => {
      startRecorderForStream(
        entry.stream,
        entry.label,
        `remote-${entry.stream.id}`
      );
    });
    setIsRecording(true);
  }, []);

  const stopLocalRecording = useCallback(() => {
    recordersRef.current.forEach(({ recorder }) => {
      try {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      } catch (error) {
        logger.warn("camera-recorder-stop-error", { error: String(error) });
      }
    });
    recordersRef.current.clear();
    setIsRecording(false);
  }, []);

  const scheduleRecording = useCallback(
    (startAt: number) => {
      cleanupCountdownTimers();
      const delay = Math.max(0, startAt - Date.now());
      if (delay === 0) {
        startLocalRecording();
        return;
      }
      setCountdown(Math.ceil(delay / 1000));
      countdownIntervalRef.current = window.setInterval(() => {
        const remaining = Math.max(0, startAt - Date.now());
        setCountdown(Math.ceil(remaining / 1000));
        if (remaining <= 0 && countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }, 500);
      countdownTimerRef.current = window.setTimeout(() => {
        setCountdown(0);
        startLocalRecording();
      }, delay);
    },
    [cleanupCountdownTimers, startLocalRecording]
  );

  const handleCommand = useCallback(
    (payload: CommandPayload) => {
      if (payload.action === "start") {
        scheduleRecording(payload.startAt);
      } else if (payload.action === "stop") {
        stopLocalRecording();
      }
    },
    [scheduleRecording, stopLocalRecording]
  );

  useEffect(() => {
    if (!sessionId || !supabase) {
      setIsConnected(false);
      return;
    }

    const channel = supabase.channel(`camera_sync:${sessionId}`, {
      config: {
        presence: {
          key: participantIdRef.current,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, handlePresenceSync)
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        processSignal(payload as SignalPayload);
      })
      .on("broadcast", { event: "command" }, ({ payload }) => {
        handleCommand(payload as CommandPayload);
      });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        channel.track({
          displayName: participantLabel || `Participant ${participantIdRef.current.slice(0, 6)}`,
        });
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsConnected(false);
      }
    });

    channelRef.current = channel;
    return () => {
      setIsConnected(false);
      cleanupCountdownTimers();
      channel.unsubscribe();
      channelRef.current = null;
      peersRef.current.forEach((peer) => {
        try {
          peer.close();
        } catch {
          // ignore
        }
      });
      peersRef.current.clear();
      remoteStreamsRef.current.clear();
      setRemoteFeeds([]);
    };
  }, [
    handleCommand,
    handlePresenceSync,
    processSignal,
    cleanupCountdownTimers,
    supabase,
    sessionId,
    participantLabel,
  ]);

  const registerLocalCamera = useCallback(
    (descriptor: LocalCameraDescriptor) => {
      localStreamsRef.current.set(descriptor.id, {
        descriptor,
        trackIds: new Set(descriptor.stream.getTracks().map((track) => track.id)),
      });
      peersRef.current.forEach((peer) => {
        descriptor.stream
          .getTracks()
          .forEach((track) => peer.addTrack(track, descriptor.stream));
      });
      updateLocalSnapshots();
    },
    [updateLocalSnapshots]
  );

  const unregisterLocalCamera = useCallback(
    (cameraId: string) => {
      const record = localStreamsRef.current.get(cameraId);
      if (!record) return;
      record.descriptor.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      peersRef.current.forEach((peer) => {
        peer.getSenders().forEach((sender) => {
          if (record.trackIds.has(sender.track?.id ?? "")) {
            try {
              peer.removeTrack(sender);
            } catch (error) {
              logger.warn("camera-remove-track-error", {
                error: String(error),
              });
            }
          }
        });
      });
      localStreamsRef.current.delete(cameraId);
      updateLocalSnapshots();
    },
    [updateLocalSnapshots]
  );

  const startSyncedRecording = useCallback(
    (leadTimeMs = 3_000) => {
      if (!channelRef.current) {
        scheduleRecording(Date.now() + leadTimeMs);
        return;
      }
      const startAt = Date.now() + leadTimeMs;
      const payload: CommandPayload = {
        action: "start",
        from: participantIdRef.current,
        startAt,
        issuedAt: Date.now(),
      };
      channelRef.current.send({
        type: "broadcast",
        event: "command",
        payload,
      });
      scheduleRecording(startAt);
    },
    [scheduleRecording]
  );

  const stopSyncedRecording = useCallback(
    (options?: { broadcast?: boolean }) => {
      const shouldBroadcast = options?.broadcast !== false;
      if (shouldBroadcast && channelRef.current) {
        const payload: CommandPayload = {
          action: "stop",
          from: participantIdRef.current,
          issuedAt: Date.now(),
        };
        channelRef.current.send({
          type: "broadcast",
          event: "command",
          payload,
        });
      }
      stopLocalRecording();
      cleanupCountdownTimers();
    },
    [cleanupCountdownTimers, stopLocalRecording]
  );

  useEffect(() => {
    updateLocalSnapshots();
  }, [updateLocalSnapshots]);

  return {
    sessionId,
    shareCode,
    shareLink,
    participants,
    remoteFeeds,
    localCameras: localCameraSnapshots,
    countdown,
    isRecording,
    isConnected,
    registerLocalCamera,
    unregisterLocalCamera,
    startSyncedRecording,
    stopSyncedRecording,
    participantId: participantIdRef.current,
  };
}

