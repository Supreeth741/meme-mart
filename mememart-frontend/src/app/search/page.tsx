'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import { mediaService } from '@/services/mediaService';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const mediaType = searchParams.get('mediaType') || '';
  const sort = searchParams.get('sort') || 'latest';
  const pageParam = searchParams.get('page') || '1';

  const [results, setResults] = useState<Media[]>([]);
  const [page, setPage] = useState(parseInt(pageParam));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const { data } = await mediaService.search({
          q: q || undefined,
          mediaType: mediaType || undefined,
          sort,
          page,
          limit: 10,
        });
        setResults(data.data.data);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [q, mediaType, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (mediaType) params.set('mediaType', mediaType);
    if (sort !== 'latest') params.set('sort', sort);
    router.push(`/search?${params.toString()}`);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Search</h1>
        <p className="text-slate-400 mt-2">Find memes, videos, images, and audio</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full h-12 rounded-xl bg-slate-800 border border-slate-700 pl-12 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {['', 'video', 'image', 'audio'].map((type) => (
            <button
              key={type}
              onClick={() => updateFilter('mediaType', type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mediaType === type
                  ? 'bg-primary text-bg-dark'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'trending', label: 'Trending' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => updateFilter('sort', s.value === 'latest' ? '' : s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sort === s.value || (!sort && s.value === 'latest')
                  ? 'bg-primary text-bg-dark'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-4">{total} result{total !== 1 ? 's' : ''} found</p>
          {results.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
              <p>No results found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((item) => (
                <MediaCard key={item._id} id={item._id} {...item} />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => {
            setPage(p);
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', p.toString());
            router.push(`/search?${params.toString()}`);
          }} />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <SearchContent />
    </Suspense>
  );
}
