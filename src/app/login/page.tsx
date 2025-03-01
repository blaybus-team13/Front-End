"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../utils/api"; // 로그인 API 호출 함수

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<{ id: string; password: string }>({
    id: "",
    password: "",
  });
  const [rememberId, setRememberId] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 입력값 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 로그인 요청
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await loginUser(form);

      if (response.token) {
        localStorage.setItem("token", response.token);
        if (rememberId) localStorage.setItem("savedId", form.id);
        else localStorage.removeItem("savedId");

        alert("로그인 성공!");
        router.push("/dashboard");
      } else {
        setError(response.message || "로그인 실패. 다시 시도해주세요.");
      }
    } catch (err) {
      setError((err as Error)?.message || "서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 relative">
      {/* 🔙 뒤로 가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-gray-600 text-lg font-semibold hover:text-gray-900 transition"
      >
        ← 뒤로
      </button>

      {/* 상단 타이틀 */}
      <h2 className="text-xl font-bold text-gray-900 mb-6 mt-10">로그인</h2>

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        {/* 아이디 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">아이디</label>
          <input
            type="text"
            name="id"
            placeholder="아이디를 입력해주세요."
            value={form.id}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            name="password"
            placeholder="비밀번호를 입력해주세요."
            value={form.password}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* 아이디 저장 & 비밀번호 찾기 */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rememberId}
              onChange={() => setRememberId(!rememberId)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <span>아이디 저장</span>
          </label>
          <a href="/forgot-password" className="text-primary font-semibold">
            아이디/비밀번호 찾기 &gt;
          </a>
        </div>

        {/* 에러 메시지 출력 */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
        >
          로그인하기
        </button>
      </form>
    </div>
  );
}
