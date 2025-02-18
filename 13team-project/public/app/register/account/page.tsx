"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent } from "react";

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // API 요청 중 로딩 상태 관리
  const [error, setError] = useState<string | null>(null); // 오류 메시지 저장

  // URL에서 데이터 가져오기
  useEffect(() => {
    const nameFromParams = searchParams.get("name");
    const phoneFromParams = searchParams.get("phone");
    const positionFromParams = searchParams.get("position");

    if (nameFromParams) setName(decodeURIComponent(nameFromParams));
    if (phoneFromParams) setPhone(decodeURIComponent(phoneFromParams));
    if (positionFromParams) setPosition(decodeURIComponent(positionFromParams));
  }, [searchParams]);

  // 회원가입 API 호출 함수
  const handleRegister = async () => {
    if (!id || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://0a69-121-134-41-93.ngrok-free.app/auth/carer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          position,
          id,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("회원가입 실패! 다시 시도해주세요.");
      }

      // 성공적으로 회원가입이 완료되면 success 페이지로 이동
      router.push(`/register/success?name=${encodeURIComponent(name)}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-1 w-1/3 bg-orange-500 rounded"></div>
      </div>

      {/* 타이틀 */}
      <p className="text-sm text-gray-600 mt-6">마지막 단계예요!</p>
      <h2 className="text-2xl font-bold text-gray-900 mt-2">
        로그인 시 사용하실 아이디와 <br /> 비밀번호를 입력해주세요!
      </h2>

      {/* 아이디 입력 필드 */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">아이디</label>
        <input
          type="text"
          placeholder="아이디를 입력해주세요."
          value={id}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 비밀번호 입력 필드 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">비밀번호</label>
        <input
          type="password"
          placeholder="비밀번호를 입력해주세요."
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* 확인 버튼 */}
      <button
        className="w-full mt-6 bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        disabled={!id || !password || loading}
        onClick={handleRegister}
      >
        {loading ? "가입 중..." : "확인"}
      </button>
    </div>
  );
}
