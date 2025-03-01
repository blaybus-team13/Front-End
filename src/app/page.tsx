'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // 2초 후에 온보딩 화면으로 이동
    const timer = setTimeout(() => {
      router.replace('/onboarding'); // replace를 사용하여 스플래쉬 화면을 히스토리에 남기지 않음
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-500 to-orange-400">
      <div className="flex flex-col items-center">
      <Image src="/assets/logo.png" alt="로고" width={80} height={80} className="mb-4" />
      <p className="text-white text-lg font-semibold">돌봄과 정성을 잇는 따뜻한 물결</p>
      </div>
    </div>
  );
}
