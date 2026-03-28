"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import MediaCard from "@/components/MediaCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { mediaService } from "@/services/mediaService";

interface Media {
  _id: string;
  title: string;
  mediaType: string;
  mediaUrl: string;
  uploaderName: string;
  views: number;
  downloads: number;
  isViral: boolean;
  createdAt: string;
}

export default function CategoryDetailClient() {
  const params = useParams();
  const pathname = usePathname();
  // In static export, useParams() returns the generateStaticParams placeholder ("_").
  // Fall back to the actual URL segment at runtime.
  const rawSlug = params.slug as string;
  const slug = rawSlug === "_" ? pathname.split("/").filter(Boolean).pop() ?? "_" : rawSlug;
  const [media, setMedia] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      try {
        const { data } = await mediaService.getByCategory(slug, page, 10);
        let items = data.data.data;
        if (filter) items = items.filter((m: Media) => m.mediaType === filter);
        setMedia(items);
        setTotalPages(data.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch category media:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [slug, page, filter]);

  const categoryName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          {categoryName}
        </h1>
        <p className="text-slate-400 mt-2">All media in this category</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "video", "image", "audio"].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === type
                ? "bg-primary text-bg-dark"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : media.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <span className="material-symbols-outlined text-5xl mb-4 block">
            folder_open
          </span>
          <p>No media found in this category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => (
              <MediaCard key={item._id} id={item._id} {...item} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
