"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import "../globals.css";

export default function ChatList() {
  const router = useRouter();

  const [caregiver, setCaregiver] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active"); // 진행 중 vs 종료된 대화
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<
    {
      id: string;
      center: string;
      message: string;
      time: string;
      unreadCount: number;
      status: "active" | "closed";
    }[]
  >([]);
  const [role, setRole] = useState<"admin" | "caregiver" | null>(null);
  const searchParams = useSearchParams();
  const caregiverID = searchParams.get("id") || "";

    useEffect(() => {
    fetch("/api/auth/me") // 로그인한 사용자 정보 가져오기
        .then((res) => res.json())
        .then((data) => {
        if (data.success) {
            setRole(data.role); // role: "admin" 또는 "caregiver"
        } else {
            setRole(null);
        }
        })
        .catch((error) => console.error("사용자 정보 가져오기 오류:", error));
    }, []);


  useEffect(() => {
    // 요양보호사 정보 가져오기
    fetch(`/api/caregiver?id=${caregiverID}`)
      .then((res) => res.json())
      .then((data) => setCaregiver(data))
      .catch((error) => console.error("요양보호사 정보 가져오기 오류:", error));

    // API에서 채팅 목록 가져오기
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((error) => console.error("채팅 목록 불러오기 오류:", error));
  }, [caregiverID]);

  // 검색 필터링
  const filteredChats = chats.filter(
    (chat) =>
      chat.center.includes(searchTerm) &&
      chat.status === activeTab
  );

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white w-full font-[Pretendard]">
      {/* 상단바 */}
      <div className="w-screen h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center justify-between px-6 pt-8">
        {/* 뒤로가기 버튼 */}
        <button onClick={() => router.push(`/caregiver?id=${caregiverID}`)} className="text-white">
          <ChevronLeft size={28} />
        </button>

        {/* 프로필 & 이름 */}
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-gray-400 rounded-full lg:w-14 lg:h-14"></div>
          <span className="text-lg lg:text-xl">
            <span className="text-[18px] font-medium">요양보호사 </span>
            <span className="text-[18px] font-semibold">{caregiver?.name}</span>
            <span className="text-[18px]">님</span>
          </span>
        </div>

        {/* 빈 공간 (UI 균형 유지) */}
        <div className="w-[28px]"></div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex justify-around w-full border-b border-gray-300 mt-3">
        <button
          className={`w-1/2 pb-2 text-center font-semibold ${
            activeTab === "active" ? "border-b-4 border-[#FF8B14] text-[#FF8B14]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("active")}
        >
          진행 중인 대화
        </button>
        <button
          className={`w-1/2 pb-2 text-center font-semibold ${
            activeTab === "closed" ? "border-b-4 border-[#FF8B14] text-[#FF8B14]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("closed")}
        >
          종료된 대화
        </button>
      </div>

      {/* 검색 바 */}
      <div className="relative w-[90%] mt-4">
        <input
          type="text"
          placeholder="센터 혹은 어르신 성명을 검색하세요"
          className="w-full p-3 pl-10 border border-gray-300 rounded-full text-sm focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* 채팅 목록 */}
      <div className="w-full px-4 mt-4">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] bg-gray-300 rounded-full"></div>
                <div className="flex flex-col">
                  <h3 className="text-md font-semibold">{chat.center}</h3>
                  <p className="text-sm text-gray-500">{chat.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-400 text-xs">{chat.time}</span>
                {chat.unreadCount > 0 && (
                  <span className="bg-[#FF8B14] text-white text-xs font-semibold px-2 py-1 rounded-full mt-1">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-10">채팅이 없습니다.</p>
        )}
      </div>

      {/* 하단바 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex justify-around rounded-t-3xl drop-shadow-xl z-50">
        <button
            className="text-gray-600 text-[13px] flex flex-col items-center"
            onClick={() => router.push(`/caregiver?id=${caregiverID}`)}
        >
            <img src="/assets/홈화면_OFF.png" alt="홈" className="w-[72px] h-[64px]" />
        </button>
        <button
          className="text-gray-600 text-[13px] flex flex-col items-center"
          
          onClick={() => router.push("/chat")} // 채팅 페이지로 이동
        >
          <div className="absolute top-[2px] w-10 h-1 bg-[#FF8B14] rounded-full"></div>
          <img src="/assets/대화하기_ON.png" alt="대화하기" className="w-[72px] h-[64px] mb-1" />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center">
          <img src="/assets/구직정보관리.png" alt="구직 정보 관리" className="w-[72px] h-[64px]" />
        </button>
        <button className="text-gray-600 text-[13px] flex flex-col items-center">
          <img src="/assets/프로필.png" alt="프로필" className="w-[72px] h-[64px]" />
        </button>
      </div>
    </div>
  );
}

