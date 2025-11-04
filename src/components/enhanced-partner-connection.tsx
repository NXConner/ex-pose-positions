import { useEffect, useState, useCallback } from "react";
import { useShared } from "@/hooks/use-shared";
import { signInAnonymously } from "firebase/auth";
import { getFirebase } from "@/services/firebase";
import { sanitizeForFirebase, validateEmail } from "@/utils/sanitize";
import { hapticPress, hapticSuccess, hapticError } from "@/utils/haptic";

export function EnhancedPartnerConnection() {
  const { me, email, saveEmail, partner, savePartner, shared, features } = useShared();
  const [input, setInput] = useState(partner || "");
  const [emailInput, setEmailInput] = useState(email || "");
  const [emailStatus, setEmailStatus] = useState<{ tone: "success" | "error" | "info"; message: string } | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    setInput(partner || "");
  }, [partner]);

  useEffect(() => {
    setEmailInput(email || "");
  }, [email]);

  const handleSaveEmail = useCallback(async () => {
    const sanitized = sanitizeForFirebase(emailInput, 254) || "";
    if (!sanitized) {
      hapticError();
      setEmailStatus({ tone: "error", message: "Please enter your email address." });
      return;
    }
    if (!validateEmail(sanitized)) {
      hapticError();
      setEmailStatus({ tone: "error", message: "That doesn't look like a valid email address." });
      return;
    }

    try {
      hapticPress();
      setSavingEmail(true);
      setEmailStatus({ tone: "info", message: "Linking email to your User ID..." });
      const result = await saveEmail(sanitized);
      if (result.ok) {
        hapticSuccess();
        setEmailStatus({ tone: "success", message: "Email linked! Your User ID is now tied to " + sanitized + "." });
      } else {
        hapticError();
        setEmailStatus({ tone: "error", message: result.error });
      }
    } catch (error) {
      console.error("save email", error);
      hapticError();
      setEmailStatus({ tone: "error", message: "We couldn't save your email. Please try again." });
    } finally {
      setSavingEmail(false);
    }
  }, [emailInput, saveEmail]);

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
      hapticSuccess();
      navigator.clipboard.writeText(me);
      alert('User ID copied to clipboard! Send this to your partner.');
    }
  }, [me]);

  const handleConnect = useCallback(() => {
    const sanitized = sanitizeForFirebase(input, 200) || "";
    if (sanitized) {
      hapticPress();
      savePartner(sanitized);
      alert('Partner ID saved! Waiting for connection...');
    } else {
      hapticError();
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
            {/* Email Link */}
            <div className="bg-slate-900/60 rounded-lg p-4 border border-sky-500/30">
              <div className="text-sm text-slate-400 mb-2">Link Your Email</div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 bg-slate-800 text-white rounded px-3 py-2 text-sm"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailStatus(null);
                  }}
                  placeholder="Enter the email you'd like tied to your User ID"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={254}
                />
                <button
                  onClick={handleSaveEmail}
                  disabled={savingEmail}
                  className="neon-focus bg-sky-600 hover:bg-sky-700 duration-200 text-white rounded px-4 py-2 disabled:opacity-50"
                >
                  {savingEmail ? "Linking..." : email ? "Update Email" : "Link Email"}
                </button>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Current: {email ? <span className="text-white">{email}</span> : <span className="text-yellow-300">Not linked yet</span>}
              </div>
              {emailStatus && (
                <div
                  className={`text-xs mt-2 ${
                    emailStatus.tone === "success"
                      ? "text-green-400"
                      : emailStatus.tone === "error"
                        ? "text-red-400"
                        : "text-slate-200"
                  }`}
                >
                  {emailStatus.message}
                </div>
              )}
            </div>

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

