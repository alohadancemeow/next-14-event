"use server";

import { db } from "@/lib/db";
import { EventPopulated } from "@/types";
import { Category } from "@prisma/client";

type RelatedEventProps = {
  eventId: string;
  categoryId: string;
  limit?: number;
  page?: number | string;
};

export const getRelatedEvents = async ({
  categoryId,
  eventId,
  limit = 3,
  page = "1",
}: RelatedEventProps) => {
  try {
    const skipAmount = (Number(page) - 1) * limit;

    const relatedEvents = await db.event.findMany({
      where: {
        categoryId,
        NOT: {
          id: eventId,
        },
      },
      skip: skipAmount,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: relatedEvents as EventPopulated[],
      totalPages: Math.ceil(relatedEvents.length / limit),
    };
  } catch (error) {
    console.log(error);
  }
};

// note --> count item: https://github.com/prisma/prisma/discussions/3087
