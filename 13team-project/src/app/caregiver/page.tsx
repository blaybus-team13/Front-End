"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../globals.css";
import { X } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const [caregiver, setCaregiver] = useState<{
    id: string;
    name: string;
    isJobSeeking: boolean;
    isActive: boolean;
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

  const [showJobAlert, setShowJobAlert] = useState(true);
  const [selectedElders, setSelectedElders] = useState<number | null>(null);
  const [showJobWarning, setShowJobWarning] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChatElder, setSelectedChatElder] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("id") || ""; // URL에서 id 값 가져오기


  // 제안 받은 어르신 필터링
  const filteredElders = elders.filter((elder) => elder.forced || elder.hasJobPosting);

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

  useEffect(() => {
    fetch(`/api/caregiver?id=${caregiverId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API 응답 데이터:", data);
        if (data.success && data.caregiver) {
          setCaregiver(data.caregiver); 
        } else {
          setCaregiver(null);
        }
      })
      .catch((error) => {
        console.error("요양보호사 데이터 오류:", error);
      });
  }, [caregiverId]);
  

   /** 요양보호사 제안 목록 불러오기 */
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


   /** 받은 제안에 대한 어르신 정보 불러오기 */
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

            console.log("제안 받은 노인 ID 목록:", elderIds);
            console.log("elders 상태 값:", matchedElders);
        })
        .catch((error) => console.error("어르신 정보 불러오기 오류:", error));
  }, [proposals]);


  /** 구직 상태 변경 (구직 중 ↔ 휴식 중) */
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

  /** 구직 정보 추가 화면으로 이동 */
  const navigateToJobInfo = () => {
    router.push(`/job-info?id=${encodeURIComponent(caregiverId)}`);
  };

  if (!caregiver) return <p className="text-center text-gray-500">로딩 중...</p>;

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white w-full font-[Pretendard] pb-24">
      {/* 상단바 */}
      <div className="w-screen h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center justify-between px-6 pt-8">
        {/* 프로필 아이콘 & 이름 */}
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-gray-400 rounded-full lg:w-14 lg:h-14"></div>
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

      {/* 경고 메시지 (구직 정보 없을 때) */}
      {showJobWarning && (
        <div className="mt-4 p-3 bg-red-500 text-white rounded-md">
          구직 정보를 먼저 입력해주세요!
          <button onClick={() => setShowJobWarning(false)} className="ml-2 text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 일자리 제안 안내 */}
      {showJobAlert && (
        <div className="absolute top-[125px] left-1/2 transform -translate-x-1/2 w-[303px] md:w-[50%] lg:w-[60%] xl:w-[70%] max-w-[800px] px-4">
          <div className="relative bg-[#6EB5CB] text-white w-[303px] h-[41px] flex items-center justify-between rounded-full shadow-lg">
            <span className="text-[16px] font-regular text-left tracking-tight whitespace-nowrap ml-6">
              버튼을 눌러 <span className="font-semibold">일자리 제안</span>을 받아보세요!
            </span>
            <button onClick={() => setShowJobAlert(false)} className="absolute right-4">
              <X size={20} className="text-white" />
            </button>
          </div>
          <div className="absolute top-[-14px] left-[79%] transform -translate-x-1/2 -rotate-45 w-[30px] h-[28px] bg-[#6EB5CB] z-[-1]"></div>
        </div>
      )}

      {/* 구직 정보가 없는 경우 → "구직 정보 추가해주세요!" 표시 */}
      {!caregiver.isJobSeeking ? (
        <div className="flex-1 flex flex-col items-center justify-start w-full px-4 text-center mt-14">
          <p className="text-gray-700 text-[18px] lg:text-lg">
            어르신과의 원활한 매칭을 위해선 <br />
            요양보호사님의 정보가 더 필요해요
          </p>
          <h2 className="text-[32px] lg:text-2xl font-bold mt-2">
            나의 구직 정보를 <br /> 추가해주세요!
          </h2>
          <button
            onClick={navigateToJobInfo}
            className="mt-8 w-[320px] bg-[#FF8B14] text-white text-[16px] font-semibold p-4 rounded-lg lg:text-lg lg:p-5"
          >
            내 정보 더 추가하러 가기
          </button>
        </div>
        ) : !caregiver.isActive ? (
          // 휴식 중 상태일 때 (업로드한 이미지와 동일한 UI)
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4 text-center mt-20">
            <p className="text-gray-500 font-medium text-[18px]">모든 근무 제안을 받지 않습니다.</p>
            <h2 className="text-[32px] lg:text-2xl font-bold mt-2">지금은 휴식중이에요!</h2>
          </div>
      ) : caregiver.isActive && elders.length > 0 ? (
        <>
          {/* 제안이 있을 때 알림 배너 (배너만 숨기기) */}
          {showBanner && (
            <div className="w-[90%] border border-[#FF8B14] rounded-2xl text-[#FF8B14] text-center p-2 font-semibold flex justify-between items-center mt-4">
              <span>새로운 제안이 {elders.length}건 들어왔어요!</span>
              <button onClick={() => setShowBanner(false)} className="text-[#FF8B14]">
                <X size={20} />
              </button>
            </div>
          )}

          {/* 제안 목록 (배너와 무관하게 유지) */}
          <div className="w-full px-4 mt-4">
            {elders.map((elder, index) => {
              // 조건이 undefined일 경우 기본값 설정
              const { wage, days, time } = elder.conditions ?? { wage: 0, days: [], time: "" };

              const caregiverWage = caregiver?.jobInfo?.hourlyWage || 0;
              const caregiverDays = caregiver?.jobInfo?.days || [];
              const caregiverTimes = caregiver?.jobInfo?.times || [];

              const wageDiff = wage - caregiverWage;
              const missingDays = days.filter(day => !caregiverDays.includes(day));
              const extraDays = caregiverDays.filter(day => !days.includes(day));
              const isTimeMatch = caregiverTimes.includes(time);
              const isPartialTimeMatch = caregiverTimes.some(t => time.includes(t));

              return (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-md mb-4 w-full max-w-md border border-gray-200">
                  {/* 상단: 기관명 & 어르신 정보 */}
                  <div className="flex items-start gap-3">
                    <div className="w-[50px] h-[50px] bg-gray-300 rounded-lg"></div>
                    <div className="flex flex-col">
                      <p className="text-gray-500 text-sm">{elder.elderly.location}</p>
                      <h3 className="text-lg font-bold">{elder.center}</h3>
                      <p className="text-sm text-gray-500">
                        <span className="font-black text-black">{elder.elderly.name}님</span> | {elder.elderly.gender}{" "}
                        {new Date().getFullYear() - elder.elderly.birthYear}세, {elder.elderly.careLevel}
                      </p>
                    </div>
                  </div>

                  {/* 설명 문구 */}
                  <p className="text-gray-600 text-sm mt-3 p-2 bg-gray-100 rounded-lg">
                    {elder.elderly.description}
                  </p>

                  {/* 시급 비교 */}
                  <div className="flex items-center gap-2">
                      {caregiver.jobInfo.hourlyWage >= (elders[currentIndex]?.conditions?.wage ?? 0) ? (
                          <>
                              <img src="/assets/조건 일치.png" className="w-6 h-6" />
                              <span className="text-black-500 text-lg font-medium">시급</span>
                              <span className="text-lg font-bold">{caregiver.jobInfo.hourlyWage.toLocaleString()}원</span>
                              {caregiver.jobInfo.hourlyWage > (elders[currentIndex]?.conditions?.wage ?? 0) && (
                                  <span className="text-green-500 text-sm font-medium">
                                      (+{(caregiver.jobInfo.hourlyWage - (elders[currentIndex]?.conditions?.wage ?? 0)).toLocaleString()}원)
                                  </span>
                              )}
                          </>
                      ) : (
                          <>
                              <img src="/assets/조건 불일치.png" className="w-6 h-6" />
                              <span className="text-black-500 text-lg font-medium">시급</span>
                              <span className="text-md font-bold">{caregiver.jobInfo.hourlyWage.toLocaleString()}원</span>
                              <span className="text-red-500 text-sm font-medium">
                                  (-{((elders[currentIndex]?.conditions?.wage ?? 0) - caregiver.jobInfo.hourlyWage).toLocaleString()}원)
                              </span>
                          </>
                      )}
                  </div>

                  {/* 요일 비교 */}
                  <div className="flex items-center gap-2">
                    {caregiver.jobInfo.days.includes("모든 요일 가능") || 
                    (elders[currentIndex]?.conditions?.days ?? []).every(day => caregiver.jobInfo.days.includes(day)) ? (
                        <>
                            <img src="/assets/조건 일치.png" className="w-6 h-6" />
                            <span className="text-black-500 text-lg font-medium">요일</span>
                            <span className="text-md font-bold">{caregiver.jobInfo.days.join(", ")}</span>
                        </>
                    ) : (elders[currentIndex]?.conditions?.days ?? []).some(day => caregiver.jobInfo.days.includes(day)) ? (
                        <>
                            <img src="/assets/조건 협의가능.png" className="w-6 h-6" />
                            <span className="text-black-500 text-lg font-medium">요일</span>
                            <span className="text-md font-bold">{caregiver.jobInfo.days.join(", ")}</span>
                        </>
                    ) : (
                        <>
                            <img src="/assets/조건 불일치.png" className="w-6 h-6" />
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
                              <span className="text-black-500 text-lg font-medium">시간</span>
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

                  {/* 버튼 영역 */}
                  <div className="flex justify-between mt-4 w-full">
                    {/* 대화하기 버튼 */}
                    <button
                      className="bg-[#FF8B14] text-white p-3 rounded-lg text-sm w-[48%]"
                      onClick={() => setSelectedChatElder(elder.id)} // elder.id 저장
                    >
                      대화하기
                    </button>
                    {/* 거절하기 버튼 (기존 기능 유지) */}
                    <button
                      className="border border-gray-200 text-gray-600 p-3 rounded-lg text-sm w-[48%]"
                      onClick={() => setSelectedElders(elder.id)}
                    >
                      거절하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 text-center mt-10">
          <p className="text-gray-700 text-[16px] lg:text-lg">아직은 일자리 제안이 들어오지 않았어요</p>
          <h2 className="text-[24px] lg:text-2xl font-bold mt-2">조금만 기다려주세요!</h2>
        </div>
      )}

      {/* 기존 거절하기 모달 유지 */}
      {selectedElders !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <img src="/assets/거절아이콘.png" alt="경고" className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-lg font-bold">제안을 <span className="text-[#FF8B14]">거절</span>하시겠습니까?</h2>
            <p className="text-gray-500 text-sm mt-2">거절한 제안은 [프로필] - [최근 제안 보기]에서<br />언제든 확인할 수 있어요.</p>

            <div className="mt-4 flex flex-col gap-2">
            <button
              className="bg-[#FF8B14] text-white p-3 rounded-lg text-sm font-semibold"
              onClick={() => {
                setelders((prev) => prev.filter((elder) => elder.id !== selectedElders)); // 목록에서 삭제
                setSelectedElders(null); // 모달 닫기
              }}
            >
              네, 거절할게요
            </button>
              <button
                className="border border-gray-200 text-gray-600 p-3 rounded-lg text-sm"
                onClick={() => setSelectedElders(null)}
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추가된 대화하기 모달 */}
      {selectedChatElder !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center h-80">
            <img src="/assets/제안아이콘.png" alt="채팅" className="w-14 h-14 mx-auto mb-2 mt-3" />
            <h2 className="text-lg font-bold mt-3">
              <span className="text-[#FF8B14]">대화</span>를 걸어볼까요?
            </h2>
            <p className="text-gray-500 font-medium text-sm mt-2">
              대화를 시작하게 되면 자세한 어르신의<br /> 정보와 근무 내용을 확인할 수 있어요.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {/* 대화 시작 버튼: 채팅 페이지로 이동 */}
              <button
                className="bg-[#FF8B14] text-white p-3 rounded-lg text-sm font-semibold"
                onClick={() => {
                  const elder = elders.find(e => e.id === selectedChatElder);
                  if (elder) {
                    router.push(`/ChatRoom?id=${caregiverId}&elderId=${elder.id}`);
                  }
                }}
              >
                네, 대화 시작할게요
              </button>

              {/* 취소 버튼: 모달 닫기 */}
              <button
                className="border border-gray-200 text-gray-600 p-3 rounded-lg text-sm"
                onClick={() => setSelectedChatElder(null)}
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단바 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex justify-around rounded-t-3xl drop-shadow-xl z-50">
        <button className="relative text-[#FF8B14] font-semibold text-[13px] flex flex-col items-center">
          <div className="absolute top-[-10px] w-10 h-1 bg-[#FF8B14] rounded-full"></div>
          <img src="/assets/홈화면_ON.png" alt="홈" className="w-[72px] h-[64px]" />
        </button>
        <button
          className="text-gray-600 text-[13px] flex flex-col items-center"
          onClick={() => router.push(`/chat?id=${caregiverId}`)} // 채팅 페이지로 이동
        >
          <img src="/assets/대화하기_OFF.png" alt="대화하기" className="w-[72px] h-[64px] mb-1" />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center">
          <img src="/assets/구직정보관리_OFF.png" alt="구직 정보 관리" className="w-[72px] h-[64px]" 
          onClick={() => router.push(`/caregiver-info?id=${caregiverId}`)}
        />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center">
          <img src="/assets/내정보_OFF.png" alt="프로필" className="w-[72px] h-[64px]" 
          onClick={() => router.push(`/caregiverProfile?id=${caregiverId}`)}
          />
        </button>
      </div>
    </div>
  );
}
