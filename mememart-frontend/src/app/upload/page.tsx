'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mediaService } from '@/services/mediaService';
import { categoryService } from '@/services/categoryService';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    mediaType: 'video' as 'video' | 'image' | 'audio',
    tags: '',
    resolution: '',
    fps: '',
    duration: '',
    format: '',
    bitrate: '',
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await categoryService.getAll();
        setCategories(data.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const maxSizes: Record<string, number> = { video: 5, image: 2, audio: 1 };
  const acceptTypes: Record<string, string> = {
    video: '.mp4,.mov,.avi,.webm',
    image: '.jpg,.jpeg,.png,.gif,.webp',
    audio: '.mp3,.wav,.flac,.aac',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const maxMB = maxSizes[formData.mediaType];
    if (selected.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB for ${formData.mediaType}`);
      return;
    }

    setFile(selected);

    const fileExt = selected.name.split('.').pop()?.toUpperCase() || '';

    if (formData.mediaType === 'image') {
      const url = URL.createObjectURL(selected);
      setPreview(url);
      const img = new Image();
      img.onload = () => {
        setFormData(prev => ({
          ...prev,
          resolution: `${img.naturalWidth}x${img.naturalHeight}`,
          format: fileExt,
          fps: '',
          duration: '',
          bitrate: '',
        }));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (formData.mediaType === 'video') {
      setPreview(null);
      const url = URL.createObjectURL(selected);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setFormData(prev => ({
          ...prev,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          duration: Math.round(video.duration).toString(),
          format: fileExt,
          fps: '',
          bitrate: '',
        }));
        URL.revokeObjectURL(url);
      };
      video.src = url;
    } else if (formData.mediaType === 'audio') {
      setPreview(null);
      const url = URL.createObjectURL(selected);
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const durationSec = Math.round(audio.duration);
        const estimatedBitrate = selected.size > 0 && audio.duration > 0
          ? Math.round((selected.size * 8) / audio.duration / 1000)
          : 0;
        setFormData(prev => ({
          ...prev,
          duration: durationSec.toString(),
          format: fileExt,
          bitrate: estimatedBitrate > 0 ? estimatedBitrate.toString() : '',
          resolution: '',
          fps: '',
        }));
        URL.revokeObjectURL(url);
      };
      audio.src = url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }
    if (!formData.title || !formData.category) {
      toast.error('Please fill in title and category');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', formData.title);
      fd.append('category', formData.category);
      fd.append('mediaType', formData.mediaType);
      if (formData.tags) {
        formData.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
          fd.append('tags[]', t);
        });
      }
      if (formData.resolution) fd.append('resolution', formData.resolution);
      if (formData.fps) fd.append('fps', formData.fps);
      if (formData.duration) fd.append('duration', formData.duration);
      if (formData.format) fd.append('format', formData.format);
      if (formData.bitrate) fd.append('bitrate', formData.bitrate);

      await mediaService.upload(fd);
      toast.success('Upload successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 px-6 lg:px-40 py-10 max-w-[1200px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6">
          <a className="text-neutral-400 text-sm font-medium hover:text-primary" href="/">Home</a>
          <span className="material-symbols-outlined text-neutral-400 text-sm">chevron_right</span>
          <span className="text-slate-900 dark:text-slate-100 text-sm font-medium">Upload Template</span>
        </div>

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-2">Upload Meme Template</h1>
          <p className="text-neutral-400 text-lg">Help the community grow by sharing high-quality viral assets.</p>
        </div>

        {/* Upload Form Container */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Media Upload */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media Type Tabs */}
            <div className="bg-neutral-700/10 dark:bg-neutral-800/40 p-1.5 rounded-xl flex gap-1 w-fit">
              {(['video', 'audio', 'image'] as const).map((type) => {
                const icons = { video: 'movie', audio: 'music_note', image: 'image' };
                const labels = { video: 'Video', audio: 'Audio', image: 'Image' };
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setFormData({ ...formData, mediaType: type }); setFile(null); setPreview(null); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      formData.mediaType === type
                        ? 'bg-primary text-background-dark'
                        : 'text-neutral-400 hover:text-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icons[type]}</span>
                    {labels[type]}
                  </button>
                );
              })}
            </div>

            {/* Dropzone */}
            <div className="group relative flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-neutral-600 hover:border-primary/50 bg-neutral-700/5 dark:bg-neutral-800/20 px-6 py-24 transition-all">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-[40px]">cloud_upload</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-xl font-bold leading-tight">
                  {file ? file.name : 'Drag and drop your template here'}
                </p>
                <p className="text-neutral-400 text-sm">
                  {formData.mediaType === 'video' && 'Supports MP4, MOV, AVI, WEBM (Max 5MB)'}
                  {formData.mediaType === 'audio' && 'Supports MP3, WAV, FLAC, AAC (Max 1MB)'}
                  {formData.mediaType === 'image' && 'Supports JPG, JPEG, PNG, GIF, WEBP (Max 2MB)'}
                </p>
              </div>
              {preview && (
                <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
              )}
              <button type="button" className="flex items-center justify-center rounded-full h-12 px-8 bg-neutral-700 dark:bg-neutral-700 text-white text-sm font-bold hover:bg-neutral-600 transition-colors">
                Browse Files
              </button>
              <input
                type="file"
                accept={acceptTypes[formData.mediaType]}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Guidelines */}
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                Upload Guidelines
              </h4>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex gap-2 items-start"><span className="text-primary">•</span> High quality files (1080p+ preferred)</li>
                <li className="flex gap-2 items-start"><span className="text-primary">•</span> No watermarks or personal branding on the asset</li>
                <li className="flex gap-2 items-start"><span className="text-primary">•</span> Ensure you have the rights to share the material</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-6">
            <div className="flex flex-col gap-6 p-8 rounded-xl bg-neutral-700/10 dark:bg-neutral-800/40 border border-neutral-700/30">
              {/* Template Name */}
              <div className="space-y-2">
                <label htmlFor="template-title" className="text-sm font-bold text-neutral-400">Template Name</label>
                <input
                  id="template-title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-xl focus:ring-primary focus:border-primary text-sm py-3 px-4 outline-none transition-all"
                  placeholder="e.g. Distracted Boyfriend"
                  type="text"
                  autoComplete="off"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="upload-category" className="text-sm font-bold text-neutral-400">Category</label>
                <div className="relative">
                  <select
                    id="upload-category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full appearance-none bg-background-light dark:bg-background-dark border-neutral-700 rounded-xl focus:ring-primary focus:border-primary text-sm py-3 px-4 pr-10 outline-none transition-all cursor-pointer"
                  >
                    <option disabled value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">expand_more</span>
                </div>
              </div>

              {/* Auto-detected Metadata */}
              {file && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-neutral-400">Detected Metadata</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Resolution - for video and image */}
                    {(formData.mediaType === 'video' || formData.mediaType === 'image') && formData.resolution && (
                      <div className="space-y-1">
                        <label htmlFor="resolution" className="text-xs font-semibold text-neutral-500">Resolution</label>
                        <input
                          id="resolution"
                          name="resolution"
                          value={formData.resolution}
                          readOnly
                          className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-lg text-sm py-2 px-3 outline-none text-neutral-400"
                        />
                      </div>
                    )}
                    {/* FPS - for video only */}
                    {formData.mediaType === 'video' && (
                      <div className="space-y-1">
                        <label htmlFor="fps" className="text-xs font-semibold text-neutral-500">FPS</label>
                        <input
                          id="fps"
                          name="fps"
                          value={formData.fps}
                          onChange={(e) => setFormData({ ...formData, fps: e.target.value })}
                          placeholder="e.g. 30"
                          className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-lg text-sm py-2 px-3 outline-none"
                        />
                      </div>
                    )}
                    {/* Duration - for video and audio */}
                    {(formData.mediaType === 'video' || formData.mediaType === 'audio') && formData.duration && (
                      <div className="space-y-1">
                        <label htmlFor="duration" className="text-xs font-semibold text-neutral-500">Duration (sec)</label>
                        <input
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          readOnly
                          className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-lg text-sm py-2 px-3 outline-none text-neutral-400"
                        />
                      </div>
                    )}
                    {/* Format - for image and audio */}
                    {(formData.mediaType === 'image' || formData.mediaType === 'audio') && formData.format && (
                      <div className="space-y-1">
                        <label htmlFor="format" className="text-xs font-semibold text-neutral-500">Format</label>
                        <input
                          id="format"
                          name="format"
                          value={formData.format}
                          readOnly
                          className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-lg text-sm py-2 px-3 outline-none text-neutral-400"
                        />
                      </div>
                    )}
                    {/* Bitrate - for audio only */}
                    {formData.mediaType === 'audio' && formData.bitrate && (
                      <div className="space-y-1">
                        <label htmlFor="bitrate" className="text-xs font-semibold text-neutral-500">Bitrate (kbps)</label>
                        <input
                          id="bitrate"
                          name="bitrate"
                          value={formData.bitrate}
                          readOnly
                          className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-lg text-sm py-2 px-3 outline-none text-neutral-400"
                        />
                      </div>
                    )}
                    {/* File Size */}
                    <div className="space-y-1">
                      <label htmlFor="file-size" className="text-xs font-semibold text-neutral-500">File Size</label>
                      <input
                        id="file-size"
                        name="fileSize"
                        value={file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                        readOnly
                        className="w-full bg-background-light dark:bg-background-dark border-neutral-700 rounded-lg text-sm py-2 px-3 outline-none text-neutral-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <hr className="border-neutral-700/50 my-2" />

              {/* Primary Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    Uploading...
                  </>
                ) : (
                  'Upload Template'
                )}
              </button>
              <p className="text-[11px] text-center text-neutral-400">
                By clicking upload, you agree to our Terms of Service and Content Guidelines.
              </p>
            </div>

            {/* Quick Help */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-700/30">
              <div className="size-10 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">help_outline</span>
              </div>
              <div>
                <p className="text-sm font-bold">Need help?</p>
                <p className="text-xs text-neutral-400">Check our Creator FAQ</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
