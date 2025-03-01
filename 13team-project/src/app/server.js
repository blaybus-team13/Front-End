const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

let chats = {}; // 채팅 데이터 저장
let elders = {
  "1": {
    name: "김하은",
    birthYear: 1945,
    gender: "여",
    careLevel: "3등급",
    weight: 55,
    diseases: "고혈압, 당뇨",
    dementiaSymptoms: "약간의 기억력 저하",
    cohabitant: "배우자와 함께 거주",
    workplaceDetails: "아파트 3층, 엘리베이터 있음",
    additionalServices: "병원 동행 필요",
    location: "서울시 강동구 천호동",
  },
};

// ✅ 노인 프로필 조회 API
app.get("/api/elder-profile", (req, res) => {
  const elderId = req.query.elderId;
  if (!elders[elderId]) {
    return res.status(404).json({ success: false, message: "노인 정보 없음" });
  }
  res.json({ success: true, profile: elders[elderId] });
});

// ✅ 채팅 데이터 불러오기
app.get("/api/chat", (req, res) => {
  const { caregiverId, elderId } = req.query;
  const chatId = `${caregiverId}-${elderId}`;
  res.json({ messages: chats[chatId] || [] });
});

// ✅ 소켓 연결 설정
io.on("connection", (socket) => {
  console.log("🔥 새 클라이언트 연결됨!");

  socket.on("joinRoom", ({ chatId }) => {
    socket.join(chatId);
    console.log(`✔️ 채팅방 입장: ${chatId}`);
  });

  socket.on("sendMessage", ({ chatId, senderId, content, type }) => {
    const newMessage = { senderId, content, type, createdAt: new Date() };

    if (!chats[chatId]) chats[chatId] = [];
    chats[chatId].push(newMessage);

    io.to(chatId).emit("newMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("❌ 클라이언트 연결 해제");
  });
});

// ✅ 서버 실행
server.listen(5000, () => {
  console.log("✅ 서버 실행 중: http://localhost:5000");
});
