/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { BarChart3, TrendingUp, Map, Network, Box, Home } from "lucide-react";
import Link from "next/link";
import "../leaflet.css";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function Visualizations() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate data loading
    const fetchData = async () => {
      try {
        // For now, we'll use mock data structure
        // In production, you'd fetch aggregated data from your API
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading visualizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              <div className="text-slate-300">|</div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">
                  Data Visualizations
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "trends", label: "Trends", icon: TrendingUp },
              { id: "geospatial", label: "Maps", icon: Map },
              { id: "network", label: "Network", icon: Network },
              { id: "3d", label: "3D View", icon: Box },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "trends" && <TrendsTab />}
        {activeTab === "geospatial" && <GeospatialTab />}
        {activeTab === "network" && <NetworkTab />}
        {activeTab === "3d" && <ThreeDTab />}
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab() {
  // Mock data for top subdistricts
  const mockSubdistrictData = {
    x: [12450, 11230, 10890, 9870, 9120, 8560, 8210, 7980, 7650, 7320],
    y: [
      "วังทองหลาง",
      "ลาดพร้าว",
      "สายไหม",
      "บางนา",
      "ดินแดง",
      "คลองตัน",
      "บางกะปิ",
      "สามเสนใน",
      "คลองเตย",
      "จตุจักร",
    ],
  };

  // Mock data for complaint types
  const mockComplaintTypes = {
    labels: [
      "Total",
      "ถนน",
      "ความสะอาด",
      "แสงสว่าง",
      "ทางเท้า",
      "ต้นไม้",
      "กีดขวาง",
      "ท่อระบายน้ำ",
      "น้ำท่วม",
      "สายไฟ",
      "จราจร",
      "สัตว์จรจัด",
      "เสียงรบกวน",
      "คลอง",
      "PM2.5",
      "ความปลอดภัย",
      "ป้าย",
      "สะพาน",
    ],
    parents: [
      "",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
    ],
    values: [
      165000, 45000, 28000, 18000, 15000, 12000, 10000, 8000, 7000, 6000, 5000,
      4000, 3000, 2500, 1500, 800, 600, 600,
    ],
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Top 10 Subdistricts by Total Complaints
        </h2>
        {/* @ts-expect-error Plotly type definitions do not fully support bar configuration */}
        <Plot
          data={[
            {
              type: "bar",
              x: mockSubdistrictData.x,
              y: mockSubdistrictData.y,
              orientation: "h",
              marker: {
                color: mockSubdistrictData.x,
                colorscale: "Reds",
                showscale: true,
                colorbar: { title: "Complaints" },
              },
              text: mockSubdistrictData.x,
              textposition: "auto",
            } as any,
          ]}
          layout={{
            xaxis: { title: "Total Complaints" },
            yaxis: { title: "Subdistrict" },
            height: 500,
            // template: "plotly_white",
            margin: { l: 120, r: 50, t: 20, b: 50 },
          }}
          config={{ responsive: true }}
          className="w-full"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Complaint Types Distribution
        </h2>
        <Plot
          data={[
            {
              type: "sunburst",
              labels: mockComplaintTypes.labels,
              parents: mockComplaintTypes.parents,
              values: mockComplaintTypes.values,
              marker: { colorscale: "RdYlBu_r" },
              textinfo: "label+percent",
            } as any,
          ]}
          layout={{
            height: 600,
            //template: "plotly_white",
            margin: { l: 0, r: 0, t: 20, b: 0 },
          }}
          config={{ responsive: true }}
          className="w-full"
        />
      </div>
    </div>
  );
}

