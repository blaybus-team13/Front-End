import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const KAKAO_API_KEY = "50f92a6f823acfa0e0636e329463bb8d";

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
    return NextResponse.json({ status: 500 });
  }
}
