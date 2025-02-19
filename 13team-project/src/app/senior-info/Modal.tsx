import { useEffect } from "react";
import { useRouter } from "next/router";

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ showModal, onClose, onConfirm }) => {
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden"; // 모달이 열리면 스크롤 막기
    } else {
      document.body.style.overflow = "auto"; // 모달이 닫히면 스크롤 해제
    }

    return () => {
      document.body.style.overflow = "auto"; // 컴포넌트가 언마운트될 때 스크롤 해제
    };
  }, [showModal]);

  if (!showModal) return null; // showModal이 false면 모달을 렌더링하지 않음

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg max-w-md text-center z-50">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-4"
        >
          <path
            d="M32.0377 5.33008C17.3097 5.33008 5.37109 17.2687 5.37109 31.9967C5.37109 46.7247 17.3097 58.6633 32.0377 58.6633C45.5844 58.6633 56.9551 48.5087 58.5391 35.1647C58.7097 33.7007 57.667 32.3381 56.203 32.1621C54.7417 31.9914 53.3764 33.034 53.2057 34.498C51.9391 45.1647 42.8751 53.33 32.0377 53.33C20.2564 53.33 10.7044 43.778 10.7044 31.9967C10.7044 20.2154 20.2564 10.6634 32.0377 10.6634C34.4991 10.6634 36.9364 11.1087 39.2057 11.9141C40.5924 12.4047 42.0457 11.6341 42.5391 10.2474C43.0297 8.85806 42.3417 7.32211 40.955 6.82877C38.1177 5.82344 35.1071 5.33008 32.0377 5.33008ZM56.0377 10.6634C55.355 10.6634 54.6404 10.9034 54.1204 11.4128L30.8697 34.33C30.1844 35.0047 29.4937 34.8741 28.9551 34.0794L26.2884 30.1621C25.4724 28.9594 23.7604 28.6101 22.5391 29.4127C21.3151 30.2154 20.9711 31.8767 21.7871 33.0794L24.4538 36.9967C26.8564 40.5407 31.5577 41.01 34.6217 37.9967L57.955 15.1647C58.995 14.1407 58.995 12.4367 57.955 11.4128C57.435 10.9008 56.7204 10.6634 56.0377 10.6634Z"
            fill="#FF8B14"
            fillOpacity="0.24"
          />
        </svg>
        <p className="font-bold text-2xl text-gray-600">임시저장 하시겠습니까?</p>
        <div className="px-5 py-4">
          <p className="font-medium text-[15px] text-gray-350">임시저장한 채용공고는</p>
          <p className="font-medium text-[15px] text-gray-350">어르신 관리에서 확인하실 수 있어요.</p>
        </div>
        <div className="flex flex-col mt-4 space-y-3">
          <button
            className="w-full bg-orange text-white py-3 rounded-[9px] font-semibold text-base"
            onClick={onConfirm} 
          >
            임시저장 후 홈으로 가기
          </button>
          <button
            className="w-full text-gray-400 border border-gray-200 py-3 rounded-[9px] font-semibold text-base"
            onClick={onClose}
          >
            계속 작성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
