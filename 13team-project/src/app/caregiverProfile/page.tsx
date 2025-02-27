"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Bell, HelpCircle, Settings, LogOut, ChevronRight } from "lucide-react";

export default function CaregiverProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("id") || "";

  const [caregiver, setCaregiver] = useState<{
    id: string;
    name: string;
    profileImage?: string;
    completedJobs: number;
    ongoingJobs: number;
    totalMeetings: number;
  } | null>(null);
  const [elders, setelders] = useState<
    {
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
    }[]
  >([]);
  const [proposals, setProposals] = useState<
    {
      caregiverId: string;
      elderId: number;
      status: string;
    }[]
  >([]); 

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
            <span className="text-[18px] font-medium">요양보호사 </span>
            <span className="text-[18px] font-semibold">{caregiver.name}</span>
            <span className="text-[18px]">님</span>
          </span>
        </div>
        </div> 
      {/* 프로필 카드 (알림 배너 & 버튼 포함) */}
        <div className="bg-white rounded-xl shadow-md mx-4 mt-4 p-4 flex flex-col items-center w-full max-w-md">
        {/* 프로필 정보 */}
        <div className="flex items-center w-full space-x-4">
            <div className="relative">
            <Image
                src={caregiver.profileImage || "/assets/기본프로필.png"}
                alt="프로필 이미지"
                width={60}
                height={60}
                className="w-16 h-16 rounded-full"
            />
            {/* 수정 아이콘 */}
            <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                <Image src="/assets/수정.png" alt="프로필 수정" width={16} height={16} />
            </button>
            </div>

            <div className="flex-1">
            <h3 className="text-lg font-semibold">{caregiver.name}님</h3>
            <p className="text-gray-600 text-sm">
                채용완료 <span className="font-bold">{caregiver.completedJobs}</span>건 | 진행중{" "}
                <span className="font-bold">{elders.length}</span>건
            </p>
            </div>
            <ChevronRight size={24} className="text-gray-400" />
        </div>

        {/* 알림 배너 */}
        <div className="bg-orange-100 text-orange-700 px-4 py-3 mt-3 rounded-lg text-sm font-medium w-full border border-orange-300">
            지금까지 잔물결을 통해 <span className="font-bold text-orange-900">{caregiver.totalMeetings}</span>번
            만남에 성공했어요!
        </div>

        {/* 버튼 메뉴 */} 
        <div className="flex space-x-6 mt-4">
            {/* 최근 제안 보기 */}
            <button
                className="flex flex-col items-center bg-[#FF8B14]/20 rounded-full w-24 h-24 justify-center"
                onClick={() => router.push(`/proposals?id=${caregiverId}`)}
            >
                <Image src="/assets/최근제안.png" alt="제안 보기" width={40} height={40} />
                <span className="text-gray-700 text-xs mt-2">최근 제안 보기</span>
            </button>

            {/* 내 매칭 관리 */}
            <button
                className="flex flex-col items-center bg-[#FF8B14]/20 rounded-full w-24 h-24 justify-center"
                onClick={() => router.push("/matches")}
            >
                <Image src="/assets/매칭관리.png" alt="매칭 관리" width={40} height={40} />
                <span className="text-gray-700 text-xs mt-2">내 매칭 관리</span>
            </button>
        </div>
     </div>

      {/* 설정 메뉴 리스트 */}
      <div className="bg-white shadow-md mx-4 mt-6 rounded-lg divide-y w-full max-w-md">
        <MenuItem icon={<Bell size={20} />} label="공지 사항" onClick={() => router.push("/notices")} />
        <MenuItem icon={<HelpCircle size={20} />} label="고객 센터" onClick={() => router.push("/support")} />
        <MenuItem icon={<Settings size={20} />} label="설정" onClick={() => router.push("/settings")} />
        <MenuItem icon={<LogOut size={20} />} label="로그아웃" onClick={() => router.push("/login")} />
      </div>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex justify-around rounded-t-3xl drop-shadow-xl z-50">
        <NavItem imgSrc="/assets/홈화면_OFF.png" label="" onClick={() => router.push(`/caregiver?id=${caregiverId}`)} />
        <NavItem imgSrc="/assets/대화하기_OFF.png" label="" onClick={() => router.push(`/chat?id=${caregiverId}`)} />
        <NavItem imgSrc="/assets/구직정보관리_OFF.png" label="" onClick={() => router.push(`/caregiver-info?id=${caregiverId}`)} />
        <NavItem imgSrc="/assets/내정보_ON.png" label="" onClick={() => router.push(`/caregiverProfile?id=${caregiverId}`)} />
      </div>
    </div>
  );
}

// ✅ 메뉴 아이템 컴포넌트
function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center py-4 px-6 w-full text-left text-gray-700 hover:bg-gray-50">
      {icon}
      <span className="ml-4 flex-1">{label}</span>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}

// ✅ 네비게이션 아이템 컴포넌트
function NavItem({ imgSrc, label, onClick }: { imgSrc: string; label: string; onClick: () => void }) {
  return (
    <button className="text-gray-600 text-[13px] flex flex-col items-center" onClick={onClick}>
      <Image src={imgSrc} alt={label} width={72} height={64} className="w-[72px] h-[64px]" />
      <span>{label}</span>
    </button>
  );
}
