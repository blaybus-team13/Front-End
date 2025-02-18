"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ElderType {
  elid: number;
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
  };
  mealSupport: boolean;
  toiletSupport: boolean;
  mobilitySupport: boolean;
  hasJobPosting: boolean; 
  conditions?: {         
    wage: number;       
    days: string[];     
    time: string;       
  };
  forced: boolean;
}


interface CaregiverType {
    id: string;
    name: string;
    location: string;
    experience: number;
    certification: string;
    hasJobPosting: boolean;
    isJobSeeking: boolean;
    isActive: boolean;
    jobInfo: {
      days: string[];
      times: string[];
      hourlyWage: number;
    };
  }

interface AdminType {
  id: number;
  name: string;
  role: string;
}

function checkTimeMatch(caregiverTimes: string[], elderTime: string) {
    const [elderStart, elderEnd] = elderTime.split("~").map(t => parseInt(t));
  
    // 요양보호사 시간 범위
    const timeRanges: { [key: string]: [number, number] } = {
      "오전 (9-12시)": [9, 12],
      "오후 (12-6시)": [12, 18],
      "저녁 (6-9시)": [18, 21],
    };
  
    let fullMatch = false;
    let partialMatch = false;
  
    caregiverTimes.forEach(time => {
      const [start, end] = timeRanges[time] || [0, 0];
  
      if (start >= elderStart && end <= elderEnd) {
        fullMatch = true;
      } else if ((start <= elderEnd && end >= elderStart) || (start < elderEnd && end > elderEnd)) {
        partialMatch = true;
      }
    });
  
    if (fullMatch) return "full";
    if (partialMatch) return "partial";
    return "none";
  }
  

