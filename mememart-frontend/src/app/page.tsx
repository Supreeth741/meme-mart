'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { mediaService } from '@/services/mediaService';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

interface Media {
  _id: string;
  title: string;
  mediaType: string;
  mediaUrl: string;
  uploaderName: string;
  views: number;
  downloads: number;
  fileSize?: number;
  isViral: boolean;
  createdAt: string;
}

type TabKey = 'videos' | 'audios' | 'images';

const tabs: { key: TabKey; label: string; icon: string; mediaType: string }[] = [
  { key: 'videos', label: 'Recent Video', icon: 'videocam', mediaType: 'video' },
  { key: 'audios', label: 'Recent MP3', icon: 'play_arrow', mediaType: 'audio' },
  { key: 'images', label: 'Image Templates', icon: 'image', mediaType: 'image' },
];

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileExtension(mediaType: string): string {
  if (mediaType === 'video') return 'MP4';
  if (mediaType === 'audio') return 'MP3';
  return 'JPG';
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('videos');
  const [mediaData, setMediaData] = useState<Record<TabKey, Media[]>>({ videos: [], audios: [], images: [] });
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const promises: Promise<any>[] = [
          mediaService.getLatest('video', 8),
          mediaService.getLatest('audio', 8),
          mediaService.getLatest('image', 8),
        ];
        if (user) {
          promises.push(authService.getFavourites());
        }
        const results = await Promise.all(promises);
        setMediaData({
          videos: results[0].data.data,
          audios: results[1].data.data,
          images: results[2].data.data,
        });
        if (user && results[3]) {
          const favIds = results[3].data.data.map((m: any) => m._id);
          setFavourites(new Set(favIds));
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const toggleFavourite = useCallback(async (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    // Optimistic update
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
    try {
      await authService.toggleFavourite(mediaId);
    } catch {
      // Revert on failure
      setFavourites(prev => {
        const next = new Set(prev);
        if (next.has(mediaId)) next.delete(mediaId);
        else next.add(mediaId);
        return next;
      });
    }
  }, [user, router]);

  if (loading) return <LoadingSpinner size="lg" />;

  const currentMedia = mediaData[activeTab];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="px-6 lg:px-20 py-8">
        <div className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-slate-950 min-h-[400px] flex flex-col items-center justify-center text-center p-6 lg:p-12">
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA5Mor9LtpB802N18cXiALl_UGuFIgqjTMaLdv8xsY6p3TKVZM0jTD7VwC8uoWt1XxL2pOWInD70W9mEk5R6lb1s4uUhbjiNFWBoc30pNSZCVb6ref1z6SvMcGERhyutFUTX5_iI9Go5htocGckxTSoDyML2WhbAbx3eSyxGJKz1oUn_JJCcRWMnz7ZJebAfLYFoqb7zLTqqbGDPRHnkCBOgmKakyhLIDEvXjj7I2hnSo7o-o55DW9vf9-fF9xnRNLi8AT8w7WxQsg")',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          <div className="relative z-10 max-w-3xl flex flex-col gap-6">
            <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight">
              The Ultimate <span className="text-primary">Meme Template</span> Repository
            </h1>
            <p className="text-slate-300 text-base lg:text-xl font-medium">
              Find and download the latest viral video and audio assets for your next masterpiece.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-6 lg:px-20 mb-8">
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center border-b-4 pb-3 font-bold text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-slate-900 dark:text-slate-100'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Media Grid */}
      <section className="px-6 lg:px-20 mb-10">
        {currentMedia.length === 0 ? (
          <p className="text-slate-500 text-center py-12">No templates found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentMedia.map((item) => {
              const isLatest = new Date(item.createdAt) >= new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
              const isFav = favourites.has(item._id);
              const ext = getFileExtension(item.mediaType);
              const size = formatFileSize(item.fileSize);

              return (
                <div
                  key={item._id}
                  className="group flex flex-col gap-3 pb-4 rounded-md overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all p-2 cursor-pointer"
                  onClick={() => router.push(`/media/${item._id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden">
                    {item.mediaType === 'image' ? (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : item.mediaType === 'video' ? (
                      <video
                        src={item.mediaUrl}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        preload="metadata"
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <span className="material-symbols-outlined text-4xl text-slate-500">music_note</span>
                      </div>
                    )}

                    {/* Badge */}
                    {item.isViral ? (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        Viral
                      </div>
                    ) : isLatest ? (
                      <div className="absolute top-3 left-3 bg-primary text-background-dark text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        Latest
                      </div>
                    ) : null}

                    {/* Hover Play Overlay (for video/image) */}
                    {item.mediaType !== 'audio' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <span className="material-symbols-outlined text-white text-5xl">
                          {item.mediaType === 'video' ? 'play_circle' : 'image'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button
                          className={`transition-colors shrink-0 ${isFav ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                          onClick={(e) => toggleFavourite(e, item._id)}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {isFav ? 'favorite' : 'favorite_border'}
                          </span>
                        </button>
                        <div
                          className="bg-primary text-background-dark rounded-full p-1 cursor-pointer hover:bg-primary/80 transition-colors"
                          onClick={(e) => { e.stopPropagation(); router.push(`/media/${item._id}`); }}
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                        {ext}{size ? ` • ${size}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary text-slate-900 dark:text-slate-100 font-bold hover:bg-primary/10 transition-colors">
            Load More Templates
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </section>
    </main>
  );
}
