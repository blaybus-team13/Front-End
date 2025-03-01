"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChatRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("id");
  const elderId = searchParams.get("elderId");

  const [elder, setElder] = useState<{
    name: string;
    birthYear: number;
    weight: number;
    gender: string;
    careLevel: string;
    location: string;
    profileImage?: string;
    diseases: string;
    dementiaSymptoms: string;
    cohabitant: string;
    workplaceDetails: string;
    additionalServices: string;
    center: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!elderId) return;

    // ✅ 어르신 정보 가져오기
    fetch(`/api/elders?elderId=${elderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.elders.length > 0) {
          setElder(data.elders[0]); // 첫 번째 어르신 정보 사용
        }
      })
      .catch((err) => console.error("어르신 정보 불러오기 실패:", err));
  }, [elderId]);

  if (!elder) {
    return <p className="text-center text-gray-500 mt-10">어르신 정보를 불러오는 중...</p>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        {/* 프로필 이미지 */}
        <div className="flex justify-center">
          <img
            src={elder.profileImage || "/default-profile.png"}
            alt={`${elder.name}님 프로필`}
            className="w-32 h-32 rounded-full border"
          />
        </div>

        {/* 어르신 기본 정보 */}
        <h1 className="text-center text-2xl font-bold mt-4">{elder.name} 님</h1>
        <p className="text-center text-gray-600">{elder.gender} | {new Date().getFullYear() - elder.birthYear}세</p>
        <p className="text-center text-gray-500">{elder.location}</p>

        {/* 건강 및 돌봄 정보 */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">건강 정보</h2>
          <ul className="mt-2 text-gray-600 space-y-1">
            <li><strong>질병:</strong> {elder.diseases || "없음"}</li>
            <li><strong>치매 증상:</strong> {elder.dementiaSymptoms || "없음"}</li>
            <li><strong>체중:</strong> {elder.weight}kg</li>
            <li><strong>요양등급:</strong> {elder.careLevel}</li>
          </ul>
        </div>

        {/* 돌봄 환경 정보 */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">돌봄 환경</h2>
          <ul className="mt-2 text-gray-600 space-y-1">
            <li><strong>동거 여부:</strong> {elder.cohabitant || "미입력"}</li>
            <li><strong>근무지:</strong> {elder.workplaceDetails || "미입력"}</li>
            <li><strong>추가 서비스:</strong> {elder.additionalServices || "없음"}</li>
            <li><strong>소속 센터:</strong> {elder.center}</li>
          </ul>
        </div>

        {/* 설명 */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">어르신 설명</h2>
          <p className="mt-2 text-gray-600">{elder.description || "설명이 없습니다."}</p>
        </div>

        {/* 홈으로 돌아가기 버튼 */}
        <button
          onClick={() => router.push("/")}
          className="w-full mt-6 bg-blue-500 text-white p-3 rounded-lg text-center font-semibold"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
