'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ChartSectionProps {
  analytics: {
    mediaByType: { _id: string; count: number }[];
    uploadTrend: { _id: string; count: number }[];
  };
  trafficData: {
    daily?: { _id: string; count: number }[];
    uploadActivity?: { _id: string; count: number }[];
    loginActivity?: { _id: string; count: number }[];
  } | null;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
    },
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#94a3b8', padding: 16, font: { size: 12 } },
    },
  },
};

export default function ChartSection({ analytics, trafficData }: ChartSectionProps) {
  // Upload Trend - Line Chart
  const uploadTrendData = {
    labels: analytics.uploadTrend.map((d) => d._id),
    datasets: [
      {
        label: 'Uploads',
        data: analytics.uploadTrend.map((d) => d.count),
        borderColor: '#f9f506',
        backgroundColor: 'rgba(249, 245, 6, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Media by Type - Doughnut
  const mediaByTypeData = {
    labels: analytics.mediaByType.map((d) => d._id.charAt(0).toUpperCase() + d._id.slice(1)),
    datasets: [
      {
        data: analytics.mediaByType.map((d) => d.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  // Traffic - Bar Chart
  const dailyData = trafficData?.daily || trafficData?.uploadActivity || [];
  const loginData = trafficData?.loginActivity || [];
  const trafficChartData = trafficData
    ? {
        labels: dailyData.map((d) => d._id),
        datasets: [
          {
            label: 'Traffic',
            data: dailyData.map((d) => d.count),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderRadius: 4,
          },
          {
            label: 'Logins',
            data: loginData.map((d) => d.count),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderRadius: 4,
          },
        ],
      }
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Trend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Upload Trend (Last 30 Days)</h3>
        <div className="h-[260px]">
          <Line data={uploadTrendData} options={chartOptions} />
        </div>
      </div>

      {/* Media by Type */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Media by Type</h3>
        <div className="h-[260px]">
          <Doughnut data={mediaByTypeData} options={doughnutOptions} />
        </div>
      </div>

      {/* Traffic Metrics */}
      {trafficChartData && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-300 mb-4">Traffic & Login Activity (Last 30 Days)</h3>
          <div className="h-[280px]">
            <Bar data={trafficChartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
