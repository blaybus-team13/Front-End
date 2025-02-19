'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '../Modal';

interface JobPostingPageProps {
  mealAssistance: string[];
  toiletAssistance: string[];
  movingAssistance: string[];
  lifeAssistance: string[];
  detailService: string;
  showModal: boolean;
}

export default function JobPostingPage() {
  const router = useRouter();
  const [mealAssistance, setMealAssistance] = useState<string[]>([]);
  const [toiletAssistance, setToiletAssistance] = useState<string[]>([]);
  const [movingAssistance, setMovingAssistance] = useState<string[]>([]);
  const [lifeAssistance, setLifeAssistance] = useState<string[]>([]);
  const [detailService, setDetailService] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const adminId = searchParams.get("id");

  const mealAssistanceList: string[] = ['스스로 식사 가능', '식사 차려드리기', '죽, 반찬 등 조리 필요', '경관식 보조'];
  const toiletAssistanceList: string[] = ['스스로 배변 가능', '가끔 대소변 실수 시 도움', '기저귀 케어 필요', '유치도뇨/방광루/장루 관리'];
  const movingAssistanceList: string[] = ['스스로 거동 가능', '이동 시 부축 도움', '휠체어 이동 보조', '거동 불가'];
  const lifeAssistanceList: string[] = ['청소, 빨래 보조', '목욕 보조', '병원 동행', '산책, 간단한 운동', '말벗 등 정서지원', '인지자극 활동'];

  // 다음 단계로 이동 (등록 성공 페이지)
  const handleNext = async (event: React.FormEvent) => {
    event.preventDefault(); // 기본 동작 방지
    if (!mealAssistance.length) {
      alert('식사 보조 서비스를 선택해 주세요.');
      return;
    }
    if (!toiletAssistance.length) {
        alert('배변 보조 서비스를 선택해 주세요.');
        return;
    }
    if (!movingAssistance.length) {
        alert('이동 보조 서비스를 선택해 주세요.');
        return;
    }
    if (!lifeAssistance.length) {
        alert('일상 생활 서비스를 선택해 주세요.');
        return;
    }

    // 로컬 스토리지에서 이전 페이지 데이터 가져오기
    const storedData = localStorage.getItem('elderData');
    if (!storedData) {
      alert('어르신 정보를 저장할 수 없습니다.');
      return;
    }

    const elderData = JSON.parse(storedData);

    // 현재 페이지의 데이터와 합침
    const fullElderData = {
      ...elderData,
      mealAssistance,
      toiletAssistance,
      movingAssistance,
      lifeAssistance,
      detailService,
    };

    // elders API로 데이터 전송
    try {
      const response = await fetch('/api/elders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullElderData),
      });
      const data = await response.json();

      // 서버 응답 확인
      if (data.success) {
        console.log('어르신 정보가 성공적으로 등록되었습니다:', data);
        alert('어르신 정보가 등록되었습니다.');
        router.push(`/senior-info/success?id=${encodeURIComponent(adminId ?? '')}`)
      } else {
        console.error('어르신 정보 등록 실패:', data);
        alert('어르신 정보 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('어르신 정보 등록에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4 font-[Pretendard]">
      {/* 상단 네비게이션 */}
      <div className="relative flex items-center justify-center">
        <button onClick={() => router.back()} className="absolute left-0 text-gray-500 text-lg">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 24L12 16L20 8" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-lg font-semibold text-gray-600">어르신 정보 등록</p>
        <button onClick={() => setShowModal(true)} className="absolute right-0 font-semibold text-gray-400 text-base">
          임시저장
        </button>
        <Modal 
            showModal={showModal} 
            onClose={() => {setShowModal(false);}} 
            onConfirm={() => {
                setShowModal(false);
                router.push('/'); // 홈으로 이동
        }}/>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-[#FF8B14] rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">어르신이 필요로 하는 서비스는 무엇인가요?</h2>
      <p className="text-base font-medium text-gray-500 mt-3">어르신께 맞춤 돌봄을 제공하기 위한 정보예요.</p>

      <form onSubmit={handleNext}>
        {/* 식사 보조 서비스 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              식사 보조 서비스&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {mealAssistanceList.map((meal, index) => (
              <button
                type="button"
                key={index}
                className={`w-[calc(50%-0.75rem)] h-[76px] py-4 rounded-[61px] border ${
                  mealAssistance.includes(meal)
                    ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]'
                    : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setMealAssistance((prev) =>
                    prev.includes(meal) ? prev.filter((req) => req !== meal) : [...prev, meal]
                  );
                }}
              >
                {meal}
              </button>
            ))}
          </div>
        </div>

        {/* 배변 보조 서비스 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              배변 보조 서비스&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {toiletAssistanceList.map((toilet, index) => (
              <button
                type="button"
                key={index}
                className={`w-[calc(50%-0.75rem)] h-[76px] px-4 py-4 rounded-[61px] border ${
                  toiletAssistance.includes(toilet)
                    ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]'
                    : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setToiletAssistance((prev) =>
                    prev.includes(toilet) ? prev.filter((req) => req !== toilet) : [...prev, toilet]
                  );
                }}
              >
                {toilet}
              </button>
            ))}
          </div>
        </div>

        {/* 이동 보조 서비스 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              이동 보조 서비스&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {movingAssistanceList.map((moving, index) => (
              <button
                type="button"
                key={index}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  movingAssistance.includes(moving)
                    ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]'
                    : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setMovingAssistance((prev) =>
                    prev.includes(moving) ? prev.filter((req) => req !== moving) : [...prev, moving]
                  );
                }}
              >
                {moving}
              </button>
            ))}
          </div>
        </div>

        {/* 일상 생활 서비스 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              일상 생활 서비스&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {lifeAssistanceList.map((life, index) => (
              <button
                type="button"
                key={index}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  lifeAssistance.includes(life)
                    ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]'
                    : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setLifeAssistance((prev) =>
                    prev.includes(life) ? prev.filter((req) => req !== life) : [...prev, life]
                  );
                }}
              >
                {life}
              </button>
            ))}
          </div>
        </div>

        {/* 추가 사항 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">추가 필요 서비스</p>
          <textarea
            placeholder="추가로 어르신께 필요한 서비스를 입력해 주세요."
            value={detailService}
            onChange={(e) => setDetailService(e.target.value)}
            className="w-full p-3 border border-gray-200 placeholder:font-[15px] rounded-[9px] mt-3 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
            style={{ height: '124px' }}
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

          {/* 어르신 정보 등록하기 버튼 */}
          <button
            type="submit"
            className="w-2/3 bg-[#FF8B14] text-white py-3 rounded-[9px] text-base font-semibold mx-1"
            style={{ cursor: 'pointer' }}
          >
            어르신 정보 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
