import {
  Activity,
  Bell,
  ChevronDown,
  Database,
  LayoutDashboard,
  Settings2,
  Waypoints,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

const chartColors = [
  "#f97316",
  "#dc2626",
  "#78716c",
  "#facc15",
  "#3b82f6",
  "#f5f5f5",
];

const fallbackClassification = [
  { label: "Industrial Fire", count: 0 },
  { label: "Wildfire", count: 0 },
  { label: "Mining", count: 0 },
  { label: "Agricultural Burn", count: 0 },
  { label: "Gas Flare", count: 0 },
  { label: "Persistent Industrial Thermal Source", count: 0 },
];

function formatLabel(label: string) {
  return label
    .replace("Industrial Fire", "Industrial fire")
    .replace(
      "Persistent Industrial Thermal Source",
      "Persistent Industrial thermal source"
    )
    .replace("Agricultural Burn", "Agricultural burn")
    .replace("Gas Flare", "Gas flare");
}

function ChartPanel({
  index,
  eyebrow,
  title,
  status,
  children,
  footer,
}: {
  index: string;
  eyebrow: string;
  title: string;
  status: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="tv-panel tv-corner-brackets overflow-hidden p-0">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-4 py-3">
        <div>
          <div className="tv-kicker">
            {index} / {eyebrow}
          </div>
          <div className="mt-1 tv-display text-[15px] font-bold tracking-[0.08em] text-[#fffff0]">
            {title}
          </div>
        </div>
        <div className="tv-kicker pt-1">{status}</div>
      </div>
      <div className="p-4">{children}</div>
      {footer && (
        <div className="border-t border-white/[0.08] px-4 py-3 text-[10px] text-[#c6ad9c]">
          {footer}
        </div>
      )}
    </section>
  );
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[#ffd25a]/35 bg-[#291711] px-3 py-2 text-[10px] text-[#fffff0] shadow-xl">
      <div className="tv-kicker">{label}</div>
      <div className="mt-1 tv-display text-sm font-bold text-[#ffd25a]">
        {payload[0].value}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const query = new URLSearchParams(window.location.search);
  const startDate = query.get("start_date") || undefined;
  const endDate = query.get("end_date") || startDate;
  const { data, loading, error } = useAnalyticsData(startDate, endDate);
  const classification = data?.classification?.length
    ? data.classification
    : fallbackClassification;
  const confidence = data?.confidence_distribution ?? [];
  const intensity = data?.intensity_distribution ?? [];
  const locations = data?.top_locations ?? [];
  const total =
    data?.total ?? classification.reduce((sum, item) => sum + item.count, 0);
  const maxLocation = Math.max(...locations.map(item => item.count), 1);
  const siteLikeLocations = locations.map(item => ({
    ...item,
    label: item.label.length > 20 ? `${item.label.slice(0, 19)}…` : item.label,
  }));
  const activeRangeLabel = startDate
    ? `${startDate}${endDate && endDate !== startDate ? ` → ${endDate}` : ""}`
    : "All available observations";

  const go = (path: string) => {
    setMenuOpen(false);
    setLocation(path);
  };

  return (
    <div className="tv-app min-h-screen">
      <main className="tv-main min-h-screen">
        <header className="sticky top-0 z-20 flex min-h-[82px] items-center justify-between gap-4 border-b border-[#ffd25a]/25 bg-[#3a1e16] px-4 py-4 sm:px-7 lg:px-9">
          <div className="relative">
            <button
              className="tv-command-menu tv-focus-ring inline-flex items-center gap-2 border border-[#ffd25a]/35 bg-[#4a2417] px-3 py-2 text-left text-[#fffff0]"
              onClick={() => setMenuOpen(open => !open)}
            >
              <Activity className="h-4 w-4 text-[#ffd25a]" strokeWidth={1.7} />
              <span className="hidden tv-display text-[10px] font-bold uppercase tracking-[0.13em] sm:inline">
                Operations
              </span>
              <span className="tv-display text-[10px] font-bold uppercase tracking-[0.13em] text-[#ffd25a]">
                Analytics
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#ffd25a]" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-12 z-30 w-64 border border-[#ffd25a]/30 bg-[#3a1e16] p-1 shadow-2xl">
                <div className="tv-kicker px-2 py-2">Current operation</div>
                <button
                  className="flex w-full items-center gap-2 px-2 py-2.5 text-left tv-display text-[11px] font-bold uppercase tracking-[0.1em] text-[#e8dacb] hover:bg-[#4a2417]"
                  onClick={() => go("/")}
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </button>
                <button
                  className="flex w-full items-center gap-2 bg-[#4a2417] px-2 py-2.5 text-left tv-display text-[11px] font-bold uppercase tracking-[0.1em] text-[#ffd25a]"
                  onClick={() => go("/analytics")}
                >
                  <Activity className="h-4 w-4" /> Analytics
                </button>
                <button
                  className="flex w-full items-center gap-2 px-2 py-2.5 text-left tv-display text-[11px] font-bold uppercase tracking-[0.1em] text-[#e8dacb] hover:bg-[#4a2417]"
                  onClick={() => go("/")}
                >
                  <Bell className="h-4 w-4" /> Alerts{" "}
                  <span className="ml-auto border border-[#ffaa5a]/55 px-1.5 py-0.5 text-[9px]">
                    {data?.total ?? "—"}
                  </span>
                </button>
                <button
                  className="flex w-full items-center gap-2 px-2 py-2.5 text-left tv-display text-[11px] font-bold uppercase tracking-[0.1em] text-[#e8dacb] hover:bg-[#4a2417]"
                  onClick={() => go("/")}
                >
                  <Settings2 className="h-4 w-4" /> Settings
                </button>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 px-2 sm:px-7">
            <div className="tv-kicker">Historical thermal site analysis</div>
            <h1 className="tv-display truncate text-[20px] font-bold tracking-[0.09em] text-[#fffff0] sm:text-[25px]">
              ANALYTICS <span className="text-[#ffd25a]">OVERVIEW</span>
            </h1>
          </div>
          <div className="hidden border border-[#ffd25a]/25 bg-[#ffd25a]/[0.07] px-3 py-2 tv-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffd25a] sm:block">
            Historical mode
          </div>
        </header>

        <div className="container py-6 sm:py-8">
          <section className="mb-5 flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end">
            <div>
              <div className="tv-kicker mb-2">
                Analysis workspace / archive intelligence
              </div>
              <h2 className="tv-display text-[26px] font-bold tracking-[0.08em] text-[#fffff0] sm:text-[32px]">
                ANALYTICS
              </h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#d8c8b9]">
                Historical thermal site analysis across classification,
                geography, confidence, and thermal intensity.
              </p>
              <div className="mt-3 tv-kicker text-[#ffd25a]">
                Observation range / {activeRangeLabel}
              </div>
            </div>
            <div className="border border-[#ffd25a]/25 bg-[#291711]/55 px-4 py-3 text-right">
              <div className="tv-kicker">Dataset status</div>
              <div
                className={`mt-1 tv-display text-[11px] font-bold uppercase tracking-[0.1em] ${error ? "text-[#ffaa5a]" : "text-[#ffd25a]"}`}
              >
                {loading
                  ? "Loading API"
                  : error
                    ? "API unavailable"
                    : "Live backend data"}
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <ChartPanel
              index="01"
              eyebrow="classification profile"
              title="Classification distribution"
              status={loading ? "LOADING" : "LIVE DATA"}
              footer={
                <span>
                  Total sites{" "}
                  <strong className="text-[#ffd25a]">
                    {total.toLocaleString()}
                  </strong>
                </span>
              }
            >
              <div className="grid min-h-[250px] grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(180px,0.9fr)_1.1fr]">
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classification}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="#291711"
                        strokeWidth={3}
                      >
                        {classification.map((item, index) => (
                          <Cell
                            key={item.label}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#c6ad9c"
                        fontSize="9"
                        letterSpacing="2"
                      >
                        TOTAL SITES
                      </text>
                      <text
                        x="50%"
                        y="59%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fffff0"
                        fontSize="25"
                        fontWeight="700"
                      >
                        {total}
                      </text>
                      <Tooltip content={<TooltipBox />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {classification.map((item, index) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-[11px] text-[#e8dacb]"
                    >
                      <span
                        className="h-2 w-2 shrink-0"
                        style={{
                          background: chartColors[index % chartColors.length],
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        {formatLabel(item.label)}
                      </span>
                      <strong className="tv-display text-[12px] text-[#fffff0]">
                        {item.count}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </ChartPanel>

            <ChartPanel
              index="02"
              eyebrow="geographic concentration"
              title="Top 10 sites by thermal location count"
              status={loading ? "LOADING" : "LIVE DATA"}
              footer={
                <span>
                  Labels use the backend’s nearest facility names; state names
                  require a state-boundary field or reverse-geocoding step.
                </span>
              }
            >
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={siteLikeLocations}
                    layout="vertical"
                    margin={{ top: 4, right: 10, left: 12, bottom: 4 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="rgba(255,255,240,.08)"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#9d7765", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={84}
                      tick={{ fill: "#d8c8b9", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<TooltipBox />}
                      cursor={{ fill: "rgba(255,210,90,.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#ffd25a"
                      radius={[0, 1, 1, 0]}
                      barSize={12}
                    >
                      {siteLikeLocations.map(item => (
                        <Cell
                          key={item.label}
                          fill={
                            item.count / maxLocation > 0.65
                              ? "#ffd25a"
                              : "#ffaa5a"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel
              index="03"
              eyebrow="model confidence"
              title="Confidence distribution"
              status={loading ? "LOADING" : "LIVE DATA"}
              footer={
                <span>
                  Observation count{" "}
                  <strong className="float-right text-[#ffd25a]">
                    {total.toLocaleString()} records
                  </strong>
                </span>
              }
            >
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={confidence}
                    margin={{ top: 10, right: 8, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(255,255,240,.08)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#c6ad9c", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#9d7765", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<TooltipBox />}
                      cursor={{ fill: "rgba(255,210,90,.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#ffb35c"
                      barSize={42}
                      radius={[1, 1, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel
              index="04"
              eyebrow="thermal signature"
              title="Thermal intensity distribution"
              status={loading ? "LOADING" : "LIVE DATA"}
              footer={
                <span>
                  Thermal delta bins{" "}
                  <strong className="float-right text-[#ffd25a]">
                    ΔT / observation
                  </strong>
                </span>
              }
            >
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={intensity}
                    margin={{ top: 10, right: 8, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(255,255,240,.08)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#c6ad9c", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={value => `${value}°C`}
                    />
                    <YAxis
                      tick={{ fill: "#9d7765", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<TooltipBox />}
                      cursor={{ fill: "rgba(255,170,90,.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#f97316"
                      barSize={42}
                      radius={[1, 1, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>
          </div>

          <footer className="mt-5 border border-white/[0.08] px-3 py-3 text-[10px] text-[#9d7765]">
            Live chart values are derived from the backend `sites` table. No
            government or satellite statistics are inferred when a backend field
            is unavailable.
          </footer>
        </div>
      </main>
    </div>
  );
}
