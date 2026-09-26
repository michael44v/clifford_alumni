import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface DonateProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

const amounts = [1000, 2000, 5000, 10000, 25000, 50000];

function fmt(n: number) { return "₦" + Number(n || 0).toLocaleString(); }

export default function Donate({ onNavigate, isLoggedIn }: DonateProps) {
  const [causes, setCauses] = useState<any[]>([]);
  const [selectedCauseId, setSelectedCauseId] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/finance/campaigns");
      const list = Array.isArray(res) ? res : res.data || [];
      setCauses(list);
      if (list.length > 0 && !selectedCauseId) {
        setSelectedCauseId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const finalAmount = amount !== "" ? amount : parseInt(customAmount) || 0;
  const currentCause = causes.find(c => c.id === selectedCauseId) || causes[0];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { onNavigate("login"); return; }
    if (!currentCause || finalAmount < 100) return;
    setLoading(true);
    try {
      await apiFetch("/api/finance/donate", {
        method: "POST",
        body: JSON.stringify({
          donationCampaignId: currentCause.id,
          amount: finalAmount,
        }),
      });
      setSubmitted(true);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || "Donation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Give Back</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Donate & Support</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Every contribution strengthens our community. Support welfare, scholarships, and the growth of our alma mater.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        {/* Causes */}
        <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-6">Choose a Cause</h2>
        {causes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {causes.map(cause => {
              const raised = Number(cause.raisedAmount || 0);
              const goal = Number(cause.targetAmount || 1);
              const pct = Math.min(100, Math.round((raised / goal) * 100));
              const isSelected = selectedCauseId === cause.id;

              return (
                <div
                  key={cause.id}
                  onClick={() => setSelectedCauseId(cause.id)}
                  className={`bg-white border rounded p-5 cursor-pointer transition-all ${isSelected ? "border-[var(--primary)] shadow-md ring-1 ring-[var(--primary)]" : "border-[var(--border)] hover:border-[var(--primary)]"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">❤️</span>
                    {isSelected && <span className="w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>}
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">{cause.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{cause.description}</p>
                  <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] font-medium">
                    <span>{fmt(raised)} raised</span>
                    <span>{pct}% of {fmt(goal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-lg p-8 text-center text-[var(--muted-foreground)] mb-10">
            <p className="text-sm">No active donation causes listed at this time.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-6">Make a Donation</h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded p-8 text-center">
                <span className="text-5xl block mb-3">🎉</span>
                <p className="font-display text-xl font-bold text-green-800 mb-2">Thank you!</p>
                <p className="text-sm text-green-700 leading-relaxed mb-2">
                  Your donation of <strong>{fmt(finalAmount)}</strong> to <strong>{currentCause?.title}</strong> has been received.
                </p>
                <p className="text-xs text-green-600 mb-4">
                  A receipt has been recorded under your transaction history.
                </p>
                <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-green-700 text-white rounded text-sm font-semibold">Make Another Donation</button>
              </div>
            ) : (
              <form onSubmit={handleDonate} className="bg-white border border-[var(--border)] rounded p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Select Amount</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {amounts.map(a => (
                      <button key={a} type="button" onClick={() => { setAmount(a); setCustomAmount(""); }} className={`py-2.5 border rounded text-sm font-medium transition-colors ${amount === a ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                        {fmt(a)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Enter custom amount (₦)"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setAmount(""); }}
                    min="100"
                    className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>

                <div className="bg-[var(--muted)] rounded p-3 text-sm">
                  <span className="font-medium">Donating to: </span>
                  <span className="text-[var(--primary)] font-semibold">{currentCause?.title || "Donation Cause"}</span>
                  {finalAmount > 0 && <span className="ml-2 font-semibold">— {fmt(finalAmount)}</span>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="w-4 h-4 accent-[var(--primary)]" />
                  <span className="text-sm text-[var(--foreground)]">Make this donation anonymous</span>
                </label>

                {!isLoggedIn && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    You will be asked to sign in before proceeding to payment.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={finalAmount < 100 || !currentCause}
                  className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {finalAmount >= 100 ? `Donate ${fmt(finalAmount)}` : "Enter an amount to continue"}
                </button>
              </form>
            )}
          </div>

          {/* Impact sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Your Impact in 2024</h3>
              <div className="space-y-3">
                {[
                  { label: "Members supported through welfare", value: "34" },
                  { label: "Scholarships awarded", value: "12" },
                  { label: "Donors this year", value: "287" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                    <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
                    <span className="text-sm font-bold text-[var(--primary)]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--secondary)] rounded p-5 text-white">
              <p className="font-display text-lg font-bold mb-2">Other Ways to Support</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Pay your annual membership dues</li>
                <li>• Sponsor an event or programme</li>
                <li>• Offer mentorship to younger alumni</li>
                <li>• List your business in our directory</li>
                <li>• Volunteer for association activities</li>
              </ul>
            </div>

            <div className="bg-white border border-[var(--border)] rounded p-5">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-2">🔒 Secure Transactions</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                All payments are processed securely. Every transaction generates a receipt with a unique transaction ID, date, amount, purpose and payment status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
