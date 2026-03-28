"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AudioPlayer from "@/components/AudioPlayer";
import { adminService } from "@/services/adminService";
import { mediaService } from "@/services/mediaService";
import { authService } from "@/services/authService";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

interface Report {
  _id: string;
  mediaId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Media {
  _id: string;
  title: string;
  mediaType: string;
  mediaUrl: string;
  uploadedBy: string;
  uploaderName: string;
  views: number;
  downloads: number;
  fileSize?: number;
  isViral: boolean;
  createdAt: string;
  resolution?: string;
  fps?: string;
  duration?: string;
  format?: string;
  bitrate?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export default function ReportDetailClient() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  // In static export, useParams() returns the generateStaticParams placeholder ("_").
  // Fall back to the actual URL segment at runtime.
  const rawId = params.id as string;
  const reportId = rawId === "_" ? pathname.split("/").filter(Boolean).pop() ?? "_" : rawId;

  const [report, setReport] = useState<Report | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [reporter, setReporter] = useState<User | null>(null);
  const [uploader, setUploader] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  async function fetchReportDetails() {
    try {
      setLoading(true);
      const { data: reportData } = await adminService.getReportById(reportId);
      const reportDetails = reportData.data as Report;
      setReport(reportDetails);

      const { data: mediaData } = await mediaService.getById(
        reportDetails.mediaId,
      );
      const mediaDetails = mediaData.data as Media;
      setMedia(mediaDetails);

      const { data: reporterData } = await authService.getUserById(
        reportDetails.reportedBy,
      );
      setReporter(reporterData.data as User);

      const { data: uploaderData } = await authService.getUserById(
        mediaDetails.uploadedBy,
      );
      setUploader(uploaderData.data as User);
    } catch (error) {
      console.error("Failed to fetch report details:", error);
      toast.error("Failed to load report details");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus: ReportStatus) {
    try {
      setActionLoading(true);
      await adminService.updateReportStatus(reportId, newStatus);
      setReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success(`Report marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update report status:", error);
      toast.error("Failed to update report status");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteMedia() {
    try {
      setActionLoading(true);
      await adminService.deleteMedia(media?._id || "");
      await handleStatusUpdate("resolved");
      toast.success("Media deleted successfully");
      router.push("/admin/reports");
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media");
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" />;
  if (!report || !media)
    return (
      <div className="text-center py-16 text-slate-500">Report not found</div>
    );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    reviewed: "bg-blue-500/20 text-blue-400",
    resolved: "bg-green-500/20 text-green-400",
    dismissed: "bg-slate-600/20 text-slate-400",
  };

  const reasonLabels: Record<string, string> = {
    inappropriate: "Inappropriate Content",
    copyright: "Copyright Issue",
    spam: "Spam",
    offensive: "Offensive Content",
    other: "Other",
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-semibold">Back to Reports</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Report Details
            </h1>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[report.status]}`}
          >
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Media & Report Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Preview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Media Under Review</h2>

              {/* Media Preview Area */}
              <div className="mb-6 bg-slate-800/50 rounded-lg overflow-hidden aspect-video flex items-center justify-center mb-6">
                {media.mediaType === "image" ? (
                  <img
                    src={media.mediaUrl}
                    alt={media.title}
                    className="w-full h-full object-contain"
                  />
                ) : media.mediaType === "video" ? (
                  <video
                    src={media.mediaUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-6 p-4 sm:p-8 w-full">
                    <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary">
                      music_note
                    </span>
                    <div className="w-full max-w-md">
                      <AudioPlayer src={media.mediaUrl} />
                    </div>
                  </div>
                )}
              </div>

              {/* Media Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                    Title
                  </p>
                  <p className="text-sm font-semibold">{media.title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                    Type
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {media.mediaType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                    Uploaded By
                  </p>
                  <p className="text-sm font-semibold">
                    {uploader?.username || media.uploaderName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                    Uploaded On
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(media.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {media.mediaType === "video" && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        Resolution
                      </p>
                      <p className="text-sm font-semibold">
                        {media.resolution || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold">
                        {media.duration ? `${media.duration}s` : "N/A"}
                      </p>
                    </div>
                  </>
                )}
                {media.mediaType === "image" && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        Resolution
                      </p>
                      <p className="text-sm font-semibold">
                        {media.resolution || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        Format
                      </p>
                      <p className="text-sm font-semibold">
                        {media.format || "N/A"}
                      </p>
                    </div>
                  </>
                )}
                {media.mediaType === "audio" && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold">
                        {media.duration ? `${media.duration}s` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        Bitrate
                      </p>
                      <p className="text-sm font-semibold">
                        {media.bitrate ? `${media.bitrate} kbps` : "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Views</p>
                  <p className="text-lg font-bold">
                    {media.views.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Downloads</p>
                  <p className="text-lg font-bold">
                    {media.downloads.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <p className="text-lg font-bold">
                    {media.isViral ? "Viral" : "Normal"}
                  </p>
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Report Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                    Reported By
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="size-10 rounded-lg bg-primary text-background-dark flex items-center justify-center font-bold shrink-0">
                      {reporter?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {reporter?.username || "Unknown User"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {reporter?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                    Report Reason
                  </p>
                  <p className="text-sm font-semibold bg-slate-800/30 p-3 rounded-lg">
                    {reasonLabels[report.reason] || report.reason}
                  </p>
                </div>

                {report.description && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                      Description
                    </p>
                    <p className="text-sm bg-slate-800/30 p-3 rounded-lg whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                    Reported On
                  </p>
                  <p className="text-sm font-semibold bg-slate-800/30 p-3 rounded-lg">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sticky top-4">
              <h3 className="font-bold mb-4">Admin Actions</h3>

              <div className="space-y-3">
                {report.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("reviewed")}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">
                        check_circle
                      </span>
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("resolved")}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">
                        done_all
                      </span>
                      Resolve Report
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("dismissed")}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                      Dismiss Report
                    </button>
                  </>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                    Delete Media
                  </button>

                  {showDeleteConfirm && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-4 w-56 text-sm z-10">
                      <p className="mb-3 font-semibold">Delete this media?</p>
                      <p className="text-xs text-slate-400 mb-4">
                        This action cannot be undone. The media will be
                        permanently removed.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteMedia}
                          disabled={actionLoading}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                  Current Status
                </p>
                <p
                  className={`text-sm font-semibold px-3 py-2 rounded-lg ${statusColors[report.status]}`}
                >
                  {report.status.charAt(0).toUpperCase() +
                    report.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
