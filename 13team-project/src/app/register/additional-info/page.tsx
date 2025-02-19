"use client";

import { useState, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdditionalInfoRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [additionalInfo, setAdditionalInfo] = useState({
    grade: "",
    period: "",
    description: "",
  });

  // URL에서 기존 센터 정보 가져오기
  const placeName = searchParams.get("place_name") || "";
  const addressName = searchParams.get("address_name") || "";

  // 입력값 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAdditionalInfo({ ...additionalInfo, [e.target.name]: e.target.value });
  };

  // 다음 페이지로 이동 시 기존 센터 정보 유지
  const handleNext = () => {
    router.push(
      `/register/name?place_name=${encodeURIComponent(placeName)}&address_name=${encodeURIComponent(addressName)}&grade=${encodeURIComponent(additionalInfo.grade)}&period=${encodeURIComponent(additionalInfo.period)}&description=${encodeURIComponent(additionalInfo.description)}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="text-gray-600 text-lg">←</button>
        <button
          onClick={() =>
            router.push(
              `/register/name?place_name=${encodeURIComponent(placeName)}&address_name=${encodeURIComponent(addressName)}`
            )
          }
          className="text-orange-500 font-semibold"
        >
          건너뛰기
        </button>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-1 w-1/3 bg-orange-500 rounded"></div>
        <div className="h-1 w-1/3 bg-gray-300 rounded mx-1"></div>
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
      </div>

      {/* 제목 */}
      <h2 className="mt-6 text-2xl font-bold text-gray-900">필수는 아니지만 입력하면 좋은 정보들이에요!</h2>
      <p className="text-gray-600 mt-2">나중에 작성하고 싶으시면 건너뛰기를 눌러주세요.</p>

      {/* 추가 정보 입력 필드 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">센터 등급</label>
          <input
            type="text"
            name="grade"
            placeholder="1등급"
            value={additionalInfo.grade}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">운영 기간</label>
          <input
            type="text"
            name="period"
            placeholder="3년"
            value={additionalInfo.period}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">센터 한줄 소개</label>
        <input
          type="text"
          name="description"
          placeholder="센터의 한줄 소개를 입력해주세요."
          value={additionalInfo.description}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 확인 버튼 */}
      <button
        className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        onClick={handleNext}
      >
        확인
      </button>
    </div>
  );
}
