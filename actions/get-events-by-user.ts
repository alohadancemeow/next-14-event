"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { EventPopulated } from "@/types";

type EventProps = {
  page: string | number;
  limit?: number;
};

export const getEventsByUser = async ({
  limit = 6,
  page = "1",
}: EventProps) => {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    const skipAmount = (Number(page) - 1) * limit;

    const [events, total] = await db.$transaction([
      db.event.findMany({
        where: {
          organizer: userId,
        },
        skip: skipAmount,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.event.count(),
    ]);

    return {
      data: events as EventPopulated[],
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log(error);
  }
};
