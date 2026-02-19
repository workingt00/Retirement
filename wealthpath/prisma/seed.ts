import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PLAN_DATA = {
  name: "My Plan",
  mode: "velocity",
  personal: { currentAge: 41, retirementAge: 55, filingStatus: "MFJ", state: "Georgia", stateEffectiveRate: 0.0549 },
  income: { w2Salary: 180000, w9Income: 15000, annualRaise: 3, partTimeInRetirement: false, partTimeAmount: 0 },
  socialSecurity: { monthlyBenefitAtFRA: 3000, quartersEarned: 40, claimingAge: 70 },
  balances: { traditional401k: 56000, rothIRA: 5500, privatePortfolio: 200000, foreignPension: 145000, plan529: 0 },
  housing: { ownershipType: "own_mortgage", monthlyMortgage: 2684, monthlyPropertyTax: 300, monthlyInsurance: 250, monthlyHOA: 115, mortgageBalance: 467977, mortgageEndAge: 67 },
  expenses: {
    groceries: 1100, diningOut: 600, kidsExpenses: 350,
    utilities: { gas: 100, electricity: 120, water: 90, exterminator: 75 },
    subscriptions: { amazonPrime: 16, instacart: 11, walmart: 9, homeSecurity: 33, streaming: 18, selfDriving: 100, other: 75 },
    otherSpending: { clothes: 100, sports: 100, gym: 50, storage: 5, onlineGames: 20, miscellaneous: 25 },
  },
  healthcare: { monthlyPremium: 450, chronicConditions: "none", projectedAnnualAge50Plus: 18000 },
  lifestyle: { annualTravelHobby: 43000, expectToRelocate: false, expectToDownsize: false, inflationRate: 3 },
  investment: { style: "moderate", growth401k: 0.10, growthRothPortfolio: 0.12 },
  goalSolver: { targetNetWorth: 2000000, employerMatchPercent: 4 },
  growthRates: { traditional401k: 0.10, roth401k: 0.10, traditionalIRA: 0.10, rothIRA: 0.12, privatePortfolio: 0.12, foreignPension: 0.12, plan529: 0.10 },
  sensitivity: { bearAdjustment: -0.04, bullAdjustment: 0.02 },
  tax: { mode: "BRACKET", standardDeduction: 30000, cgTaxablePortion: 0.75, ssTaxablePortion: 0.85, flatFederalRate: 0.139 },
  inflation: { general: 1.03, medical: 1.06, incomeGrowth: 1.03 },
};

async function main() {
  const marcus = await prisma.user.create({
    data: {
      email: "demo-velocity@wealthpath.com",
      name: "Marcus",
      mode: "velocity",
      passwordHash: bcrypt.hashSync("demo123", 10),
    },
  });
  await prisma.plan.create({
    data: { userId: marcus.id, name: "FIRE at 45", data: DEFAULT_PLAN_DATA },
  });

  const patricia = await prisma.user.create({
    data: {
      email: "demo-horizon@wealthpath.com",
      name: "Patricia",
      mode: "horizon",
      passwordHash: bcrypt.hashSync("demo123", 10),
    },
  });
  await prisma.plan.create({
    data: {
      userId: patricia.id,
      name: "Retire at 62",
      data: {
        ...DEFAULT_PLAN_DATA,
        mode: "horizon",
        personal: { ...DEFAULT_PLAN_DATA.personal, currentAge: 57, retirementAge: 62 },
      },
    },
  });

  console.log('Seeded demo users: Marcus (velocity) and Patricia (horizon)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
