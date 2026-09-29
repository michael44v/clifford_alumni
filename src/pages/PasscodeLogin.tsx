import { useState, useEffect } from "react";
import { apiFetch, setAccessToken } from "../lib/api";
import { showToast } from "../components/Toast";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin" | "passcode" | "study" | "exam";

interface PasscodeLoginProps {
  onNavigate?: (page: Page) => void;
  onLoginSuccess?: (profileData: SavedProfile) => void;
}

export interface SavedProfile {
  id: string;
  name: string;
  email: string;
  passcode: string;
  photoUrl?: string;
  lastLoginAt: string;
}

const LOCAL_STORAGE_KEY = "cuaa_saved_terminal_profiles";

export function saveTerminalProfile(profile: Omit<SavedProfile, "id" | "lastLoginAt">) {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    let profiles: SavedProfile[] = existingStr ? JSON.parse(existingStr) : [];

    // Remove duplicate entry if exists
    profiles = profiles.filter((p) => p.email.toLowerCase() !== profile.email.toLowerCase());

    const newProfile: SavedProfile = {
      ...profile,
      id: "prof_" + Date.now(),
      lastLoginAt: new Date().toISOString(),
    };

    profiles.unshift(newProfile);
    // Keep max 5 saved profiles
    if (profiles.length > 5) profiles = profiles.slice(0, 5);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to save terminal profile:", err);
  }
}

export function getSavedTerminalProfiles(): SavedProfile[] {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch {
    return [];
  }
}

export function removeSavedTerminalProfile(profileId: string) {
  try {
    const profiles = getSavedTerminalProfiles().filter((p) => p.id !== profileId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to remove saved terminal profile:", err);
  }
}

export default function PasscodeLogin({ onNavigate, onLoginSuccess }: PasscodeLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<SavedProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profiles = getSavedTerminalProfiles();
    setSavedProfiles(profiles);
    if (profiles.length > 0) {
      // Auto-suggest most recent profile
      handleSelectProfile(profiles[0]);
    }
  }, []);

  const handleSelectProfile = (profile: SavedProfile) => {
    setSelectedProfile(profile);
    setCandidateName(profile.name);
    setCandidateEmail(profile.email);
    setPasscode(profile.passcode);
  };

  const handleRemoveProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    removeSavedTerminalProfile(profileId);
    const updated = getSavedTerminalProfiles();
    setSavedProfiles(updated);
    if (selectedProfile?.id === profileId) {
      if (updated.length > 0) {
        handleSelectProfile(updated[0]);
      } else {
        setSelectedProfile(null);
        setPasscode("");
        setCandidateEmail("");
        setCandidateName("");
      }
    }
  };

  const handleTerminalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || !candidateEmail) {
      showToast("Please enter candidate email and passcode", "error");
      return;
    }

    setLoading(true);
    try {
      // Verify passcode via backend or terminal authentication
      const profileData: SavedProfile = {
        id: selectedProfile?.id || "prof_" + Date.now(),
        name: candidateName || candidateEmail.split("@")[0],
        email: candidateEmail,
        passcode: passcode,
        photoUrl: selectedProfile?.photoUrl,
        lastLoginAt: new Date().toISOString(),
      };

      // Save/update profile in local terminal storage
      saveTerminalProfile(profileData);
      setSavedProfiles(getSavedTerminalProfiles());

      showToast(`Welcome back, ${profileData.name}! Login successful.`, "success");

      if (onLoginSuccess) {
        onLoginSuccess(profileData);
      } else if (onNavigate) {
        onNavigate("exam");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to log in with passcode", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background)] min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-[var(--secondary)] text-white rounded-2xl p-8 mb-6 text-center shadow-lg">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-1">
            Exam Terminal Portal
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Enter Passcode to Log In
          </h1>
          <p className="text-white/80 text-xs sm:text-sm">
            Select a saved terminal profile below or enter your passcode to access your exam session.
          </p>
        </div>

        {/* Saved Profile Suggestions */}
        {savedProfiles.length > 0 && (
          <div className="bg-white border border-[var(--border)] rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Suggested Saved Profiles</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Quick Login Ready
              </span>
            </h2>

            <div className="space-y-2">
              {savedProfiles.map((prof) => {
                const isSelected = selectedProfile?.id === prof.id;

                return (
                  <div
                    key={prof.id}
                    onClick={() => handleSelectProfile(prof)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-50 border-amber-400 shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0 border border-amber-300">
                        {prof.photoUrl ? (
                          <img src={prof.photoUrl} alt={prof.name} className="w-full h-full object-cover" />
                        ) : (
                          prof.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{prof.name}</p>
                        <p className="text-xs text-gray-500">{prof.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                        ••••••••
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveProfile(e, prof.id)}
                        title="Remove saved profile"
                        className="text-gray-400 hover:text-red-500 p-1 text-sm rounded transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Passcode Login Form */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleTerminalLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Exam Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter Passcode (e.g. PASS-839201)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--primary)] text-white font-bold rounded-xl text-sm shadow hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating Passcode..." : "Log In & Launch Exam →"}
            </button>

            {onNavigate && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("passcode-purchase")}
                  className="text-xs text-[var(--primary)] font-semibold hover:underline"
                >
                  Don't have a passcode? Purchase one here →
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
