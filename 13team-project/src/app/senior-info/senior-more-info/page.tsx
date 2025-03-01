'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '../Modal';

interface KakaoLocationResult {
  place_name: string;
  road_address_name: string;
  address_name: string;
}

export default function SeniorMoreInformationPage() {
  const router = useRouter();
  const [location, setLocation] = useState<string>('');
  const [careDays, setCareDays] = useState<string[]>([]);
  const [careStartHour, setCareStartHour] = useState<string>('10:00');
  const [careEndHour, setCareEndHour] = useState<string>('18:00');
  const [workplaceDetails, setWorkplaceDetails] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<KakaoLocationResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const searchParams = useSearchParams();
  const adminId = searchParams.get("id");

  const careDaysList: string[] = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  const workplaceDetailsList: string[] = ['가사도우미 있음', '주차가능', '반려동물 있음', '집 평수 30평 이상'];

  // ✅ 기존 저장된 elderData 불러오기
  useEffect(() => {
    const storedData = localStorage.getItem("elderData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setLocation(parsedData.elderly?.location || '');
      setCareDays(parsedData.careDays || []);
      setCareStartHour(parsedData.careStartHour || '10:00');
      setCareEndHour(parsedData.careEndHour || '18:00');
      setWorkplaceDetails(parsedData.workplaceDetails || []);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (location.trim() !== '') {
        setDebouncedQuery(location);
      }
    }, 500); // 0.5초 동안 입력이 없으면 API 요청

    return () => clearTimeout(handler);
  }, [location]);

  // 카카오 API 호출
  useEffect(() => {
    if (!debouncedQuery) return;

    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/kakao?query=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) throw new Error('API 호출 실패');
        const data = await response.json();
        setSearchResults(data.documents || []);
        setShowResults(true);
      } catch (error) {
        console.error('카카오 API 호출 오류:', error);
        setSearchResults([]);
      }
    };

    fetchLocation();
  }, [debouncedQuery]);

  // 주소에서 시, 구, 동 추출
  const extractCityDistrict = (address: string): string => {
    const addressParts = address.split(' ');
    if (addressParts.length >= 3) {
      return `${addressParts[0]} ${addressParts[1]} ${addressParts[2]}`; // 시, 구, 동
    }
    return address; // 주소가 너무 간단할 경우 그대로 반환
  };

  const handleSelectLocation = (selectedLocation: KakaoLocationResult) => {
    const cityDistrict = extractCityDistrict(selectedLocation.road_address_name || selectedLocation.address_name);
    console.log("📌 선택한 지역:", cityDistrict); // 🔍 디버깅 로그
    setLocation(cityDistrict);
    console.log("📌 업데이트된 location 상태:", cityDistrict); // 🔍 업데이트된 상태 확인
    setShowResults(false);
  };  

  // 다음 단계로 이동 (채용 공고 등록 페이지)
  const handleNext = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!location.trim()) {
      alert("거주지를 선택해 주세요.");
      return;
    }
    if (!careDays.length) {
      alert("돌봄을 필요로 하는 요일을 선택해 주세요.");
      return;
    }
    if (!careStartHour || !careEndHour) {
      alert("돌봄을 필요로 하는 시간을 선택해 주세요.");
      return;
    }
  
    const storedData = localStorage.getItem("elderData");
    const existingData = storedData ? JSON.parse(storedData) : {};

    const newData = {
      ...existingData, 
      elderly: {
        ...existingData.elderly, 
        location, 
      },
      careDays: careDays,
      careStartHour: careStartHour, 
      careEndHour: careEndHour,
      workplaceDetails,
    };
  
    // ✅ 디버깅 로그 추가
    console.log("📌 저장될 데이터:", newData);
  
    localStorage.setItem("elderData", JSON.stringify({ ...existingData, ...newData }));
  
    // ✅ `location` 정보를 URL 파라미터로 전달
    router.push(`/senior-info/service?id=${encodeURIComponent(adminId ?? "")}&location=${encodeURIComponent(location)}`);
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
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            router.push('/'); // 홈으로 이동
          }}
        />
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-[#FF8B14] rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">어르신 상세 정보를 받아볼게요!</h2>
      <p className="text-base font-medium text-gray-500 mt-3">보다 원활한 연결을 위해 필요한 정보예요.</p>

      <form onSubmit={handleNext}>
        {/* 검색 입력창 */}
      <div className="mt-12 relative">
        <p className="text-lg font-bold text-gray-600">어느 지역에 거주 중이신가요? *</p>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="지역을 입력해 주세요."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <path
              d="M17.5 17.5L12.5 12.5M2.5 8.33333C2.5 9.09938 2.65088 9.85792 2.94404 10.5657C3.23719 11.2734 3.66687 11.9164 4.20854 12.4581C4.75022 12.9998 5.39328 13.4295 6.10101 13.7226C6.80875 14.0158 7.56729 14.1667 8.33333 14.1667C9.09938 14.1667 9.85792 14.0158 10.5657 13.7226C11.2734 13.4295 11.9164 12.9998 12.4581 12.4581C12.9998 11.9164 13.4295 11.2734 13.7226 10.5657C14.0158 9.85792 14.1667 9.09938 14.1667 8.33333C14.1667 7.56729 14.0158 6.80875 13.7226 6.10101C13.4295 5.39328 12.9998 4.75022 12.4581 4.20854C11.9164 3.66687 11.2734 3.23719 10.5657 2.94404C9.85792 2.65088 9.09938 2.5 8.33333 2.5C7.56729 2.5 6.80875 2.65088 6.10101 2.94404C5.39328 3.23719 4.75022 3.66687 4.20854 4.20854C3.66687 4.75022 3.23719 5.39328 2.94404 6.10101C2.65088 6.80875 2.5 7.56729 2.5 8.33333Z"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 검색 결과 리스트 */}
        {showResults && searchResults.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-md mt-2">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectLocation(result)}
              >
                {result.place_name} ({extractCityDistrict(result.road_address_name || result.address_name)})
              </li>
            ))}
          </ul>
        )}
      </div>

        {/* 요일 선택 */}
        <div className="mt-12">
          <div>
            <p className="text-lg font-bold text-gray-600">
              돌봄을 필요로 하시는 요일이 어떻게 되세요?&nbsp;
              <span className="text-red">
                *
              </span>
            </p>
            <p className="font-normal text-sm text-gray-400 mt-1">중복 선택 가능</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {careDaysList.map((day, index) => (
              <button
                type='button'
                key={index}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  careDays.includes(day) ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]' : 'bg-white text-gray-600'
                }`}
                onClick={() => {
                  setCareDays((prev) =>
                    prev.includes(day) ? prev.filter((req) => req !== day) : [...prev, day]
                  );
                }}
              >
                {day}
              </button>
            ))}
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
            <p className="font-normal text-sm text-gray-400 mt-1">채용 공고 등록 또는 프로필에서 변경이 가능해요.</p>
          </div>
          <div className="mt-3 flex gap-3 items-center">
            <div className="w-1/2">
              <label className="block text-base font-medium text-gray-500">시작 시간</label>
              <select
                value={careStartHour}
                onChange={(e) => setCareStartHour(e.target.value)}
                className="w-full mt-2 p-3 text-base font-semibold text-gray-600 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
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
              <label className="block text-base font-medium text-gray-500">종료 시간</label>
              <select
                value={careEndHour}
                onChange={(e) => setCareEndHour(e.target.value)}
                className="w-full mt-2 p-3 text-base font-semibold text-gray-600 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-[#FF8B14]"
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
        </div>

        {/* 추가 사항 */}
        <div className="mt-12">
          <p className="text-lg font-bold text-gray-600">근무지의 부가사항을 선택해 주세요.</p>
          <div className="mt-3 flex flex-wrap gap-3 text-base font-semibold">
            {workplaceDetailsList.map((detail, index) => (
              <button
                type="button"
                key={index}
                className={`w-[calc(50%-0.75rem)] py-4 rounded-[61px] border ${
                  workplaceDetails.includes(detail) ? 'bg-[#FF8B14] bg-opacity-10 border-[#FF8B14] text-[#FF8B14]' : 'bg-white text-gray-600'
                }`}
                onClick={() =>
                  setWorkplaceDetails((prev) =>
                    prev.includes(detail) ? prev.filter((d) => d !== detail) : [...prev, detail]
                  )
                }
              >
                {detail}
              </button>
            ))}
          </div>
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
            className="w-2/3 bg-[#FF8B14] text-white py-3 rounded-[9px] text-base font-semibold mx-1"
            style={{ cursor: 'pointer' }}
          >
            다음으로 이동
          </button>
        </div>
      </form>
    </div>
  );
}