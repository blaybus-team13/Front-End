"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckIcon from "@/components/CheckIcon";

// 경력 정보 타입 정의
interface Career {
  institution: string;
  task: string;
  term: string;
}

export default function SelectiveInformationPage() {
  const router = useRouter();

  // 상태 타입 지정
  const [period, setPeriod] = useState<string>("");
  const [careerList, setCareerList] = useState<Career[]>([]);
  const [newCareer, setNewCareer] = useState<Career>({ institution: "", task: "", term: "" });
  const [intro, setIntro] = useState<string>("");
  const [hasCar, setHasCar] = useState<boolean>(false);
  const [dementiaTraining, setDementiaTraining] = useState<boolean>(false);

  // 경력 추가 핸들러
  const handleAddCareer = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (newCareer.institution && newCareer.task && newCareer.term) {
      setCareerList([...careerList, newCareer]);
      setNewCareer({ institution: "", task: "", term: "" }); // 입력 폼 초기화
    }
  };

  // 경력 입력 필드 변경 핸들러
  const handleNewCareerChange = (field: keyof Career, value: string) => {
    setNewCareer({ ...newCareer, [field]: value });
  };

  // 다음 단계로 이동 (certificate 페이지)
  const handleNext = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (period || careerList.length > 0 || intro || hasCar || dementiaTraining) {
      router.push("/register/certificate");
    } else {
      if (confirm("아직 입력하지 않은 정보가 있어요. 건너뛰시겠어요?")) {
        router.push("/register/certificate");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* 상단 네비게이션 */}
      <div className="relative flex items-center justify-center">
        <button onClick={() => router.back()} className="absolute left-0 text-gray-500 text-lg">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 24L12 16L20 8" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-lg font-bold text-gray-600">회원가입</p>
        <button
          onClick={() => router.push("/register/certificate")}
          className="absolute right-0 font-semibold text-gray-400 text-base"
        >
          건너뛰기
        </button>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-orange rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">필수는 아니지만 입력하면 좋은 정보들이에요!</h2>
      <p className="text-base font-medium text-gray-500 mt-3">나중에 작성하고 싶으시다면 건너뛰기를 눌러주세요.</p>

      <form onSubmit={handleNext}>
        {/* 경력 기간 입력 필드 */}
        <div className="mt-8">
          <label className="block text-base font-normal text-gray-600">경력 기간</label>
          <input
            type="text"
            placeholder="경력 기간을 입력해 주세요. (예: 2년)"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-orange"
          />
        </div>

        {/* 주요 경력 */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <label className="font-normal text-base text-gray-600">주요 경력</label>
            <button onClick={handleAddCareer} className="text-orange font-semibold text-sm flex items-center">
              추가하기 +
            </button>
          </div>

          <div className="mt-3 space-y-2 bg-gray-100 p-4 rounded-[9px]">
            <label className="block text-[15px] font-medium text-gray-500">기관명</label>
            <input
              type="text"
              placeholder="기관명을 입력해 주세요."
              value={newCareer.institution}
              onChange={(e) => handleNewCareerChange("institution", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-[9px] mt-2"
            />

            <label className="block text-[15px] font-medium text-gray-500">업무</label>
            <input
              type="text"
              placeholder="하셨던 업무를 입력해 주세요."
              value={newCareer.task}
              onChange={(e) => handleNewCareerChange("task", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-[9px] mt-2"
            />

            <label className="block text-[15px] font-medium text-gray-500">기간</label>
            <input
              type="text"
              placeholder="업무 기간을 입력해 주세요."
              value={newCareer.term}
              onChange={(e) => handleNewCareerChange("term", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-[9px] mt-2"
            />
          </div>

          {/* 추가된 경력 리스트 */}
          <div className="mt-4">
            {careerList.map((career, index) => (
              <div key={index} className="p-2 border border-gray-200 rounded-[9px] mb-2">
                <p className="font-semibold text-base text-blue">
                  {career.institution} <span className="text-gray-200">|</span> {career.task} <span className="text-gray-200">|</span> {career.term}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 한줄 소개 */}
        <label className="block mt-6 text-base font-normal text-gray-600">한줄 소개</label>
        <input
          type="text"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          className="w-full p-3 mt-2 border border-gray-300 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-orange"
          placeholder="한줄 소개를 입력해 주세요."
        />

        {/* 차량 소유 선택 */}
        <div className="mt-6 flex items-center justify-between">
          <p className="font-normal text-base text-gray-600">개인 차량을 소유하고 계신가요?</p>
          <button type="button" className="w-8 h-8" onClick={() => setHasCar(!hasCar)}>
            <CheckIcon selected={hasCar} />
          </button>
        </div>

        {/* 치매 교육 이수 여부 선택 */}
        <div className="mt-6 flex items-center justify-between">
          <p className="font-normal text-base text-gray-600">치매 교육을 이수하셨나요?</p>
          <button type="button" className="w-8 h-8" onClick={() => setDementiaTraining(!dementiaTraining)}>
            <CheckIcon selected={dementiaTraining} />
          </button>
        </div>

        {/* 확인 버튼 */}
        <input type="submit" className="w-full mt-6 bg-orange text-white py-3 rounded-[9px] text-base font-semibold cursor-pointer" value="확인" />
      </form>
    </div>
  );
}
