import useSWR from "swr";
import { Link, useNavigate } from "react-router-dom";
import {
  DollarSign,
  FileSpreadsheet,
  Receipt,
  Users,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { api, type BillingDashboardStats } from "../../lib/api";
import { formatMoney, formatDate, relativeTime, docStatusClass } from "../../lib/billing";

export function BillingDashboard() {
  const navigate = useNavigate();

  const { data: stats, error, isLoading: loading } = useSWR<BillingDashboardStats>(
    "/api/billing?resource=dashboard",
    () => api.getBillingDashboard(),
    {
      onError: (err) => {
        if (err?.status === 401 || err?.status === 403) {
          navigate("/admin");
        }
      },
    }
  );

  if (loading && !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-56 bg-evolw-gray-200 dark:bg-white/10 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-evolw-gray-200 dark:bg-white/10" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-evolw-gray-200 dark:bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-rose-600 dark:text-rose-400">{error?.message || "No data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing Dashboard</h1>
          <p className="text-sm text-evolw-gray-500 mt-1">
            Live overview of quotations, invoices, and collections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            to="/admin/quotations/new"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-white dark:bg-evolw-slate border border-evolw-gray-200 dark:border-white/10 rounded-xl hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium"
          >
            New Quotation
          </Link>
          <Link
            to="/admin/invoices/new"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-evolw-accent text-white rounded-xl hover:bg-evolw-accent/90 transition-colors text-sm font-medium shadow-sm"
          >
            New Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Invoiced" value={formatMoney(stats.totalInvoicedAmount)} icon={<Receipt className="w-5 h-5" />} hint={`${stats.openInvoices} open`} />
        <StatCard title="Amount Received" value={formatMoney(stats.totalReceived)} icon={<DollarSign className="w-5 h-5" />} hint="Collected" positive />
        <StatCard title="Outstanding" value={formatMoney(stats.outstanding)} icon={<AlertCircle className="w-5 h-5" />} hint="Needs collection" positive={false} />
        <StatCard title="Active Clients" value={String(stats.activeClients)} icon={<Users className="w-5 h-5" />} hint={`${stats.pendingQuotations} pending quotes`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatCard title="Approved Quotations" value={formatMoney(stats.approvedQuotationValue)} icon={<FileSpreadsheet className="w-5 h-5" />} hint={`Pipeline ${formatMoney(stats.totalQuotationValue)}`} />
        <div className="bg-white dark:bg-evolw-slate rounded-2xl p-6 border border-evolw-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-center gap-3">
          <p className="text-sm font-medium text-evolw-gray-500">Quick links</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/clients" className="text-sm font-semibold text-evolw-accent hover:underline">Clients</Link>
            <span className="text-evolw-gray-300">·</span>
            <Link to="/admin/payments" className="text-sm font-semibold text-evolw-accent hover:underline">Payments</Link>
            <span className="text-evolw-gray-300">·</span>
            <Link to="/admin/billing-settings" className="text-sm font-semibold text-evolw-accent hover:underline">Settings</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityPanel
          title="Recent Payments"
          empty="No payments yet"
          items={stats.recentPayments.map((p) => ({
            id: p.id,
            title: formatMoney(p.amount, p.currency),
            desc: `${p.client_name}${p.invoice_number ? ` · ${p.invoice_number}` : ""}`,
            time: relativeTime(p.created_at || p.date),
            href: "/admin/payments",
          }))}
        />
        <ActivityPanel
          title="Recent Invoices"
          empty="No invoices yet"
          items={stats.recentInvoices.map((i) => ({
            id: i.id,
            title: i.invoice_number,
            desc: `${i.client_name} · ${formatMoney(i.grand_total, i.currency)}`,
            time: relativeTime(i.created_at),
            status: i.status,
            href: `/admin/invoices/${i.id}`,
          }))}
        />
        <ActivityPanel
          title="Recent Quotations"
          empty="No quotations yet"
          items={stats.recentQuotations.map((q) => ({
            id: q.id,
            title: q.quotation_number,
            desc: `${q.client_name} · ${formatMoney(q.grand_total, q.currency)}`,
            time: relativeTime(q.created_at),
            status: q.status,
            href: `/admin/quotations/${q.id}`,
          }))}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  hint,
  positive,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-evolw-slate rounded-2xl p-6 border border-evolw-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-evolw-gray-50 dark:bg-white/5 rounded-xl text-evolw-accent">{icon}</div>
      </div>
      <p className="text-sm font-medium text-evolw-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      {hint && (
        <p
          className={`text-xs mt-2 font-medium ${
            positive === true
              ? "text-emerald-600"
              : positive === false
                ? "text-rose-500"
                : "text-evolw-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function ActivityPanel({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; title: string; desc: string; time: string; status?: string; href: string }[];
}) {
  return (
    <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-evolw-gray-500 py-6 text-center">{empty}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Link key={item.id} to={item.href} className="flex gap-3 group">
              <div className="w-2 h-2 mt-2 rounded-full bg-evolw-accent shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate group-hover:text-evolw-accent transition-colors">
                    {item.title}
                  </p>
                  {item.status && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${docStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-evolw-gray-500 truncate">{item.desc}</p>
                <p className="text-[10px] text-evolw-gray-400 uppercase tracking-wider mt-0.5">{item.time}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-evolw-gray-300 group-hover:text-evolw-accent shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}
      <p className="text-[10px] text-evolw-gray-400">Updated {formatDate(new Date().toISOString())}</p>
    </div>
  );
}
