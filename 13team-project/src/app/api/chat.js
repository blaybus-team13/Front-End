const express = require("express");
const router = express.Router();
const { elders } = require("/api/elders"); // elders API 데이터 가져오기

// ✅ 메모리 기반 채팅 저장소
let chats = []; // 채팅방 목록
let messages = {}; // 채팅 메시지 저장 { chatId: [messages] }

/**
 * ✅ 1. 채팅방 생성 시, 노인 프로필을 자동으로 첫 메시지로 추가
 * 요청: POST /api/chat
 * body: { carerId, centerId, elderId }
 */
router.post("/", (req, res) => {
  const { carerId, centerId, elderId } = req.body;

  if (!carerId || !centerId || !elderId) {
    return res.status(400).json({ success: false, message: "필수 데이터 누락" });
  }

  const chatId = `${carerId}_${centerId}_${elderId}`;
  if (!chats.find((c) => c.chatId === chatId)) {
    chats.push({ chatId, carerId, centerId, elderId });
    messages[chatId] = [];

    // ✅ 노인 정보 찾기
    const elderData = elders.find((e) => e.elid === parseInt(elderId));
    if (elderData) {
      const profileMessage = {
        senderId: "system",
        content: `👴 어르신 프로필 정보: \n\n이름: ${elderData.elderly.name} \n나이: ${
          new Date().getFullYear() - elderData.elderly.birthYear
        }세 \n성별: ${elderData.elderly.gender} \n요양 등급: ${elderData.elderly.careLevel} \n거주지: ${
          elderData.elderly.location
        } \n질병: ${elderData.elderly.diseases} \n\n📌 근무 조건: \n시급: ${
          elderData.conditions.wage
        }원 \n요일: ${elderData.conditions.days.join(", ")} \n근무 시간: ${elderData.conditions.time}`,
        createdAt: new Date(),
      };

      // ✅ 첫 메시지로 자동 전송
      messages[chatId].push(profileMessage);
    }
  }

  res.json({ success: true, chatId, messages: messages[chatId] || [] });
});

/**
 * ✅ 2. 특정 채팅방 메시지 가져오기
 * 요청: GET /api/chat/:chatId
 */
router.get("/:chatId", (req, res) => {
  const { chatId } = req.params;
  res.json({ success: true, messages: messages[chatId] || [] });
});

/**
 * ✅ 3. 메시지 전송
 * 요청: POST /api/chat/send
 * body: { chatId, senderId, content }
 */
router.post("/send", (req, res) => {
  const { chatId, senderId, content } = req.body;

  if (!chatId || !senderId || !content) {
    return res.status(400).json({ success: false, message: "필수 데이터 누락" });
  }

  const newMessage = {
    senderId,
    content,
    createdAt: new Date(),
  };

  // ✅ 메시지 저장
  if (!messages[chatId]) messages[chatId] = [];
  messages[chatId].push(newMessage);

  res.json({ success: true, message: newMessage });
});

module.exports = router;