function TrendsTab() {
  // Generate mock time series data using useMemo to avoid setState in effect
  const timeSeriesData = useMemo(() => {
    const dates: string[] = [];
    const values: number[] = [];
    const startDate = new Date("2023-05-01");

    for (let i = 0; i < 400; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);

      // Generate realistic complaint count with trend and seasonality
      const trend = i * 0.1;
      const seasonal = 20 * Math.sin((i * 2 * Math.PI) / 365);
      const pseudoRandom = Math.sin(i * 12.9898) * 0.5 + 0.5; // Returns value between 0 and 1
      const noise = pseudoRandom * 30 - 15;
      values.push(Math.max(50 + trend + seasonal + noise, 0));
    }
    return { dates, values };
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Complaints Over Time (Daily)
        </h2>
        {/* @ts-expect-error Plotly type definitions do not fully support scatter configuration */}
        <Plot
          data={[
            {
              type: "scatter",
              mode: "lines",
              x: timeSeriesData.dates,
              y: timeSeriesData.values,
              name: "Total Complaints",
              line: { color: "#e74c3c", width: 2 },
            },
          ]}
          layout={{
            xaxis: { title: "Date" },
            yaxis: { title: "Number of Complaints" },
            height: 500,
            template: "plotly_white",
            hovermode: "x unified",
            margin: { l: 60, r: 50, t: 20, b: 60 },
          }}
          config={{ responsive: true }}
          className="w-full"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Heatmap: Complaint Types by Top Subdistricts
        </h2>
        {/* @ts-expect-error Plotly type definitions do not fully support heatmap configuration */}
        <Plot
          data={[
            {
              type: "heatmap",
              z: [
                [850, 320, 280, 180, 150, 120, 90, 80, 70, 60, 50, 40, 30, 20, 15, 10, 8],
                [780, 310, 260, 170, 140, 110, 85, 75, 65, 55, 48, 38, 28, 18, 13, 9, 7],
                [720, 290, 240, 160, 130, 100, 80, 70, 60, 50, 45, 35, 25, 16, 12, 8, 6],
                [680, 270, 220, 150, 120, 95, 75, 65, 55, 48, 42, 33, 23, 15, 11, 7, 5],
                [650, 260, 210, 145, 115, 90, 72, 62, 52, 45, 40, 31, 22, 14, 10, 7, 5],
                [620, 250, 200, 140, 110, 88, 70, 60, 50, 43, 38, 30, 21, 13, 9, 6, 4],
                [590, 240, 190, 135, 105, 85, 68, 58, 48, 41, 36, 28, 20, 12, 9, 6, 4],
                [560, 230, 180, 130, 100, 82, 66, 56, 46, 39, 34, 27, 19, 11, 8, 5, 4],
                [530, 220, 175, 125, 98, 80, 64, 54, 44, 37, 33, 26, 18, 11, 8, 5, 3],
                [510, 210, 170, 122, 95, 78, 62, 52, 43, 36, 32, 25, 17, 10, 7, 5, 3],
              ],
              x: [
                "ถนน",
                "ความสะอาด",
                "แสงสว่าง",
                "ทางเท้า",
                "ต้นไม้",
                "กีดขวาง",
                "ท่อระบายน้ำ",
                "น้ำท่วม",
                "สายไฟ",
                "จราจร",
                "สัตว์จรจัด",
                "เสียงรบกวน",
                "คลอง",
                "PM2.5",
                "ความปลอดภัย",
                "ป้าย",
                "สะพาน",
              ],
              y: [
                "วังทองหลาง",
                "ลาดพร้าว",
                "สายไหม",
                "บางนา",
                "ดินแดง",
                "คลองตัน",
                "บางกะปิ",
                "สามเสนใน",
                "คลองเตย",
                "จตุจักร",
              ],
              colorscale: "YlOrRd",
              colorbar: { title: "Complaints" },
            },
          ]}
          layout={{
            xaxis: { title: "Complaint Type", tickangle: -45 },
            yaxis: { title: "Subdistrict" },
            height: 600,
            template: "plotly_white",
            margin: { l: 120, r: 50, t: 20, b: 100 },
          }}
          config={{ responsive: true }}
          className="w-full"
        />
      </div>
    </div>
  );
}

