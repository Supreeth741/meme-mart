'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-6 lg:px-20">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 shrink-0">
          <span>&copy; 2026 Meme Mart Repository. Stay dank.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a
            href="https://www.instagram.com/mememart2026?igsh=NTNlNHFhbGp1bDA4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <img src="https://img.icons8.com/?size=100&id=hK7HDtSy9QsB&format=png&color=000000" alt="Instagram" className="w-5 h-5 shrink-0" />
            Instagram
          </a>
          <a
            href="mailto:mememart26@gmail.com"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <img src="https://img.icons8.com/?size=100&id=qbiAUnUMOnLp&format=png&color=000000" alt="Email" className="w-5 h-5 shrink-0" />
            Mail
          </a>
          <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <img src="https://img.icons8.com/?size=100&id=W67bPh5YZnyt&format=png&color=000000" alt="Privacy Policy" className="w-5 h-5 shrink-0" />
            Privacy Policy
          </a>
          <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <img src="https://img.icons8.com/?size=100&id=b0vfoq4G1DH5&format=png&color=000000" alt="Terms and Conditions" className="w-5 h-5 shrink-0" />
            Terms and Conditions
          </a>
        </div>
      </div>
    </footer>
  );
}
