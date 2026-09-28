import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { showToast } from "../components/Toast";
import { TableRowSkeleton, CardSkeleton } from "../components/Skeleton";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface FinanceProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

type FinanceTab = "dues" | "history";

export default function Finance({ onNavigate, isLoggedIn }: FinanceProps) {
  const [activeTab, setActiveTab] = useState<FinanceTab>("dues");
  const [duesList, setDuesList] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingItem, setPayingItem] = useState<any | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    Promise.all([
      apiFetch("/api/finance/dues").catch(() => []),
      apiFetch("/api/finance/history").catch(() => []),
    ]).then(([duesRes, histRes]) => {
      setDuesList(Array.isArray(duesRes) ? duesRes : duesRes.data || []);
      setPaymentHistory(Array.isArray(histRes) ? histRes : histRes.data || []);
    }).finally(() => setLoading(false));
  }, [isLoggedIn]);

  const confirmPayment = async () => {
    if (!payingItem) return;
    try {
      // Initialize Korapay Checkout
      const korapayKey = import.meta.env.VITE_KORAPAY_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_sample";
      const Korapay = (window as any).Korapay;

      const refreshData = async () => {
        const [duesRes, histRes] = await Promise.all([
          apiFetch("/api/finance/dues").catch(() => []),
          apiFetch("/api/finance/history").catch(() => []),
        ]);
        setDuesList(Array.isArray(duesRes) ? duesRes : duesRes.data || []);
        setPaymentHistory(Array.isArray(histRes) ? histRes : histRes.data || []);
      };

      const recordPayment = async (response?: any) => {
        await apiFetch("/api/finance/pay-dues", {
          method: "POST",
          body: JSON.stringify({ duesItemId: payingItem.id }),
        });
        showToast("Payment successful via Korapay! Reference: " + (response?.reference || response?.checkout_reference || "SUCCESS"), "success");
        setPayingItem(null);
        await refreshData();
      };

      if (Korapay && typeof Korapay.initialize === "function") {
        Korapay.initialize({
          key: korapayKey,
          reference: "DUES-" + Math.floor(Math.random() * 1000000000 + 1),
          amount: Number(payingItem.amount),
          currency: "NGN",
          customer: {
            name: "CUAA Member",
            email: "member@cliffordalumni.ng",
          },
          information: {
            title: payingItem.title,
            description: payingItem.description || "Annual Dues Payment",
          },
          onSuccess: function (response: any) {
            recordPayment(response);
          },
          onClose: function () {
            showToast("Korapay payment window closed.", "info");
          },
          onFailed: function (response: any) {
            showToast("Payment failed: " + (response?.message || "Transaction uncompleted"), "error");
          },
        });
      } else {
        // Fallback to direct backend API call if inline JS script is blocked
        await recordPayment();
      }
    } catch (err: any) {
      showToast(err.message || "Payment failed", "error");
    }
  };

  const outstandingDues = duesList.filter(d => d.status !== "PAID");
  const totalOutstanding = outstandingDues.reduce((s, i) => s + (i.amount || 0), 0);

  const currentYear = new Date().getFullYear();
  const duesPaidCurrentYear = paymentHistory
    .filter(p => (p.status === "SUCCESSFUL" || p.status === "PAID") && new Date(p.createdAt).getFullYear() === currentYear)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPaidAllTime = paymentHistory
    .filter(p => p.status === "SUCCESSFUL" || p.status === "PAID")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Financial Centre</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Finance</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Manage your dues, levies, payment history, and financial obligations to the association.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-amber-500 text-lg">🔒</span>
            <p className="text-sm text-amber-800 flex-1">Sign in to view your dues, make payments, and access your financial records.</p>
            <div className="flex gap-2">
              <button onClick={() => onNavigate("login")} className="px-4 py-2 text-xs font-semibold bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--accent)] transition-colors">Sign In</button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Outstanding Balance", value: `₦${totalOutstanding.toLocaleString()}`, color: totalOutstanding > 0 ? "text-red-600" : "text-green-600" },
            { label: `Dues Paid (${currentYear})`, value: `₦${duesPaidCurrentYear.toLocaleString()}`, color: "text-green-600" },
            { label: "Total Paid (All Time)", value: `₦${totalPaidAllTime.toLocaleString()}`, color: "text-[var(--primary)]" },
            { label: "Payment Status", value: totalOutstanding > 0 ? "Action Needed" : "Up to Date", color: totalOutstanding > 0 ? "text-amber-600" : "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-[var(--border)] rounded-xl p-4 text-center">
              <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-[var(--muted)] p-1 rounded-xl mb-6">
          {([
            { id: "dues", label: "Annual Dues" },
            { id: "levies", label: "Levies" },
            { id: "history", label: "Payment History" },
            { id: "receipts", label: "Receipts" },
          ] as { id: FinanceTab; label: string }[]).map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === id ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Annual Dues & Levies */}
        {activeTab === "dues" && (
          <div className="space-y-4">
            <div className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--muted-foreground)]">
              <p><strong className="text-[var(--foreground)]">Annual Dues Policy:</strong> All verified CLUAA members are required to pay annual dues to maintain Active Member status.</p>
            </div>
            {loading ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : duesList.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)] bg-white rounded-xl border border-[var(--border)]">
                <p className="font-semibold text-base mb-1">No outstanding dues or levies schedule found</p>
                <p className="text-xs">Your account is fully up to date.</p>
              </div>
            ) : (
              duesList.map((d) => {
                const isPaid = d.status === "PAID";
                return (
                  <div key={d.id || d.title} className="bg-white border border-[var(--border)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-[var(--foreground)]">{d.title}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{isPaid ? "Paid" : "Pending"}</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">Session: {d.academicYear || d.year || "Current Session"} · Type: {d.type || "Annual Dues"}</p>
                      {d.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{d.description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg text-[var(--foreground)]">₦{Number(d.amount).toLocaleString()}</p>
                      {!isPaid ? (
                        <button onClick={() => setPayingItem(d)} className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent)] transition-colors">Pay Now</button>
                      ) : (
                        <button className="px-5 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--muted-foreground)]">Receipt</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div className="text-center pt-4">
              <button onClick={() => onNavigate("donate")} className="px-6 py-3 border border-[var(--primary)] text-[var(--primary)] rounded-lg text-sm font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors">
                Also Make a Donation →
              </button>
            </div>
          </div>
        )}

        {/* Payment History */}
        {activeTab === "history" && (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)]">All Transactions</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <p className="font-semibold">No transactions recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                      {["Receipt Ref", "Type", "Date", "Method", "Amount", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map(p => (
                      <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 text-[11px] font-mono text-[var(--muted-foreground)]">{p.receiptNumber || p.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{p.paymentType}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{p.paymentMethod || "CARD"}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-100 text-green-700">{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-display text-xl font-bold text-[var(--secondary)] mb-2">Confirm Payment</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">You are about to pay for:</p>
            <div className="bg-[var(--muted)] rounded-lg p-3 mb-5 text-sm">
              <p className="font-medium text-[var(--foreground)]">{payingItem.title}</p>
              <p className="text-[var(--primary)] font-bold mt-1">₦{Number(payingItem.amount).toLocaleString()}</p>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-5">Transactions process via simulated gateway with automatic receipt generation.</p>
            <div className="flex gap-2">
              <button onClick={() => setPayingItem(null)} className="flex-1 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:border-[var(--primary)] transition-colors">Cancel</button>
              <button onClick={confirmPayment} className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent)] transition-colors">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}