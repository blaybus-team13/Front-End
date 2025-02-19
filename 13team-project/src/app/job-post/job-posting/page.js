'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobPostingPage() {
  const router = useRouter();
  const [applyCondition, setApplyCondition] = useState([]);
  const [email, setEmail] = useState('');

  // 다음 단계로 이동 (등록 성공 페이지)
  const handleNext = (event) => {
    event.preventDefault(); // 기본 동작 방지
    router.push('/job-post/success');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* 상단 네비게이션 */}
      <div className="relative flex items-center justify-center">
        <button onClick={() => router.back()} className="absolute left-0 text-gray-500 text-lg">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 24L12 16L20 8" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-lg font-semibold text-gray-600">채용 공고 등록</p>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-orange rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">채용 공고 정보를 받아볼게요!</h2>
      <p className="text-sm font-normal text-gray-500 mt-3">공고가 더 잘 전달될 수 있도록 하는 단계예요.</p>

      <form onSubmit={handleNext}>
        {/* 지원조건 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">지원조건을 선택해 주세요.</p>
            <p className="font-normal text-sm text-gray-400 mt-2">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 mt-2 text-base font-semibold">
            {['초보 가능', '경력 우대', '경력 필수', '운전면허증 필수'].map((level, index) => (
              <button
                type='button'
                key={level}
                className={`w-[calc(50%-0.75rem)] py-3 rounded-[61px] border ${
                  applyCondition.includes(level) ? 'bg-orange text-white' : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setApplyCondition((prev) =>
                    prev.includes(level) ? prev.filter((req) => req !== level) : [...prev, level]
                  );
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 이메일 입력 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">채용 담당자분의 이메일을 입력해 주세요.</p>
          <p className="text-sm font-normal text-gray-400 mt-2">서비스 외에도 원활한 연결을 위해 이메일이 필요해요.</p>
          <input
            type="email"
            placeholder="이메일을 입력해 주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-3 focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        <div className="flex justify-between mt-14">
          {/* 이전 버튼 */}
          <button
            type="button"
            className="w-1/3 bg-gray-200 text-white py-3 rounded-[9px] text-base font-semibold mx-1"
            onClick={() => router.back()}
            style={{ cursor: 'pointer' }}
          >
            이전
          </button>

          {/* 채용 공고 등록하기 버튼 */}
          <button
            type="submit"
            className="w-2/3 bg-orange text-white py-3 rounded-[9px] text-base font-semibold mx-1"
            style={{ cursor: 'pointer' }}
          >
            채용 공고 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}