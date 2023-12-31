import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { getURL } from "@/lib/get-url";
import { z } from "zod";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

const stringToNumber = z.string().transform((val) => val.length);

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { order } = await req.json();

    const price = order.isFree
      ? 0
      : stringToNumber.parse(order.totalAmount) * 100;

    console.log(price, "price");

    if (!params.eventId)
      return new NextResponse("Event ID is required", { status: 400 });

    const event = await db.event.findUnique({
      where: { id: params.eventId },
    });

    if (!event) throw new Error("Event not found");

    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // // create stripe session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "USD",
            unit_amount: price,
            product_data: {
              name: event?.title,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: event.id,
        buyerId: userId,
      },
      mode: "payment",
      success_url: `${getURL()}/profile`,
      cancel_url: `${getURL()}/`,
    });

    const newOrder = await db.order.create({
      data: {
        userId,
        stripeId: session.id,
        eventId: params.eventId,
        totalAmount: String(price),
      },
    });

    // // redirect(session.url!);

    return NextResponse.json({
      order: newOrder,
      session,
    });
  } catch (error) {
    console.log("[CHECKOUT_CREATE]", error);
    return new NextResponse("Interanl error", { status: 500 });
  }
}
