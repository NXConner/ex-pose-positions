import { doc, onSnapshot, setDoc, addDoc, collection } from 'firebase/firestore'
import { getFirebase } from '@/services/firebase'

export type RtcRole = 'caller' | 'callee'

export async function createPeer(role: RtcRole, pairId: string, allowTurn: boolean) {
  const pc = new RTCPeerConnection({
    iceServers: allowTurn ? undefined : [],
  })
  const { db } = getFirebase()
  if (!db) return pc
  const base = doc(db, 'links', pairId)
  const offerDoc = doc(base, 'rtc/offer')
  const answerDoc = doc(base, 'rtc/answer')
  const candCol = collection(base, 'rtc_candidates')

  pc.onicecandidate = async (e) => {
    if (e.candidate) await addDoc(candCol, { c: e.candidate.toJSON(), ts: Date.now() })
  }

  // Consume ICE candidates from the other side
  onSnapshot(candCol, async (snap) => {
    for (const d of snap.docChanges()) {
      const data = d.doc.data() as any
      if (data?.c) {
        try { await pc.addIceCandidate(data.c) } catch {}
      }
    }
  })

  if (role === 'caller') {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await setDoc(offerDoc, { sdp: offer.sdp, type: offer.type, ts: Date.now() })
    onSnapshot(answerDoc, async (snap) => {
      const d = snap.data() as any
      if (d?.sdp && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription({ sdp: d.sdp, type: d.type })
      }
    })
  } else {
    onSnapshot(offerDoc, async (snap) => {
      const d = snap.data() as any
      if (d?.sdp && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription({ sdp: d.sdp, type: d.type })
        const ans = await pc.createAnswer()
        await pc.setLocalDescription(ans)
        await setDoc(answerDoc, { sdp: ans.sdp, type: ans.type, ts: Date.now() })
      }
    })
  }
  return pc
}

