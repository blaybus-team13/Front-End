"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";

export default function PhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // 🔹 URL에서 role, name 값 가져오기
  useEffect(() => {
    const roleFromParams = searchParams.get("role");
    const nameFromParams = searchParams.get("name");
    if (roleFromParams) setRole(decodeURIComponent(roleFromParams));
    if (nameFromParams) setName(decodeURIComponent(nameFromParams));
  }, [searchParams]);

  // 🔹 전화번호 자동 포맷팅 (010-0000-0000)
  const formatPhoneNumber = (value: string): string => {
    value = value.replace(/\D/g, ""); // 숫자만 입력 가능
    if (value.length > 3 && value.length <= 7) {
      return `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    return value;
  };

  // 🔹 입력값 변경 시 자동 포맷 적용
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  // 🔹 다음 페이지로 이동
  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phone.length === 13) {
      const nextUrl = `/caregiver-register/residence?role=${encodeURIComponent(role)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;
      router.push(nextUrl);
    }
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
        <p className="text-lg font-semibold text-gray-600">회원가입</p>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-[#FF8B14] rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <p className="text-base font-medium text-gray-500 mt-6">센터 관리자분들이 필요로 하시는 정보를 받아볼게요.</p>
      <h2 className="mt-3 text-[26px] font-bold text-gray-600">전화번호가 어떻게 되세요?</h2>

      <form onSubmit={handleNext}>
        {/* 전화번호 입력 필드 */}
        <div className="mt-8">
          <label className="block text-base font-normal text-gray-600">전화번호</label>
          <input
            type="tel"
            placeholder="전화번호를 입력해주세요"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={13}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* 이름 필드 (읽기 전용) */}
        <div className="mt-4">
          <label className="block text-base font-normal text-gray-600">이름</label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 bg-gray-100 text-gray-400"
          />
        </div>

        {/* 확인 버튼 */}
        <input
          type="submit"
          className="w-full mt-6 bg-[#FF8B14] text-white py-3 rounded-[9px] text-base font-semibold cursor-pointer disabled:opacity-50"
          disabled={phone.length < 13}
          value="확인"
        />
      </form>
    </div>
  );
}
