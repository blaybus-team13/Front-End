"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// 주소 데이터 타입 정의
interface Address {
  id: number;
  address: string;
  post: string;
}

export default function ResidencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [addressResults, setAddressResults] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // URL에서 데이터 가져오기
  useEffect(() => {
    const roleFromParams = searchParams.get("role");
    const nameFromParams = searchParams.get("name");
    const phoneFromParams = searchParams.get("phone");
    if (roleFromParams) setRole(decodeURIComponent(roleFromParams));
    if (nameFromParams) setName(decodeURIComponent(nameFromParams));
    if (phoneFromParams) setPhone(decodeURIComponent(phoneFromParams));
  }, [searchParams]);

  // 카카오 주소 검색 API 호출
  const handleSearch = async (query: string) => {
    if (!query) {
      setAddressResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/kakao-search?query=${query}`);
      const data = await response.json();

      // 시, 구, 동까지만 필터링
      const filteredAddresses = data.documents
        .map((item: any) => {
          const addressParts = item.address_name.split(" ");
          return {
            id: item.id,
            address: addressParts.slice(0, 3).join(" "), // 시, 구, 동까지만 포함
            post: item.road_address ? item.road_address.zone_no : "N/A",
          };
        })
        .filter(
          (addr: Address, index: number, self: Address[]) =>
            index === self.findIndex((a) => a.address === addr.address) // 중복 제거
        );

      setAddressResults(filteredAddresses);
    } catch (error) {
      console.error("주소 검색 오류:", error);
      setAddressResults([]);
    }

    setLoading(false);
  };

  // 주소 선택 시 모달 표시
  const handleSelectAddress = (adr: Address) => {
    setSelectedAddress(adr);
    setShowModal(true);
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
        <p className="text-lg font-semibold text-gray-600">회원가입</p>
      </div>

      {/* 진행 상태 바 */}
      <div className="mt-3 w-full flex">
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
        <div className="h-[6px] w-1/3 bg-orange rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <h2 className="mt-6 text-[26px] font-bold text-gray-600">어느 지역에 거주 중이신가요?</h2>
      <p className="text-base font-medium text-gray-500 mt-3">거주지 근처의 센터를 추천해 드릴게요.</p>

      {/* 검색 입력창 */}
      <div className="mt-8 relative">
        <input
          type="text"
          placeholder="시, 구, 동을 입력해 주세요."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full p-3 pl-10 border border-gray-200 placeholder:text-sm rounded-[100px] focus:outline-none focus:ring-2 focus:ring-orange"
        />
      </div>

      {/* 검색 결과 */}
      <div className="relative">
        {loading && <p className="text-sm text-gray-500 mt-2">검색 중...</p>}
        {addressResults.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {addressResults.map((adr) => (
              <div
                key={adr.id}
                className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSelectAddress(adr)}
              >
                <p className="font-bold text-lg text-gray-600">{adr.address}</p>
                <p className="text-sm text-gray-400">우편번호: {adr.post}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 모달 창 */}
      {showModal && selectedAddress && (
        <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-t-3xl shadow-lg w-full max-w-md">
            <p className="font-bold mb-4 text-xl text-gray-600">아래의 지역에 거주하시는 게 맞나요?</p>
            <div className="p-4">
              <p className="font-bold text-lg text-gray-600">{selectedAddress.address}</p>
              <p className="text-sm text-gray-400">우편번호: {selectedAddress.post}</p>
            </div>
            <div className="flex justify-between mt-4">
              <button
                className="w-1/2 bg-orange text-white py-3 rounded-[7px] font-semibold text-base mr-2"
                onClick={() => {
                  setShowModal(false);
                  const nextUrl = `/register/selectiveInformation?role=${encodeURIComponent(
                    role
                  )}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(
                    phone
                  )}&residence=${encodeURIComponent(selectedAddress.address)}`;
                  router.push(nextUrl);
                }}
              >
                맞아요
              </button>
              <button
                className="w-1/2 text-gray-400 border border-gray-200 py-3 rounded-[7px] font-semibold text-base"
                onClick={() => setShowModal(false)}
              >
                아니에요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
