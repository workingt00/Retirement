import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? "",
    annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID ?? "",
  },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier, interval } = await req.json();
  const priceId = PRICE_IDS[tier]?.[interval];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier or interval" }, { status: 400 });
  }

  // Get or create Stripe customer
  let sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;

    if (sub) {
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    } else {
      await prisma.subscription.create({
        data: { userId: session.user.id, stripeCustomerId: customerId },
      });
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings`,
    metadata: { userId: session.user.id, tier },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
