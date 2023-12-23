"use server";

import { db } from "@/lib/db";
import { EventPopulated } from "@/types";

type EventProps = {
  query: string;
  category: string;
  page: string | number;
  limit: number;
};

export const getAllEvents = async ({
  query,
  category,
  limit = 3,
  page = "1",
}: EventProps) => {
  try {
    const skipAmount = (Number(page) - 1) * limit;

    const filter = db.event.findMany({
      where: {
        OR: [
          {
            Category: {
              name: { equals: category },
            },
          },
          {
            title: { contains: query },
          },
        ],
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

    const notFilter = db.event.findMany({
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

    const eventsBy = !query && !category ? notFilter : filter;

    const [events, total] = await db.$transaction([eventsBy, db.event.count()]);

    return {
      data: events as EventPopulated[],
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log(error);
  }
};

// note --> count item: https://github.com/prisma/prisma/discussions/3087
