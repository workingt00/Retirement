import type { YearResult, SimulationResult, SimulationSummary } from "@wealthpath/engine";

export function generateMockYears(
  startAge: number = 41,
  retireAge: number = 55,
  endAge: number = 80,
): YearResult[] {
  const years: YearResult[] = [];
  const startYear = 2025;

  let trad401k = 56000;
  let roth401k = 0;
  let tradIRA = 0;
  let rothIRA = 5500;
  let portfolio = 200000;
  let foreign = 145000;
  let plan529 = 0;

  for (let age = startAge; age <= endAge; age++) {
    const year = startYear + (age - startAge);
    const isRetired = age >= retireAge;
    const yearsRetired = isRetired ? age - retireAge : 0;

    // Income
    const w2Income = isRetired ? 0 : 180000 * Math.pow(1.03, age - startAge);
    const w9Income = isRetired ? 0 : 15000;
    const ssAge = 70;
    const socialSecurity = age >= ssAge ? 36000 * Math.pow(1.03, age - ssAge) : 0;
    const otherIncome = 0;
    const totalIncome = w2Income + w9Income + socialSecurity + otherIncome;

    // Taxes
    const ordinaryTaxableIncome = Math.max(0, totalIncome - 30000);
    const federalTax = ordinaryTaxableIncome * 0.18;
    const stateTax = ordinaryTaxableIncome * 0.055;
    const ssTax = isRetired ? 0 : w2Income * 0.0765;
    const totalTax = federalTax + stateTax + ssTax;

    // Expenses
    const inflationMult = Math.pow(1.03, age - startAge);
    const housing = age <= 67 ? 40000 * inflationMult : 8000 * inflationMult;
    const groceries = 20400 * inflationMult;
    const bills = 8000 * inflationMult;
    const lifestyle = 43000 * inflationMult;
    const medical = age >= 50 ? 18000 * Math.pow(1.06, age - 50) : 5400 * inflationMult;
    const miscellaneous = 3600 * inflationMult;
    const kids = age <= 60 ? 4200 * inflationMult : 0;
    const lumpyExpenses = 0;
    const carExpenses = 0;
    const totalExpenses = housing + groceries + bills + lifestyle + medical + miscellaneous + kids;

    const annualCashFlow = totalIncome - totalTax - totalExpenses;
    const monthlyCashRemaining = annualCashFlow / 12;

    // Account growth
    const growthRate = 0.10;
    const rothGrowth = 0.12;

    if (!isRetired) {
      trad401k = trad401k * (1 + growthRate) + 23000;
      rothIRA = rothIRA * (1 + rothGrowth) + 7500;
      portfolio = portfolio * (1 + rothGrowth) + 13000;
      plan529 = plan529 * (1 + growthRate) + 2000;
      foreign = foreign * (1 + rothGrowth);
      // Roth conversion at 47+
      if (age >= 47) {
        const conversion = Math.min(45000, trad401k);
        trad401k -= conversion;
        rothIRA += conversion;
      }
    } else {
      // Retirement: withdraw from portfolio, accounts still grow
      const withdrawalNeed = Math.max(0, totalExpenses + totalTax - socialSecurity);
      trad401k = trad401k * (1 + growthRate * 0.8);
      rothIRA = rothIRA * (1 + rothGrowth * 0.8);
      portfolio = Math.max(0, portfolio * (1 + rothGrowth * 0.6) - withdrawalNeed);
      plan529 = Math.max(0, plan529 - (age >= 50 && age <= 54 ? 10000 : 0));
      foreign = age === retireAge ? 0 : foreign;
      if (age === retireAge) portfolio += foreign * 0.65;
    }

    // Transfer Roth 401k -> Roth IRA at 55
    if (age === 55 && roth401k > 0) {
      rothIRA += roth401k;
      roth401k = 0;
    }

    const totalTaxDeferred = trad401k + tradIRA;
    const totalTaxFree = roth401k + rothIRA + portfolio;
    const totalNetWorth = totalTaxDeferred + totalTaxFree + plan529 + foreign;

    const bearNetWorth = totalNetWorth * (0.6 + Math.random() * 0.15);
    const bullNetWorth = totalNetWorth * (1.15 + Math.random() * 0.15);

    const status: "OK" | "FAIL" = totalNetWorth > 0 ? "OK" : "FAIL";

    years.push({
      year,
      age,
      isRetired,
      w2Income: Math.round(w2Income),
      w9Income: Math.round(w9Income),
      socialSecurity: Math.round(socialSecurity),
      otherIncome,
      totalIncome: Math.round(totalIncome),
      ordinaryTaxableIncome: Math.round(ordinaryTaxableIncome),
      federalTax: Math.round(federalTax),
      stateTax: Math.round(stateTax),
      ssTax: Math.round(ssTax),
      totalTax: Math.round(totalTax),
      federalMarginalRate: ordinaryTaxableIncome > 206700 ? 0.24 : ordinaryTaxableIncome > 96950 ? 0.22 : 0.12,
      cgRate: ordinaryTaxableIncome < 96700 ? 0 : 0.15,
      housing: Math.round(housing),
      lumpyExpenses,
      carExpenses,
      groceries: Math.round(groceries),
      bills: Math.round(bills),
      lifestyle: Math.round(lifestyle),
      medical: Math.round(medical),
      miscellaneous: Math.round(miscellaneous),
      kids: Math.round(kids),
      totalExpenses: Math.round(totalExpenses),
      annualCashFlow: Math.round(annualCashFlow),
      monthlyCashRemaining: Math.round(monthlyCashRemaining),
      status,
      traditional401k: Math.round(trad401k),
      roth401k: Math.round(roth401k),
      traditionalIRA: Math.round(tradIRA),
      rothIRA: Math.round(rothIRA),
      privatePortfolio: Math.round(portfolio),
      plan529: Math.round(plan529),
      foreignPension: Math.round(foreign),
      rothConversionAmount: !isRetired && age >= 47 ? 45000 : 0,
      roth401kTransfer: age === 55 ? roth401k : 0,
      portfolioSellAmount: isRetired ? Math.round(Math.max(0, totalExpenses + totalTax - socialSecurity)) : 0,
      portfolioSellFedTax: 0,
      portfolioSellStateTax: 0,
      foreignPensionAfterTax: age === retireAge ? Math.round(foreign * 0.65) : 0,
      rothIRAContribution: !isRetired ? 7500 : 0,
      totalTaxDeferred: Math.round(totalTaxDeferred),
      totalTaxFree: Math.round(totalTaxFree),
      totalNetWorth: Math.round(totalNetWorth),
      w0Gap: 0,
      w0FromPortfolio: 0,
      w0FromTraditional: 0,
      w0FromRoth: 0,
      bearNetWorth: Math.round(bearNetWorth),
      bullNetWorth: Math.round(bullNetWorth),
      bearStatus: bearNetWorth > 0 ? "OK" : "FAIL",
      bullStatus: "OK",
      activeMoves: !isRetired ? ["C1", "C3", "C4"] : ["W1", "S1"],
    });
  }

  return years;
}

