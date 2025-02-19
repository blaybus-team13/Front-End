import { NextResponse } from "next/server";

// 전역 변수 대신 상태를 유지할 저장소 사용 (임시 메모리 저장)
let proposals: Proposal[] = [];

interface Proposal {
  caregiverId: string;
  elderId: number;
  status: "pending" | "accepted" | "rejected";
}

/** 특정 요양보호사의 제안 목록 가져오기 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caregiverId = searchParams.get("caregiverId") || "";


    if (!caregiverId) {
      return NextResponse.json(
        { success: false, message: "caregiverId가 필요합니다." },
        { status: 400 }
      );
    }

    // 특정 요양보호사에 해당하는 제안 필터링
    const filteredProposals = proposals.filter(
      (proposal) => proposal.caregiverId === caregiverId
    );

    return NextResponse.json(
      { success: true, proposals: filteredProposals },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "서버 오류 발생", error },
      { status: 500 }
    );
  }
}

/** 새로운 제안 추가 */
export async function POST(req: Request) {
  try {
    const { caregiverId, elderId, type } = await req.json();

    if (!caregiverId || !elderId) {
      return NextResponse.json(
        { success: false, message: "caregiverId와 elderId가 필요합니다." },
        { status: 400 }
      );
    }

    let status: "pending" | "rejected";
    if (type === "proposal") {
      status = "pending";
    } else if (type === "rejected") {
      status = "rejected";
    } else {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 type 값입니다." },
        { status: 400 }
      );
    }

    // 새로운 제안 객체 추가
    const newProposal: Proposal = { caregiverId, elderId, status };
    proposals.push(newProposal);

    return NextResponse.json(
      {
        success: true,
        message: "제안이 성공적으로 저장되었습니다.",
        proposal: newProposal,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "서버 오류 발생", error },
      { status: 500 }
    );
  }
}
