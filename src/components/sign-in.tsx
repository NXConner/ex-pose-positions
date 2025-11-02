import { useState, useCallback } from "react";
import { useShared } from "@/hooks/use-shared";
import { getFirebase } from "@/services/firebase";
import { signInAnonymously } from "firebase/auth";

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { me } = useShared();

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { auth } = getFirebase();
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      await signInAnonymously(auth);
      // Success - user will be automatically updated via useShared hook
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, []);

  if (me) {
    return null; // Already signed in
  }

  return (
    <section className="w-full neon-card rounded-md p-6 flex flex-col gap-4">
      <h4 className="text-2xl neon-accent text-center">Sign In</h4>
      <div className="text-sm text-slate-300 text-center">
        Sign in anonymously to access all features and connect with your partner
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSignIn}
        disabled={loading}
        className="neon-focus bg-pink-700 hover:bg-pink-800 duration-200 text-white rounded-lg px-6 py-3 text-lg font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/50"
      >
        {loading ? 'Signing in...' : '🔐 Sign In Anonymously'}
      </button>

      <div className="text-xs text-slate-400 text-center">
        Your privacy is protected. No personal information is required.
      </div>
    </section>
  );
}

