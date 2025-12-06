'use client';

import { useState } from "react";

export default function Home() {
  const [subdistrict, setSubdistrict] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [predictions, setPredictions] = useState<Record<string, number> | null>(null);
  const [totalPredicted, setTotalPredicted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdistricts, setSubdistricts] = useState<string[]>([]);

  // Fetch subdistricts on mount
  useState(() => {
    fetch('http://localhost:8000/subdistricts')
      .then(res => res.json())
      .then(data => setSubdistricts(data.subdistricts))
      .catch(err => console.error('Failed to fetch subdistricts:', err));
  });

  const handlePredict = async () => {
    setError('');
    setPredictions(null);
    setLoading(true);

    try {
      // Parse date string to get year, month, day
      const [year, month, day] = date.split('-').map(Number);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdistrict, year, month, day })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Prediction failed');
      }

      setPredictions(data.predictions);
      setTotalPredicted(data.total_predicted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bangkok Traffy Predictor
          </h1>
          <p className="text-gray-600 mb-8">
            Predict complaint counts by category for Bangkok subdistricts
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdistrict (แขวง)
              </label>
              <input
                type="text"
                value={subdistrict}
                onChange={(e) => setSubdistrict(e.target.value)}
                placeholder="e.g., วังทองหลาง"
                list="subdistricts"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <datalist id="subdistricts">
                {subdistricts.map(sd => (
                  <option key={sd} value={sd} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="2023-01-01"
                max="2030-12-31"
                className="w-full px-4 py-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || !subdistrict}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Predicting...' : 'Predict Complaints'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {totalPredicted !== null && predictions && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📊</span>
                <h2 className="text-3xl font-bold text-gray-800">
                  Prediction Results
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-gray-600 mb-6">
                <span className="px-3 py-1 bg-blue-50 rounded-full text-sm font-medium text-blue-700">
                  📍 {subdistrict}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  📅 {new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </span>
              </div>

              {/* Total Card */}
              <div className="relative overflow-hidden p-6 bg-linear-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <p className="text-sm opacity-90 mb-2 flex items-center gap-2">
                    <span>📈</span> Total Predicted Complaints
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-6xl font-bold">
                      {Math.round(totalPredicted)}
                    </p>
                    <p className="text-xl opacity-75">
                      complaints
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {totalPredicted < 3 ? (
                      <span className="px-3 py-1 bg-green-400 bg-opacity-30 rounded-full text-sm font-semibold">
                        ✅ Low Activity Expected
                      </span>
                    ) : totalPredicted < 7 ? (
                      <span className="px-3 py-1 bg-yellow-400 bg-opacity-30 rounded-full text-sm font-semibold">
                        ⚠️ Moderate Activity Expected
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-400 bg-opacity-30 rounded-full text-sm font-semibold">
                        🔴 High Activity Expected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Issues Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span> Top 3 Expected Issues
              </h3>
              <div className="space-y-3">
                {Object.entries(predictions)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([category, count], index) => (
                    <div 
                      key={category}
                      className="flex items-center gap-4 p-4 bg-linear-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="grow">
                        <p className="font-semibold text-gray-800 text-lg">{category}</p>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-linear-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min((count / totalPredicted) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">{((count / totalPredicted) * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{count.toFixed(1)} complaints</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* All Categories Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span> All Categories ({Object.keys(predictions).length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(predictions)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div 
                      key={category}
                      className="group p-4 border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700 grow">{category}</p>
                        {count > 1 && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold shrink-0">
                            High
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-bold text-gray-800 mb-2">
                        {((count / totalPredicted) * 100).toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-700"
                          style={{ 
                            width: `${Math.min((count / Math.max(...Object.values(predictions))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {count.toFixed(1)} complaints
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setPredictions(null);
                  setTotalPredicted(null);
                  setSubdistrict('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                🔄 New Prediction
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
