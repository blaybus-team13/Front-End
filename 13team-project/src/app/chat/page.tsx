"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import io from "socket.io-client"; // ✅ 소켓 연결 추가
import "../globals.css";

const BACKEND_URL = "http://localhost:3000"; // ✅ 백엔드 주소 설정

export default function ChatList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caregiverID = searchParams.get("id") || "";

  const [caregiver, setCaregiver] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<
    { id: string; center: string; message: string; time: string; unreadCount: number; status: "active" | "closed" }[]
  >([]);
  const [role, setRole] = useState<"admin" | "caregiver" | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);
  
    newSocket.on("newMessage", (newMessage: any) => {
      console.log("📩 새로운 메시지 도착:", newMessage);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === newMessage.chatId
            ? { ...chat, message: newMessage.message, unreadCount: chat.unreadCount + 1 }
            : chat
        )
      );
    });
  
    return () => {
      newSocket.disconnect(); // ✅ 소켓 연결 해제 (정확한 타입 반환)
    };
  }, []);
  

  useEffect(() => {
    fetch(`/api/chat/auth/me`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRole(data.role);
        } else {
          setRole(null);
        }
      })
      .catch((error) => console.error("사용자 정보 가져오기 오류:", error));
  }, []);

  useEffect(() => {
    fetch(`/api/caregiver?id=${caregiverID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.caregiver) {
          setCaregiver(data.caregiver);
        } else {
          setCaregiver(null); // ✅ 데이터가 없을 경우 null 처리
        }
      })
    fetch(`/api/chat`)
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((error) => console.error("채팅 목록 불러오기 오류:", error));
  }, [caregiverID]);

  const filteredChats = chats.filter((chat) => chat.center.includes(searchTerm) && chat.status === activeTab);

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white w-full font-[Pretendard]">
      <div className="w-screen h-[115px] bg-[#FF8B14] text-white rounded-b-2xl shadow-md flex items-center justify-between px-6 pt-8">
        <button onClick={() => router.push(`/caregiver?id=${caregiverID}`)} className="text-white">
          <ChevronLeft size={28} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-gray-400 rounded-full lg:w-14 lg:h-14"></div>
          <span className="text-lg lg:text-xl">
            <span className="text-[18px] font-medium">요양보호사 </span>
            <span className="text-[18px] font-semibold">{caregiver?.name}</span>
            <span className="text-[18px]">님</span>
          </span>
        </div>
        <div className="w-[28px]"></div>
      </div>

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
    </div>
  );
}
