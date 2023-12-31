import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export const getOrders = async (query: string) => {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    const orders = await db.order.findMany({
      where: {
        OR: [
          {},
          {
            event: {
              title: {
                contains: query,
              },
            },
          },
        ],
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return orders;
  } catch (error) {
    console.log(error);
  }
};
