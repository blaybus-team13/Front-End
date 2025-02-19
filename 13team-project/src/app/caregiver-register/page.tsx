"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function NamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    // URL에서 role 값 가져오기
    const roleFromParams = searchParams.get("role");
    if (roleFromParams) setRole(decodeURIComponent(roleFromParams));
  }, [searchParams]);

  const handleNext = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 기본 동작 방지

    if (name.trim()) {
      try {
        // API 호출
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role, name }),
        };

        const response = await fetch("/api/caregiver", options);

        const data = await response.json();
        console.log("API 응답:", data);

        // 이름 값을 다음 페이지로 넘길 수 있도록 URL 파라미터 사용
        const nextUrl = `/caregiver-register/phone?role=${encodeURIComponent(role)}&name=${encodeURIComponent(name)}`;
        router.push(nextUrl);
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    }
  };

  if (role === "caregiver") {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-4 font-[Pretendard]">
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
        <h2 className="mt-3 text-[26px] font-bold text-gray-600">이름이 어떻게 되세요?</h2>

        <form onSubmit={handleNext}>
          {/* 이름 입력 필드 */}
          <div className="mt-8">
            <label className="block text-base font-normal text-gray-600">이름</label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-orange"
            />
          </div>

          {/* 확인 버튼 */}
          <input
            type="submit"
            className="w-full mt-6 bg-[#FF8B14] text-white py-3 rounded-[9px] text-base font-semibold cursor-pointer"
            disabled={!name}
            value="확인"
          />
        </form>
      </div>
    );
  } else {
    return null; // role이 caregiver가 아닌 경우 아무것도 렌더링하지 않음
  }
}
