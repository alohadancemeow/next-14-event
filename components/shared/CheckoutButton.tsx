"use client";

import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import Checkout from "./Checkout";

import { Event } from "@prisma/client";

const CheckoutButton = ({ event }: { event: Event }) => {
  // const { user } = useUser();
  // const userId = user?.publicMetadata.userId as string;
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  return (
    <div className="flex items-center gap-3">
      {hasEventFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : (
        <>
          <SignedOut>
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">Get Tickets</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Checkout event={event} />
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
