'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState('');

  // ✅ URL에서 ID 가져오기
  useEffect(() => {
    const idFromParams = searchParams.get('id');
    if (idFromParams) setId(decodeURIComponent(idFromParams));
  }, [searchParams]);

  // ✅ 2초 후 자동으로 /caregiver?id=유저아이디 로 이동
  useEffect(() => {
    if (id) {
      setTimeout(() => {
        router.push(`/caregiver?id=${encodeURIComponent(id)}`);
      }, 2000); // 2초 후 자동 이동
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      {/* ✅ 성공 메시지 */}
      <h2 className="text-3xl font-bold text-gray-600">🎉 축하드려요!</h2>
      <h2 className="text-2xl font-bold text-gray-600 mt-2">가입이 완료되었습니다.</h2>
      <p className="text-gray-500 mt-4">잠시 후 서비스로 이동합니다...</p>

      {/* ✅ 즉시 이동 버튼 */}
      <button
        className="w-full max-w-md mt-6 bg-[#FF8B14] text-white py-3 rounded-[9px] text-normal font-semibold"
        onClick={() => router.push(`/caregiver?id=${encodeURIComponent(id)}`)}
      >
        서비스로 바로 이동하기
      </button>
    </div>
  );
}
