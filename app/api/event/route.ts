import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import * as z from "zod";
import { eventFormSchema } from "@/lib/validator";
import { revalidatePath } from "next/cache";

export async function GET() {
  const events = await db.event.findMany();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const { event, path } = await request.json();
    const eventPayload = eventFormSchema.parse(event);

    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const newEvent = await db.event.create({
      data: {
        organizer: userId,
        ...eventPayload,
      },
    });

    revalidatePath(path);

    return NextResponse.json(newEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.log("[EVENT_CREATE]", error);
    return new NextResponse("Interanl error", { status: 500 });
  }
}
