import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongodb";
import Caregiver from "@/models/Caregiver";

/** GET 요청: 특정 ID 또는 특정 어르신에게 맞는 요양보호사 추천 */
export async function POST(req: Request) {
  try {
    await connectToDB();
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

      if (!role || !name || !phone || !location || !id || !password) {
        return NextResponse.json({ success: false, message: "필수 정보를 입력해주세요!" }, { status: 400 });
      }

      // 🔍 **ID 중복 확인 (MongoDB)**
      const existingCaregiver = await Caregiver.findOne({ id });
      if (existingCaregiver) {
        return NextResponse.json({ success: false, message: "이미 존재하는 ID입니다!" }, { status: 409 });
      }

      // ✅ **이미지 변환 (Base64)**
      let imageBase64 = "";
      if (uploadedFile) {
        const buffer = Buffer.from(await uploadedFile.arrayBuffer());
        imageBase64 = `data:${uploadedFile.type};base64,${buffer.toString("base64")}`;
      }

      // 📌 **새로운 요양보호사 생성**
      const newCaregiver = new Caregiver({
        role,
        id,
        name,
        phone,
        location,
        experience: period ? Number(period) : 0,
        certification: certNumber ?? "",
        uploadedImage: imageBase64,
        hasJobPosting: false,
        isJobSeeking: false,
        isActive: false,
        jobInfo: { days: [], times: [], hourlyWage: 0, address: [] },
        intro,
        careerList,
        hasCar,
        dementiaTraining,
        hasNurseCert,
        selectedNurseLevel,
        hasSocialWorkerCert,
        password, // ⚠️ 실제로는 bcrypt로 해싱 필요
      });

      await newCaregiver.save();

      return NextResponse.json({ success: true, message: "회원가입 성공!", caregiver: newCaregiver }, { status: 201 });
    }

    // 📌 **JSON 데이터 처리 (구직 정보 업데이트)**
    const { id, address, days, times, hourlyWage } = await req.json();

    // 유효성 검사
    if (!id || !Array.isArray(address) || !Array.isArray(days) || !Array.isArray(times) || Number(hourlyWage) <= 0) {
      return NextResponse.json({ success: false, message: "모든 정보를 올바르게 입력해주세요!" }, { status: 400 });
    }

    // 🔍 **DB에서 요양보호사 찾기**
    const caregiver = await Caregiver.findOne({ id });
    if (!caregiver) {
      return NextResponse.json({ success: false, message: "요양보호사를 찾을 수 없습니다!" }, { status: 404 });
    }

    // 📌 **구직 정보 업데이트**
    caregiver.isJobSeeking = true;
    caregiver.isActive = true;
    caregiver.jobInfo = {
      address: address as string[],
      days: days as string[],
      times: times as string[],
      hourlyWage: Number(hourlyWage),
    };

    await caregiver.save();

    return NextResponse.json({ success: true, message: "구직 정보 저장 완료!", caregiver }, { status: 200 });

  } catch (error) {
    console.error("❌ [ERROR] 요양보호사 저장 실패:", error);
    return NextResponse.json({ success: false, message: "요양보호사 저장 실패", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

/** PATCH 요청: 특정 요양보호사의 구직 상태 업데이트 */
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const { id, isActive } = await req.json();

    // 🔍 **DB에서 요양보호사 찾기**
    const caregiver = await Caregiver.findOne({ id });

    if (!caregiver) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
    }

    // ⚠️ **유효성 검사: 구직 정보 없이 활성화 불가**
    if (!caregiver.isJobSeeking && isActive) {
      return NextResponse.json({ success: false, message: "구직 정보를 먼저 입력해주세요!" }, { status: 400 });
    }

    // 📌 **구직 상태 업데이트**
    caregiver.isActive = isActive ?? caregiver.isActive;

    await caregiver.save();

    return NextResponse.json({
      success: true,
      message: "구직 상태 변경 완료!",
      caregiver,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ [ERROR] 구직 상태 변경 실패:", error);
    return NextResponse.json({ success: false, message: "구직 상태 변경 실패", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

/** PUT 요청: 특정 요양보호사의 구직 정보 수정 */
export async function PUT(req: Request) {
  try {
    await connectToDB();
    const { id, address, days, times, hourlyWage } = await req.json();

    // 🔍 **DB에서 요양보호사 찾기**
    const caregiver = await Caregiver.findOne({ id });

    if (!caregiver) {
      return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다!" }, { status: 404 });
    }

    // 🛠️ **구직 정보 업데이트**
    caregiver.jobInfo = {
      address: address as string[],
      days: days as string[],
      times: times as string[],
      hourlyWage: Number(hourlyWage),
    };

    await caregiver.save();

    return NextResponse.json({
      success: true,
      message: "구직 정보가 수정되었습니다.",
      caregiver,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ [ERROR] 구직 정보 수정 실패:", error);
    return NextResponse.json({ success: false, message: "구직 정보 수정 실패", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // 🔍 **MongoDB에서 특정 요양보호사 찾기**
      const caregiver = await Caregiver.findOne({ id });

      if (!caregiver) {
        return NextResponse.json({ success: false, message: "요양보호사 정보를 찾을 수 없습니다." }, { status: 404 });
      }

      return NextResponse.json({ success: true, caregiver }, { status: 200 });
    }

    // 📌 **MongoDB에서 모든 요양보호사 가져오기**
    const caregivers = await Caregiver.find();

    return NextResponse.json({ success: true, caregivers }, { status: 200 });

  } catch (error) {
    console.error("❌ [ERROR] 요양보호사 조회 실패:", error);
    return NextResponse.json({ success: false, message: "요양보호사 조회 실패", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "삭제할 ID를 입력해주세요." }, { status: 400 });
    }

    // 🔍 **MongoDB에서 특정 요양보호사 삭제**
    const deletedCaregiver = await Caregiver.findOneAndDelete({ id });

    if (!deletedCaregiver) {
      return NextResponse.json({ success: false, message: "요양보호사를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "요양보호사가 삭제되었습니다.",
      deletedCaregiver,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ [ERROR] 요양보호사 삭제 실패:", error);
    return NextResponse.json({ success: false, message: "요양보호사 삭제 실패", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}