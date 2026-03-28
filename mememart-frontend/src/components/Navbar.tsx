'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('#mobile-menu-btn')) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  // Hide navbar on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-4 lg:px-20 bg-background-light dark:bg-background-dark sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link className="flex items-center text-primary" href="/">
            <img src="/icons/logo.png" alt="c" className="w-16 h-auto" />
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold leading-tight tracking-tight">
              Meme Mart
            </h2>
          </Link>
          {/* Desktop Search - hidden on search page */}
          {!pathname.startsWith('/search') && (
          <form onSubmit={handleSearch} className="hidden md:flex">
            <label className="flex flex-col min-w-40 h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-none focus:ring-0 h-full placeholder:text-slate-500 px-3 text-sm font-normal text-slate-900 dark:text-slate-100"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </label>
          </form>
          )}
        </div>
        <div className="flex flex-1 justify-end gap-4 items-center">
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              className={`text-sm font-semibold transition-colors ${pathname === '/' ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
              href="/"
            >Home</Link>
            <Link
              className={`text-sm font-semibold transition-colors ${pathname === '/categories' ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
              href="/categories"
            >Category</Link>
            {user && (
              <Link
                className={`text-sm font-semibold transition-colors ${pathname === '/upload' ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
                href="/upload"
              >Upload</Link>
            )}
            {user?.role === 'admin' && (
              <Link
                className={`text-sm font-semibold transition-colors ${pathname.startsWith('/admin') ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
                href="/admin"
              >Admin</Link>
            )}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  {user.username}
                  <span className="material-symbols-outlined text-sm">
                    {dropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-lg">person</span>
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold hover:brightness-110 transition-all"
                  href="/login"
                >Login</Link>
                <Link
                  className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-primary text-background-dark text-sm font-bold border-b-2 border-primary"
                  href="/register"
                >Sign Up</Link>
              </>
            )}
          </div>
          <button
            id="mobile-menu-btn"
            aria-label="Toggle mobile menu"
            className="lg:hidden flex items-center justify-center size-10 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="lg:hidden fixed inset-x-0 top-[65px] z-40 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 shadow-xl"
        >
          <nav className="flex flex-col px-6 py-4 gap-1">
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 font-semibold text-sm transition-all"
              href="/"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-lg">home</span>Home
            </Link>
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 font-semibold text-sm transition-all"
              href="/categories"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-lg">category</span>Category
            </Link>
            {user && (
              <>
                <Link
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 font-semibold text-sm transition-all"
                  href="/upload"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg">cloud_upload</span>Upload
                </Link>
                {user.role === 'admin' && (
                  <Link
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 font-semibold text-sm transition-all"
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>Admin
                  </Link>
                )}
              </>
            )}
            <hr className="border-slate-200 dark:border-slate-800 my-2" />
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm transition-all"
              >Logout</button>
            ) : (
              <>
                <Link
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm hover:brightness-110 transition-all"
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                >Login</Link>
                <Link
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-background-dark font-bold text-sm hover:brightness-110 transition-all mt-2"
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                >Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