export default function AdminDashboard() {
  const router = useRouter();
  const [elders, setElders] = useState<ElderType[]>([]);
  const [filteredElders, setFilteredElders] = useState<ElderType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [admin, setAdmin] = useState<AdminType | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverType[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [recommendedCaregivers, setRecommendedCaregivers] = useState<CaregiverType[]>([]);
  const [showJobAlert, setShowJobAlert] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<{
    id: string; // 요양보호사 ID
    elderId: number; // 어르신 ID 추가
    type: "proposal" | "reject";
  } | null>(null);

  useEffect(() => {
    setRecommendedCaregivers([]);
  
    if (filteredElders[currentIndex]?.hasJobPosting) {
      fetch(`/api/caregiver?elderId=${filteredElders[currentIndex]?.elid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRecommendedCaregivers(data.caregivers || []);
          }
        })
        .catch((error) => console.error("추천된 요양보호사 정보 불러오기 실패:", error));
    }
  }, [filteredElders, currentIndex]);   

  /** 어르신 데이터 불러오기 */
  useEffect(() => {
    fetch("/api/elders")
      .then((res) => res.json())
      .then((data) => {
        setElders(data.elders);
        setFilteredElders(data.elders);
      })
      .catch((error) => console.error("어르신 목록 불러오기 오류:", error));
  }, []);

  /** 관리자 정보 불러오기 */
  useEffect(() => {
    fetch("/api/admin?id=1")
      .then((res) => res.json())
      .then((data) => setAdmin(data.admin ?? { id: 0, name: "정보 없음", role: "직책 없음" }))
      .catch((error) => console.error("관리자 정보 불러오기 오류:", error));
  }, []);

  /** 요양보호사 데이터 불러오기 */
  useEffect(() => {
    if (filteredElders.length > 0 && filteredElders[currentIndex]?.hasJobPosting) {
      setLoading(true);
      fetch("/api/caregiver")
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ caregivers API 응답:", data); // 🔥 응답 확인
          if (Array.isArray(data)) {
            setCaregivers(data); // ✅ 올바른 경우
          } else if (data && Array.isArray(data.caregivers)) {
            setCaregivers(data.caregivers); // ✅ 객체 안에 배열이 있는 경우
          } else {
            setCaregivers([]); // 🚨 예외 처리
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("요양보호사 목록 불러오기 오류:", error);
          setLoading(false);
        });
    } else {
      setCaregivers([]); 
    }
  }, [currentIndex, filteredElders]);
  

  /** 드롭다운 외부 클릭 시 닫기 */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  /** 검색 기능 */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredElders(elders);
      setCurrentIndex(0);
    } else {
      const matchedElders = elders.filter((elder) => elder.elderly.name.includes(query));
      setFilteredElders(matchedElders);
      setCurrentIndex(0);
    }
  };

  /** ✅ 제안하기 API 요청 */
  const handleProposal = async (caregiverId: string, elderId: number) => {
    try {
        const response = await fetch("/api/propose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                caregiverId,
                elderId,
                status: "pending", // 대기 상태
            }),
        });

        const data = await response.json();
        console.log("✅ 제안 전송 결과:", data); // 🔥 응답 확인

        if (response.ok) {
            alert("제안이 성공적으로 전송되었습니다.");
            // 제안 목록을 다시 불러오기 위해 상태 업데이트
            setSelectedProposal({ id: caregiverId, elderId, type: "proposal" });
        } else {
            alert(`제안 전송 실패: ${data.message}`);
        }
    } catch (error) {
        console.error("제안 전송 오류:", error);
        alert("제안 전송 중 오류가 발생했습니다.");
    }
};



  /** 프로필 페이지 넘기기 */
  const handleNext = () => {
    if (filteredElders.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredElders.length);
    }
  };

  const handlePrev = () => {
    if (filteredElders.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredElders.length) % filteredElders.length);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white w-full font-[Pretendard] pb-24">
        {/* 상단바 */}
        <div className="w-screen h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center justify-between px-6 pt-8 relative">
            {/* 관리자 정보 */}
            <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-gray-400 rounded-full lg:w-14 lg:h-14"></div>
            <span className="text-lg lg:text-xl">
                <span className="text-[18px] font-medium">{admin?.role ?? "직책 없음"} </span>
                <span className="text-[18px] font-semibold">{admin?.name ?? "정보 없음"}</span>
                <span className="text-[18px]">님</span>
            </span>
            </div>

            {/* 버튼 클릭 시 드롭다운 표시 */}
            <div className="relative" ref={dropdownRef}>
            <button
                className="text-white text-[40px] font-thin"
                onClick={() => setShowDropdown((prev) => !prev)}
            >
                +
            </button>
            {showDropdown && (
                <div className="absolute right-1 top-[50px] bg-white rounded-lg shadow-lg w-40 py-2 border border-gray-200 z-50">
                <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-400"
                    onClick={() => {
                    setShowDropdown(false);
                    router.push("/admin/add-elder");
                    }}
                >
                    어르신 정보 등록
                </button>
                <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-400 cursor-not-allowed"
                    disabled
                >
                    채용 공고 등록
                </button>
                </div>
            )}
            </div>
        </div>

        {showJobAlert && (
        <div className="absolute top-[-12px] left-10 h-[50px] w-[280px] md:w-[320px] bg-[#6EB5CB] text-white p-3 rounded-full shadow-lg relative flex flex-col items-center justify-center text-center">
            <p className="text-[14px] font-regular">
            버튼을 눌러 <span className="font-semibold">어르신 정보</span> 또는 <br />
            <span className="font-semibold">요양보호사 채용 공고</span>를 등록해보세요!
            </p>
            {/* 닫기 버튼 */}
            <button onClick={() => setShowJobAlert(false)} className="absolute top-2 right-3">
            ✖
            </button>
            {/* 말풍선 꼬리 */}
            <div className="absolute top-[-15px] left-[85%] -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-[#6EB5CB] "></div>
        </div>
        )}

        {/* 검색 입력창 */}
        <div className="w-[90%] max-w-md mt-4 flex items-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
            <Search className="text-gray-400" size={18} />
            <input
            type="text"
            placeholder="어르신 이름 검색"
            className="w-full pl-2 outline-none text-gray-700"
            value={searchQuery}
            onChange={handleSearch}
            />
        </div>

        {/* 검색 결과가 없을 때 */}
        {filteredElders.length === 0 ? (
            <div className="text-center mt-16">
            <p className="text-gray-500 text-lg">아직 등록된 어르신 정보가 없습니다.</p>
            <h2 className="text-[22px] font-bold mt-2 text-black">
                먼저 어르신 정보를 <br /> 등록해주세요!
            </h2>
            <button
                onClick={() => router.push("/admin/add-elder")}
                className="mt-6 text-gray-500 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-[#e07812] border-2 border-[#FF8B14] transition"
            >
                어르신 정보 등록하기
            </button>
            </div>
        ) : (
            <AnimatePresence mode="wait">
            <motion.div
                key={filteredElders[currentIndex]?.elid}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative w-[90%] max-w-md bg-white border-2 border-[#FF8B14] rounded-xl p-6 pt-1 shadow-md flex flex-col items-center text-center mt-12"
            >
                {/* 프로필 사진 */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-[75px] h-[75px] rounded-full shadow-md bg-gray-400 z-10">
                {filteredElders[currentIndex]?.elderly.profileImage ? (
                    <img
                    src={filteredElders[currentIndex].elderly.profileImage}
                    alt={`${filteredElders[currentIndex].elderly.name}님의 프로필`}
                    className="w-full h-full object-cover rounded-full"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-400 rounded-full"></div>
                )}

                {/* 추천된 요양보호사 수 표시 (크기 증가) */}
                {filteredElders[currentIndex]?.hasJobPosting && recommendedCaregivers.length > 0 && (
                    <span className="absolute -top-3 -right-3 bg-[#FF8B14] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg text-center">
                    {recommendedCaregivers.length}
                    </span>
                )}
                </div>

                {/* 어르신 정보 */}
                <p className="font-medium text-sm text-gray-600 font-bold mt-10">
                {filteredElders[currentIndex]?.elderly.location}
                </p>
                <p className="text-lg font-bold mt-1">
                {filteredElders[currentIndex]?.elderly.name}님{" "}
                <span className="text-[#767676] font-medium">
                    | {filteredElders[currentIndex]?.elderly.gender} {new Date().getFullYear() - filteredElders[currentIndex]?.elderly.birthYear}세, {filteredElders[currentIndex]?.elderly.careLevel}
                </span>
                </p>
                
                {/* "자세히 보기" 버튼 */}
                <button
                className="mt-3 border border-gray-400 text-[#767676] text-sm px-4 py-2 rounded-lg w-full max-w-[150px] hover:bg-gray-100 transition font-bold"
                onClick={() => router.push(`/elder/${filteredElders[currentIndex]?.elid}`)}
                >
                자세히 보기
                </button>

                {/* 동명이인 있을 경우 좌우 이동 버튼 유지 */}
                {filteredElders.length > 1 && (
                <>
                    <button onClick={handlePrev} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF8B14] hover:scale-110 transition">
                    <ChevronLeft size={24} />
                    </button>
                    <button onClick={handleNext} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FF8B14] hover:scale-110 transition">
                    <ChevronRight size={24} />
                    </button>
                </>
                )}
            </motion.div>
            </AnimatePresence>
        )}

        {/* 어르신의 채용 공고 상태에 따른 UI */}
        {filteredElders[currentIndex]?.hasJobPosting ? (
        caregivers.length === 0 ? (
            /* 🔹 채용 공고 등록 O, 추천할 요양보호사가 없음 → 두 번째 이미지 */
            <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">채용 조건과 유사한 요양보호사를 찾고 있습니다.</p>
            <h2 className="text-[22px] font-bold mt-2">조금만 기다려주세요!</h2>
            </div>
        ) : (
            /* 🔹 채용 공고 등록 O, 추천 요양보호사 있음 → 세 번째 이미지 */
            caregivers
                .filter((caregiver) => caregiver.isActive) // isActive가 true인 경우만 필터링
                .map((caregiver) => (
                    <div key={caregiver.id} className="w-[90%] max-w-md bg-white rounded-xl p-5 shadow-md border border-gray-200 mt-4">
                    {/* 상단 (프로필 사진 + 정보) */}
                    <div className="flex items-center gap-3">
                        <div className="w-[50px] h-[50px] bg-gray-300 rounded-lg"></div>
                        <div className="flex flex-col">
                        <p className="text-lg font-bold">{caregiver.name}님 <span className="text-sm text-gray-500 font-medium">요양보호사</span></p>
                        <p className="text-[#505050] text-sm font-semibold">{caregiver.location}</p>
                        <div className="flex gap-2 mt-1">
                        <span className="border border-[#6EB5CB] text-[#2A9EC2] text-xs px-3 py-1 rounded-full">
                        {caregiver.experience}년 경력
                        </span>
                        <span className="border border-[#6EB5CB] text-[#2A9EC2] text-xs px-3 py-1 rounded-full">
                        {caregiver.certification}
                        </span>
                        </div>
                        </div>
                    </div>

                    {/* 자기소개 */}
                    <p className="text-gray-600 text-sm mt-3 p-2 bg-gray-100 rounded-lg">
                        친절하게 어르신을 케어해드릴 수 있습니다.
                    </p>

                    {/* 조건 비교 (시급 / 요일 / 시간) */}
                    <div className="mt-3 space-y-1">
                        {/* 시급 비교 */}
                        <div className="flex items-center gap-2">
                            {caregiver.jobInfo.hourlyWage > (elders[currentIndex]?.conditions?.wage ?? 0) ? (
                                <>
                                    <img src="/assets/조건 불일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">시급</span>
                                    <span className="text-lg font-bold">{caregiver.jobInfo.hourlyWage.toLocaleString()}원</span>
                                    <span className="text-red-500 text-sm font-medium">
                                        (+{(caregiver.jobInfo.hourlyWage - (elders[currentIndex]?.conditions?.wage ?? 0)).toLocaleString()}원)
                                    </span>
                                </>
                            ) : (
                                <>
                                    <img src="/assets/조건 일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">시급</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.hourlyWage.toLocaleString()}원</span>
                                    {caregiver.jobInfo.hourlyWage < (elders[currentIndex]?.conditions?.wage ?? 0) && (
                                        <span className="text-green-500 text-sm font-medium">
                                            (-{((elders[currentIndex]?.conditions?.wage ?? 0) - caregiver.jobInfo.hourlyWage).toLocaleString()}원)
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 요일 비교 */}
                        <div className="flex items-center gap-2">
                            {caregiver.jobInfo.days.includes("모든 요일 가능") ? (
                                <>
                                    <img src="/assets/조건 일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">요일</span>
                                    <span className="text-md font-bold">모든 요일 가능</span>
                                </>
                            ) : (elders[currentIndex]?.conditions?.days || []).every(day => !caregiver.jobInfo.days.includes(day)) ? (
                                <>
                                    <img src="/assets/조건 불일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">요일</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.days.join(", ")}</span>
                                </>
                            ) : (elders[currentIndex]?.conditions?.days || []).some(day => caregiver.jobInfo.days.includes(day)) ? (
                                <>
                                    <img src="/assets/조건 협의가능.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">요일</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.days.join(", ")}</span>
                                </>
                            ) : (
                                <>
                                    <img src="/assets/조건 일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">요일</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.days.join(", ")}</span>
                                </>
                            )}
                        </div>

                        {/* 시간 비교 */}
                        <div className="flex items-center gap-2">
                            {checkTimeMatch(caregiver.jobInfo.times, elders[currentIndex]?.conditions?.time || "") === "full" ? (
                                <>
                                    <img src="/assets/조건 일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium"> 시간</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.times.join(", ")}</span>
                                </>
                            ) : checkTimeMatch(caregiver.jobInfo.times, elders[currentIndex]?.conditions?.time || "") === "partial" ? (
                                <>
                                    <img src="/assets/조건 협의가능.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">시간</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.times.join(", ")}</span>
                                </>
                            ) : (
                                <>
                                    <img src="/assets/조건 불일치.png" className="w-6 h-6" />
                                    <span className="text-black-500 text-lg font-medium">시간</span>
                                    <span className="text-md font-bold">{caregiver.jobInfo.times.join(", ")}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ✅ 버튼 영역 */}
                    <div className="flex justify-between mt-4">
                        {/* 🔹 제안하기 버튼 */}
                        <button 
                        className="bg-[#FF8B14] text-white px-4 py-2 rounded-lg text-sm w-[48%]"
                        onClick={() => setSelectedProposal({ id: caregiver.id, elderId: filteredElders[currentIndex]?.elid, type: "proposal" })}
                    >
                        제안하기
                    </button>
                        {/* 🔹 거절하기 버튼 */}
                        <button 
                            className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm w-[48%]"
                            onClick={() => setSelectedProposal({ id: caregiver.id, elderId: filteredElders[currentIndex]?.elid, type: "reject" })}
                        >
                            거절하기
                        </button>
                    </div>
                    </div>
                ))
        )
        ) : (
        /* 채용 공고 없음 → 첫 번째 이미지 */
        filteredElders.length > 0 && (
            <div className="text-center mt-12">
              <button
                className="flex items-center justify-center bg-[#FF8B14] text-white text-[24px] font-thin w-14 h-14 rounded-full mx-auto"
                onClick={() => router.push(`/elder/${filteredElders[currentIndex]?.elid}/register-job`)}
              >
                +
              </button>
              <h2 className="text-[22px] font-bold mt-4">채용 공고를 등록해주세요!</h2>
              <p className="text-gray-500 text-sm">
                해당 어르신을 도와드릴 요양보호사를 구해드릴게요.
              </p>
            </div>
        ))}

        {/* 모달 (제안하기 & 거절하기) */}
        {selectedProposal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                    <img 
                        src={selectedProposal.type === "proposal" ? "/assets/제안아이콘.png" : "/assets/거절아이콘.png"} 
                        alt="모달 아이콘" 
                        className="w-12 h-12 mx-auto mb-2" 
                    />
                    <h2 className="text-lg font-bold">
                        <span className="text-[#FF8B14]">
                            {selectedProposal.type === "proposal" ? "채용제안" : "제안을 거절"}
                        </span>
                        {selectedProposal.type === "proposal" ? "을 해볼까요?" : " 하시겠습니까?"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {selectedProposal.type === "proposal"
                            ? "요양보호사가 제안을 확인 후 먼저 대화를 걸어야 자세한 정보를 확인할 수 있어요."
                            : "거절한 제안 요청은 [내 정보]에서 언제든 확인할 수 있어요."}
                    </p>

                    <div className="mt-4 flex flex-col gap-2">
                        {/* ✅ 모달 버튼 (제안하기 또는 거절하기) */}
                        <button
                            className="bg-[#FF8B14] text-white p-3 rounded-lg text-sm font-semibold"
                            onClick={async () => {
                                try {
                                    const response = await fetch("/api/propose", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            caregiverId: selectedProposal.id, // ✅ 요양보호사 ID
                                            elderId: selectedProposal.elderId, // ✅ 어르신 ID
                                            type: selectedProposal.type, // ✅ "proposal" 또는 "reject"
                                        }),
                                    });

                                    const result = await response.json();
                                    if (response.ok) {
                                        console.log(`✅ 요양보호사 ${selectedProposal.id}에게 ${selectedProposal.type} 전송됨`);

                                        // ✅ 요양보호사 목록에서 해당 요양보호사 제거
                                        setCaregivers((prev) => prev.filter(caregiver => caregiver.id !== selectedProposal.id));
                                    } else {
                                        console.error("❌ 제안 전송 실패:", result.message);
                                        alert("제안 전송에 실패했습니다. 다시 시도해주세요.");
                                    }
                                } catch (error) {
                                    console.error("❌ 네트워크 오류:", error);
                                    alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
                                }

                                setSelectedProposal(null); // ✅ 모달 닫기
                            }}
                        >
                            네, {selectedProposal.type === "proposal" ? "제안 보낼게요" : "거절할게요"}
                        </button>

                        <button
                            className="border border-gray-400 text-gray-600 p-3 rounded-lg text-sm"
                            onClick={() => setSelectedProposal(null)}
                        >
                            다음에 할게요
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 하단 네비게이션 바 (위쪽 div 밖으로 이동) */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex justify-around rounded-t-3xl drop-shadow-xl z-50">
        <button
            className="text-[#FF8B14] font-semibold text-[13px] flex flex-col items-center"
            onClick={() => router.push("/")}
        >
            <div className="absolute top-[1px] w-10 h-1 bg-[#FF8B14] rounded-full"></div>
            <img src="/assets/홈화면_ON.png" className="w-[75px] h-[64px]" />
        </button>
        <button
            className="text-gray-600 text-[13px] flex flex-col items-center"
            onClick={() => router.push("/chat")}
        >
            <img src="/assets/대화하기_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        <button
            className="text-gray-600 text-[13px] flex flex-col items-center"
            onClick={() => router.push("/elders")}
        >
            <img src="/assets/어르신관리_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        <button
            className="relative text-gray-600 text-[13px] flex flex-col items-center"
            onClick={() => router.push("/admin/dashboard")}
        >
            <img src="/assets/대시보드_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        <button
            className="relative text-gray-600 text-[13px] flex flex-col items-center"
            onClick={() => router.push("/admin/my-info")}
        >
            <img src="/assets/내정보_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        </div>
    </div>
    );
}
