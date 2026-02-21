import { UserPlan, YearResult, SimulationResult, SimulationSummary } from './types';
import { computeAnnualExpenses } from './constants';
import {
  computeFederalTax,
  computeFederalTaxFlat,
  computeCGTax,
  marginalCGRate,
  computeSSBenefit,
  computeStateTax,
} from './tax';
import {
  computeTraditional401k,
  computeRoth401k,
  computeTraditionalIRA,
  computeRothIRA,
  computePrivatePortfolio,
  compute529,
  computeForeignPension,
  computeAnnualDeferral,
  computeEmployerMatchFromTiers,
} from './accounts';
import { IRS_401K_ELECTIVE_LIMIT } from './constants';
import { isMoveActive, getMove, getMoveAmount, getCatchUpAmount, getRMDFactor } from './moves';
import { computeW0 } from './w0-queue';
import { computeSensitivity } from './sensitivity';

export function simulate(plan: UserPlan): SimulationResult {
  const years: YearResult[] = [];
  const moves = plan.moves;
  const baseExpenses = computeAnnualExpenses(plan);
  const ss = plan.socialSecurity;
  const annualSSBenefit = computeSSBenefit(ss.monthlyBenefitAtFRA, ss.claimingAge, ss.quartersEarned);

  // Track state
  let trad401k = plan.balances.traditional401k;
  let roth401k = 0;
  let tradIRA = 0;
  let rothIRA = plan.balances.rothIRA;
  let portfolio = plan.balances.privatePortfolio;
  let plan529 = plan.balances.plan529;
  let foreignPension = plan.balances.foreignPension;

  let foreignPensionLiquidated = false;
  let houseSold = false;
  let mortgagePaidOff = false;
  let relocated = false;
  let downsized = false;

  // Inflation accumulators
  let inflationFactor = 1;
  let medicalInflationFactor = 1;
  let incomeFactor = 1;

  // Expense base values (year 0)
  let housingExpense = baseExpenses.housing;
  const housingNonMortgage = baseExpenses.housingNonMortgage;

  for (let age = plan.personal.currentAge; age <= 80; age++) {
    const yearIndex = age - plan.personal.currentAge;
    const isRetired = age >= plan.personal.retirementAge;
    const activeMoves: string[] = [];

    // Update inflation factors (skip year 0)
    if (yearIndex > 0) {
      inflationFactor *= plan.inflation.general;
      medicalInflationFactor *= plan.inflation.medical;
      incomeFactor *= plan.inflation.incomeGrowth;
    }

    // ==================== INCOME ====================
    // D: W2 Income
    const w2Income = isRetired ? 0 : plan.income.w2Salary * incomeFactor;

    // E: W9/Other Income
    let w9Income = isRetired ? 0 : plan.income.w9Income * incomeFactor;

    // Income moves (I1, I2, I3)
    let otherIncome = 0;
    const i1 = getMove(moves, "I1");
    if (i1 && isMoveActive(i1, age)) { otherIncome += i1.amount * inflationFactor; activeMoves.push("I1"); }
    const i2 = getMove(moves, "I2");
    if (i2 && isMoveActive(i2, age)) { otherIncome += i2.amount * inflationFactor; activeMoves.push("I2"); }
    const i3 = getMove(moves, "I3");
    if (i3 && isMoveActive(i3, age)) { otherIncome += i3.amount * inflationFactor; activeMoves.push("I3"); }

    // F: Social Security
    const s1 = getMove(moves, "S1");
    let ssBenefit = 0;
    if (s1 && s1.enabled && age >= ss.claimingAge) {
      const yearsOfCOLA = age - ss.claimingAge;
      ssBenefit = annualSSBenefit * Math.pow(plan.inflation.general, yearsOfCOLA);
      activeMoves.push("S1");
    }

    const totalIncome = w2Income + w9Income + otherIncome + ssBenefit;

    // ==================== CONTRIBUTIONS (working years only) ====================
    let tradContrib = 0;
    let rothContrib = 0;
    let roth401kContrib = 0;
    let portfolioContrib = 0;
    let contrib529 = 0;
    let megaBackdoor = 0;
    let backdoorRoth = 0;
    let catchUpAmount = 0;
    let employerMatch = 0;

    if (!isRetired) {
      const c1 = getMove(moves, "C1");
      if (c1 && isMoveActive(c1, age)) { tradContrib = c1.amount; activeMoves.push("C1"); }

      const c2 = getMove(moves, "C2");
      if (c2 && isMoveActive(c2, age)) { roth401kContrib = c2.amount; activeMoves.push("C2"); }

      const c3 = getMove(moves, "C3");
      if (c3 && isMoveActive(c3, age)) { rothContrib = c3.amount; activeMoves.push("C3"); }

      const c4 = getMove(moves, "C4");
      if (c4 && isMoveActive(c4, age)) { portfolioContrib = c4.amount; activeMoves.push("C4"); }

      const c5 = getMove(moves, "C5");
      if (c5 && isMoveActive(c5, age)) { contrib529 = c5.amount; activeMoves.push("C5"); }

      const c7 = getMove(moves, "C7");
      if (c7 && isMoveActive(c7, age)) { megaBackdoor = c7.amount; activeMoves.push("C7"); }

      const c8 = getMove(moves, "C8");
      if (c8 && isMoveActive(c8, age)) { backdoorRoth = c8.amount; activeMoves.push("C8"); }

      // R1: Catch-up
      const r1 = getMove(moves, "R1");
      catchUpAmount = getCatchUpAmount(age, r1);
      if (catchUpAmount > 0) activeMoves.push("R1");

      // Employee deferral + employer match (tiered)
      // Deferral base = W2 gross comp (salary + bonus + commission); RSUs excluded
      const bonusIncome = isRetired ? 0 : (plan.income.bonusIncome ?? 0) * incomeFactor;
      const commissionIncome = isRetired ? 0 : (plan.income.commissionIncome ?? 0) * incomeFactor;
      const deferralBase = w2Income + bonusIncome + commissionIncome;
      const tiers = plan.income.employerMatchTiers ?? [];
      if (tiers.length > 0) {
        const deferral = computeAnnualDeferral(
          deferralBase,
          plan.income.deferralMode ?? "percent",
          plan.income.deferralPercent ?? 0,
          plan.income.deferralDollarPerPaycheck ?? 0,
          plan.income.payFrequency ?? 24,
          plan.income.maxDeferralPct ?? 0,
          IRS_401K_ELECTIVE_LIMIT,
        );
        // Override C1 move with computed deferral when deferral fields are set
        if ((plan.income.deferralPercent ?? 0) > 0 || (plan.income.deferralDollarPerPaycheck ?? 0) > 0) {
          tradContrib = deferral;
        }
        const effectivePct = deferralBase > 0 ? (deferral / deferralBase) * 100 : 0;
        employerMatch = computeEmployerMatchFromTiers(deferralBase, effectivePct, tiers);
      } else if ((plan.goalSolver as Record<string, unknown>).employerMatchPercent != null) {
        // Legacy fallback for unmigrated plans
        employerMatch = w2Income * ((plan.goalSolver as Record<string, unknown>).employerMatchPercent as number) / 100;
      }
    }

    // ==================== CONVERSIONS ====================

    // X1: Roth Conversion Ladder (Trad 401k -> Roth IRA)
    const x1 = getMove(moves, "X1");
    let rothConversionAmount = 0;
    if (x1 && isMoveActive(x1, age)) {
      rothConversionAmount = Math.min(x1.amount, trad401k * (1 + plan.growthRates.traditional401k) + tradContrib + catchUpAmount + employerMatch);
      activeMoves.push("X1");
    }

    // X3: Rollover Trad 401k -> Trad IRA
    const x3 = getMove(moves, "X3");
    let rolloverToIRA = 0;
    if (x3 && isMoveActive(x3, age) && age === x3.startAge) {
      // One-time: full balance after growth
      rolloverToIRA = (trad401k + tradContrib + catchUpAmount + employerMatch) * (1 + plan.growthRates.traditional401k);
      activeMoves.push("X3");
    }

    // ==================== ACCOUNT BALANCES ====================

    // AA: Traditional 401k
    // Withdrawals from trad 401k
    let w3Amount = 0;
    const w3 = getMove(moves, "W3");
    if (w3 && isMoveActive(w3, age)) { w3Amount = Math.min(w3.amount, trad401k); activeMoves.push("W3"); }

    let w8Amount = 0;
    const w8 = getMove(moves, "W8");
    if (w8 && isMoveActive(w8, age) && age === w8.startAge) {
      w8Amount = (trad401k + tradContrib + catchUpAmount + employerMatch) * (1 + plan.growthRates.traditional401k);
      activeMoves.push("W8");
    }

    // W11: Liquidate all
    const w11 = getMove(moves, "W11");
    let w11Active = w11 && isMoveActive(w11, age) && age === w11.startAge;
    let w11TradAmount = 0;
    let w11Roth401kAmount = 0;
    let w11TradIRAAmount = 0;
    let w11RothIRAAmount = 0;
    let w11PortfolioAmount = 0;

    trad401k = computeTraditional401k(
      trad401k,
      plan.growthRates.traditional401k,
      tradContrib,
      catchUpAmount,
      employerMatch,
      rothConversionAmount,
      w3Amount + w8Amount,
      rolloverToIRA
    );

    if (w11Active) {
      w11TradAmount = trad401k;
      trad401k = 0;
      activeMoves.push("W11");
    }

    // AC: Roth 401k
    // X2: Transfer Roth 401k -> Roth IRA
    const x2 = getMove(moves, "X2");
    let roth401kTransfer = 0;
    const roth401kBeforeTransfer = computeRoth401k(
      roth401k,
      plan.growthRates.roth401k,
      roth401kContrib,
      megaBackdoor,
      0
    );
    if (x2 && isMoveActive(x2, age) && age === x2.startAge) {
      roth401kTransfer = roth401kBeforeTransfer;
      activeMoves.push("X2");
    }
    if (w11Active) {
      w11Roth401kAmount = roth401kBeforeTransfer - roth401kTransfer;
      roth401k = 0;
    } else {
      roth401k = roth401kBeforeTransfer - roth401kTransfer;
    }

    // AE: Traditional IRA
    // X4: Partial Roth Conversion from IRA
    const x4 = getMove(moves, "X4");
    let x4Amount = 0;
    if (x4 && isMoveActive(x4, age)) {
      x4Amount = Math.min(x4.amount, (tradIRA + rolloverToIRA) * (1 + plan.growthRates.traditionalIRA));
      activeMoves.push("X4");
    }

    let w4Amount = 0;
    const w4 = getMove(moves, "W4");
    if (w4 && isMoveActive(w4, age)) { w4Amount = Math.min(w4.amount, tradIRA); activeMoves.push("W4"); }

    let w10Amount = 0;
    const w10 = getMove(moves, "W10");
    if (w10 && isMoveActive(w10, age) && age === w10.startAge) {
      w10Amount = (tradIRA + rolloverToIRA) * (1 + plan.growthRates.traditionalIRA);
      activeMoves.push("W10");
    }

    // R3: RMD
    const r3 = getMove(moves, "R3");
    let rmdAmount = 0;
    if (r3 && r3.enabled && age >= 73) {
      const totalTrad = trad401k + (tradIRA + rolloverToIRA) * (1 + plan.growthRates.traditionalIRA);
      rmdAmount = totalTrad / getRMDFactor(age);
      activeMoves.push("R3");
    }

    tradIRA = computeTraditionalIRA(
      tradIRA,
      plan.growthRates.traditionalIRA,
      rolloverToIRA,
      x4Amount,
      w4Amount + w10Amount + rmdAmount
    );

    if (w11Active) {
      w11TradIRAAmount = tradIRA;
      tradIRA = 0;
    }

    // AF: Roth IRA
    let w2RothAmount = 0;
    const w2Move = getMove(moves, "W2");
    if (w2Move && isMoveActive(w2Move, age)) { w2RothAmount = Math.min(w2Move.amount, rothIRA); activeMoves.push("W2"); }

    let w9RothAmount = 0;
    const w9Move = getMove(moves, "W9");
    if (w9Move && isMoveActive(w9Move, age) && age === w9Move.startAge) {
      w9RothAmount = rothIRA; // Full liquidation
      activeMoves.push("W9");
    }

    rothIRA = computeRothIRA(
      rothIRA,
      plan.growthRates.rothIRA,
      rothContrib + backdoorRoth,
      0,
      roth401kTransfer,
      x4Amount + rothConversionAmount,
      w2RothAmount + w9RothAmount
    );

    if (w11Active) {
      w11RothIRAAmount = rothIRA;
      rothIRA = 0;
    }

    // ==================== FOREIGN PENSION (AM) ====================
    const w5 = getMove(moves, "W5");
    let foreignPensionCash = 0;
    let foreignPensionAfterTax = 0;
    if (w5 && isMoveActive(w5, age) && !foreignPensionLiquidated && age === w5.startAge) {
      const fpValue = foreignPension * (1 + plan.growthRates.foreignPension);
      foreignPensionAfterTax = fpValue * 0.65; // ~35% tax
      foreignPensionCash = foreignPensionAfterTax;
      foreignPensionLiquidated = true;
      foreignPension = 0;
      activeMoves.push("W5");
    } else {
      foreignPension = computeForeignPension(foreignPension, plan.growthRates.foreignPension, foreignPensionLiquidated);
    }

    // ==================== LIFESTYLE MOVES ====================
    let mortgagePayoff = 0;
    let debtPayoff = 0;
    let downsizeEquity = 0;

    // L1: Sell the house
    const l1 = getMove(moves, "L1");
    if (l1 && isMoveActive(l1, age) && age === l1.startAge && !houseSold) {
      houseSold = true;
      activeMoves.push("L1");
    }

    // L2: Pay off mortgage early
    const l2 = getMove(moves, "L2");
    if (l2 && isMoveActive(l2, age) && age === l2.startAge && !mortgagePaidOff) {
      mortgagePayoff = plan.housing.mortgageBalance * inflationFactor; // Approximate remaining
      mortgagePaidOff = true;
      activeMoves.push("L2");
    }

    // L4: Relocate
    const l4 = getMove(moves, "L4");
    if (l4 && isMoveActive(l4, age) && age === l4.startAge && !relocated) {
      relocated = true;
      activeMoves.push("L4");
    }

    // L5: Downsize
    const l5 = getMove(moves, "L5");
    if (l5 && isMoveActive(l5, age) && age === l5.startAge && !downsized) {
      downsizeEquity = l5.amount;
      downsized = true;
      activeMoves.push("L5");
    }

    // L6: Pay off debts
    const l6 = getMove(moves, "L6");
    if (l6 && isMoveActive(l6, age) && age === l6.startAge) {
      debtPayoff = l6.amount;
      activeMoves.push("L6");
    }

    // ==================== PORTFOLIO WITHDRAWALS ====================
    let portfolioSellAmount = 0;

    // W1: Flat portfolio withdrawal
    const w1 = getMove(moves, "W1");
    if (w1 && isMoveActive(w1, age)) {
      portfolioSellAmount += Math.min(w1.amount, portfolio);
      activeMoves.push("W1");
    }

    // W7: Dividend income
    const w7 = getMove(moves, "W7");
    if (w7 && isMoveActive(w7, age)) {
      portfolioSellAmount += portfolio * w7.amount;
      activeMoves.push("W7");
    }

    // W6: 529 withdrawal
    const w6 = getMove(moves, "W6");
    let w6Amount = 0;
    if (w6 && isMoveActive(w6, age)) { w6Amount = Math.min(w6.amount, plan529); activeMoves.push("W6"); }

    // ==================== TAXABLE INCOME (M) ====================
    const tradDeduction = tradContrib + catchUpAmount;
    let ordinaryTaxableIncome: number;

    if (!isRetired) {
      ordinaryTaxableIncome = w2Income + w9Income + rothConversionAmount + x4Amount
        - tradDeduction + portfolioSellAmount * plan.tax.cgTaxablePortion
        + w3Amount + w4Amount + w8Amount + w10Amount + rmdAmount;
    } else {
      ordinaryTaxableIncome = rothConversionAmount + x4Amount
        + portfolioSellAmount * plan.tax.cgTaxablePortion
        + w3Amount + w4Amount + w8Amount + w10Amount + rmdAmount
        + otherIncome
        + (w11Active ? (w11TradAmount + w11TradIRAAmount) : 0);
    }

    // ==================== W0 (if enabled) ====================
    let w0Gap = 0;
    let w0FromPortfolio = 0;
    let w0FromTraditional = 0;
    let w0FromRoth = 0;

    const w0 = getMove(moves, "W0");
    if (w0 && isMoveActive(w0, age) && isRetired) {
      // Calculate expenses first to determine the gap
      // We need a preliminary expense calc here
      const prelimExpenses = computeExpensesForAge(
        age, plan, baseExpenses, inflationFactor, medicalInflationFactor,
        houseSold, mortgagePaidOff, relocated, downsized, housingNonMortgage
      );

      const incomeBeforeW0 = otherIncome + ssBenefit
        + (w11Active ? (w11RothIRAAmount + w11Roth401kAmount) : 0)
        + w2RothAmount;

      // Compute preliminary tax to estimate gap
      const prelimTax = computePrelimTax(plan, ordinaryTaxableIncome, 0, ssBenefit);
      w0Gap = Math.max(0, prelimExpenses + prelimTax - incomeBeforeW0 - ordinaryTaxableIncome);

      const totalTrad = trad401k + tradIRA;
      const w0Result = computeW0(
        w0Gap,
        portfolio,
        totalTrad,
        rothIRA,
        ordinaryTaxableIncome,
        plan.personal.filingStatus,
        plan.personal.stateEffectiveRate,
        plan.tax.cgTaxablePortion,
        plan.tax.standardDeduction
      );
      w0FromPortfolio = w0Result.fromPortfolio;
      w0FromTraditional = w0Result.fromTrad;
      w0FromRoth = w0Result.fromRoth;
      portfolioSellAmount += w0FromPortfolio;
      ordinaryTaxableIncome += w0FromTraditional;

      // Deduct W0 from accounts
      if (w0FromTraditional > 0) {
        const tradRatio = trad401k / (trad401k + tradIRA || 1);
        trad401k = Math.max(0, trad401k - w0FromTraditional * tradRatio);
        tradIRA = Math.max(0, tradIRA - w0FromTraditional * (1 - tradRatio));
      }
      rothIRA = Math.max(0, rothIRA - w0FromRoth);
      activeMoves.push("W0");
    }

    // ==================== W11 portfolio ====================
    if (w11Active) {
      w11PortfolioAmount = portfolio;
      portfolioSellAmount += w11PortfolioAmount;
    }

    // ==================== PORTFOLIO BALANCE (AH) ====================
    portfolio = computePrivatePortfolio(
      portfolio,
      plan.growthRates.privatePortfolio,
      portfolioContrib,
      portfolioSellAmount,
      foreignPensionCash,
      downsizeEquity,
      mortgagePayoff,
      debtPayoff
    );

    if (w11Active) {
      portfolio = 0;
    }

    // 529 (AL)
    plan529 = compute529(plan529, plan.growthRates.plan529, contrib529, w6Amount);

    // ==================== TAXES ====================
    const taxableOrdAfterDeduction = Math.max(0, ordinaryTaxableIncome - plan.tax.standardDeduction);

    // Federal tax on ordinary income
    let fedOrdinaryTax: number;
    if (plan.tax.mode === "FLAT") {
      fedOrdinaryTax = computeFederalTaxFlat(ordinaryTaxableIncome, plan.tax.standardDeduction, plan.tax.flatFederalRate);
    } else {
      fedOrdinaryTax = computeFederalTax(ordinaryTaxableIncome, plan.personal.filingStatus, plan.tax.standardDeduction);
    }

    // CG tax on portfolio sells
    const cgTax = computeCGTax(
      portfolioSellAmount,
      taxableOrdAfterDeduction,
      plan.personal.filingStatus,
      plan.tax.cgTaxablePortion
    );

    // SS tax
    const ssTax = ssBenefit * plan.tax.ssTaxablePortion * 0.12;

    // Early withdrawal penalties
    let earlyPenalty = 0;
    if (age < 59.5) {
      earlyPenalty += w8Amount * 0.10;
      earlyPenalty += w10Amount * 0.10;
      if (w11Active) earlyPenalty += (w11TradAmount + w11TradIRAAmount) * 0.10;
    }

    const federalTax = fedOrdinaryTax + cgTax + ssTax + earlyPenalty;
    const stateTax = computeStateTax(
      taxableOrdAfterDeduction,
      portfolioSellAmount,
      plan.tax.cgTaxablePortion,
      plan.personal.stateEffectiveRate
    );
    const totalTax = federalTax + stateTax;

    const cgRateForYear = marginalCGRate(taxableOrdAfterDeduction, plan.personal.filingStatus);

    // ==================== EXPENSES ====================
    const totalExpensesObj = computeExpensesForAge(
      age, plan, baseExpenses, inflationFactor, medicalInflationFactor,
      houseSold, mortgagePaidOff, relocated, downsized, housingNonMortgage
    );

    // Compute individual expense categories
    let yearHousing: number;
    if (houseSold) {
      yearHousing = 0;
    } else if (mortgagePaidOff || age >= plan.housing.mortgageEndAge) {
      yearHousing = housingNonMortgage * inflationFactor;
    } else {
      yearHousing = baseExpenses.housing * inflationFactor;
    }
    if (downsized) yearHousing *= 0.5;

    let yearGroceries = baseExpenses.groceries * inflationFactor;
    let yearBills = baseExpenses.bills * inflationFactor;
    let yearLifestyle = baseExpenses.lifestyle * inflationFactor;
    let yearMisc = baseExpenses.miscellaneous * inflationFactor;
    let yearKids = baseExpenses.kids * inflationFactor;

    if (relocated) {
      yearGroceries *= 0.8;
      yearBills *= 0.8;
      yearLifestyle *= 0.8;
      yearMisc *= 0.8;
    }

    // Medical
    let yearMedical: number;
    if (age >= 50) {
      yearMedical = plan.healthcare.projectedAnnualAge50Plus * (age >= 50 ? Math.pow(plan.inflation.medical, age - 50) : 1);
    } else {
      yearMedical = baseExpenses.medical * inflationFactor;
    }
    // R2: Medicare at 65
    if (getMove(moves, "R2")?.enabled && age >= 65) {
      yearMedical *= 0.7;
    }

    const totalExpenses = yearHousing + yearGroceries + yearBills + yearLifestyle + yearMedical + yearMisc + yearKids;

    // ==================== CASH FLOW ====================
    let annualCashFlow: number;
    if (!isRetired) {
      annualCashFlow = w2Income + w9Income - totalTax - totalExpenses
        - rothContrib - backdoorRoth - portfolioContrib - contrib529 - megaBackdoor;
    } else {
      const retiredIncome = ordinaryTaxableIncome + ssBenefit
        + w2RothAmount + w9RothAmount
        + (w11Active ? (w11RothIRAAmount + w11Roth401kAmount) : 0)
        + w0FromRoth;
      annualCashFlow = retiredIncome - totalTax - totalExpenses;
    }

    const monthlyCashRemaining = annualCashFlow / 12;
    const status: "OK" | "FAIL" = annualCashFlow >= 0 || !isRetired ? "OK" : "FAIL";

    // ==================== AGGREGATES ====================
    const totalTaxDeferred = trad401k + tradIRA;
    const totalTaxFree = roth401k + rothIRA + portfolio;
    const totalNetWorth = totalTaxDeferred + totalTaxFree + plan529 + foreignPension;

    years.push({
      year: new Date().getFullYear() + yearIndex,
      age,
      isRetired,
      w2Income,
      w9Income,
      socialSecurity: ssBenefit,
      otherIncome,
      totalIncome,
      ordinaryTaxableIncome,
      federalTax,
      stateTax,
      ssTax,
      totalTax,
      federalMarginalRate: 0, // Computed below
      cgRate: cgRateForYear,
      housing: yearHousing,
      lumpyExpenses: 0,
      carExpenses: 0,
      groceries: yearGroceries,
      bills: yearBills,
      lifestyle: yearLifestyle,
      medical: yearMedical,
      miscellaneous: yearMisc,
      kids: yearKids,
      totalExpenses,
      annualCashFlow,
      monthlyCashRemaining,
      status,
      traditional401k: trad401k,
      roth401k,
      traditionalIRA: tradIRA,
      rothIRA,
      privatePortfolio: portfolio,
      plan529,
      foreignPension,
      rothConversionAmount,
      roth401kTransfer,
      portfolioSellAmount,
      portfolioSellFedTax: cgTax,
      portfolioSellStateTax: portfolioSellAmount * plan.tax.cgTaxablePortion * plan.personal.stateEffectiveRate,
      foreignPensionAfterTax,
      rothIRAContribution: rothContrib + backdoorRoth,
      totalTaxDeferred,
      totalTaxFree,
      totalNetWorth,
      w0Gap,
      w0FromPortfolio,
      w0FromTraditional,
      w0FromRoth,
      bearNetWorth: 0,
      bullNetWorth: 0,
      bearStatus: "OK",
      bullStatus: "OK",
      activeMoves,
    });
  }

  // ==================== SENSITIVITY ====================
  const avgGrowth = (plan.growthRates.traditional401k + plan.growthRates.privatePortfolio + plan.growthRates.rothIRA) / 3;
  const sens = computeSensitivity(
    years,
    plan.sensitivity.bearAdjustment,
    plan.sensitivity.bullAdjustment,
    avgGrowth,
    plan.personal.retirementAge
  );

  for (let i = 0; i < years.length; i++) {
    years[i].bearNetWorth = sens.bear[i].nw;
    years[i].bullNetWorth = sens.bull[i].nw;
    years[i].bearStatus = sens.bear[i].status;
    years[i].bullStatus = sens.bull[i].status;
  }

  // ==================== SUMMARY ====================
  const summary = computeSummary(years, plan, sens);

  return { years, summary };
}

