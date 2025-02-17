import { NextResponse } from "next/server";

// 요양보호사 초기 데이터 (배열 형태)
let caregiverData = [
  {
    id: 1,
    name: "김수은",
    location: "서울시 강남구",
    experience: 5,
    certification: "간호조무사 자격증",
    hasJobPosting: true,
    isJobSeeking: false, // 구직 여부
    isActive: false, // 활성 상태
    jobInfo: { days: [], times: [], hourlyWage: 0 },
  },
  {
    id: 2,
    name: "이영희",
    location: "경기도 성남시",
    experience: 3,
    certification: "요양보호사 자격증",
    hasJobPosting: false,
    isJobSeeking: false, // 구직 여부
    isActive: false, // 활성 상태
    jobInfo: { days: [], times: [], hourlyWage: 0 },
  },
];

/** GET 요청: 특정 ID 또는 특정 어르신에게 맞는 요양보호사 추천 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const caregiver = caregiverData.find((c) => c.id === Number(id));
    if (!caregiver) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    // ✅ success: true 추가
    return NextResponse.json({ success: true, caregiver }, { status: 200 });
  }

  return NextResponse.json({ success: true, caregivers: caregiverData }, { status: 200 });
}

/** POST 요청: 특정 요양보호사 구직 정보 저장 */
export async function POST(req: Request) {
  try {
    const { id, days, times, hourlyWage } = await req.json();

    // 유효성 검사
    if (!id || !days?.length || !times?.length || !hourlyWage) {
      return NextResponse.json({ success: false, message: "모든 정보를 입력해주세요!" }, { status: 400 });
    }

    // 특정 요양보호사 찾기
    const caregiverIndex = caregiverData.findIndex((caregiver) => caregiver.id === id);
    if (caregiverIndex === -1) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
    }

    // 해당 요양보호사의 구직 정보 업데이트
    caregiverData[caregiverIndex] = {
      ...caregiverData[caregiverIndex],
      isJobSeeking: true,
      isActive: true, // 자동 활성화
      jobInfo: { days, times, hourlyWage },
    };

    return NextResponse.json({
      success: true,
      message: "구직 정보 저장 완료!",
      data: caregiverData[caregiverIndex],
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "구직 정보 저장 실패", error }, { status: 500 });
  }
}

/** PATCH 요청: 특정 요양보호사의 구직 상태 업데이트 */
export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();

    // 특정 요양보호사 찾기
    const caregiverIndex = caregiverData.findIndex((c) => c.id === Number(id));
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
    const { id, days, times, hourlyWage } = await req.json();

    // 특정 요양보호사 찾기
    const caregiverIndex = caregiverData.findIndex((c) => c.id === Number(id));
    if (caregiverIndex === -1) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
    }

    // 기존 정보 수정
    caregiverData[caregiverIndex] = {
      ...caregiverData[caregiverIndex],
      jobInfo: { days, times, hourlyWage },
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
    caregiverData = caregiverData.filter((c) => c.id !== Number(id));

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