function GeospatialTab() {
  // Bangkok subdistrict coordinates and complaint data
  const bangkokLocations = useMemo(() => [
    { name: "วังทองหลาง", lat: 13.7783, lng: 100.6028, complaints: 12450 },
    { name: "ลาดพร้าว", lat: 13.8158, lng: 100.6060, complaints: 11230 },
    { name: "สายไหม", lat: 13.9017, lng: 100.6536, complaints: 10890 },
    { name: "บางนา", lat: 13.6686, lng: 100.6252, complaints: 9870 },
    { name: "ดินแดง", lat: 13.7636, lng: 100.5560, complaints: 9120 },
    { name: "คลองตัน", lat: 13.7297, lng: 100.5805, complaints: 8560 },
    { name: "บางกะปิ", lat: 13.7630, lng: 100.6428, complaints: 8210 },
    { name: "สามเสนใน", lat: 13.7969, lng: 100.5362, complaints: 7980 },
    { name: "คลองเตย", lat: 13.7214, lng: 100.5809, complaints: 7650 },
    { name: "จตุจักร", lat: 13.8116, lng: 100.5532, complaints: 7320 },
  ], []);

  const maxComplaints = Math.max(...bangkokLocations.map(loc => loc.complaints));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Bangkok Complaint Intensity Map
      </h2>
      <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={[13.7563, 100.5018]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bangkokLocations.map((location) => {
            const radius = (location.complaints / maxComplaints) * 30 + 10;
            const opacity = (location.complaints / maxComplaints) * 0.6 + 0.3;
            
            return (
              <CircleMarker
                key={location.name}
                center={[location.lat, location.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: "#e74c3c",
                  fillOpacity: opacity,
                  color: "#c0392b",
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-lg">{location.name}</p>
                    <p className="text-slate-600">
                      {location.complaints.toLocaleString()} complaints
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
          <span>High Complaints</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div>
          <span>Medium Complaints</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 opacity-30"></div>
          <span>Low Complaints</span>
        </div>
      </div>
    </div>
  );
}

function NetworkTab() {
  "use no memo";
  // Generate mock network graph data - memoized to avoid re-rendering
  const networkData = useMemo(() => {
    const subdistricts = [
      "วังทองหลาง",
      "ลาดพร้าว",
      "สายไหม",
      "บางนา",
      "ดินแดง",
      "คลองตัน",
      "บางกะปิ",
      "สามเสนใน",
    ];

    const nodes = subdistricts.map((name, i) => ({
      x: Math.cos((i * 2 * Math.PI) / subdistricts.length),
      y: Math.sin((i * 2 * Math.PI) / subdistricts.length),
      text: name,
      size: 20 + i * 3,
    }));

    const edge_x = [];
    const edge_y = [];

    // Create some connections using deterministic hash
    for (let i = 0; i < subdistricts.length; i++) {
      for (let j = i + 1; j < subdistricts.length; j++) {
        // Use deterministic hash based on indices instead of Math.random()
        const seed = i * subdistricts.length + j;
        const pseudoRandom = Math.sin(seed) * 0.5 + 0.5; // Returns value between 0 and 1
        if (pseudoRandom > 0.6) {
          edge_x.push(nodes[i].x, nodes[j].x, null);
          edge_y.push(nodes[i].y, nodes[j].y, null);
        }
      }
    }

    return { nodes, edge_x, edge_y };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Subdistrict Similarity Network
      </h2>
      {/* @ts-expect-error Plotly type definitions do not fully support scatter configuration */}
      <Plot
        data={[
          {
            type: "scatter",
            x: networkData.edge_x,
            y: networkData.edge_y,
            mode: "lines",
            line: { width: 1, color: "#888" },
            hoverinfo: "none",
          },
          {
            type: "scatter",
            x: networkData.nodes.map((n) => n.x),
            y: networkData.nodes.map((n) => n.y),
            mode: "markers+text",
            text: networkData.nodes.map((n) => n.text),
            textposition: "top center",
            textfont: { size: 10 },
            marker: {
              size: networkData.nodes.map((n) => n.size),
              color: networkData.nodes.map((n) => n.size),
              colorscale: "YlOrRd",
              showscale: true,
              colorbar: { title: "Complaints" },
              line: { width: 2, color: "white" },
            },
            hoverinfo: "text",
          },
        ]}
        layout={{
          showlegend: false,
          hovermode: "closest",
          xaxis: { showgrid: false, zeroline: false, showticklabels: false },
          yaxis: { showgrid: false, zeroline: false, showticklabels: false },
          height: 700,
          template: "plotly_white",
          margin: { l: 20, r: 20, t: 20, b: 20 },
        }}
        config={{ responsive: true }}
        className="w-full"
      />
    </div>
  );
}

function ThreeDTab() {
  "use no memo";
  // Generate mock 3D data - memoized to avoid re-rendering
  const data3D = useMemo(() => {
    const data = [];
    for (let month = 0; month < 12; month++) {
      for (let subdistrict = 0; subdistrict < 8; subdistrict++) {
        // Use a deterministic pseudo-random value based on month and subdistrict
        const seed = month * 8 + subdistrict;
        const pseudoRandom = Math.sin(seed) * 0.5 + 0.5; // Always returns value between 0 and 1
        data.push({
          month_idx: month,
          subdistrict_idx: subdistrict,
          complaints: 50 + pseudoRandom * 100 + month * 5,
        });
      }
    }
    return data;
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        3D View: Complaints Over Time and Space
      </h2>
      {/* @ts-expect-error Plotly type definitions do not fully support scatter3d configuration */}
      <Plot
        data={[
          {
            type: "scatter3d",
            x: data3D.map((d) => d.month_idx),
            y: data3D.map((d) => d.subdistrict_idx),
            z: data3D.map((d) => d.complaints),
            mode: "markers",
            marker: {
              size: 5,
              color: data3D.map((d) => d.complaints),
              colorscale: "Viridis",
              showscale: true,
              colorbar: { title: "Complaints" },
              opacity: 0.8,
            },
          },
        ]}
        layout={{
          scene: {
            xaxis: { title: "Time (Month Index)" },
            yaxis: { title: "Subdistrict Index" },
            zaxis: { title: "Total Complaints" },
          },
          height: 700,
          template: "plotly_white",
          margin: { l: 0, r: 0, t: 20, b: 0 },
        }}
        config={{ responsive: true }}
        className="w-full"
      />
    </div>
  );
}
