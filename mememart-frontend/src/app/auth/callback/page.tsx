'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      router.push('/');
    } else {
      router.push('/login');
    }
  }, [searchParams, setTokens, router]);

  return <LoadingSpinner size="lg" />;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
