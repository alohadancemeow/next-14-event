import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await db.category.findMany();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const { userId } = auth();

    console.log(userId, "userid");

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });

    const category = await db.category.create({
      data: {
        name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_CREATE]", error);
    return new NextResponse("Interanl error", { status: 500 });
  }
}
