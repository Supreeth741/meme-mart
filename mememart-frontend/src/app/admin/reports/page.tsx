'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminService } from '@/services/adminService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';

interface Report {
  _id: string;
  mediaId: string;
  reportedBy: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [page]);

  async function fetchReports() {
    setLoading(true);
    try {
      const { data } = await adminService.getReports(undefined, page, 10);
      setReports(data.data.data);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReportStatus(reportId: string, status: string) {
    try {
      await adminService.updateReportStatus(reportId, status);
      toast.success(`Report ${status}`);
      fetchReports();
    } catch {
      toast.error('Failed to update report');
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Reported Modules</h1>
          <p className="text-slate-400 mt-1">Review and manage content reports</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Content Reports</h3>
            {reports.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No reports</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div 
                    key={r._id}
                    onClick={() => router.push(`/admin/reports/${r._id}`)}
                    className="bg-slate-800/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">Media: {r.mediaId}</p>
                      <p className="text-xs text-slate-400">
                        Reason: <span className="capitalize">{r.reason}</span> • {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        r.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                        r.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        r.status === 'dismissed' ? 'bg-slate-600/20 text-slate-400' :
                        'bg-slate-600/20 text-slate-400'
                      }`}>
                        {r.status}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
