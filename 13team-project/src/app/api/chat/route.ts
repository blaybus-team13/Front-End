import { NextResponse } from "next/server";

// 채팅방 데이터 저장소
let chats: {
  chatId: string;
  caregiverId: string;
  adminId: string;
  elderId?: number; // 어르신 ID 저장
  messages: { senderId: string; content: string; createdAt: string }[];
}[] = [];

/** ✅ 채팅방 생성 */
export async function POST(req: Request) {
  try {
    const { caregiverId, adminId } = await req.json();

    if (!caregiverId || !adminId) {
      return NextResponse.json(
        { success: false, message: "caregiverId와 adminId가 필요합니다." },
        { status: 400 }
      );
    }

    // 해당 요양보호사의 제안에서 elderId 가져오기
    const proposalsRes = await fetch(
      `http://localhost:3000/api/propose?caregiverId=${caregiverId}`
    );
    const proposalsData = await proposalsRes.json();

    if (!proposalsData.success || proposalsData.proposals.length === 0) {
      return NextResponse.json(
        { success: false, message: "해당 요양보호사의 제안을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const elderId = proposalsData.proposals[0].elderId; // 첫 번째 제안 사용

    const chatId = `chat_${caregiverId}_${adminId}`;
    const newChat = {
      chatId,
      caregiverId,
      adminId,
      elderId,
      messages: [],
    };

    chats.push(newChat);

    return NextResponse.json(
      { success: true, chatId, elderId, messages: newChat.messages },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "채팅방 생성 실패", error }, { status: 500 });
  }
}
