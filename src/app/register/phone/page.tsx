"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent } from "react";

export default function PhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");

  // URL에서 이름 가져오기
  useEffect(() => {
    const nameFromParams = searchParams.get("name");
    if (nameFromParams) {
      setName(decodeURIComponent(nameFromParams));
    }
  }, [searchParams]);

  // 전화번호 자동 포맷팅 (010-0000-0000)
  const formatPhoneNumber = (value: string): string => {
    value = value.replace(/\D/g, ""); // 숫자만 입력 가능
    if (value.length > 3 && value.length <= 7) {
      return `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    return value;
  };

  // 입력값 변경 시 자동 포맷 적용
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  // 다음 페이지로 이동
  const handleNext = () => {
    if (phone.length === 13) {
      router.push(
        `/register/position?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`
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
        <div></div> {/* 중앙 정렬을 위해 빈 div 추가 */}
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-1 w-1/3 bg-orange-500 rounded mx-1"></div>
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-2xl font-bold text-gray-900">전화번호가 어떻게 되세요?</h2>
      <p className="text-gray-600 mt-2">요양보호사 분들이 필요로 하시는 정보를 받아볼게요.</p>

      {/* 전화번호 입력 필드 */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">전화번호</label>
        <input
          type="tel"
          placeholder="전화번호를 입력해주세요"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={13} // ✅ 숫자로 변경
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 이름 필드 (읽기 전용) */}
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
        className="w-full mt-6 bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        disabled={phone.length < 13}
        onClick={handleNext}
      >
        확인
      </button>
    </div>
  );
}
