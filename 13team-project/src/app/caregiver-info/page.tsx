"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function CaregiverProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("id") || "";

  const [caregiver, setCaregiver] = useState<{
    id: string;
    name: string;
    phone: string;
    location: string;
    certification: string;
    certImage: string;
    certType: string;
    isActive: boolean;
    careerList: string;
    isJobSeeking: boolean;
    uploadedImage: string;
    uploadedVideo: string;
    completedJobs: number;
    ongoingJobs: number;
    hasNurseCert: boolean;
    selectedNurseLevel: string | null;
    hasSocialWorkerCert: boolean;
    intro: string;
    hasCar: boolean;
    dementiaTraining: boolean;
    jobInfo: {
        hourlyWage: number;
        days: string[];
        times: string[];
      };
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
  const [isTabExpanded, setIsTabExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [tabPosition, setTabPosition] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  

  useEffect(() => {
    if (!caregiverId) return;
  
    fetch(`/api/caregiver?id=${caregiverId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API 응답 데이터:", data); // ✅ 데이터 확인용 로그 추가
        if (data.success && data.caregiver) {
          setCaregiver({
            ...data.caregiver,
            certType: data.caregiver.hasNurseCert
              ? `간호조무사 ${data.caregiver.selectedNurseLevel || "등급 미정"}`
              : data.caregiver.hasSocialWorkerCert
              ? "사회복지사"
              : data.caregiver.hasCaregiverCert
              ? "요양보호사"
              : "자격증이 없습니다.", // ✅ hasCaregiverCert도 없으면 "자격증이 없습니다."로 설정
            conditions: data.caregiver.conditions || { wage: null, days: [], time: "미정" },
          });
        }
      })
      .catch((error) => console.error("요양보호사 데이터 오류:", error));
  }, [caregiverId]);  

  useEffect(() => {
    if (!caregiver) return;

    fetch(`/api/propose?caregiverId=${caregiver.id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                setProposals(data.proposals || []);
            }
        })
        .catch((error) => console.error("제안 목록 불러오기 오류:", error));
    }, [caregiver]);

  useEffect(() => {

    if (proposals.length === 0) {
        setelders([]); // 제안이 없을 경우 빈 배열 유지
        return;
    }

    const elderIds = proposals.map((proposal) => proposal.elderId);

    fetch("/api/elders")
        .then((res) => res.json())
        .then((data) => {
            const matchedElders = data.elders.filter((elder: any) =>
                elderIds.includes(elder.elid)
            );
            setelders(matchedElders);
        })
        .catch((error) => console.error("어르신 정보 불러오기 오류:", error));
  }, [proposals]);

  const toggleJobStatus = () => {
    if (!caregiver) return;

    if (!caregiver.isJobSeeking) {
      alert("구직 정보를 먼저 입력해주세요!");
      return;
    }

    fetch("/api/caregiver", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: caregiver.id, isActive: !caregiver.isActive }),
    })
      .then((res) => res.json())
      .then((updatedData) => {
        if (updatedData.success) {
          setCaregiver((prev) =>
            prev ? { ...prev, isActive: updatedData.data.isActive } : null
          );
        } else {
          alert(updatedData.message);
        }
      })
      .catch((error) => console.error("API 오류:", error));
  };

  let parsedCareerList = [];
  try {
    parsedCareerList = caregiver?.careerList ? JSON.parse(caregiver.careerList) : [];
  } catch (error) {
    console.error("경력 데이터 파싱 오류:", error);
    parsedCareerList = [];
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl); // ✅ 미리보기 설정

    // ✅ 파일을 서버에 업로드 (예제)
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch(`/api/caregiver?id=${caregiverId}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setCaregiver((prev) => prev ? { ...prev, uploadedVideo: data.videoUrl } : null);
      }
    } catch (error) {
      console.error("비디오 업로드 오류:", error);
    }
  };

  if (!caregiver) return <p className="text-center text-gray-500">로딩 중...</p>;

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white w-full font-[Pretendard] pb-24">
      {/* 상단바 */}
      <div className="w-screen h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center justify-between px-6 pt-8">
        {/* 프로필 아이콘 & 이름 */}
        <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          {caregiver.uploadedImage ? (
            <img src={caregiver.uploadedImage} alt="프로필" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-gray-500">👤</span>
          )}
          </div>
          <span className="text-lg lg:text-xl">
            <span className="text-[18px] font-medium">요양보호사 </span>
            <span className="text-[18px] font-semibold">{caregiver.name}</span>
            <span className="text-[18px]">님</span>
          </span>
        </div>

        {/* 토글 버튼 (구직 정보 등록 후 활성화) */}
        <button
          className={`relative w-[82px] h-[32px] flex items-center justify-between px-2 rounded-full text-sm transition-all ${
            caregiver.isJobSeeking
              ? caregiver.isActive
                ? "bg-[#6EB5CB] text-white font-semibold"
                : "bg-gray-400 text-white font-semibold"
              : "bg-gray-300 text-gray-500"
          }`}
          onClick={toggleJobStatus} // 클릭 가능하게 변경
        >
          <span
            className={`text-[11px] absolute left-9 transition-opacity ${
              caregiver.isActive ? "opacity-0" : "opacity-100"
            }`}
          >
            휴식중
          </span>
          <span
            className={`text-[11px] absolute right-9 transition-opacity ${
              caregiver.isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            구직중
          </span>
          <div
            className={`absolute top-0.2 bottom-0.2 ${
              caregiver.isActive ? "right-1" : "left-1"
            } w-[25px] h-[25px] rounded-full bg-white transition-all`}
          ></div>
        </button>
      </div>

      {/* ✅ 영상 추가 */}
      <div className="w-full p-4 text-center">
        <h3 className="text-lg font-semibold">자신을 소개하는 영상을 추가해보세요!</h3>
        {videoPreview || caregiver.uploadedVideo ? (
          <video controls className="w-full mt-2 rounded-lg">
            <source src={videoPreview || caregiver.uploadedVideo} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
            <label htmlFor="videoUpload" className="cursor-pointer">
              🎥 영상 추가하기
            </label>
          </div>
        )}
        <input type="file" id="videoUpload" accept="video/*" className="hidden" onChange={handleVideoUpload} />
      </div>

      {/* ✅ 드래그 기능이 적용된 탭 */}
      <motion.div
        className="w-full flex flex-col border-b mt-4 bg-white shadow-md rounded-t-lg"
        drag="y"
        dragConstraints={{ top: -200, bottom: 200 }}
        animate={{ y: isTabExpanded ? 0 : 200 }}
        transition={{ type: "spring", stiffness: 100 }}
        onDrag={(event, info) => setTabPosition(info.offset.y)}
        onDragEnd={() => {
          if (tabPosition > 100) setIsTabExpanded(false);
          if (tabPosition < -100) setIsTabExpanded(true);
        }}
      >
        <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-2 mb-2"></div>

        {/* ✅ 탭 버튼 */}
        <div className="flex justify-around cursor-pointer p-2 border-b bg-white shadow-md w-full">
          {["기본 정보", "경력 관리", "근무 조건"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-4 text-sm font-semibold transition-colors ${
                activeTab === tab ? "border-b-2 border-[#FF8B14] text-[#FF8B14]" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

      {/* ✅ 프로필 카드 */}
      <div className="w-[90%] mx-auto bg-white shadow-md rounded-lg p-4 mt-4 flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          {caregiver.uploadedImage ? (
            <img src={caregiver.uploadedImage} alt="프로필" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-gray-500">👤</span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold">{caregiver.name}님</h3>
          <p className="text-sm text-gray-500">{caregiver.intro || "친절하게 케어해드립니다."}</p>
          <div className="flex text-sm text-gray-600 mt-1">
            <span className="mr-4">채용완료 <b>{caregiver.completedJobs}</b>건</span>
            <span>진행중 <b>{elders.length}</b>건</span>
          </div>
        </div>
      </div>

      {/* ✅ 탭 콘텐츠 */}
      <div className="w-full p-4">
        {activeTab === "기본 정보" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-lg font-semibold mb-2">개인 정보</h3>
            <div className="flex flex-col mb-2">
              <label className="text-gray-700 text-sm font-medium mb-1">이름</label>
              <input type="text" value={caregiver.name} className="w-full p-3 border rounded-lg text-gray-700" readOnly />
            </div>
            <div className="flex flex-col mb-2">
              <label className="text-gray-700 text-sm font-medium mb-1">전화번호</label>
              <input type="text" value={caregiver.phone} className="w-full p-3 border rounded-lg text-gray-700" readOnly />
            </div>
            <div className="flex flex-col mb-2">
              <label className="text-gray-700 text-sm font-medium mb-1">주소</label>
              <input type="text" value={caregiver.location} className="w-full p-3 border rounded-lg text-gray-700" readOnly />
            </div>
            <h3 className="text-lg font-semibold mt-4">자격 정보</h3>
              <input type="text" value={caregiver.certification} className="w-full p-3 border rounded-lg text-gray-700 mb-2" readOnly />
              <input type="text" value={caregiver.certType} className="w-full p-3 border rounded-lg text-gray-700 mb-2" readOnly />
              {caregiver.uploadedImage && <img src={caregiver.uploadedImage} alt="자격증" className="w-full mt-2 rounded-lg border" />}
            </motion.div>
        )}

        {activeTab === "경력 관리" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-lg font-semibold mb-2">경력 관리</h3>
            {parsedCareerList.length > 0 ? (
              <div className="mt-2 space-y-2">
                {parsedCareerList.map((exp: { institution: string; task: string; term: string }, index: number) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg shadow-sm flex justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">{exp.institution}</h4>
                      <p className="text-xs text-gray-500">{exp.task}</p>
                    </div>
                    <span className="text-sm text-gray-500">{exp.term}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 mt-4">등록된 경력이 없습니다.</p>
            )}
          </motion.div>
        )}

        {activeTab === "근무 조건" && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">근무 조건</h3>
                    <div className="flex justify-between">
                    <span className="text-gray-700 text-lg">시급</span>
                    <span className="text-lg font-semibold text-[#FF8B14]">
                    {caregiver.jobInfo.hourlyWage ? `${caregiver.jobInfo.hourlyWage.toLocaleString()}원 이상` : "협의 가능"}
                    </span>
                    </div>
                    {/* ✅ 근무 요일 */}
                    <div className="flex flex-wrap justify-between mt-4">
                        <span className="text-gray-700 text-lg">요일</span>
                        <div className="flex flex-wrap space-x-2">
                            {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                                <span
                                    key={day}
                                    className={`px-4 py-2 border rounded-lg ${
                                        caregiver.jobInfo.days?.map(d => d.replace("요일", "")).includes(day)
                                            ? "bg-[#FF8B14] text-white"
                                            : "text-gray-600 border-gray-300"
                                    }`}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* ✅ 근무 시간 */}
                    <div className="flex justify-between mt-4">
                        <span className="text-gray-700 text-lg">근무 시간</span>
                        <span className="text-lg text-gray-700">
                        {caregiver.jobInfo.times ? caregiver.jobInfo.times : "미정"}
                        </span>
                    </div>
                </div>
            )}
        </div>

      </motion.div>

      {/* 하단바 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex justify-around rounded-t-3xl drop-shadow-xl z-50">
        <button className="relative text-[#FF8B14] font-semibold text-[13px] flex flex-col items-center">
          <img src="/assets/홈화면_OFF.png" alt="홈" className="w-[72px] h-[64px]"
          onClick={() => router.push(`/caregiver?id=${caregiverId}`)}
          />
        </button>
        <button
          className="text-gray-600 text-[13px] flex flex-col items-center"
          onClick={() => router.push(`/chat?id=${caregiverId}`)} // 채팅 페이지로 이동
        >
          <img src="/assets/대화하기_OFF.png" alt="대화하기" className="w-[72px] h-[64px] mb-1" />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center">
          <div className="absolute top-[-1px] w-10 h-1 bg-[#FF8B14] rounded-full"></div>
          <img src="/assets/구직정보관리_ON.png" alt="구직 정보 관리" className="w-[72px] h-[64px]" 
          onClick={() => router.push(`/caregiver-info?id=${caregiverId}`)}
        />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center">
          <img src="/assets/프로필.png" alt="프로필" className="w-[72px] h-[64px]" 
          onClick={() => router.push(`/caregiverProfile?id=${caregiverId}`)}
          />
        </button>
      </div>
    </div>
  );
}
