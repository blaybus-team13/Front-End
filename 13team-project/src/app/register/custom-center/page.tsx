"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

// 카카오 API 응답 데이터 타입 정의
interface KakaoPlace {
  id: string;
  place_name: string;
  road_address_name?: string;
  address_name: string;
}

export default function CustomCenterRegisterPage() {
  const router = useRouter();

  // 입력 데이터 상태
  const [centerData, setCenterData] = useState<{ name: string; phone: string; address: string }>({
    name: "",
    phone: "",
    address: "",
  });
  const [step, setStep] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 입력값 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCenterData({ ...centerData, [e.target.name]: e.target.value });
  };

  // 주소 검색 API 호출 (카카오 API 사용)
  const handleAddressSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/kakao?query=${query}`);
      const data = await response.json();
      setSearchResults(data.documents || []);
    } catch (error) {
      console.error("주소 검색 오류:", error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="text-gray-600 text-lg">
          ←
        </button>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-1 w-1/3 bg-orange-500 rounded"></div>
        <div className="h-1 w-1/3 bg-gray-300 rounded mx-1"></div>
        <div className="h-1 w-1/3 bg-gray-300 rounded"></div>
      </div>

      {/* 제목 */}
      <h2 className="mt-6 text-2xl font-bold text-gray-900">센터의 정보를 받아볼게요.</h2>
      <p className="text-gray-600 mt-2">근처의 요양보호사 분들을 추천해드릴게요.</p>

      {/* 입력 필드 */}
      <div className="mt-6 space-y-4">
        {step >= 3 && (
          <div className="opacity-100">
            <label className="block text-sm font-medium text-gray-700">센터 주소</label>
            <div className="relative">
              <FiSearch className="absolute left-4 top-3 text-gray-400 text-xl" />
              <input
                type="text"
                name="address"
                placeholder="지역을 선택해주세요."
                value={centerData.address}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  handleAddressSearch(e.target.value);
                }}
                className="w-full p-3 pl-12 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* 검색 결과 표시 */}
            {loading && <p className="text-sm text-gray-500 mt-2">검색 중...</p>}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg shadow-md max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setCenterData({ ...centerData, address: result.place_name })}
                  >
                    <p className="text-sm font-semibold">{result.place_name}</p>
                    <p className="text-xs text-gray-500">
                      {result.road_address_name || result.address_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step >= 2 && (
          <div className="opacity-100">
            <label className="block text-sm font-medium text-gray-700">센터 전화번호</label>
            <input
              type="text"
              name="phone"
              placeholder="센터의 전화번호를 입력해주세요."
              value={centerData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}

        <div className="opacity-100">
          <label className="block text-sm font-medium text-gray-700">센터 이름</label>
          <input
            type="text"
            name="name"
            placeholder="센터 이름을 입력해주세요."
            value={centerData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      {/* 확인 버튼 */}
      {step < 3 ? (
        <button
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
          onClick={() => setStep(step + 1)}
          disabled={(step === 1 && !centerData.name) || (step === 2 && !centerData.phone)}
        >
          확인
        </button>
      ) : (
        <button
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition"
          onClick={() => router.push("/register/name")}
        >
          확인
        </button>
      )}
    </div>
  );
}
