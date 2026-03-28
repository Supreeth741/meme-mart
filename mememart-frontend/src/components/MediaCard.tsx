'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface MediaCardProps {
  id: string;
  title: string;
  mediaType: string;
  mediaUrl: string;
  uploaderName: string;
  views: number;
  downloads: number;
  isViral?: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  video: 'videocam',
  image: 'image',
  audio: 'music_note',
};

const typeColors: Record<string, string> = {
  video: 'bg-violet-500',
  image: 'bg-emerald-500',
  audio: 'bg-blue-500',
};

export default function MediaCard({
  id,
  title,
  mediaType,
  mediaUrl,
  uploaderName,
  views,
  downloads,
  isViral,
  createdAt,
}: MediaCardProps) {
  const [isLatest, setIsLatest] = useState(false);

  useEffect(() => {
    // Calculate on client to avoid hydration mismatch
    const createdDate = new Date(createdAt);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    setIsLatest(createdDate >= tenDaysAgo);
  }, [createdAt]);

  return (
    <Link href={`/media/${id}`} className="group block">
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
          {mediaType === 'image' ? (
            <img src={mediaUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-4xl">
                {typeIcons[mediaType]}
              </span>
              <span className="text-xs uppercase font-semibold">{mediaType}</span>
            </div>
          )}

          {/* Type badge */}
          <span className={`absolute top-2 left-2 ${typeColors[mediaType]} text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1`}>
            <span className="material-symbols-outlined text-xs">{typeIcons[mediaType]}</span>
            {mediaType}
          </span>

          {/* Tags */}
          <div className="absolute top-2 right-2 flex gap-1">
            {isViral && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                Viral
              </span>
            )}
            {isLatest && (
              <span className="bg-primary text-bg-dark text-xs px-2 py-0.5 rounded-full font-semibold">
                Latest
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">by {uploaderName}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">visibility</span>
              {views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">download</span>
              {downloads.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
