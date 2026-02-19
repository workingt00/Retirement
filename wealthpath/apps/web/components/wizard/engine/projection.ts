// Lightweight onboarding projection engine
// Separate from the full simulation engine - uses only 5 inputs

export interface ProjectionInputs {
  currentAge: number;
  annualIncome: number;
  totalSavings: number;
  monthlySpending: number;
  monthlySavings: number;
}

export interface YearData {
  age: number;
  netWorth: number;
  spending: number;
  income: number;
  ssIncome: number;
}

export interface ProjectionResult {
  retirementAge: number;
  netWorthAtRetirement: number;
  monthlyRetirementIncome: number;
  yearsOfRunway: number;
  yearByYearData: YearData[];
}

// Constants
const GROWTH_RATE = 0.07;
const INFLATION_RATE = 0.03;
const TAX_RATE_WORKING = 0.22;
const TAX_RATE_RETIREMENT = 0.15;
const SS_START_AGE = 67;
const END_AGE = 90;

export function estimateSocialSecurity(annualIncome: number): number {
  if (annualIncome <= 0) return 0;
  if (annualIncome <= 36_000) return annualIncome * 0.4;
  if (annualIncome <= 150_000) return annualIncome * 0.3;
  if (annualIncome <= 250_000) return annualIncome * 0.25;
  return 50_000;
}

function runProjectionForRetirementAge(
  inputs: ProjectionInputs,
  candidateRetirementAge: number
): YearData[] {
  const { currentAge, annualIncome, totalSavings, monthlySpending, monthlySavings } = inputs;
  const annualSpending = monthlySpending * 12;
  const annualSavings = monthlySavings * 12;
  const ssAnnual = estimateSocialSecurity(annualIncome);

  let netWorth = totalSavings;
  const yearData: YearData[] = [];

  for (let age = currentAge; age <= END_AGE; age++) {
    const yearsFromNow = age - currentAge;
    const inflationAdjustedSpending = annualSpending * Math.pow(1 + INFLATION_RATE, yearsFromNow);

    if (age <= candidateRetirementAge) {
      // Working years: grow portfolio + add savings
      netWorth = netWorth * (1 + GROWTH_RATE) + annualSavings;
    } else {
      // Retirement years
      const ssIncome = age >= SS_START_AGE ? ssAnnual : 0;
      const withdrawal = Math.max(0, inflationAdjustedSpending - ssIncome);
      const tax = withdrawal * TAX_RATE_RETIREMENT;
      netWorth = netWorth * (1 + GROWTH_RATE) - withdrawal - tax;
    }

    yearData.push({
      age,
      netWorth: Math.round(netWorth),
      spending: Math.round(inflationAdjustedSpending),
      income: age <= candidateRetirementAge ? annualIncome : 0,
      ssIncome: age >= SS_START_AGE && age > candidateRetirementAge ? ssAnnual : 0,
    });
  }

  return yearData;
}

function moneyLastsThroughEnd(yearData: YearData[]): boolean {
  return yearData.every((d) => d.netWorth >= 0);
}

export function runProjection(inputs: ProjectionInputs): ProjectionResult {
  const { currentAge } = inputs;

  // Find earliest retirement age where money lasts through END_AGE
  let bestAge = END_AGE;
  let bestYearData: YearData[] = [];

  for (let candidate = currentAge + 1; candidate <= END_AGE; candidate++) {
    const yearData = runProjectionForRetirementAge(inputs, candidate);
    if (moneyLastsThroughEnd(yearData)) {
      bestAge = candidate;
      bestYearData = yearData;
      break;
    }
  }

  // If no age worked, use END_AGE
  if (bestYearData.length === 0) {
    bestYearData = runProjectionForRetirementAge(inputs, END_AGE);
    bestAge = END_AGE;
  }

  // Find net worth at retirement
  const retirementYearEntry = bestYearData.find((d) => d.age === bestAge);
  const netWorthAtRetirement = retirementYearEntry?.netWorth ?? 0;

  // Calculate monthly retirement income
  const ssMonthly = estimateSocialSecurity(inputs.annualIncome) / 12;
  const portfolioWithdrawalMonthly =
    netWorthAtRetirement > 0 ? (netWorthAtRetirement * 0.04) / 12 : 0; // 4% rule
  const monthlyRetirementIncome = Math.round(portfolioWithdrawalMonthly + ssMonthly);

  // Years of runway: how many years money lasts from retirement age
  let yearsOfRunway = 0;
  for (const d of bestYearData) {
    if (d.age > bestAge && d.netWorth > 0) {
      yearsOfRunway++;
    }
  }
  // Add 1 for the retirement year itself if it's positive
  if (retirementYearEntry && retirementYearEntry.netWorth > 0) {
    yearsOfRunway++;
  }

  return {
    retirementAge: bestAge,
    netWorthAtRetirement: Math.round(netWorthAtRetirement),
    monthlyRetirementIncome,
    yearsOfRunway,
    yearByYearData: bestYearData,
  };
}
