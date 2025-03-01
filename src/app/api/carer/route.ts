import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const { uri, dbName } = require("../../../utils/db_connect");

/** POST 요청: 회원등록 */
export async function POST(req: Request) {
  const { name, phone, position, id, password } = await req.json();

  try {
    // 유효성 검사
    if (!name || !phone || !position || !id || !password) {
      return NextResponse.json(
        { success: false, message: "모든 정보를 입력해주세요" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(uri);
    const database = client.db(dbName);
    const collection = database.collection("carer");

    const existingCarer = await collection.find({ id }).limit(1).toArray();

    if (existingCarer.length) {
      return NextResponse.json(
        { success: false, message: "이미 등록된 ID입니다." },
        { status: 409 }
      );
    }

    await collection.insertOne({ name, phone, position, id, password });
    client.close();

    return NextResponse.json(
      {
        success: true,
        message: "회원 가입 성공",
        data: { name, phone, position, id },
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
