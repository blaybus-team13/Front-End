"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import _ from "lodash";

const JobInfoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || ""; // URL에서 id 가져오기

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [hourlyWage, setHourlyWage] = useState<string>("");
  const [monthlySalary, setMonthlySalary] = useState<number | string>("");
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isWageValid, setIsWageValid] = useState<boolean>(true);
  const [locationResults, setLocationResults] = useState<string[]>([]);

  const minimumWage = 10020; // 2025년 최저시급

  const days = ["모든 요일 가능", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const times = ["오전 (9-12시)", "오후 (12-6시)", "저녁 (6-9시)"];

  const extractAddress = (address: string): string => {
    const parts = address.split(" ");
    return parts.length >= 3 ? `${parts[0]} ${parts[1]} ${parts[2]}` : address;
  };

  const fetchLocations = useCallback(
    _.debounce(async (query: string) => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await axios.get(`/api/kakao?query=${query}`);
        const filteredLocations = response.data.documents
          .map((doc: { address_name: string }) => extractAddress(doc.address_name))
          .filter((addr: string, index: number, self: string[]) => addr && self.indexOf(addr) === index);
        setLocationResults(filteredLocations);
      } catch (error) {
        console.error("API 호출 오류:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchLocations(input);
  }, [input, fetchLocations]);

  const handleSelectLocation = (location: string) => {
    if (selectedLocations.length < 5 && !selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
    }
    setInput("");
  };

  const handleRemoveLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]));
  };

  const calculateMonthlySalary = (wage: number, selectedTimes: string[], selectedDays: string[]) => {
    let weeklyHours = 0;
    const hoursPerDay: { [key: string]: number } = {
      "오전 (9-12시)": 3,
      "오후 (12-6시)": 6,
      "저녁 (6-9시)": 3,
    };

    const workDays = selectedDays.length === 0 ? 5 : selectedDays.length;
    selectedTimes.forEach((time) => {
      if (hoursPerDay[time]) {
        weeklyHours += hoursPerDay[time];
      }
    });

    const weeklySalary = weeklyHours * wage * workDays;
    setMonthlySalary(weeklySalary * 4);
  };

  const handleWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setHourlyWage("");
      setError(null);
      setIsWageValid(false);
      setMonthlySalary("");
      return;
    }

    const wage = Number(value);
    if (isNaN(wage)) {
      setError("올바른 숫자를 입력해주세요.");
      setIsWageValid(false);
      return;
    }

    setHourlyWage(value);
    setError(null);
  };

  const validateWage = () => {
    const wage = Number(hourlyWage);
    if (wage < minimumWage) {
      setError(`최저 시급인 ${minimumWage}원 이상의 금액을 입력해주세요.`);
      setIsWageValid(false);
      setMonthlySalary("");
    } else {
      setError(null);
      setIsWageValid(true);
      calculateMonthlySalary(wage, selectedTimes, selectedDays);
    }
  };

  const handleSubmit = async () => {
    validateWage();
    if (!isWageValid) return;
    if (!queryId) {
      setError("ID를 찾을 수 없습니다.");
      return;
    }
  
    if (selectedLocations.length === 0) {
      setError("근무 희망 지역을 선택해주세요!");
      return;
    }
  
    if (selectedDays.length === 0 || selectedTimes.length === 0 || !hourlyWage) {
      setError("모든 정보를 입력해주세요.");
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/caregiver?id=${encodeURIComponent(queryId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: queryId,
          address: selectedLocations.length > 0 ? selectedLocations : ["지역 미정"],
          days: selectedDays.length > 0 ? selectedDays : ["요일 미정"],
          times: selectedTimes.length > 0 ? selectedTimes : ["시간 미정"],
          hourlyWage: Number(hourlyWage) > 0 ? Number(hourlyWage) : minimumWage,
        }),
      });      

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "서버 오류가 발생했습니다.");

      alert("구직 정보가 성공적으로 저장되었습니다!");
      router.push(`/caregiver?id=${encodeURIComponent(queryId)}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-6 font-[Pretendard]">
      <h1 className="text-2xl font-bold text-center mb-4">구직 기본 정보를 받아볼게요.</h1>
      <p className="text-center text-gray-600 mb-4">딱 알맞은 일자리를 구해드릴게요.</p>

      {/* 지역 검색 */}
      <div className="relative mt-4 w-full max-w-full">
        <label className="text-sm font-medium">어느 지역에 근무하시길 희망하시나요? *</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)} // Update input state
          placeholder="지역을 입력해주세요."
          className="w-full border rounded-lg p-3 text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        {input && locationResults.length > 0 && (
          <ul className="absolute bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow-lg z-10">
            {locationResults.map((location, index) => (
              <li
                key={index}
                className="p-3 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSelectLocation(location)} // Select location
              >
                {location}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 선택된 지역 표시 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedLocations.map((location) => (
          <div key={location} className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
            {location}
            <button className="ml-2 text-red-500" onClick={() => handleRemoveLocation(location)}>✕</button>
          </div>
        ))}
      </div>

      {/* 근무 요일 선택 */}
      <div className="w-full max-w-md mt-6">
        <label className="text-sm font-medium mb-2">근무를 희망하시는 요일을 선택해주세요. *</label>
        <div className="grid grid-cols-3 gap-3">
          {days.map((day) => (
            <button
              key={day}
              className={`p-3 rounded-full font-medium ${selectedDays.includes(day) ? "bg-[#FF8B14] text-white" : "border border-gray-300 text-gray-700"}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* 근무 시간 선택 */}
      <div className="w-full max-w-md mt-6">
        <label className="text-sm font-medium mb-2">근무를 희망하시는 시간을 선택해주세요. *</label>
        <div className="grid grid-cols-1 gap-3">
          {times.map((time) => (
            <button
              key={time}
              className={`p-3 rounded-full font-medium ${selectedTimes.includes(time) ? "bg-[#FF8B14] text-white" : "border border-gray-300 text-gray-700"}`}
              onClick={() => toggleTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* 희망 시급 입력 */}
      <div className="w-full max-w-md mt-6">
        <label className="flex flex-col">
          <span className="text-gray-700 text-lg font-medium">희망 시급 (원)</span>
          <input
            type="number"
            placeholder="예: 15000"
            className="p-3 border rounded-lg mt-2 text-center text-lg"
            value={hourlyWage}
            onChange={handleWageChange}
          />
        </label>
      </div>

      {/* 월급 계산기 */}
      {monthlySalary && (
        <div className="mt-6 w-full max-w-md">
          <p className="text-sm text-gray-700">
            월급 계산기: <span className="font-semibold">{monthlySalary.toLocaleString()} 원</span>
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* 구직 정보 제출 버튼 */}
      <button
        className={`mt-10 w-full max-w-md bg-[#FF8B14] text-white p-3 rounded-lg font-semibold ${!isWageValid ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleSubmit}
        disabled={!isWageValid} // 시급이 10,020원 미만일 경우 비활성화
      >
        완료
      </button>
    </div>
  );
};

export default JobInfoPage;
