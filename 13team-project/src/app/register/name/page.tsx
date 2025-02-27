"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, ChangeEvent } from "react";

export default function NamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "";
  const placeName = searchParams.get("place_name") || "";
  const addressName = searchParams.get("address_name") || "";
  const [name, setName] = useState<string>("");

  const handleNext = () => {
    if (name.trim()) {
      router.push(
        `/register/phone?role=${encodeURIComponent(role)}&name=${encodeURIComponent(
          name
        )}&place_name=${encodeURIComponent(placeName)}&address_name=${encodeURIComponent(addressName)}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-gray-600 text-lg">
          ←
        </button>
        <p className="text-lg font-bold">회원가입</p>
        <div></div>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-1 w-1/3 bg-orange-500 rounded mx-1"></div>
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-2xl font-bold text-gray-900">이름이 어떻게 되세요?</h2>
      <p className="text-gray-600 mt-2">요양보호사 분들이 필요로 하시는 정보를 받아볼게요.</p>

      {/* 센터 정보 표시 (선택된 경우) */}
      {placeName && addressName && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow">
          <p className="text-lg font-bold">{placeName}</p>
          <p className="text-sm text-gray-600">{addressName}</p>
        </div>
      )}

      {/* 이름 입력 필드 */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          placeholder="이름을 입력해주세요."
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 확인 버튼 */}
      <button
        className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        disabled={!name.trim()}
        onClick={handleNext}
      >
        확인
      </button>
    </div>
  );
}
