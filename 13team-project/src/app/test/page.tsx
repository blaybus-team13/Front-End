"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import _ from "lodash";

const LocationSelector = () => {
  const [input, setInput] = useState<string>("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const extractAddress = (address: string): string => {
    const parts = address.split(" ");
    if (parts.length >= 3) {
      return `${parts[0]} ${parts[1]} ${parts[2]}`;
    }
    return address;
  };

  const fetchLocations = useCallback(
    _.debounce(async (query: string) => {
      if (!query) return;

      setLoading(true);
      try {
        console.log("API 요청 중:", query);
        const response = await axios.get(`/api/kakao?query=${query}`);

        const filteredLocations = response.data.documents
          .map((doc: { address_name: string }) => extractAddress(doc.address_name))
          .filter((addr: string, index: number, self: string[]) => addr && self.indexOf(addr) === index);

        console.log("API 응답:", filteredLocations);
        setLocations(filteredLocations);
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

  const handleSelect = (location: string) => {
    if (!selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
    }
    setInput("");
  };

  const handleRemove = (location: string) => {
    setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
  };

  return (
    <div className="w-full p-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="지역을 선택해주세요."
          className="w-full border rounded p-2"
        />

        {input && locations.length > 0 && (
          <ul className="absolute bg-white border mt-1 w-full max-h-40 overflow-y-auto">
            {locations.map((loc) => (
              <li
                key={loc}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSelect(loc)}
              >
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {selectedLocations.map((loc) => (
          <div
            key={loc}
            className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full"
          >
            {loc}
            <button
              className="ml-2 text-red-500"
              onClick={() => handleRemove(loc)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector;
