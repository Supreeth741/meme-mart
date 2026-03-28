'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/categoryService';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  mediaCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await categoryService.getAll();
        setCategories(data.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Categories</h1>
        <p className="text-slate-400 mt-2">Browse memes by category</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/categories/${cat.slug}`}
            className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">
              {cat.icon || 'category'}
            </span>
            <h3 className="text-sm font-bold text-center group-hover:text-primary transition-colors">
              {cat.name}
            </h3>
            <span className="text-xs text-slate-500">{cat.mediaCount} items</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
