"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔹 URL에서 데이터 가져오기 (JSON 형식으로 전달된 'data' 파라미터)
  const rawData = searchParams.get("data");
  const parsedData = rawData ? JSON.parse(decodeURIComponent(rawData)) : {};

  console.log("📌 [CLIENT] Parsed Data from URL:", parsedData); // 🔍 디버깅 로그 추가

  // 🔹 기존 데이터 파싱 (null 문자열 변환 방지)
  const role = parsedData.role || "";
  const name = parsedData.name || "";
  const phone = parsedData.phone || "";
  const location = parsedData.location || "";
  const period = parsedData.period !== "null" ? parsedData.period || "0" : "0";
  const careerList = parsedData.careerList !== "null" ? parsedData.careerList || [] : [];
  const intro = parsedData.intro !== "null" ? parsedData.intro || "" : "";
  const hasCar = parsedData.hasCar || false;
  const dementiaTraining = parsedData.dementiaTraining || false;
  const certNumber = parsedData.certNumber || "";
  const uploadedImage = parsedData.uploadedFile || null;
  const hasNurseCert = parsedData.hasNurseCert || false;
  const selectedNurseLevel = parsedData.selectedNurseLevel || "";
  const hasSocialWorkerCert = parsedData.hasSocialWorkerCert || false;

  console.log("📌 [ACCOUNT PAGE] Sanitized Data:", {
    role,
    name,
    phone,
    location,
    period,
    careerList,
    intro,
    hasCar,
    dementiaTraining,
    certNumber,
    uploadedImage,
  });

  // 🔹 추가할 정보 (아이디, 비밀번호)
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 회원가입 API 호출
  const handleRegister = async () => {
    if (!id || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 🔹 FormData 생성
      const formData = new FormData();
      formData.append("role", role);
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("location", location);
      formData.append("period", period);
      formData.append("careerList", JSON.stringify(careerList));
      formData.append("intro", intro);
      formData.append("hasCar", String(hasCar));
      formData.append("dementiaTraining", String(dementiaTraining));
      formData.append("certNumber", certNumber);
      formData.append("hasNurseCert", String(hasNurseCert));
      formData.append("selectedNurseLevel", selectedNurseLevel);
      formData.append("hasSocialWorkerCert", String(hasSocialWorkerCert));
      formData.append("id", id);
      formData.append("password", password);

      // 🔹 이미지 파일 추가 (uploadedImage가 URL일 경우 제외)
      if (uploadedImage) {
        console.log("📌 [CLIENT] Uploading file:", uploadedImage.name);
        formData.append("uploadedImage", uploadedImage);
      } else {
        console.warn("⚠️ [CLIENT] No file selected!");
      }
    

      // 🔹 FormData 데이터 확인
      console.log("📌 [CLIENT] FormData 데이터 확인:", Object.fromEntries(formData.entries()));

      // 🔹 API 요청
      const response = await fetch("/api/caregiver", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("회원가입 실패! 다시 시도해주세요.");
      }

      // 🔹 회원가입 성공 시 다음 페이지로 이동
      router.push(`/caregiver-register/success?id=${encodeURIComponent(id)}`);
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
