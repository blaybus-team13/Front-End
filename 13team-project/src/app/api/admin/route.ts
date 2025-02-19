import { NextResponse } from "next/server";

// ✅ 관리자 초기 데이터 (배열)
let admins = [
    {
        id: "admin1",
        name: "최관리",
        password: "admin123", // ⚠️ 실제 환경에서는 반드시 암호화 필요
        role: "센터장",
    },
    {
        id: "manager2",
        name: "김매니저",
        password: "manager123", // ⚠️ 실제 환경에서는 반드시 암호화 필요
        role: "매니저",
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
                return NextResponse.json({ success: false, message: "해당 ID의 관리자를 찾을 수 없음" }, { status: 404 });
            }
            return NextResponse.json({ success: true, admin }, { status: 200 });
        }

        return NextResponse.json({ success: true, admins }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "관리자 데이터 로드 실패", error }, { status: 500 });
    }
}

/** ✅ POST 요청: 관리자 회원가입 또는 로그인 처리 */
export async function POST(req: Request) {
    try {
        const { id, password, name, role, position } = await req.json();

        // 🔹 로그인 요청 처리 (이름과 역할이 없을 경우 로그인으로 간주)
        if (!name && !role) {
            const admin = admins.find((admin) => admin.id === id && admin.password === password);
            if (!admin) {
                return NextResponse.json({ success: false, message: "아이디 또는 비밀번호가 잘못되었습니다." }, { status: 401 });
            }
            return NextResponse.json({ success: true, admin }, { status: 200 });
        }

        // 🔹 회원가입 요청 처리
        if (!id || !password || !name || !role) {
            return NextResponse.json({ success: false, message: "모든 필드를 입력해주세요!" }, { status: 400 });
        }

        // 중복 아이디 확인
        if (admins.some((admin) => admin.id === id)) {
            return NextResponse.json({ success: false, message: "이미 존재하는 아이디입니다." }, { status: 400 });
        }

        const newAdmin = {
            id,
            name,
            position,
            password, // ⚠️ 실제 환경에서는 비밀번호 해싱 필요 (bcrypt 사용)
            role,
        };

        admins.push(newAdmin);

        return NextResponse.json({
            success: true,
            message: "관리자 회원가입 성공!",
            admin: newAdmin,
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: "회원가입 또는 로그인 실패", error }, { status: 500 });
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
        return NextResponse.json({ success: false, message: "관리자 삭제 실패", error }, { status: 500 });
    }
}
