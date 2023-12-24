"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { Order } from "@prisma/client";
import { NextResponse } from "next/server";

type OrderProps = {
  page: string | number;
  limit?: number;
};

export const getOrdersByUser = async ({
  limit = 3,
  page = "1",
}: OrderProps) => {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const skipAmount = (Number(page) - 1) * limit;

    const [orders, total] = await db.$transaction([
      db.order.findMany({
        where: {
          userId,
        },
        skip: skipAmount,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.order.count(),
    ]);

    return {
      data: orders as Order[],
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log(error);
  }
};
