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
  const [placeName, setPlaceName] = useState<string>("");
  const [addressName, setAddressName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // URL에서 필요한 정보 가져오기
  useEffect(() => {
    setName(decodeURIComponent(searchParams.get("name") || ""));
    setPhone(decodeURIComponent(searchParams.get("phone") || ""));
    setPosition(decodeURIComponent(searchParams.get("position") || ""));
    setPlaceName(decodeURIComponent(searchParams.get("place_name") || ""));
    setAddressName(decodeURIComponent(searchParams.get("address_name") || ""));
  }, [searchParams]);

  // 회원가입 API 호출 함수 (admin 회원가입)
  const handleRegister = async () => {
    if (!id.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          name,
          phone,
          position,
          id,
          password,
          place_name: placeName,
          address_name: addressName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "회원가입 실패! 다시 시도해주세요.");
      }

      // 회원가입 성공 후 관리자 페이지로 이동 (id는 유지, 센터 정보는 URL에 포함하지 않음)
      router.push(`/admin?id=${encodeURIComponent(id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
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
        <div></div>
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

      {/* 센터 정보 표시 */}
      {placeName && addressName && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow">
          <p className="text-lg font-bold">{placeName}</p>
          <p className="text-sm text-gray-600">{addressName}</p>
        </div>
      )}

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

      {/* 역할(role) 필드 (항상 관리자) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">회원 역할</label>
        <input
          type="text"
          value="관리자"
          readOnly
          className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-gray-100 text-gray-500"
        />
      </div>

      {/* 오류 메시지 */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* 확인 버튼 */}
      <button
        className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        disabled={!id || !password || loading}
        onClick={handleRegister}
      >
        {loading ? "가입 중..." : "확인"}
      </button>
    </div>
  );
}
