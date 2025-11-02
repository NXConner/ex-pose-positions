import { useEffect, useState, useCallback } from "react";
import { useShared } from "@/hooks/use-shared";
import { signInAnonymously } from "firebase/auth";
import { getFirebase } from "@/services/firebase";
import { sanitizeForFirebase } from "@/utils/sanitize";

export function EnhancedPartnerConnection() {
  const { me, partner, savePartner, shared, features } = useShared();
  const [input, setInput] = useState(partner || "");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    setInput(partner || "");
  }, [partner]);

  const handleSignIn = useCallback(async () => {
    setSigningIn(true);
    try {
      const { auth } = getFirebase();
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Sign in error:', err);
      alert('Failed to sign in. Please check your Firebase configuration.');
    } finally {
      setSigningIn(false);
    }
  }, []);

  const handleCopyMyId = useCallback(() => {
    if (me) {
      navigator.clipboard.writeText(me);
      alert('User ID copied to clipboard! Send this to your partner.');
    }
  }, [me]);

  const handleConnect = useCallback(() => {
    if (input.trim()) {
      savePartner(input.trim());
      alert('Partner ID saved! Waiting for connection...');
    } else {
      alert('Please enter your partner\'s User ID');
    }
  }, [input, savePartner]);

  if (!features.partner) return null;

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-4">
      <h4 className="text-lg neon-accent">Partner Connection</h4>

      {!me ? (
        <div className="text-center">
          <div className="text-sm text-slate-300 mb-4">
            Sign in to get your unique User ID and connect with your partner
          </div>
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded-lg px-6 py-3 font-semibold disabled:opacity-50"
          >
            {signingIn ? 'Signing in...' : '🔐 Sign In to Get Started'}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* My User ID */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-pink-500/30">
            <div className="text-sm text-slate-400 mb-2">Your User ID</div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-slate-800 text-white rounded px-3 py-2 font-mono text-sm select-all"
                value={me}
                readOnly
              />
              <button
                onClick={handleCopyMyId}
                className="neon-focus bg-pink-600 hover:bg-pink-700 duration-200 text-white rounded px-4 py-2"
              >
                📋 Copy
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Share this ID with your partner
            </div>
          </div>

          {/* Partner Connection */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-purple-500/30">
            <div className="text-sm text-slate-400 mb-2">Partner's User ID</div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-slate-800 text-white rounded px-3 py-2 font-mono text-sm"
                value={input}
                onChange={(e) => {
                  const sanitized = sanitizeForFirebase(e.target.value, 200);
                  setInput(sanitized || "");
                }}
                placeholder="Paste your partner's User ID here"
                maxLength={200}
              />
              <button
                onClick={handleConnect}
                className="neon-focus bg-purple-600 hover:bg-purple-700 duration-200 text-white rounded px-4 py-2"
              >
                💝 Connect
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`rounded-lg p-3 text-center ${shared?.linked ? 'bg-green-900/30 border border-green-500/50' : 'bg-yellow-900/30 border border-yellow-500/50'}`}>
            <div className="text-sm font-semibold">
              Status: {shared?.linked ? (
                <span className="text-green-400">✓ Connected</span>
              ) : (
                <span className="text-yellow-400">⏳ Waiting for connection</span>
              )}
            </div>
            {!shared?.linked && (
              <div className="text-xs text-slate-400 mt-1">
                Both partners must enter each other's User ID
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

