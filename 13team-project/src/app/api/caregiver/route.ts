import { NextResponse } from "next/server";

// 요양보호사 초기 데이터 (배열 형태)
type Caregiver = {
  id: string;
  password: string;
  name: string;
  phone: string;
  location: string;
  experience: number;
  certification: string;
  uploadedImage: string;
  hasJobPosting: boolean;
  isJobSeeking: boolean;
  isActive: boolean;
  jobInfo: {
    address: string[];
    days: string[];
    times: string[];
    hourlyWage: number;
  };
};

// 요양보호사 초기 데이터
let caregiverData: Caregiver[] = [
  {
    id: "cdsa",
    password: "hashedpassword1",
    name: "김수은",
    phone: "010-4061-6740",
    location: "서울시 강남구",
    experience: 5,
    certification: "간호조무사 자격증",
    uploadedImage: "",
    hasJobPosting: true,
    isJobSeeking: false,
    isActive: false,
    jobInfo: { address: [], days: [], times: [], hourlyWage: 0 },
  },
  {
    id: "caregiver2",
    password: "hashedpassword2",
    name: "이영희",
    phone: "010-4061-6740",
    location: "경기도 성남시",
    experience: 3,
    certification: "요양보호사 자격증",
    uploadedImage: "",
    hasJobPosting: false,
    isJobSeeking: false,
    isActive: false,
    jobInfo: { address: [], days: [], times: [], hourlyWage: 0 },
  },
];


/** GET 요청: 특정 ID 또는 특정 어르신에게 맞는 요양보호사 추천 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const role = formData.get("role")?.toString();
      const name = formData.get("name")?.toString();
      const phone = formData.get("phone")?.toString();
      const location = formData.get("location")?.toString();
      const period = formData.get("period")?.toString();
      const careerList = JSON.parse(formData.get("careerList")?.toString() || "[]");
      const intro = formData.get("intro")?.toString();
      const hasCar = formData.get("hasCar") === "true";
      const dementiaTraining = formData.get("dementiaTraining") === "true";
      const certNumber = formData.get("certNumber")?.toString();
      const hasNurseCert = formData.get("hasNurseCert") === "true";
      const selectedNurseLevel = formData.get("selectedNurseLevel")?.toString();
      const hasSocialWorkerCert = formData.get("hasSocialWorkerCert") === "true";
      const id = formData.get("id")?.toString();
      const password = formData.get("password")?.toString();
      const uploadedFile = formData.get("uploadedImage") as File;
      

      console.log("📌 [SERVER] Parsed Data:", {
        role, name, phone, location, period, careerList, intro,
        hasCar, dementiaTraining, certNumber, hasNurseCert, selectedNurseLevel,
        hasSocialWorkerCert, id, password, uploadedFile
      });

      if (!role || !name || !phone || !location) {
        return NextResponse.json({ success: false, message: "필수 정보를 입력해주세요!" }, { status: 400 });
      }

      // ✅ 이미지 변환 (Base64 저장)
      let imageBase64 = "";
      if (uploadedFile) {
        const buffer = Buffer.from(await uploadedFile.arrayBuffer());
        imageBase64 = `data:${uploadedFile.type};base64,${buffer.toString("base64")}`;
      }

      const newId = `caregiver_${Date.now()}`;

          // 🔹 필수값 확인
      if (!role || !name || !phone || !location || !id || !password) {
        return NextResponse.json({ success: false, message: "필수 정보를 입력해주세요!" }, { status: 400 });
      }

      // 🔹 ID 중복 확인
      if (!caregiverData) {
        return NextResponse.json({ success: false, message: "요양보호사 데이터가 없습니다." }, { status: 500 });
      }
      
      const caregiverIndex = caregiverData.findIndex((cg) => cg.id === id);
      

      const newCaregiver = {
        role,
        id,
        name,
        phone,
        location,
        experience: period ? Number(period) : 0,
        certification: certNumber ?? "", // ✅ undefined 방지 (빈 문자열 처리)
        uploadedImage: imageBase64,
        hasJobPosting: false,
        isJobSeeking: false,
        isActive: false,
        jobInfo: { days: [], times: [], hourlyWage: 0 ,address: []},
        intro,
        careerList,
        hasCar,
        dementiaTraining,
        hasNurseCert,
        selectedNurseLevel,
        hasSocialWorkerCert,
        password, // ⚠️ 실제로는 해싱 필요 (예: bcrypt)
      };      

      caregiverData.push(newCaregiver);

      return NextResponse.json({
        success: true,
        message: "회원가입 성공!",
        data: newCaregiver,
      }, { status: 201 });
    }

    // JSON 데이터 처리 (구직 정보 업데이트)
    const { id, address, days, times, hourlyWage } = await req.json();

    // 유효성 검사
    if (
      !id || 
      !Array.isArray(address) || !address.length || 
      !Array.isArray(days) || !days.length ||  
      !Array.isArray(times) || !times.length ||  
      Number(hourlyWage) <= 0
    ) {
      return NextResponse.json({ success: false, message: "모든 정보를 올바르게 입력해주세요!" }, { status: 400 });
    }    

  // 특정 요양보호사 찾기
  const caregiverIndex = caregiverData.findIndex((cg) => cg.id === id);
  if (caregiverIndex === -1) {
    return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
  }

// 구직 정보 업데이트
caregiverData[caregiverIndex] = {
  ...caregiverData[caregiverIndex],
  isJobSeeking: true,
  isActive: true,
  jobInfo: {
    address: address as string[],  // ✅ 명확한 타입 지정
    days: days as string[],        // ✅ 명확한 타입 지정
    times: times as string[],      // ✅ 명확한 타입 지정
    hourlyWage: Number(hourlyWage),
  },
};
    return NextResponse.json({
      success: true,
      message: "구직 정보 저장 완료!",
      data: caregiverData[caregiverIndex],
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "요양보호사 저장 실패", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

/** PATCH 요청: 특정 요양보호사의 구직 상태 업데이트 */
export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();

    // 특정 요양보호사 찾기 (문자열 ID 그대로 비교)
    const caregiverIndex = caregiverData.findIndex((c) => c.id === id);

    if (caregiverIndex === -1) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
    }


    // 유효성 검사: 구직 정보 없이 활성화 불가
    if (!caregiverData[caregiverIndex].isJobSeeking && isActive) {
      return NextResponse.json({ success: false, message: "구직 정보를 먼저 입력해주세요!" }, { status: 400 });
    }

    // 구직 상태 업데이트
    caregiverData[caregiverIndex] = {
      ...caregiverData[caregiverIndex],
      isActive: isActive ?? caregiverData[caregiverIndex].isActive,
    };

    return NextResponse.json({
      success: true,
      message: "구직 상태 변경 완료!",
      data: caregiverData[caregiverIndex],
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "구직 상태 변경 실패", error }, { status: 500 });
  }
}

