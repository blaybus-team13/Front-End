"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JobInfoPage() {
  const router = useRouter();
  const userId = 1; // ✅ 예제용 사용자 ID (실제 로그인 시스템에서는 동적으로 받아와야 함)

  // ✅ 단계별 화면 상태 (1: 요일 선택, 2: 시간 선택, 3: 희망 시급 입력)
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [hourlyWage, setHourlyWage] = useState<string>("");
  const [loading, setLoading] = useState(false); // ✅ API 요청 중 로딩 상태
  const [error, setError] = useState<string | null>(null); // ✅ API 오류 메시지

  const days = ["모든 요일 가능", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const times = ["오전 (9-12시)", "오후 (12-6시)", "저녁 (6-9시)"];

  // ✅ 요일 선택 핸들러
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // ✅ 시간 선택 핸들러
  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  // ✅ 완료 버튼 클릭 → API 요청 보내기
  const handleSubmit = async () => {
    if (!hourlyWage) {
      setError("희망 시급을 입력해주세요!");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/caregiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId, // ✅ 사용자 ID 추가
          days: selectedDays, // ✅ 개별 필드로 전달
          times: selectedTimes,
          hourlyWage: Number(hourlyWage),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "서버 오류가 발생했습니다.");

      alert("구직 정보가 성공적으로 저장되었습니다!");
      router.push("/caregiver"); // ✅ 메인 페이지로 이동
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-6">
      {/* ✅ 뒤로 가기 버튼 */}
      {step > 1 && (
        <button onClick={() => setStep(step - 1)} className="self-start mb-4 text-[#FF8B14] font-medium">
          ← 뒤로 가기
        </button>
      )}

      {/* ✅ 단계별 타이틀 */}
      {step === 1 ? (
        <h1 className="text-2xl font-bold text-center">
          일할 수 있는 요일을 <br />
          <span className="text-green-500">모두</span> 선택하세요
        </h1>
      ) : step === 2 ? (
        <h1 className="text-2xl font-bold text-center">
          원하는 시간을 <br />
          선택하세요
        </h1>
      ) : (
        <h1 className="text-2xl font-bold text-center">
          희망하는 <br />
          시급을 입력하세요
        </h1>
      )}

      {/* ✅ 요일 선택 */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-md">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`p-3 rounded-full font-medium ${
                selectedDays.includes(day) ? "bg-green-500 text-white" : "border border-gray-300 text-gray-700"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* ✅ 시간 선택 */}
      {step === 2 && (
        <div className="grid grid-cols-1 gap-3 mt-6 w-full max-w-md">
          {times.map((time) => (
            <button
              key={time}
              onClick={() => toggleTime(time)}
              className={`p-3 rounded-full font-medium ${
                selectedTimes.includes(time) ? "bg-green-500 text-white" : "border border-gray-300 text-gray-700"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      {/* ✅ 희망 시급 입력 */}
      {step === 3 && (
        <div className="w-full max-w-md mt-6">
          <label className="flex flex-col">
            <span className="text-gray-700 text-lg font-medium">희망 시급 (원)</span>
            <input
              type="number"
              placeholder="예: 15000"
              className="p-3 border rounded-lg mt-2 text-center text-lg"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* ✅ 오류 메시지 표시 */}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* ✅ 다음 & 완료 버튼 */}
      <button
        className="mt-10 w-full max-w-md bg-[#FF8B14] text-white p-3 rounded-lg font-semibold"
        onClick={() => {
          if (step === 1) {
            setStep(2); // 요일 선택 후 → 시간 선택 화면으로 이동
          } else if (step === 2) {
            setStep(3); // 시간 선택 후 → 시급 입력 화면으로 이동
          } else {
            handleSubmit(); // 입력 완료 후 → API 요청 전송
          }
        }}
        disabled={loading}
      >
        {loading ? "저장 중..." : step === 3 ? "완료" : "다음"}
      </button>
    </div>
  );
}
