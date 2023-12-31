"use client";

import axios from "axios";
import React, { useEffect } from "react";
import { getStripe } from "@/lib/stripe-client";

import { Button } from "../ui/button";
import { Event } from "@prisma/client";
import { OrderInput } from "@/types";

const Checkout = ({ event }: { event: Event }) => {
  const onCheckout = async () => {
    const order: OrderInput = {
      totalAmount: event.price,
      isFree: event.isFree,
    };

    try {
      const response = await axios.post(`/api/checkout/${event.id}`, { order });
      // console.log(response, "response");

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId: response.data.session.id });
    } catch (error) {
      console.log(error);
    }
  };

  // Check to see if this is a redirect back from Checkout
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);

  return (
    <form action={onCheckout} method="post">
      <Button type="submit" role="link" size="lg" className="button sm:w-fit">
        {event.isFree ? "Get Ticket" : "Buy Ticket"}
      </Button>
    </form>
  );
};

export default Checkout;