function computeExpensesForAge(
  age: number,
  plan: UserPlan,
  baseExpenses: ReturnType<typeof computeAnnualExpenses>,
  inflationFactor: number,
  medicalInflationFactor: number,
  houseSold: boolean,
  mortgagePaidOff: boolean,
  relocated: boolean,
  downsized: boolean,
  housingNonMortgage: number
): number {
  let housing: number;
  if (houseSold) {
    housing = 0;
  } else if (mortgagePaidOff || age >= plan.housing.mortgageEndAge) {
    housing = housingNonMortgage * inflationFactor;
  } else {
    housing = baseExpenses.housing * inflationFactor;
  }
  if (downsized) housing *= 0.5;

  let groceries = baseExpenses.groceries * inflationFactor;
  let bills = baseExpenses.bills * inflationFactor;
  let lifestyle = baseExpenses.lifestyle * inflationFactor;
  let misc = baseExpenses.miscellaneous * inflationFactor;
  const kids = baseExpenses.kids * inflationFactor;

  if (relocated) {
    groceries *= 0.8;
    bills *= 0.8;
    lifestyle *= 0.8;
    misc *= 0.8;
  }

  let medical: number;
  if (age >= 50) {
    medical = plan.healthcare.projectedAnnualAge50Plus * Math.pow(plan.inflation.medical, age - 50);
  } else {
    medical = baseExpenses.medical * inflationFactor;
  }
  if (getMove(plan.moves, "R2")?.enabled && age >= 65) {
    medical *= 0.7;
  }

  return housing + groceries + bills + lifestyle + medical + misc + kids;
}