/** PUT 요청: 특정 요양보호사의 구직 정보 수정 */
export async function PUT(req: Request) {
  try {
    const { id, address, days, times, hourlyWage } = await req.json();

    // 특정 요양보호사 찾기
    const caregiverIndex = caregiverData.findIndex((c) => c.id === id);
    if (caregiverIndex === -1) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
    }

    // 기존 정보 수정
    caregiverData[caregiverIndex] = {
      ...caregiverData[caregiverIndex],
      jobInfo: { days, times, hourlyWage, address},
    };

    return NextResponse.json({
      success: true,
      message: "구직 정보가 수정되었습니다.",
      data: caregiverData[caregiverIndex],
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "구직 정보 수정 실패", error }, { status: 500 });
  }
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const caregiver = caregiverData.find((c) => c.id === id);
    if (!caregiver) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ success: true, caregiver }, { status: 200 });
  }

  return NextResponse.json({ success: true, caregivers: caregiverData }, { status: 200 });
}

/** DELETE 요청: 특정 요양보호사 삭제 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "삭제할 ID를 입력해주세요." }, { status: 400 });
    }

    // 특정 요양보호사 삭제
    const initialLength = caregiverData.length;
    caregiverData = caregiverData.filter((c) => c.id !== id);

    if (caregiverData.length === initialLength) {
      return NextResponse.json({ success: false, message: "요양보호사를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "요양보호사가 삭제되었습니다.",
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "요양보호사 삭제 실패", error }, { status: 500 });
  }
}
