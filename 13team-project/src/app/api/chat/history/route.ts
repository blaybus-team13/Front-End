import { NextResponse } from "next/server";

let chats: {
    chatId: string;
    caregiverId: string;
    adminId: string;
    messages: { senderId: string; content: string; createdAt: string }[];
  }[] = [];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ success: false, message: "채팅방 ID가 필요합니다." }, { status: 400 });
    }

    const chat = chats.find(c => c.chatId === chatId);
    if (!chat) {
      return NextResponse.json({ success: false, message: "채팅방을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, messages: chat.messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "채팅 내역 조회 실패", error }, { status: 500 });
  }
}