function computePrelimTax(plan: UserPlan, ordinaryIncome: number, portfolioSell: number, ssBenefit: number): number {
  const fedTax = plan.tax.mode === "FLAT"
    ? computeFederalTaxFlat(ordinaryIncome, plan.tax.standardDeduction, plan.tax.flatFederalRate)
    : computeFederalTax(ordinaryIncome, plan.personal.filingStatus, plan.tax.standardDeduction);
  const ssTax = ssBenefit * plan.tax.ssTaxablePortion * 0.12;
  const stateTax = Math.max(0, ordinaryIncome - plan.tax.standardDeduction) * plan.personal.stateEffectiveRate;
  return fedTax + ssTax + stateTax;
}

function computeSummary(
  years: YearResult[],
  plan: UserPlan,
  sens: { bear: { nw: number; status: "OK" | "FAIL" }[]; bull: { nw: number; status: "OK" | "FAIL" }[] }
): SimulationSummary {
  const retireIdx = plan.personal.retirementAge - plan.personal.currentAge;

  let firstFailureAge: number | null = null;
  let totalFailYears = 0;
  let totalTaxesPaid = 0;
  let totalIncomeEarned = 0;
  let totalExpenses = 0;
  let totalSSReceived = 0;
  let totalPortfolioSold = 0;
  let peakNetWorth = 0;
  let bearFirstFail: number | null = null;
  let bullFirstFail: number | null = null;
  let yearsAt0CG = 0;

  for (let i = 0; i < years.length; i++) {
    const yr = years[i];
    totalTaxesPaid += yr.totalTax;
    totalIncomeEarned += yr.totalIncome;
    totalExpenses += yr.totalExpenses;
    totalSSReceived += yr.socialSecurity;
    totalPortfolioSold += yr.portfolioSellAmount;
    if (yr.totalNetWorth > peakNetWorth) peakNetWorth = yr.totalNetWorth;
    if (yr.status === "FAIL") {
      totalFailYears++;
      if (firstFailureAge === null) firstFailureAge = yr.age;
    }
    if (sens.bear[i].status === "FAIL" && bearFirstFail === null) bearFirstFail = yr.age;
    if (sens.bull[i].status === "FAIL" && bullFirstFail === null) bullFirstFail = yr.age;
    if (yr.cgRate === 0) yearsAt0CG++;
  }

  const getYearByAge = (a: number) => years.find(y => y.age === a);
  const nwAt = (a: number) => getYearByAge(a)?.totalNetWorth ?? 0;
  const bearNWAt = (a: number) => {
    const idx = a - plan.personal.currentAge;
    return idx >= 0 && idx < sens.bear.length ? sens.bear[idx].nw : 0;
  };
  const bullNWAt = (a: number) => {
    const idx = a - plan.personal.currentAge;
    return idx >= 0 && idx < sens.bull.length ? sens.bull[idx].nw : 0;
  };

  const retireYear = getYearByAge(plan.personal.retirementAge);
  const ssStartAge = plan.socialSecurity.claimingAge;

  // Cash flow phases (average annual)
  let cfWorking = 0, cfWorkingCount = 0;
  let cfEarlyRetire = 0, cfEarlyRetireCount = 0;
  let cfPreSS = 0, cfPreSSCount = 0;
  let cfSS = 0, cfSSCount = 0;
  let cfLate = 0, cfLateCount = 0;

  for (const yr of years) {
    if (!yr.isRetired) { cfWorking += yr.annualCashFlow; cfWorkingCount++; }
    else if (yr.age < ssStartAge && yr.age < 65) { cfEarlyRetire += yr.annualCashFlow; cfEarlyRetireCount++; }
    else if (yr.age < ssStartAge) { cfPreSS += yr.annualCashFlow; cfPreSSCount++; }
    else if (yr.age < 75) { cfSS += yr.annualCashFlow; cfSSCount++; }
    else { cfLate += yr.annualCashFlow; cfLateCount++; }
  }

  // CG harvest capacity: room in 0% bracket
  const cgThreshold = plan.personal.filingStatus === "MFJ" ? 96700 : 48350;
  const retireOrdinary = retireYear?.ordinaryTaxableIncome ?? 0;
  const annual0CGCapacity = Math.max(0, cgThreshold - Math.max(0, retireOrdinary - plan.tax.standardDeduction)) / plan.tax.cgTaxablePortion;

  return {
    firstFailureAge,
    yearsOfRunway: firstFailureAge ? firstFailureAge - plan.personal.retirementAge : 80 - plan.personal.retirementAge,
    totalFailYears,
    netWorthAtRetirement: nwAt(plan.personal.retirementAge),
    netWorthAt60: nwAt(60),
    netWorthAt65: nwAt(65),
    netWorthAt70: nwAt(70),
    netWorthAt75: nwAt(75),
    netWorthAt80: nwAt(80),
    peakNetWorth,
    totalTaxesPaid,
    totalIncomeEarned,
    totalExpenses,
    totalSSReceived,
    totalPortfolioSold,
    effectiveTaxRate: totalIncomeEarned > 0 ? totalTaxesPaid / totalIncomeEarned : 0,
    cashFlowWorking: cfWorkingCount > 0 ? cfWorking / cfWorkingCount : 0,
    cashFlowEarlyRetire: cfEarlyRetireCount > 0 ? cfEarlyRetire / cfEarlyRetireCount : 0,
    cashFlowPreSS: cfPreSSCount > 0 ? cfPreSS / cfPreSSCount : 0,
    cashFlowSSYears: cfSSCount > 0 ? cfSS / cfSSCount : 0,
    cashFlowLateRetire: cfLateCount > 0 ? cfLate / cfLateCount : 0,
    bearFirstFailureAge: bearFirstFail,
    bullFirstFailureAge: bullFirstFail,
    bearYearsOfRunway: bearFirstFail ? bearFirstFail - plan.personal.retirementAge : 80 - plan.personal.retirementAge,
    bullYearsOfRunway: bullFirstFail ? bullFirstFail - plan.personal.retirementAge : 80 - plan.personal.retirementAge,
    bearNWAt80: bearNWAt(80),
    bullNWAt80: bullNWAt(80),
    cgRateAtRetirement: retireYear?.cgRate ?? 0,
    yearsAt0CG,
    annual0CGHarvestCapacity: annual0CGCapacity,
    balancesAtRetirement: {
      traditional401k: retireYear?.traditional401k ?? 0,
      roth401k: retireYear?.roth401k ?? 0,
      rothIRA: retireYear?.rothIRA ?? 0,
      privatePortfolio: retireYear?.privatePortfolio ?? 0,
      foreignPension: retireYear?.foreignPension ?? 0,
      plan529: retireYear?.plan529 ?? 0,
    },
  };
}
