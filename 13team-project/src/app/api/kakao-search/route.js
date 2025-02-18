import { NextResponse } from "next/server"; // ✅ NextRequest 삭제

export async function GET(req) {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY; // 환경 변수 사용

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ message: "Missing query parameter" }, { status: 400 });
    }

    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Kakao API 오류: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "서버 오류", error: error.message }, { status: 500 });
  }
}
