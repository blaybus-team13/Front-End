"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface Proposal {
  caregiverId: string;
  elderId: number;
  status: "pending" | "accepted" | "rejected";
}

const [caregiver, setCaregiver] = useState<{
    id: string;
    name: string;
    profileImage?: string;
    completedJobs: number;
    ongoingJobs: number;
    totalMeetings: number;
  } | null>(null);

interface Elder {
  id: number;
  center: string;
  elderly: {
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
  };
  mealSupport: boolean;
  toiletSupport: boolean;
  mobilitySupport: boolean;
  hasJobPosting: boolean;
  forced: boolean;
  conditions?: {
    wage: number;
    days: string[];
    time: string;
  };
}

export default function RecentProposals() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("id") || "";

  // 상태 값 관리
  const [proposals, setProposals] = useState<Proposal[]>([]); // ✅ 올바른 위치
  const [elders, setElders] = useState<any[]>([]);

  useEffect(() => {
    if (!caregiverId) return;

    // ✅ 제안 목록 가져오기
    fetch(`/api/propose?caregiverId=${caregiverId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProposals(data.proposals);
        }
      })
      .catch((err) => console.error("제안 목록 불러오기 오류:", err));
  }, [caregiverId]);

  useEffect(() => {
    if (proposals.length === 0) return;

    // ✅ 제안된 어르신 정보 가져오기
    fetch("/api/elders")
      .then((res) => res.json())
      .then((data) => {
        const matchedElders = data.elders.filter((elder: Elder) =>
          proposals.some((p) => p.elderId === elder.id)
        );
        setElders(matchedElders);
      })
      .catch((err) => console.error("어르신 정보 불러오기 오류:", err));
  }, [proposals]);

  useEffect(() => {
    if (!caregiverId) return;

    fetch(`/api/caregiver?id=${caregiverId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.caregiver) {
          setCaregiver(data.caregiver);
        }
      })
      .catch((error) => console.error("요양보호사 데이터 오류:", error));
  }, [caregiverId]);

  if (!caregiver) {
    return <p className="text-center text-gray-500">로딩 중...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center w-full font-[Pretendard] pb-24">
      {/* 상단 프로필 바 */}
      <div className="w-full h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center px-6 pt-8">
      <div className="flex items-center gap-3">
      <div className="w-[42px] h-[42px] rounded-full lg:w-14 lg:h-14 overflow-hidden">
      <Image
            src={caregiver.profileImage ? caregiver.profileImage : "/assets/기본프로필.png"}
            alt="프로필 이미지"
            width={56}
            height={56}
            className="w-full h-full object-cover"
        />
    </div>

          <span className="text-lg lg:text-xl">
          <h1 className="text-lg font-semibold">최근 들어온 제안</h1>
          <span className="text-sm">{proposals.length}개</span>
            <span className="text-[18px] font-medium">요양보호사 </span>
            <span className="text-[18px] font-semibold">{caregiver.name}</span>
            <span className="text-[18px]">님</span>
          </span>
        </div>
        </div> 
       {/* 제안 목록 */}
       <div className="mt-4 space-y-4">
        {proposals.length === 0 ? (
          <p className="text-center text-gray-500">최근 제안이 없습니다.</p>
        ) : (
          proposals.map((proposal, index) => {
            const elder = elders.find(e => e.id === proposal.elderId);
            if (!elder) return null;

            return (
              <div key={index} className="bg-white shadow-md p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{elder.elderly.name}님</p>
                    <p className="text-sm text-gray-600">
                      {elder.elderly.gender}, {new Date().getFullYear() - elder.elderly.birthYear}세, {elder.elderly.careLevel}
                    </p>
                    <p className="text-xs text-gray-500">{elder.center}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      proposal.status === "accepted"
                        ? "bg-green-100 text-green-600"
                        : proposal.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {proposal.status === "accepted"
                      ? "매칭 완료"
                      : proposal.status === "rejected"
                      ? "거절함"
                      : "대화 중"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  {proposal.status === "pending" && (
                    <button
                      className="text-orange-500 border border-orange-500 px-4 py-1 rounded-md"
                      onClick={() => router.push(`/elder-profile?id=${elder.id}`)}
                    >
                      대화 시작
                    </button>
                  )}
                  {proposal.status === "rejected" && (
                    <button
                      className="text-gray-500 border border-gray-300 px-4 py-1 rounded-md"
                      onClick={() => router.push(`/elder-profile?id=${elder.id}`)}
                    >
                      대화 재시작
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}