import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { simulate } from "@wealthpath/engine";
import { TIER_LIMITS } from "@wealthpath/engine";
import type { UserPlan } from "@wealthpath/engine";

const t = initTRPC.context<{ userId: string | null }>().create();
const publicProcedure = t.procedure;
const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { userId: ctx.userId } });
});

async function getUserTier(userId: string): Promise<"free" | "pro" | "premium"> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.status !== "active") return "free";
  return sub.tier as "free" | "pro" | "premium";
}

// ==================== PLAN ROUTER ====================
const planRouter = t.router({
  list: authedProcedure.query(async ({ ctx }) => {
    const plans = await prisma.plan.findMany({
      where: { userId: ctx.userId },
      orderBy: { updatedAt: "desc" },
    });
    return plans.map((p) => ({ ...p, data: JSON.parse(p.data) }));
  }),

  get: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await prisma.plan.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { scenarios: true },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        ...plan,
        data: JSON.parse(plan.data),
        scenarios: plan.scenarios.map((s) => ({
          ...s,
          snapshot: JSON.parse(s.snapshot),
          config: JSON.parse(s.config),
        })),
      };
    }),

  create: authedProcedure
    .input(z.object({ name: z.string().optional(), data: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const tier = await getUserTier(ctx.userId);
      const count = await prisma.plan.count({ where: { userId: ctx.userId } });
      if (count >= TIER_LIMITS[tier].maxPlans) {
        throw new TRPCError({ code: "FORBIDDEN", message: `Plan limit reached for ${tier} tier` });
      }
      const created = await prisma.plan.create({
        data: { userId: ctx.userId, name: input.name ?? "My Plan", data: JSON.stringify(input.data) },
      });
      return { ...created, data: JSON.parse(created.data) };
    }),

  update: authedProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), data: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await prisma.plan.findFirst({ where: { id: input.id, userId: ctx.userId } });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.plan.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.data && { data: JSON.stringify(input.data) }),
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await prisma.plan.findFirst({ where: { id: input.id, userId: ctx.userId } });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.plan.delete({ where: { id: input.id } });
    }),

  simulate: authedProcedure
    .input(z.object({ planData: z.any() }))
    .mutation(async ({ input }) => {
      return simulate(input.planData as UserPlan);
    }),
});

// ==================== SCENARIO ROUTER ====================
const scenarioRouter = t.router({
  create: authedProcedure
    .input(z.object({ planId: z.string(), name: z.string(), snapshot: z.any(), config: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await prisma.plan.findFirst({ where: { id: input.planId, userId: ctx.userId } });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });

      const tier = await getUserTier(ctx.userId);
      const count = await prisma.scenario.count({ where: { planId: input.planId } });
      if (count >= TIER_LIMITS[tier].maxScenarios) {
        throw new TRPCError({ code: "FORBIDDEN", message: `Scenario limit reached for ${tier} tier` });
      }

      return prisma.scenario.create({
        data: {
          planId: input.planId,
          name: input.name,
          snapshot: JSON.stringify(input.snapshot),
          config: JSON.stringify(input.config),
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scenario = await prisma.scenario.findFirst({
        where: { id: input.id },
        include: { plan: true },
      });
      if (!scenario || scenario.plan.userId !== ctx.userId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return prisma.scenario.delete({ where: { id: input.id } });
    }),
});

// ==================== USER ROUTER ====================
const userRouter = t.router({
  me: authedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { id: ctx.userId },
      include: { subscription: true },
    });
  }),

  setMode: authedProcedure
    .input(z.object({ mode: z.enum(["horizon", "velocity"]) }))
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.userId },
        data: { mode: input.mode },
      });
    }),

  updateProfile: authedProcedure
    .input(z.object({ name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.userId },
        data: { ...(input.name && { name: input.name }) },
      });
    }),
});

// ==================== SUBSCRIPTION ROUTER ====================
const subscriptionRouter = t.router({
  status: authedProcedure.query(async ({ ctx }) => {
    const sub = await prisma.subscription.findUnique({ where: { userId: ctx.userId } });
    return { tier: sub?.tier ?? "free", status: sub?.status ?? "none", currentPeriodEnd: sub?.currentPeriodEnd };
  }),
});

// ==================== APP ROUTER ====================
export const appRouter = t.router({
  plan: planRouter,
  scenario: scenarioRouter,
  user: userRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
