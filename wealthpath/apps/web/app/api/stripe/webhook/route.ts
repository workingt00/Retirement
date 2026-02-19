import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier ?? "pro";
      if (userId) {
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubId: session.subscription as string,
            stripePriceId: tier,
            tier,
            status: "active",
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubId: session.subscription as string,
            stripePriceId: tier,
            tier,
            status: "active",
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findUnique({
        where: { stripeSubId: subscription.id },
      });
      if (sub) {
        await prisma.subscription.update({
          where: { stripeSubId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findUnique({
        where: { stripeSubId: subscription.id },
      });
      if (sub) {
        await prisma.subscription.update({
          where: { stripeSubId: subscription.id },
          data: { tier: "free", status: "canceled" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
