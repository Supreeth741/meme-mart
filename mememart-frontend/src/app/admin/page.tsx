'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminService } from '@/services/adminService';
import LoadingSpinner from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';

import type { ChartSectionProps } from '@/components/ChartSection';
const ChartSection = dynamic<ChartSectionProps>(() => import('@/components/ChartSection'), { ssr: false });

interface AnalyticsData {
  totalUsers: number;
  totalMedia: number;
  totalDownloads: number;
  totalViews: number;
  mediaByType: { _id: string; count: number }[];
  recentUploads: number;
  recentUsers: number;
  topMedia: any[];
  uploadTrend: { _id: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const [analyticsRes, trafficRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getTrafficMetrics(),
      ]);
      setAnalytics(analyticsRes.data.data);
      setTrafficData(trafficRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = analytics
    ? [
        { label: 'Total Users', value: analytics.totalUsers, icon: 'group', color: 'text-blue-400' },
        { label: 'Total Uploads', value: analytics.totalMedia, icon: 'cloud_upload', color: 'text-green-400' },
        { label: 'Total Downloads', value: analytics.totalDownloads, icon: 'download', color: 'text-purple-400' },
        { label: 'Total Views', value: analytics.totalViews, icon: 'visibility', color: 'text-orange-400' },
        { label: 'New Users (30d)', value: analytics.recentUsers, icon: 'person_add', color: 'text-cyan-400' },
        { label: 'New Uploads (30d)', value: analytics.recentUploads, icon: 'add_circle', color: 'text-yellow-400' },
      ]
    : [];

  return (
    <ProtectedRoute adminOnly>
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and performance metrics</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : analytics ? (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4"
                >
                  <span className={`material-symbols-outlined ${stat.color} text-xl sm:text-2xl`}>
                    {stat.icon}
                  </span>
                  <p className="text-lg sm:text-2xl font-extrabold mt-2">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <ChartSection analytics={analytics} trafficData={trafficData} />

            {/* Top Media */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Top Media by Views</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-800">
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Views</th>
                      <th className="pb-3 pr-4">Downloads</th>
                      <th className="pb-3">Uploader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topMedia.map((m) => (
                      <tr key={m._id} className="border-b border-slate-800/50">
                        <td className="py-3 pr-4 font-semibold truncate max-w-[200px]">{m.title}</td>
                        <td className="py-3 pr-4 capitalize">{m.mediaType}</td>
                        <td className="py-3 pr-4">{m.views.toLocaleString()}</td>
                        <td className="py-3 pr-4">{m.downloads.toLocaleString()}</td>
                        <td className="py-3">{m.uploaderName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Failed to load analytics data</p>
        )}
      </div>
    </ProtectedRoute>
  );
}
