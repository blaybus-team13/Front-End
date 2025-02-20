'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GreenCheckIcon from '../GreenCheckIcon';

export default function BasicInformationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const elderId = searchParams.get('elderId'); // URL에서 elderId 가져오기
  const Id = searchParams.get('id');

  /** ✅ 상태 변수 */
  const [jobType, setJobType] = useState<string>('방문요양');
  const [days, setDays] = useState<string[]>(['월요일', '화요일']);
  const [workStartHour, setWorkStartHour] = useState<string>('10:00');
  const [workEndHour, setWorkEndHour] = useState<string>('18:00');
  const [wage, setWage] = useState<string>('');
  const [welfare, setWelfare] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [wageError, setWageError] = useState<string>('');

  const jobTypes: string[] = ['방문요양', '입주요양', '방문목욕', '병원동행', '주야간보호', '병원', '요양원'];
  const workDays: string[] = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  const welfareList: string[] = ['4대보험', '퇴직급여', '식사(비) 지원', '장기근속 장려금', '교통비 지원', '중증가산수당', '운전수당', '정부 지원금', '경조사비', '명절선물'];

  const hoursList = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}:00`);
  const MINIMUM_WAGE = 10020;

  /** ✅ 페이지 진입 시 elderId 확인 */
  useEffect(() => {
    if (!elderId) {
      alert('어르신 정보가 없습니다. 다시 선택해 주세요.');
      router.push('/elders'); // 어르신 선택 페이지로 이동
      return;
    }

    // ✅ API에서 어르신 정보 가져오기 (현재는 localStorage 사용)
    const storedElderData = localStorage.getItem(`elder_${elderId}`);
    if (storedElderData) {
      const elderData = JSON.parse(storedElderData);
      setJobType(elderData.jobType || '방문요양');
      setDays(elderData.days || []);
      setWorkStartHour(elderData.workTime?.split('~')[0] || '10:00');
      setWorkEndHour(elderData.workTime?.split('~')[1] || '18:00');
      setWage(elderData.wage?.toString() || '');
      setWelfare(elderData.welfare || []);
      setAdditionalInfo(elderData.additionalInfo || '');
    }
  }, [elderId, router]);

  /** ✅ 월급 계산 함수 */
  const calculateMonthlyWage = (hourlyWage: number): number => {
    const workHoursPerDay = Number(workEndHour) - Number(workStartHour);
    const workDaysPerWeek = days.length;
    const weeksPerMonth = 4; // 월 4주 기준
    return hourlyWage * workHoursPerDay * workDaysPerWeek * weeksPerMonth;
  };

  /** ✅ 다음 페이지로 이동 */
  const handleNext = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!elderId) {
      alert('어르신 정보를 찾을 수 없습니다.');
      return;
    }
    if (!jobType) {
      alert('근무 형태를 선택해 주세요.');
      return;
    }
    if (!days.length) {
      alert('채용 요일을 선택해 주세요.');
      return;
    }
    if (!workStartHour || !workEndHour) {
      alert('채용 시간을 선택해 주세요.');
      return;
    }
    if (!wage) {
      alert('급여를 입력해 주세요.');
      return;
    }
    if (Number(wage) < MINIMUM_WAGE) {
      setWageError(`2025년 최저시급 ${MINIMUM_WAGE.toLocaleString()}원 이상 입력`);
      return;
    }
    if (!welfare.length) {
      alert('제공하실 복리후생을 선택해 주세요.');
      return;
    }

    /** ✅ 백엔드 API와 맞춰서 데이터 저장 */
    const jobData = {
      conditions: {
        jobType,
        wage: Number(wage),
        days,
        workTime: `${workStartHour}~${workEndHour}`,
      },
      welfare,
      additionalInfo,
    };

    // ✅ `elderId`를 포함하여 저장 (다음 페이지에서도 유지됨)
    localStorage.setItem(`elder_${elderId}`, JSON.stringify(jobData));
    router.push(`/job-post/job-posting?elderId=${elderId}&id=${Id}`);
  };


  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* 상단 네비게이션 */}
      <div className="relative flex items-center justify-center">
        <button onClick={() => router.back()} className="absolute left-0 text-gray-500 text-lg">
          <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 24L12 16L20 8" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-lg font-semibold text-gray-600">채용 공고 등록</p>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">채용 기본 정보를 받아볼게요!</h2>

      <form onSubmit={handleNext}>
        {/* 근무 형태 선택 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">근무 형태 선택 *</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {jobTypes.map((type) => (
              <button
                type="button"
                key={type}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  jobType === type ? 'bg-[#FF8B14] border-[#FF8B14] text-black-500' : 'bg-white text-gray-600'
                }`}
                onClick={() => setJobType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 요일 선택 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">근무 요일 *</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {workDays.map((day) => (
              <button
                type="button"
                key={day}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  days.includes(day) ? 'bg-[#FF8B14] border-[#FF8B14] text-black-500' : 'bg-white text-gray-600'
                }`}
                onClick={() =>
                  setDays((prev) =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  )
                }
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 근무 시간 선택 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">근무 시간 *</p>
          <div className="mt-3 flex gap-3 items-center">
            <select value={workStartHour} onChange={(e) => setWorkStartHour(e.target.value)} className="p-2 border rounded-md">
              {hoursList.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span>~</span>
            <select value={workEndHour} onChange={(e) => setWorkEndHour(e.target.value)} className="p-2 border rounded-md">
              {hoursList.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 희망 급여 입력 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">희망 급여 *</p>
          <input
            type="text"
            placeholder="최저시급 이상의 금액을 입력해 주세요."
            value={wage}
            onChange={(e) => {
              setWage(e.target.value);
              if (Number(e.target.value) >= MINIMUM_WAGE) {
                setWageError('');
              } else {
                setWageError(`2025년 최저시급 ${MINIMUM_WAGE.toLocaleString()}원 이상 입력`);
              }
            }}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-4"
          />
          {wageError && <p className="text-red text-sm mt-2">{wageError}</p>}
          <p className="text-sm text-gray-500 mt-2">월급 예상: {wage && `${calculateMonthlyWage(Number(wage)).toLocaleString()}원`}</p>
        </div>

        {/* 복리후생 선택 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">제공 복리후생 *</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {welfareList.map((benefit) => (
              <button
                type="button"
                key={benefit}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  welfare.includes(benefit) ? 'bg-[#FF8B14] border-[#FF8B14] text-black-500' : 'bg-white text-gray-600'
                }`}
                onClick={() =>
                  setWelfare((prev) =>
                    prev.includes(benefit) ? prev.filter((w) => w !== benefit) : [...prev, benefit]
                  )
                }
              >
                {benefit}
              </button>
            ))}
          </div>
        </div>

        {/* 다음으로 버튼 */}
        <div className="flex justify-between mt-14">
          <button
            type="button"
            className="w-1/3 bg-gray-200 text-white py-3 rounded-[9px]"
            onClick={() => router.back()}
          >
            이전
          </button>
          <button
            type="submit"
            className="w-2/3 bg-[#FF8B14] text-white py-3 rounded-[9px]"
          >
            다음으로 이동
          </button>
        </div>
      </form>
    </div>
  );
}
