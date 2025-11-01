import { useCallback, useEffect, useRef, useState } from "react";
import { useShared } from "@/hooks/use-shared";
import { createPeer } from "@/services/webrtc";

export function CameraSync() {
  const { docId } = useShared();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const startLocal = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      const rec = new MediaRecorder(s);
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recRef.current = rec;
    } catch {}
  }, []);

  const startRecording = useCallback(() => {
    if (!recRef.current) return;
    chunksRef.current = [];
    recRef.current.start();
  }, []);

  const stopRecording = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const mode = localStorage.getItem('cam_save_mode') || 'prompt';
      if (mode === 'auto') {
        const a = document.createElement('a'); a.href = url; a.download = `session-${Date.now()}.webm`; a.click();
      } else {
        const a = document.createElement('a'); a.href = url; a.download = `session-${Date.now()}.webm`; a.click();
      }
      if (localStorage.getItem('cam_autodelete')==='1') {
        setTimeout(()=> URL.revokeObjectURL(url), 3000);
      }
    };
    rec.stop();
  }, []);

  const [countdown, setCountdown] = useState<number>(0);
  const startSynced = useCallback(async () => {
    const localOnly = localStorage.getItem('cam_local_only')==='1';
    const allowTurn = localStorage.getItem('cam_allow_turn')!=='0';
    if (!localOnly && docId) {
      const pc = await createPeer('caller', docId, allowTurn);
      pcRef.current = pc;
      pc.ontrack = (e) => { if (remoteRef.current && e.streams[0]) remoteRef.current.srcObject = e.streams[0]; };
      if (stream) stream.getTracks().forEach(t=> pc.addTrack(t, stream));
    }
    setCountdown(3);
    const timer = setInterval(()=> setCountdown((c)=>{
      if (c<=1) { clearInterval(timer); setCountdown(0); startRecording(); }
      return c-1;
    }), 1000);
  }, [docId, stream]);

  const joinSynced = useCallback(async () => {
    const localOnly = localStorage.getItem('cam_local_only')==='1';
    const allowTurn = localStorage.getItem('cam_allow_turn')!=='0';
    if (!localOnly && docId) {
      const pc = await createPeer('callee', docId, allowTurn);
      pcRef.current = pc;
      pc.ontrack = (e) => { if (remoteRef.current && e.streams[0]) remoteRef.current.srcObject = e.streams[0]; };
      if (stream) stream.getTracks().forEach(t=> pc.addTrack(t, stream));
    }
  }, [docId, stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      try { pcRef.current?.getSenders().forEach(s=>pcRef.current?.removeTrack(s)); } catch {}
      try { pcRef.current?.close(); } catch {}
    };
  }, [stream]);

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Camera Sync (beta)</h4>
      <div className="text-sm text-slate-300">Starts/stops local recording. For true cross-device sync, coordinate via voice for now.</div>
      <video ref={videoRef} autoPlay muted playsInline className="rounded bg-black max-h-64" />
      <video ref={remoteRef} autoPlay playsInline className="rounded bg-black max-h-64" />
      <div className="flex items-center gap-2">
        <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={startLocal}>Enable Camera</button>
        <button className="neon-focus bg-green-700 text-white rounded px-3 py-1" onClick={startSynced}>Start</button>
        <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={joinSynced}>Join</button>
        <button className="neon-focus bg-red-700 text-white rounded px-3 py-1" onClick={stopRecording}>Stop & Save</button>
        <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={()=>{
          try { recRef.current?.stop(); } catch {}
          stream?.getTracks().forEach(t=>t.stop()); setStream(null);
          try { pcRef.current?.close(); pcRef.current=null; } catch {}
        }}>Teardown</button>
      </div>
      {countdown>0 && <div className="text-3xl text-white">{countdown}</div>}
    </section>
  );
}

