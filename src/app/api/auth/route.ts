import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "";

/** POST 요청: 로그인 요청 */
export async function POST(req: Request) {
  const { id, password } = await req.json();

  try {
    const client = await MongoClient.connect(uri);
    const database = client.db(dbName);
    const collection = database.collection("carer");

    const existingCarer = await collection
      .find({ id, password })
      .limit(1)
      .toArray();

    if (existingCarer.length === 0) {
      return NextResponse.json(
        { success: false, message: "계정 정보를 확인하세요." },
        { status: 401 }
      );
    }

    client.close();

    return NextResponse.json(
      {
        user: existingCarer[0],
        message: "로그인 성공",
        token: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "구직 정보 저장 실패", error },
      { status: 500 }
    );
  }
}
