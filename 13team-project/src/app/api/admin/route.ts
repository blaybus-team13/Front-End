import { NextResponse } from "next/server";

// 관리자 데이터 저장 (임시 데이터베이스)
let admins = [
    {
        id: "admin1",
        name: "최관리",
        password: "admin123", // 실제 환경에서는 반드시 암호화 필요
        role: "관리자",
        position: "센터장",
        phone: "010-1234-5678",
        place_name: "서울요양원",
        address_name: "서울특별시 강남구 강남대로 123",
    }
];

/** ✅ GET 요청: 관리자 정보 가져오기 (ID가 없으면 전체 목록 반환) */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (id) {
            const admin = admins.find((admin) => admin.id === id);
            if (!admin) {
                return NextResponse.json({ success: false, message: "해당 ID의 관리자를 찾을 수 없습니다." }, { status: 404 });
            }
            return NextResponse.json({ success: true, admin }, { status: 200 });
        }

        return NextResponse.json({ success: true, admins }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "관리자 데이터 로드 실패",
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}

/** ✅ POST 요청: 관리자 회원가입 */
export async function POST(req: Request) {
    try {
        const { id, password, name, role, position, phone, place_name, address_name } = await req.json();

        if (!id || !password || !name || !role || !phone || !place_name || !address_name) {
            return NextResponse.json({ success: false, message: "모든 필드를 입력해주세요!" }, { status: 400 });
        }

        if (admins.some((admin) => admin.id === id)) {
            return NextResponse.json({ success: false, message: "이미 존재하는 아이디입니다." }, { status: 400 });
        }

        const newAdmin = {
            id,
            name,
            role,
            position: position || "센터장",
            phone,
            password, // 실제 환경에서는 해싱 필요 (bcrypt 사용 권장)
            place_name,
            address_name,
        };

        admins.push(newAdmin);

        return NextResponse.json({
            success: true,
            message: "관리자 회원가입 성공!",
            admin: newAdmin,
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "회원가입 또는 로그인 실패",
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}

/** ✅ DELETE 요청: 특정 관리자 삭제 */
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "삭제할 관리자 ID를 입력해주세요." }, { status: 400 });
        }

        const initialLength = admins.length;
        admins = admins.filter((admin) => admin.id !== id);

        if (admins.length === initialLength) {
            return NextResponse.json({ success: false, message: "해당 관리자를 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "관리자가 삭제되었습니다.",
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "관리자 삭제 실패",
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
