"use server";

import { db } from "@/lib/db";
import { EventPopulated } from "@/types";
import { auth } from "@clerk/nextjs";

type OrderProps = {
  page: string | number;
  limit?: number;
};

export const getEventOrdersByUser = async ({
  limit = 3,
  page = "1",
}: OrderProps) => {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    const skipAmount = (Number(page) - 1) * limit;

    const [events, total] = await db.$transaction([
      db.event.findMany({
        where: {
          Order: {
            userId,
          },
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
      db.order.count(),
    ]);

    return {
      data: events as EventPopulated[],
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log(error);
  }
};
