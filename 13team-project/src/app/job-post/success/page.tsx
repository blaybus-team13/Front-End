'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'; // ✅ 올바르게 import

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ useSearchParams 사용
  const adminId = searchParams.get('id') ?? ''; // ✅ id가 없을 경우 대비

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      {/* 성공 메시지 */}
      <h2 className="text-3xl font-bold text-gray-600">축하드려요,</h2>
      <h2 className="text-3xl font-bold text-gray-600 mt-2">등록이 완료되었습니다!</h2>

      {/* 일러스트 */}
      <img src="/assets/등록완.png" alt="성공 이미지" className="mt-6" width="234" height="234" />

      {/* 홈으로 돌아가기 버튼 */}
      <button
        className="w-full max-w-md mt-10 bg-[#FF8B14] text-white py-3 rounded-[9px] text-normal font-semibold"
        onClick={() => router.push(`/admin?id=${adminId}`)} // ✅ id 포함
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
