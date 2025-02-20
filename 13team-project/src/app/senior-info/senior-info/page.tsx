'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '../Modal';

export default function SeniorInformationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState('');
  const [careLevel, setCareLevel] = useState('');
  const [weight, setWeight] = useState('');
  const [diseaseInfo, setDiseaseInfo] = useState('');
  const [dementiaInfo, setDementiaInfo] = useState<string[]>([]);
  const [cohabitant, setCohabitant] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const adminId = searchParams.get("id");

  const careLevels = ['등급없음', '1등급', '2등급', '3등급', '4등급', '5등급', '인적지원 등급'];
  const dementiaInfoList = ['정상(증상없음)', '집 밖을 배회', '했던 말을 반복하는 등의 단기기억 장애', '가족을 알아보지 못함', '길을 잃거나 자주 가던 곳을 헤맴', '어린아이 같은 행동', '사람을 의심하는 증상', '때리거나 욕설 등의 공격적인 행동'];
  const cohabitantList = ['독거', '배우자와 동거, 돌봄 시간 중에 집에 있음', '배우자와 동거, 돌봄 시간 중에 자리 비움', '다른 가족과 동거, 돌봄 시간 중에 집에 있음', '다른 가족과 동거, 돌봄 시간 중에 자리 비움'];

  // 출생 연도 옵션 생성
  const birthYears = Array.from({ length: 1960 - 1920 + 1 }, (_, i) => 1960 - i);

  useEffect(() => {
    if (!adminId) {
      alert("센터 정보가 없습니다.");
      router.push("/login");
      return;
    }

    // ✅ 관리자 정보에서 place_name 가져오기
    fetch(`/api/admin?id=${encodeURIComponent(adminId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlaceName(data.admin.place_name);
        } else {
          alert("센터 정보를 가져올 수 없습니다.");
          router.push("/login");
        }
      })
      .catch((err) => console.error("센터 정보 불러오기 실패:", err));
  }, [adminId]);

  useEffect(() => {
    const storedData = localStorage.getItem("elderData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setName(parsedData.elderly?.name || "");
      setYear(parsedData.elderly?.birthYear || "");
      setGender(parsedData.elderly?.gender || "");
      setCareLevel(parsedData.elderly?.careLevel || "");
      setWeight(parsedData.elderly?.weight || "");
      setDiseaseInfo(parsedData.elderly?.diseases || "");
      setDementiaInfo(parsedData.elderly?.dementiaSymptoms || []);
      setCohabitant(parsedData.elderly?.cohabitant || "");
    }
  }, []);

  /** ✅ 다음 단계로 이동 */
  const handleNext = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name) {
      alert('어르신의 성함을 입력해 주세요.');
      return;
    }
    if (!year || !month || !day) {
      alert('어르신의 생년월일을 입력해 주세요.');
      return;
    }
    if (!gender) {
      alert('어르신의 성별을 선택해 주세요.');
      return;
    }
    if (!careLevel) {
      alert('어르신의 장기요양 등급을 선택해 주세요.');
      return;
    }
    if (!weight) {
      alert('어르신의 몸무게를 선택해 주세요.');
      return;
    }
    if (!dementiaInfo.length) {
      alert('어르신의 치매 증상을 선택해 주세요.');
      return;
    }
    if (!cohabitant) {
      alert('어르신의 동거인 여부를 선택해 주세요.');
      return;
    }

    // ✅ 기존 데이터 유지하면서 새로운 데이터 병합 저장
    const storedData = localStorage.getItem("elderData");
    const existingData = storedData ? JSON.parse(storedData) : {};

    const newData = {
      place_name: placeName,
      elderly: {
        name,
        birthYear: Number(year),
        gender,
        careLevel,
        weight: Number(weight),
        diseases: diseaseInfo,
        dementiaSymptoms: dementiaInfo,
        cohabitant,
      },
    };

    localStorage.setItem("elderData", JSON.stringify({ ...existingData, ...newData }));

    router.push(`/senior-info/senior-more-info?id=${encodeURIComponent(adminId ?? '')}`);
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
        <div className="h-[6px] w-1/3 bg-[#FF8B14] rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">어르신 정보를 받아볼게요!</h2>
      <p className="text-base font-medium text-gray-500 mt-3">어르신께 꼭 맞는 분을 찾기 위해 필요한 정보예요.</p>

      <form onSubmit={handleNext}>
        {/* 이름 입력 필드 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 성함은 어떻게 되세요?&nbsp;
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
          <input
            type="text"
            name="name"
            placeholder="어르신의 성함을 입력해 주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
          />
        </div>

        {/* 출생연도 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 생년월일은 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
          </div>
          <div className="flex justify-between gap-2">
            <input
              type="text"
              name="year"
              maxLength={4}
              minLength={4}
              placeholder="연도"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-[40%] p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
            />
            <input
              type="text"
              name="month"
              maxLength={2}
              placeholder="월"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-[30%] p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
            />
            <input
              type="text"
              name="day"
              maxLength={2}
              placeholder="일"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-[30%] p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
            />
          </div>
        </div>

        {/* 성별 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 성별은 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-base font-semibold">
            {['여성', '남성'].map((_gender, index) => (
              <button
                type='button'
                key={index}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  gender === _gender ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]' : 'bg-white text-gray-600'
                }`}
                onClick={() => setGender(_gender)}
              >
                {_gender}
              </button>
            ))}
          </div>
        </div>

        {/* 장기요양 등급 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 장기요양 등급은 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-base font-semibold">
            {careLevels.map((_careLevel, index) => (
              <button
                type='button'
                key={index}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  careLevel === _careLevel ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]' : 'bg-white text-gray-600'
                }`}
                onClick={() => setCareLevel(_careLevel)}
              >
                {_careLevel}
              </button>
            ))}
          </div>
        </div>
        
        {/* 몸무게 입력 필드 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 몸무게는 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
          </div>
          <input
            type="text"
            name="weight"
            placeholder="어르신의 몸무게를 입력해 주세요."
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
          />
        </div>

        {/* 보유 질병 또는 질환 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">어르신의 보유 질병 또는 질환을 입력해 주세요.</p>
          <textarea
            placeholder="예) 현재 당뇨가 있으시고, 고관절이 편찮으셔요."
            value={diseaseInfo}
            onChange={(e) => setDiseaseInfo(e.target.value)}
            className="w-full p-3 border border-gray-200 placeholder:font-[15px] rounded-[9px] mt-3 focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
            style={{ height: '76px' }}
          />
        </div>

        {/* 치매 증상 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 치매 증상을 선택해 주세요.&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[15px] font-semibold">
            {dementiaInfoList.map((symptom, index) => (
              <button
                type='button'
                key={index}
                className={`w-[calc(50%-0.75rem)] h-[76px] py-1 px-3 rounded-[61px] border ${
                  dementiaInfo.includes(symptom) ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]' : 'bg-white text-gray-600'
                }`}
                onClick={() => setDementiaInfo((prev) =>
                  prev.includes(symptom) ? prev.filter((info) => info !== symptom) : [...prev, symptom]
                )}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* 동거인 여부 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              어르신의 동거인 여부를 선택해 주세요.&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-base font-semibold">
            {cohabitantList.map((_cohabitant, index) => (
              <button
                type='button'
                key={index}
                className={`w-full py-4 rounded-[61px] border ${
                  cohabitant === _cohabitant ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]' : 'bg-white text-gray-600'
                }`}
                onClick={() => setCohabitant(_cohabitant)}
              >
                {_cohabitant}
              </button>
            ))}
          </div>
        </div>

        {/* 다음으로 버튼 */}
        <button
          type="submit"
          className="w-full bg-[#FF8B14] text-white py-3 rounded-[9px] text-base font-semibold mx-1 mt-12"
          style={{ cursor: 'pointer' }}
        >
          다음으로 이동
        </button>
      </form>
    </div>
  );
}