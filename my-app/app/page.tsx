"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Calendar,
  Search,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Printer,
  TrendingUp,
  LayoutDashboard,
  ChevronDown,
  X,
  CalendarDays,
  LineChart,
} from "lucide-react";
import Link from "next/link";

export default function TraffyPredictor() {
  // --- State ---
  const [subdistrict, setSubdistrict] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [predictions, setPredictions] = useState<Record<string, number> | null>(
    null
  );
  const [totalPredicted, setTotalPredicted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subdistricts, setSubdistricts] = useState<string[]>([]);

  // Search UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Fetch subdistricts
  useEffect(() => {
    fetch("http://localhost:8000/subdistricts")
      .then((res) => res.json())
      .then((data) => setSubdistricts(data.subdistricts))
      .catch((err) => console.error("Failed to fetch subdistricts:", err));
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Helpers ---

  const filteredSubdistricts = subdistricts.filter((sd) =>
    sd.toLowerCase().includes(subdistrict.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < filteredSubdistricts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (
      e.key === "Enter" &&
      isDropdownOpen &&
      filteredSubdistricts.length > 0
    ) {
      e.preventDefault();
      setSubdistrict(filteredSubdistricts[highlightedIndex]);
      setIsDropdownOpen(false);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const setDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDate(d.toISOString().split("T")[0]);
  };

  const handlePredict = async () => {
    setError("");
    setPredictions(null);
    setLoading(true);

    try {
      const [year, month, day] = date.split("-").map(Number);

      // Artificial delay for demo feel (remove in prod)
      // await new Promise(r => setTimeout(r, 800));

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdistrict, year, month, day }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Prediction failed");

      setPredictions(data.predictions);
      setTotalPredicted(data.total_predicted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (total: number) => {
    if (total < 3)
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        text: "Low Activity",
      };
    if (total < 7)
      return {
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: AlertTriangle,
        text: "Moderate Activity",
      };
    return {
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: Activity,
      text: "High Activity",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <main className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-2">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Bangkok Traffy Predictor
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            AI-powered forecasting of civic complaints for Bangkok subdistricts.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/visualizations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
            >
              <BarChart3 className="w-5 h-5" />
              View Data Visualizations
            </Link>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-visible relative z-10">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* --- CUSTOM SEARCH UI --- */}
              <div className="space-y-3 relative" ref={searchContainerRef}>
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  Subdistrict (แขวง)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin
                      className={`h-5 w-5 transition-colors ${
                        isDropdownOpen ? "text-blue-500" : "text-slate-400"
                      }`}
                    />
                  </div>

                  <input
                    type="text"
                    value={subdistrict}
                    onChange={(e) => {
                      setSubdistrict(e.target.value);
                      setIsDropdownOpen(true);
                      setHighlightedIndex(0);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search location..."
                    className="block w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                    autoComplete="off"
                  />

                  {subdistrict && (
                    <button
                      onClick={() => {
                        setSubdistrict("");
                        setIsDropdownOpen(false);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[280px] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
                    {filteredSubdistricts.length > 0 ? (
                      <ul className="py-2">
                        {filteredSubdistricts.map((sd, index) => (
                          <li
                            key={sd}
                            onClick={() => {
                              setSubdistrict(sd);
                              setIsDropdownOpen(false);
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                              index === highlightedIndex
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <MapPin
                              className={`w-4 h-4 ${
                                index === highlightedIndex
                                  ? "text-blue-500"
                                  : "text-slate-300"
                              }`}
                            />
                            <span className="font-medium">{sd}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        No subdistricts found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* --- IMPROVED DATE UI --- */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="block text-sm font-bold text-slate-700 ml-1">
                    Target Date
                  </label>
                  {/* Quick Select Chips */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDatePreset(0)}
                      className="text-xs font-medium text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded-md transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDatePreset(1)}
                      className="text-xs font-medium text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded-md transition-colors"
                    >
                      Tom.
                    </button>
                    <button
                      onClick={() => setDatePreset(7)}
                      className="text-xs font-medium text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded-md transition-colors"
                    >
                      +7d
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <CalendarDays className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min="2023-01-01"
                    max="2030-12-31"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner relative appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  {/* Custom Calendar Icon Overlay for the native picker trigger */}
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading || !subdistrict}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Running Neural Network...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Analyze Location
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {totalPredicted !== null && predictions && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
            {/* ... [Result Headers kept same as previous, just clean styling] ... */}
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="text-blue-600" />
                Prediction Report
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Card */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50/50"></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Forecasted Volume
                    </p>
                    <div className="text-7xl font-black text-slate-900 tracking-tighter mb-1">
                      {Math.round(totalPredicted)}
                    </div>
                    <p className="text-slate-400 font-medium mb-6">
                      complaints / day
                    </p>

                    {(() => {
                      const severity = getSeverityConfig(totalPredicted);
                      const SeverityIcon = severity.icon;
                      return (
                        <div
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border ${severity.bg} ${severity.border} ${severity.color} transition-all`}
                        >
                          <SeverityIcon className="w-5 h-5" />
                          <span className="font-bold">{severity.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setPredictions(null);
                      setTotalPredicted(null);
                      setSubdistrict("");
                    }}
                    className="flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all font-semibold"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>

              {/* Breakdown Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-bold text-slate-800">
                    Category Breakdown
                  </h3>
                </div>

                <div className="space-y-6">
                  {Object.entries(predictions)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4) // Show top 4 big bars
                    .map(([category, count], index) => (
                      <div key={category} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-700 flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {index + 1}
                            </span>
                            {category}
                          </span>
                          <span className="font-bold text-slate-900">
                            {count.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 relative"
                            style={{
                              width: `${Math.max(
                                (count / totalPredicted) * 100,
                                5
                              )}%`,
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Remaining items pills */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Other Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(predictions)
                      .sort(([, a], [, b]) => b - a)
                      .slice(4)
                      .map(([category, count]) => (
                        <div
                          key={category}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 flex items-center gap-2"
                        >
                          <span>{category}</span>
                          <span className="font-bold text-slate-800 text-xs bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-slate-100">
                            {count.toFixed(1)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
