let admins = [
    {
        id: 1,
        name: "최관리",
        username: "admin1",
        role: "센터장",
    },
    {
        id: 2,
        name: "김매니저",
        username: "manager2",
        role: "매니저",
    }
];

// 관리자 정보 가져오기
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (id) {
            const admin = admins.find((admin) => admin.id === parseInt(id));
            if (!admin) {
                return new Response(
                    JSON.stringify({ success: false, message: "해당 ID의 관리자를 찾을 수 없음" }),
                    { status: 404, headers: { "Content-Type": "application/json" } }
                );
            }
            return new Response(JSON.stringify({ success: true, admin }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, admins }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: "관리자 데이터 로드 실패", error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
