import { db } from "@/lib/db";
import { eventFormSchema } from "@/lib/validator";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { event, path } = await request.json();
    const eventPayload = eventFormSchema.parse(event);

    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    if (!params.eventId) {
      return new NextResponse("Event ID missing", { status: 400 });
    }

    const existingEvent = await db.event.findUnique({
      where: { id: event.id },
    });

    if (!existingEvent) throw new Error("Event not found");
    if (existingEvent.organizer !== userId) throw new Error("Unauthorized");

    const updateEvent = await db.event.update({
      where: { id: existingEvent.id },
      data: {
        ...eventPayload,
      },
    });

    revalidatePath(path);

    return NextResponse.json(updateEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.log("[EVENT_UPDATE]", error);
    return new NextResponse("Interanl error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {}
