'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import CheckIcon from '@/components/CheckIcon';

export default function CertificationPage() {
  const router = useRouter();
  const [certNumber, setCertNumber] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasNurseCert, setHasNurseCert] = useState<boolean>(false);
  const [selectedNurseLevel, setSelectedNurseLevel] = useState<string | null>(null);
  const [hasSocialWorkerCert, setHasSocialWorkerCert] = useState<boolean>(false);

  // 🔹 자격증 번호 자동 포맷팅 (20XX-XXXXXXX 형식)
  const formatCertNumber = (value: string): string => {
    const onlyNums = value.replace(/\D/g, ''); // 숫자만 남기기
    return onlyNums.length <= 4 ? onlyNums : `${onlyNums.slice(0, 4)}-${onlyNums.slice(4, 11)}`;
  };

  // 🔹 자격증 번호 입력 시 자동 포맷 적용
  const handleCertNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCertNumber(formatCertNumber(event.target.value));
  };

  // 🔹 이미지 업로드 핸들러
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  // 🔹 다음 단계로 이동 (가입 성공 페이지)
  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!certNumber || certNumber.length < 12) {
      alert('요양 보호사 자격증 번호를 입력해 주세요.');
      return;
    }
    if (!uploadedImage) {
      alert('자격증 사진을 업로드해 주세요.');
      return;
    }
    router.push('/register/success');
  };

  // 🔹 간호조무사 자격증 선택 토글
  const handleNurseCertToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (hasNurseCert) {
      setSelectedNurseLevel(null);
    }
    setHasNurseCert(!hasNurseCert);
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
        <div className="h-[6px] w-1/3 bg-gray-300 rounded-[30px] mx-2"></div>
        <div className="h-[6px] w-1/3 bg-orange rounded-[30px]"></div>
      </div>

      {/* 타이틀 */}
      <p className="text-base font-medium text-gray-500 mt-6">마지막 단계예요!</p>
      <h2 className="mt-3 text-[26px] font-bold text-gray-600">
        소유하고 계신 자격증을 <div>입력해 주세요.</div>
      </h2>

      <form onSubmit={handleNext}>
        {/* 요양 보호사 자격증 번호 입력 */}
        <div className="mt-8">
          <label className="block text-base font-normal text-gray-600">요양 보호사 자격증 번호(필수)</label>
          <input
            type="text"
            placeholder="20xx-xxxxxxx 형식으로 입력해 주세요."
            value={certNumber}
            onChange={handleCertNumberChange}
            className="w-full p-3 border border-gray-200 rounded-[9px] mt-2 focus:outline-none focus:ring-2 focus:ring-orange"
            maxLength={12}
          />

          {/* 자격증 사진 업로드 */}
          <p className="mt-6 text-base font-normal text-gray-600">인증을 위해 자격증 사진을 업로드해 주세요.</p>
          <label className="mt-2 flex flex-col items-center justify-center w-full h-40 border-gray-70 rounded-[9px] cursor-pointer bg-gray-70">
            {uploadedImage ? (
              <img src={uploadedImage} alt="자격증 미리보기" className="h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="mt-2 text-orange text-base font-semibold">사진 업로드하기 +</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>

          {/* 간호조무사 자격증 보유 선택 */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="font-normal text-base text-gray-600">간호조무사 자격증 보유</p>
              <button type="button" className="ml-auto w-8 h-8" onClick={handleNurseCertToggle}>
                <CheckIcon selected={hasNurseCert} />
              </button>
            </div>

            {hasNurseCert && (
              <div className="flex gap-3 mt-2 text-base font-semibold">
                {['1급', '2급'].map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={`w-1/2 py-2 rounded-[61px] border ${
                      selectedNurseLevel === level ? 'bg-orange text-white' : 'bg-white text-gray-600'
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedNurseLevel(level);
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 사회복지사 자격증 보유 선택 */}
          <div className="mt-6 flex items-center justify-between">
            <p className="font-normal text-base text-gray-600">사회복지사 자격증 보유</p>
            <button type="button" className="w-8 h-8" onClick={() => setHasSocialWorkerCert(!hasSocialWorkerCert)}>
              <CheckIcon selected={hasSocialWorkerCert} />
            </button>
          </div>
        </div>

        {/* 회원가입 완료 버튼 */}
        <input
          type="submit"
          className="w-full mt-6 bg-orange text-white py-3 rounded-[9px] text-base font-semibold"
          value="회원가입 완료하기"
          style={{ cursor: 'pointer' }}
        />
      </form>
    </div>
  );
}
