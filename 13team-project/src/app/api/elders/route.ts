import { NextResponse } from "next/server";
import Elder from "@/models/Elder";
import { connectToDB } from "../../../lib/mongodb";

/** 📌 어르신 목록 가져오기 */
export async function GET(req: Request): Promise<Response> {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const jobPostingOnly = searchParams.get("jobPostingOnly") === "true";

    const elders = await Elder.find(jobPostingOnly ? { hasJobPosting: true } : {});

    return NextResponse.json(
      { elders, hasElders: elders.length > 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "데이터 조회 실패", error }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    await connectToDB();
    const newElder = await req.json();

    console.log("📌 [DEBUG] 요청 데이터:", JSON.stringify(newElder, null, 2));

    if (!newElder.elderly?.name || !newElder.elderly?.birthYear || !newElder.elderly?.careLevel) {
      return NextResponse.json({ success: false, message: "이름, 생년, 등급을 입력해주세요." }, { status: 400 });
    }

    const lastElder = await Elder.findOne().sort({ elid: -1 });
    newElder.elid = lastElder ? lastElder.elid + 1 : 1;
    newElder.hasJobPosting = false;
    newElder.conditions = { wage: 0, days: [], time: "" };
    newElder.jobPosting = { condition: [], email: "" };

    // ✅ 필수값 기본값 설정
    newElder.elderly.dementiaSymptoms = newElder.elderly.dementiaSymptoms ?? [];
    newElder.elderly.diseases = newElder.elderly.diseases || "기타 질병 없음";
    newElder.elderly.workplaceDetails = newElder.elderly.workplaceDetails || "";
    newElder.elderly.additionalServices = newElder.elderly.additionalServices || "추가 서비스 없음";
    newElder.elderly.description = newElder.elderly.description || "어르신 관련 설명 없음";

    newElder.careDays = Array.isArray(newElder.careDays) ? newElder.careDays : [];
    newElder.careStartHour = String(newElder.careStartHour ?? "00:00");
    newElder.careEndHour = String(newElder.careEndHour ?? "00:00");

    console.log("✅ [DEBUG] 변환된 데이터:", JSON.stringify(newElder, null, 2));

    const createdElder = await Elder.create(newElder);

    return NextResponse.json({ success: true, elder: createdElder }, { status: 201 });
  } catch (error) {
    console.error("❌ [ERROR] 어르신 추가 실패:", error);
    return NextResponse.json({ success: false, message: "어르신 추가 실패", error }, { status: 500 });
  }
}


/** 📌 어르신 정보 업데이트 */
export async function PATCH(req: Request): Promise<Response> {
  try {
    await connectToDB();
    const { id, updates } = await req.json();

    const updatedElder = await Elder.findOneAndUpdate(
      { elid: id },
      {
        ...updates,
        conditions: { ...updates.conditions },
        jobPosting: { ...updates.jobPosting },
        ...(updates.jobPosting ? { hasJobPosting: true } : {}),
      },
      { new: true }
    );

    if (!updatedElder) {
      return NextResponse.json({ success: false, message: "어르신을 찾을 수 없음" }, { status: 404 });
    }

    return NextResponse.json({ success: true, elder: updatedElder }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "업데이트 실패", error }, { status: 500 });
  }
}

/** 📌 어르신 삭제 */
export async function DELETE(req: Request): Promise<Response> {
  try {
    await connectToDB();
    const { id } = await req.json();

    const deletedElder = await Elder.findOneAndDelete({ elid: id });

    if (!deletedElder) {
      return NextResponse.json({ success: false, message: "어르신을 찾을 수 없음" }, { status: 404 });
    }

    const remainingElders = await Elder.countDocuments();

    return NextResponse.json(
      { success: true, message: "삭제 완료", hasElders: remainingElders > 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "삭제 실패", error }, { status: 500 });
  }
}
