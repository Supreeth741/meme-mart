"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mediaService } from "@/services/mediaService";
import LoadingSpinner from "@/components/LoadingSpinner";
import AudioPlayer from "@/components/AudioPlayer";
import toast from "react-hot-toast";

interface MediaDetail {
  _id: string;
  title: string;
  category: string;
  mediaType: string;
  mediaUrl: string;
  streamUrl?: string;
  uploaderName: string;
  resolution?: string;
  fps?: number;
  duration?: number;
  bitrate?: number;
  format?: string;
  fileSize: number;
  tags: string[];
  computedTags: string[];
  isViral: boolean;
  views: number;
  downloads: number;
  createdAt: string;
}

interface RelatedMedia {
  _id: string;
  title: string;
  mediaType: string;
  mediaUrl: string;
  views: number;
  duration?: number;
}

export default function MediaDetailClient() {
  const params = useParams();
  const pathname = usePathname();
  // In static export, useParams() returns the generateStaticParams placeholder ("_").
  // Fall back to the actual URL segment at runtime.
  const rawId = params.id as string;
  const id = rawId === "_" ? pathname.split("/").filter(Boolean).pop() ?? "_" : rawId;
  const router = useRouter();
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [relatedByType, setRelatedByType] = useState<RelatedMedia[]>([]);
  const [relatedByCategory, setRelatedByCategory] = useState<RelatedMedia[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [mediaRes, relatedRes] = await Promise.all([
          mediaService.getById(id),
          mediaService.getRelated(id, 4),
        ]);
        setMedia(mediaRes.data.data);
        setRelatedByType(relatedRes.data.data.relatedByType || []);
        setRelatedByCategory(relatedRes.data.data.relatedByCategory || []);
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [id]);

  const handleDownload = async () => {
    if (!media) return;
    setDownloading(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://api.mememart.in/api";
      const response = await fetch(
        `${API_URL}/media/${media._id}/download-file`,
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const extMap: Record<string, string> = {
        video: "mp4",
        image: "png",
        audio: "mp3",
      };
      const ext = extMap[media.mediaType] || "";

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = ext ? `${media.title}.${ext}` : media.title;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      setMedia({ ...media, downloads: media.downloads + 1 });
      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }
    try {
      await mediaService.report(id, reportReason, reportDesc);
      toast.success("Report submitted");
      setShowReport(false);
      setReportReason("");
      setReportDesc("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Report failed");
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!media)
    return (
      <div className="text-center py-16 text-slate-500">Media not found</div>
    );

  const fileExtMap: Record<string, string> = {
    video: "MP4",
    image: "PNG",
    audio: "MP3",
  };

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-[1200px] mx-auto px-4 py-8">
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">
              {media.title}
            </h1>
          </div>

          {/* Media Player */}
          <div className="relative group aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5 shadow-2xl ring-1 ring-slate-200 dark:ring-primary/20 flex items-center justify-center">
            {media.mediaType === "image" ? (
              <img
                src={media.streamUrl || media.mediaUrl}
                alt={media.title}
                className="w-full h-full object-contain"
              />
            ) : media.mediaType === "video" ? (
              <video
                src={media.streamUrl || media.mediaUrl}
                controls
                className="w-full h-full"
                preload="metadata"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-6 p-4 sm:p-8">
                <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary">
                  music_note
                </span>
                <div className="w-full max-w-md">
                  <AudioPlayer src={media.streamUrl || media.mediaUrl} />
                </div>
              </div>
            )}
          </div>

          {/* Description & Details */}
          <div className="bg-white dark:bg-primary/5 p-6 rounded-xl border border-slate-200 dark:border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Video: Resolution, FPS, Duration, Downloads */}
              {media.mediaType === "video" && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Resolution
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {media.resolution || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      FPS
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {media.fps ? `${media.fps} fps` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Duration
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDuration(media.duration)}
                    </p>
                  </div>
                </>
              )}
              {/* Image: Resolution, Format, File Size, Downloads */}
              {media.mediaType === "image" && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Resolution
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {media.resolution || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Format
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {media.format || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      File Size
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatSize(media.fileSize)}
                    </p>
                  </div>
                </>
              )}
              {/* Audio: Duration, Bitrate, Format, Downloads */}
              {media.mediaType === "audio" && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Duration
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDuration(media.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Bitrate
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {media.bitrate ? `${media.bitrate} kbps` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                      Format
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {media.format || "N/A"}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-slate-500 dark:text-primary/40 uppercase font-bold tracking-widest">
                  Downloads
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {media.downloads.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">person</span>
              {media.uploaderName}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                visibility
              </span>
              {media.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                calendar_today
              </span>
              {new Date(media.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Tags */}
          {media.computedTags && media.computedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.computedTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tag === "Viral"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : tag === "Latest"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Actions Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-primary/5 p-6 rounded-xl border border-slate-200 dark:border-primary/10 sticky top-24">
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-3 rounded-full h-14 bg-primary text-background-dark text-base font-black tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">download</span>
                <span>
                  {downloading
                    ? "Starting..."
                    : `Download ${fileExtMap[media.mediaType] || "File"} (${media.mediaType.charAt(0).toUpperCase() + media.mediaType.slice(1)})`}
                </span>
              </button>
              <button
                className="w-full flex items-center justify-center gap-3 rounded-full h-14 bg-transparent text-slate-700 dark:text-slate-300 text-base font-bold tracking-tight hover:bg-slate-100 dark:hover:bg-primary/10 transition-all border-2 border-slate-200 dark:border-primary/10"
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => toast.success("Link copied!")).catch(() => toast.error("Copy failed"));
                  } else {
                    const el = document.createElement("textarea");
                    el.value = url;
                    el.style.cssText = "position:fixed;opacity:0";
                    document.body.appendChild(el);
                    el.focus();
                    el.select();
                    try { document.execCommand("copy"); toast.success("Link copied!"); } catch { toast.error("Copy failed"); }
                    document.body.removeChild(el);
                  }
                }}
              >
                <span className="material-symbols-outlined">share</span>
                <span>Share Template</span>
              </button>
            </div>

            {/* Related Templates */}
            {relatedByType.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-primary/10 space-y-4">
                <h4 className="text-sm font-bold text-slate-500 dark:text-primary/60 uppercase tracking-widest">
                  Related Templates
                </h4>
                <div className="space-y-4">
                  {relatedByType.map((item) => (
                    <a
                      key={item._id}
                      className="group flex gap-3 items-center cursor-pointer"
                      onClick={() => router.push(`/media/${item._id}`)}
                    >
                      <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                        {item.mediaType === "image" ? (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="object-cover size-full group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                        ) : item.mediaType === "video" ? (
                          <div className="size-full bg-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-slate-400">
                              videocam
                            </span>
                          </div>
                        ) : (
                          <div className="size-full bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-slate-500">
                              music_note
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-primary/40">
                          {item.views.toLocaleString()} views
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Report */}
            {user && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-primary/10">
                {!showReport ? (
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      flag
                    </span>
                    Report Content
                  </button>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold">Report this content</h4>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select reason</option>
                      <option value="inappropriate">Inappropriate</option>
                      <option value="copyright">Copyright</option>
                      <option value="spam">Spam</option>
                      <option value="offensive">Offensive</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Additional details (optional)"
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReport}
                        className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowReport(false)}
                        className="flex-1 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More from this category */}
      {relatedByCategory.length > 0 && (
        <section className="w-full mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black">
              More {media.category} Templates
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedByCategory.map((item) => (
              <div
                key={item._id}
                className="group cursor-pointer"
                onClick={() => router.push(`/media/${item._id}`)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  {item.mediaType === "image" ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="object-cover size-full group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : item.mediaType === "video" ? (
                    <div className="size-full bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-slate-400">
                        videocam
                      </span>
                    </div>
                  ) : (
                    <div className="size-full bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-slate-500">
                        music_note
                      </span>
                    </div>
                  )}
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded">
                      {formatDuration(item.duration)}
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm group-hover:text-primary transition-colors">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
