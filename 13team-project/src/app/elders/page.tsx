"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";

interface Elder {
  elid: number;
  center: string;
  elderly: {
    name: string;
    birthYear: number;
    gender: string;
    careLevel: string;
    location: string;
    diseases: string;
    dementiaSymptoms: string;
    cohabitant: string;
    additionalServices: string;
    workplaceDetails: string;
    description: string;
  };
  hasJobPosting: boolean;
  conditions: {
    wage: number;
    days: string[];
    time: string;
  };
}

interface Proposal {
  caregiverId: string;
  elderId: number;
  status: "pending" | "accepted" | "rejected";
}

export default function ElderManagement() {
  const router = useRouter();
  const [elders, setElders] = useState<Elder[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [jobPostingOnly, setJobPostingOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("id") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        const eldersRes = await fetch(`/api/elders?jobPostingOnly=${jobPostingOnly}`);
        const proposalsRes = await fetch("/api/propose");

        const eldersData = await eldersRes.json();
        const proposalsData = await proposalsRes.json();

        setElders(eldersData.elders || []);
        setProposals(proposalsData.proposals || []);
        setLoading(false);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [jobPostingOnly]);

  const filteredElders = elders.filter((elder) =>
    elder.elderly.name.includes(searchQuery)
  );

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단바 */}
      <div className="w-full h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center justify-between px-6 pt-8">
        <h2 className="text-lg font-semibold">센터장님</h2>
        <button onClick={() => router.push("/admin/add-elder")}>
          <Plus size={28} className="text-white" />
        </button>
      </div>

      {/* 검색 바 */}
      <div className="mt-4 px-4">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm bg-white">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="어르신 이름 검색"
            className="w-full pl-2 outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-between px-4 mt-4">
        <button
          className="bg-[#FF8B14] text-white py-2 px-4 rounded-lg text-sm font-semibold"
          onClick={() => router.push("/admin/add-elder")}
        >
          신규 등록
        </button>
        <button
          className={`border border-gray-300 py-2 px-4 rounded-lg text-sm ${
            jobPostingOnly ? "text-white bg-[#FF8B14]" : "text-gray-600"
          }`}
          onClick={() => setJobPostingOnly(!jobPostingOnly)}
        >
          {jobPostingOnly ? "전체 목록 보기" : "채용공고 등록된 어르신"}
        </button>
      </div>

      {/* 어르신 리스트 */}
      <div className="mt-4 px-4 space-y-3">
        {filteredElders.map((elder) => {
          const elderProposals = proposals.filter((p) => p.elderId === elder.elid);
          const acceptedCount = elderProposals.filter((p) => p.status === "accepted").length;
          const pendingCount = elderProposals.filter((p) => p.status === "pending").length;
          const waitingCount = elder.hasJobPosting ? elderProposals.length : 0;

          return (
            <div
              key={elder.elid}
              className="flex items-center bg-white p-3 rounded-lg shadow-md border border-gray-300 cursor-pointer"
              onClick={() => router.push(`/elder/${elder.elid}`)}
            >
              {/* 프로필 사진 */}
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold">
                {elder.elderly.name.charAt(0)}
              </div>

              {/* 정보 */}
              <div className="ml-3 flex-1">
                <p className="text-lg font-bold">
                  {elder.elderly.name}님{" "}
                  <span className="text-gray-500 text-sm">
                    {elder.elderly.birthYear}년생 {elder.elderly.careLevel}
                  </span>
                </p>

                {/* 채용 상태 표시 */}
                <div className="flex gap-3 text-sm text-gray-600 mt-1">
                  <span>
                    채용완료 <span className={`font-bold ${acceptedCount > 0 ? "text-black" : "text-gray-400"}`}>{acceptedCount}건</span>
                  </span>
                  <span>
                    진행중 <span className={`font-bold ${pendingCount > 0 ? "text-[#FF8B14]" : "text-gray-400"}`}>{pendingCount}건</span>
                  </span>
                  <span>
                    대기중 <span className={`font-bold ${waitingCount > 0 ? "text-[#FF8B14]" : "text-gray-400"}`}>{waitingCount}건</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex justify-around rounded-t-3xl drop-shadow-xl z-50">
        <button className="text-gray-600 text-[13px] flex flex-col items-center" onClick={() => router.push(`/admin?id=${encodeURIComponent(caregiverId)}`)}>
          <img src="/assets/홈화면_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center" onClick={() => router.push("/chat")}>
          <img src="/assets/대화하기_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        <button className="text-[#FF8B14] text-[13px] flex flex-col items-center" onClick={() => router.push("/elders")}>
          <img src="/assets/어르신관리_ON.png" className="w-[65px] h-[60px]" />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center" onClick={() => router.push("/dashboard")}>
          <img src="/assets/대시보드_OFF.png" className="w-[65px] h-[60px]" />
        </button>
        <button
            className="relative text-gray-600 text-[13px] flex flex-col items-center" onClick={() => router.push("/admin/my-info")}>
            <img src="/assets/내정보_OFF.png" className="w-[65px] h-[60px]" />
        </button>
      </div>
    </div>
  );
}
