'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GreenCheckIcon from '../GreenCheckIcon';

export default function BasicInformationPage() {
  const router = useRouter();
  const [selectedJobType, setSelectedJobType] = useState('방문요양'); // 기존 정보로 초기화
  const [selectedWorkDays, setSelectedWorkDays] = useState(['월요일', '화요일']); // 기존 정보로 초기화
  const [workStartHour, setStartTime] = useState('10:00');  // 기존 정보로 초기화
  const [workEndHour, setEndTime] = useState('18:00');  // 기존 정보로 초기화
  const [workHours, setWorkHours] = useState([workStartHour, workEndHour]);
  const [wage, setWage] = useState(''); // 기존 정보로 초기화
  const [welfare, setWelfare] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [negotiation, setNegotiation] = useState({
    workDays: false,
    workHours: false,
    wage: false,
    minimumWage: false,
  });
  const [wageError, setWageError] = useState('');

  const jobTypes = ['방문요양', '입주요양', '방문목욕', '병원동행', '주야간보호', '병원', '요양원'];
  const workDays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  const welfareList = ['4대보험', '퇴직급여', '식사(비) 지원', '장기근속 장려금', '교통비 지원', '중증가산수당', '운전수당', '정부 지원금', '경조사비', '명절선물'];

  const MINIMUM_WAGE = 10020;

  // 다음 단계로 이동 (채용 공고 등록 페이지)
  const handleNext = (event) => {
    event.preventDefault(); // 기본 동작 방지
    if (!selectedJobType) {
      alert('근무 형태를 선택해 주세요.');
      return;
    }
    if (!selectedWorkDays.length) {
      alert('채용 요일을 선택해 주세요.');
      return;
    }
    if (!workHours.length) {
      alert('채용 시간을 선택해 주세요.');
      return;
    }
    if (!wage) {
      alert('급여를 입력해 주세요.');
      return;
    }
    if (parseInt(wage) < MINIMUM_WAGE) {
      setWageError(`2025년의 최저시급인 ${MINIMUM_WAGE.toLocaleString()}원 이상의 금액을 입력해 주세요!`);
      return;
    }
    if (!welfare.length) {
      alert('제공하실 복리후생을 선택해 주세요.');
      return;
    }
    else router.push('/job-post/job-posting');
  };

  const calculateMonthlyWage = (hourlyWage) => {
    const workHoursPerDay = (parseInt(workEndHour) - parseInt(workStartHour)) || 0; // 하루 근무 시간
    const workDaysPerWeek = selectedWorkDays.length; // 주당 근무 일수
    const weeksPerMonth = 4; // 월당 주 수 (4주)
    return hourlyWage * workHoursPerDay * workDaysPerWeek * weeksPerMonth;
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
        <div className="h-[6px] w-1/3 bg-orange rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">채용 기본 정보를 받아볼게요!</h2>
      <p className="text-base font-medium text-gray-500 mt-3">보다 원활한 연결을 위해 필요한 정보예요.</p>

      <form onSubmit={handleNext}>
        {/* 근무 형태 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어떤 근무 형태를 원하시나요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-[15px] text-gray-400 mt-1">
              <span className="text-lg font-bold text-red">
                *&nbsp;
              </span>
              필수 입력
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-base font-semibold">
            {jobTypes.map((jobType, index) => (
              <button
                type='button'
                key={jobType}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  selectedJobType === jobType ? 'bg-orange bg-opacity-10 border-orange text-orange' : 'bg-white text-gray-600'
                }`}
                onClick={() => setSelectedJobType(jobType)}
              >
                {jobType}
              </button>
            ))}
          </div>
        </div>

        {/* 요일 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              채용하고자 하시는 요일이 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">기존 정보를 불러왔어요. 자유롭게 변경 가능해요.</p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-base font-semibold">
            {workDays.map((day, index) => (
              <button
                type='button'
                key={day}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  selectedWorkDays.includes(day) ? 'bg-orange bg-opacity-10 border-orange text-orange' : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setSelectedWorkDays((prev) =>
                    prev.includes(day) ? prev.filter((req) => req !== day) : [...prev, day]
                  );
                }}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center">
            <label className="flex items-center cursor-pointer">
              <GreenCheckIcon selected={negotiation.workDays} />
              <p className="ml-2 font-normal text-[15px] text-gray-400">협의 가능</p>
              <input
                type="checkbox"
                checked={negotiation.workDays}
                onChange={() => setNegotiation({ ...negotiation, workDays: !negotiation.workDays })}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 돌봄 시간 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              돌봄을 필요로 하시는 시간이 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">기존 정보를 불러왔어요. 자유롭게 변경 가능해요.</p>
          </div>
          <div className="mt-3 flex gap-3 items-center">
            <div className="w-1/2">
              <label className="block text-base font-medium text-gray-500">시작</label>
              <select
                value={workStartHour}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-2 p-3 text-base font-semibold text-gray-600 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-orange"
              >
                {/* 시간 옵션 추가 */}
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i < 10 ? '0' : ''}${i}:00`}>
                    {`${i < 10 ? '0' : ''}${i}:00`}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-600 mt-6">~</span>
            <div className="w-1/2">
              <label className="block text-base font-medium text-gray-500">종료</label>
              <select
                value={workEndHour}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-2 p-3 text-base font-semibold text-gray-600 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-orange"
              >
                {/* 시간 옵션 추가 */}
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i < 10 ? '0' : ''}${i}:00`}>
                    {`${i < 10 ? '0' : ''}${i}:00`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <label className="flex items-center cursor-pointer">
              <GreenCheckIcon selected={negotiation.workHours} />
              <p className="ml-2 font-normal text-[15px] text-gray-400">협의 가능</p>
              <input
                type="checkbox"
                checked={negotiation.workHours}
                onChange={() => setNegotiation({ ...negotiation, workHours: !negotiation.workHours })}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 희망 급여 입력 */}
        <div className="mt-12">
          <p className="block text-lg font-bold text-gray-600">희망하시는 급여를 입력해 주세요.
            <span className="text-red text-lg font-bold">
              *
            </span>
          </p>
          <input
            type="text"
            placeholder="최저시급 이상의 금액을 입력해 주세요."
            value={wage}
            onChange={(e) => {
              setWage(e.target.value);
              if (parseInt(e.target.value) >= MINIMUM_WAGE) {
                setWageError('');
              } else {
                setWageError(`2025년의 최저시급인 ${MINIMUM_WAGE.toLocaleString()}원 이상의 금액을 입력해 주세요!`);
              }
            }}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-4 focus:outline-none focus:ring-2 focus:ring-orange"
          />
          {wageError && <p className="text-red text-sm font-normal mt-2">{wageError}</p>}
          <div className="mt-3 flex items-center">
            <p className="font-normal text-[15px] text-gray-400">월급 계산기:</p>
            <span className="font-bold text-base text-gray-600 ml-2">
              {!wageError && wage ? `${calculateMonthlyWage(parseInt(wage) || 0).toLocaleString()}원` : ''}
            </span>
          </div>
          <div className="mt-3 flex flex-col items-start gap-2">
            <label className="flex items-center cursor-pointer">
              <GreenCheckIcon selected={negotiation.wage} />
              <p className="ml-2 font-normal text-[15px] text-gray-400">협의 가능</p>
              <input
                type="checkbox"
                checked={negotiation.wage}
                onChange={() => setNegotiation({ ...negotiation, wage: !negotiation.wage })}
                className="hidden"
              />
            </label>
            <label className="flex items-center cursor-pointer">
              <GreenCheckIcon selected={negotiation.minimumWage} />
              <p className="ml-2 font-normal text-[15px] text-gray-400">당사는 본 채용에 관해 최저임금법을 준수합니다.</p>
              <input
                type="checkbox"
                checked={negotiation.minimumWage}
                onChange={() => setNegotiation({ ...negotiation, minimumWage: !negotiation.minimumWage })}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 복리후생 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              제공하실 복리후생을 선택해 주세요.&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-[15px] text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {welfareList.map((benefits, index) => (
              <button
                type='button'
                key={benefits}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  welfare.includes(benefits) ? 'bg-orange bg-opacity-10 border-orange boreder-1.5 text-orange' : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setWelfare((prev) =>
                    prev.includes(benefits) ? prev.filter((req) => req !== benefits) : [...prev, benefits]
                  );
                }}
              >
                {benefits}
              </button>
            ))}
          </div>
        </div>

        {/* 추가 사항 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">요양보호사분께 남길 추가 사항을 적어주세요.</p>
          <textarea
            placeholder="근로 내용, 추가 근무 수당, 오시는 길 등 추가로 전달하실 내용을 입력해 주세요."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="w-full p-3 border border-gray-200 placeholder:font-[15px] rounded-[9px] mt-3 focus:outline-none focus:ring-2 focus:ring-orange"
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

          {/* 다음으로 버튼 */}
          <button
            type="submit"
            className="w-2/3 bg-orange text-white py-3 rounded-[9px] text-base font-semibold mx-1"
            style={{ cursor: 'pointer' }}
          >
            다음으로 이동
          </button>
        </div>
      </form>
    </div>
  );
}