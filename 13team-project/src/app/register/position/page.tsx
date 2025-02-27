"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent } from "react";

export default function PositionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [position, setPosition] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [placeName, setPlaceName] = useState<string>("");
  const [addressName, setAddressName] = useState<string>("");

  // URL에서 `role`, `name`, `phone`, `place_name`, `address_name` 가져오기
  useEffect(() => {
    const nameFromParams = searchParams.get("name");
    const phoneFromParams = searchParams.get("phone");
    const roleFromParams = searchParams.get("role");
    const placeNameFromParams = searchParams.get("place_name");
    const addressNameFromParams = searchParams.get("address_name");

    if (nameFromParams) setName(decodeURIComponent(nameFromParams));
    if (phoneFromParams) setPhone(decodeURIComponent(phoneFromParams));
    if (roleFromParams) setRole(decodeURIComponent(roleFromParams));
    if (placeNameFromParams) setPlaceName(decodeURIComponent(placeNameFromParams));
    if (addressNameFromParams) setAddressName(decodeURIComponent(addressNameFromParams));
  }, [searchParams]);

  // 다음 단계로 이동 (Account 페이지)
  const handleNext = () => {
    if (position.trim()) {
      router.push(
        `/register/account?role=${encodeURIComponent(role)}&name=${encodeURIComponent(
          name
        )}&phone=${encodeURIComponent(phone)}&position=${encodeURIComponent(position)}&place_name=${encodeURIComponent(placeName)}&address_name=${encodeURIComponent(addressName)}`
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
      <h2 className="mt-6 text-2xl font-bold text-gray-900">센터 내의 직책은 무엇인가요?</h2>
      <p className="text-gray-600 mt-2">요양보호사 분들이 필요로 하시는 정보를 받아볼게요.</p>

      {/* 센터 정보 표시 */}
      {placeName && addressName && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow">
          <p className="text-lg font-bold">{placeName}</p>
          <p className="text-sm text-gray-600">{addressName}</p>
        </div>
      )}

      {/* 직책 입력 필드 */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">직책</label>
        <input
          type="text"
          placeholder="직책을 입력해주세요."
          value={position}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPosition(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 전화번호 & 이름 필드 (읽기 전용) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">전화번호</label>
        <input
          type="text"
          value={phone}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-gray-100 text-gray-500"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          value={name}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-gray-100 text-gray-500"
        />
      </div>

      {/* 확인 버튼 */}
      <button
        className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        disabled={!position}
        onClick={handleNext}
      >
        확인
      </button>
    </div>
  );
}
