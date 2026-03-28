'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mediaService } from '@/services/mediaService';
import { authService } from '@/services/authService';
import ProtectedRoute from '@/components/ProtectedRoute';
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

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

export default function ProfilePage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<Media[]>([]);
  const [favourites, setFavourites] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [uploadsRes, favsRes] = await Promise.all([
          mediaService.getUserUploads(page, 10),
          authService.getFavourites(),
        ]);
        setUploads(uploadsRes.data.data.data);
        setTotalPages(uploadsRes.data.data.totalPages);
        setFavourites(favsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const openEditModal = () => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) return;
    try {
      await authService.updateProfile({ username: editForm.username });
      toast.success('Profile updated! Please log in again.');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const initials = user?.username
    ? user.username.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'MM';

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10 flex-1">
        {/* PROFILE CARD */}
        <section className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-background-dark text-3xl font-extrabold">{initials}</span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 dark:text-white text-2xl font-extrabold truncate">{user?.username || 'Meme Master'}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user?.email || 'mememaster@example.com'}</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">Connoisseur of the finest memes on the internet. 🐸</p>
          </div>
          {/* Edit button */}
          <button
            onClick={openEditModal}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Profile
          </button>
        </section>

        {/* FAVOURITES */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-red-500 text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">Your Favourites</h2>
          </div>

          {/* Empty state or favourites grid */}
          {loading ? (
            <LoadingSpinner />
          ) : favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400 text-3xl">favorite_border</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium">No favourites yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Hit the ♡ icon on any meme card to save it here.</p>
            <a href="/" className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-background-dark font-bold text-sm hover:bg-primary/90 transition-colors">
              Browse Memes
            </a>
          </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favourites.map((item) => (
                <MediaCard key={item._id} id={item._id} {...item} />
              ))}
            </div>
          )}
        </section>

        {/* MY UPLOADS */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">My Uploads</h2>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : uploads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-3xl">cloud_off</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium">No uploads yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uploads.map((item) => (
                  <MediaCard key={item._id} id={item._id} {...item} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </section>
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          {/* Modal box */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 dark:text-slate-400 text-sm font-semibold" htmlFor="edit-name">Username</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Your display name"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary text-sm"
                />
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 dark:text-slate-400 text-sm font-semibold" htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-1">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl bg-primary text-background-dark font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
