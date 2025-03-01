'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');

  useEffect(() => {
    console.log(router, name);
  }, [router, name]);
  
  // URL에서 이름 가져오기
  useEffect(() => {
    const nameFromParams = searchParams.get('name');
    if (nameFromParams) setName(decodeURIComponent(nameFromParams));
  }, [searchParams]);

  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      {/* 성공 메시지 */}
      <h2 className="text-3xl font-bold text-gray-900">축하드려요,</h2>
      <h2 className="text-3xl font-bold text-gray-900 mt-2">가입이 완료되었습니다!</h2>


      {/* 돌아보기 버튼 */}
      <button
        className="w-full max-w-md mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition"
        onClick={() => router.push('/login')} // 로그인 페이지 또는 메인 페이지로 이동
      >
        둘러보기
      </button>
    </div>
  );
}