export function generateMockSimulation(): SimulationResult {
  const years = generateMockYears();
  const lastYear = years[years.length - 1];
  const retireYear = years.find((y) => y.isRetired);

  const summary: SimulationSummary = {
    firstFailureAge: null,
    yearsOfRunway: 40,
    totalFailYears: 0,
    netWorthAtRetirement: retireYear?.totalNetWorth ?? 0,
    netWorthAt60: years.find((y) => y.age === 60)?.totalNetWorth ?? 0,
    netWorthAt65: years.find((y) => y.age === 65)?.totalNetWorth ?? 0,
    netWorthAt70: years.find((y) => y.age === 70)?.totalNetWorth ?? 0,
    netWorthAt75: years.find((y) => y.age === 75)?.totalNetWorth ?? 0,
    netWorthAt80: lastYear.totalNetWorth,
    peakNetWorth: Math.max(...years.map((y) => y.totalNetWorth)),
    totalTaxesPaid: years.reduce((s, y) => s + y.totalTax, 0),
    totalIncomeEarned: years.reduce((s, y) => s + y.totalIncome, 0),
    totalExpenses: years.reduce((s, y) => s + y.totalExpenses, 0),
    totalSSReceived: years.reduce((s, y) => s + y.socialSecurity, 0),
    totalPortfolioSold: years.reduce((s, y) => s + y.portfolioSellAmount, 0),
    effectiveTaxRate: 0.18,
    cashFlowWorking: 0,
    cashFlowEarlyRetire: 0,
    cashFlowPreSS: 0,
    cashFlowSSYears: 0,
    cashFlowLateRetire: 0,
    bearFirstFailureAge: 78,
    bullFirstFailureAge: null,
    bearYearsOfRunway: 37,
    bullYearsOfRunway: 40,
    bearNWAt80: 200000,
    bullNWAt80: lastYear.bullNetWorth,
    cgRateAtRetirement: 0,
    yearsAt0CG: 8,
    annual0CGHarvestCapacity: 96700,
    balancesAtRetirement: {
      traditional401k: retireYear?.traditional401k ?? 0,
      roth401k: retireYear?.roth401k ?? 0,
      rothIRA: retireYear?.rothIRA ?? 0,
      privatePortfolio: retireYear?.privatePortfolio ?? 0,
      foreignPension: retireYear?.foreignPension ?? 0,
      plan529: retireYear?.plan529 ?? 0,
    },
  };

  return { years, summary };
}
