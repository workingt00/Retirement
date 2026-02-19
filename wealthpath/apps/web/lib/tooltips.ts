export const tooltips: Record<string, { horizon: string; velocity: string }> = {
  traditional_401k: {
    horizon: "A retirement account through your employer. You put money in before taxes, which lowers your tax bill now. You'll pay taxes when you take the money out in retirement.",
    velocity: "Pre-tax salary deferral under IRC 401(k). $23K limit (2025). Reduces AGI. Taxed as ordinary income on distribution.",
  },
  roth_ira: {
    horizon: "A personal retirement account where you put in money after taxes. The good news: when you take it out in retirement, it's completely tax-free.",
    velocity: "After-tax contributions, tax-free qualified distributions. $7.5K limit. Income phase-out: $230K-$240K AGI (MFJ). Backdoor available.",
  },
  roth_401k: {
    horizon: "Like a Roth IRA, but through your employer. You pay taxes now, but withdrawals in retirement are tax-free.",
    velocity: "After-tax 401(k) deferral. Same $23K limit shared with traditional. No income phase-out. Tax-free qualified distributions.",
  },
  private_portfolio: {
    horizon: "Your regular investment account (stocks, bonds, mutual funds). No special tax advantages, but no withdrawal restrictions either.",
    velocity: "Taxable brokerage account. Capital gains taxed at 0%/15%/20% based on income. No contribution limits. LTCG after 1yr holding.",
  },
  plan_529: {
    horizon: "A special savings account for education expenses. Grows tax-free and withdrawals are tax-free when used for school costs.",
    velocity: "Tax-advantaged education savings. Tax-free growth and qualified distributions. State tax deduction varies. Superfunding available.",
  },
  foreign_pension: {
    horizon: "A retirement account from work abroad. When you cash it out, expect about 35% to go to taxes.",
    velocity: "Non-US pension. Taxed at approximately 35% combined rate on liquidation. No US tax treaty assumed. One-time cashout modeled.",
  },
  capital_gains: {
    horizon: "When you sell an investment that went up in value, you pay tax on the profit. The tax rate depends on your income -- you might even pay 0% in retirement!",
    velocity: "LTCG taxed at 0%/15%/20% progressive brackets based on ordinary taxable income. CG portion parameter (default 75%) estimates cost basis.",
  },
  roth_conversion: {
    horizon: "Moving money from a Traditional account to a Roth account. You pay tax now, but then it grows tax-free forever. It's like paying a small toll now to drive on a free highway later.",
    velocity: "Trad-to-Roth rollover. Taxed as ordinary income in conversion year. Resets cost basis. 5-year rule applies for penalty-free access before 59.5.",
  },
  first_failure_age: {
    horizon: "This is the age when your plan runs out of money based on current assumptions. Don't panic -- we have ideas to fix this.",
    velocity: "MIN(age) WHERE status='FAIL'. The earliest year net worth hits zero. Optimize until null (never fails) or exceeds life expectancy.",
  },
  w0_priority_queue: {
    horizon: "When you turn this on, we automatically figure out the smartest order to take money from your different accounts -- paying the least tax possible.",
    velocity: "Tax-optimal withdrawal sequencing: (1) Taxable portfolio at marginal CG rate, (2) Traditional at marginal ordinary rate, (3) Roth tax-free. Minimizes lifetime tax drag.",
  },
  bear_case: {
    horizon: "What happens if the stock market performs poorly for an extended period. Think of it as a stress test for your retirement plan.",
    velocity: "All growth rates adjusted by bear delta (default -4pp). Approximates poor sequence-of-returns risk. Bear failure age is the actionable risk metric.",
  },
  bull_case: {
    horizon: "What happens if the stock market performs better than expected. The optimistic scenario for your retirement plan.",
    velocity: "All growth rates adjusted by bull delta (default +2pp). Upper bound estimate. Do not plan for bull case -- use base or bear.",
  },
  sensitivity: {
    horizon: "We test your plan against good times and bad times to make sure it holds up no matter what happens in the market.",
    velocity: "Bear/base/bull projections using growth rate adjustments. Default: bear -4pp, bull +2pp. Not Monte Carlo -- deterministic scenario analysis.",
  },
  standard_deduction: {
    horizon: "The amount of income you don't have to pay taxes on. For married couples filing together, it's about $30,000 in 2025.",
    velocity: "MFJ: $30,000. Single: $15,000 (2025). Subtracted from gross income before applying marginal brackets.",
  },
  rule_of_55: {
    horizon: "If you leave your job at 55 or later, you can take money from that employer's 401k without the usual 10% early withdrawal penalty.",
    velocity: "IRC 72(t)(2): Penalty-free 401k distributions if separated from service in or after the year you turn 55. Current employer plan only.",
  },
  net_worth: {
    horizon: "The total value of all your retirement accounts combined. This is the number we're trying to grow and protect.",
    velocity: "Sum of all account balances: tax-deferred + tax-free + taxable + 529 + foreign. Primary optimization target.",
  },
  cash_flow: {
    horizon: "How much money you have left over each year after paying taxes and all your expenses. Positive is good!",
    velocity: "Annual: totalIncome - totalTax - totalExpenses. Negative cash flow triggers withdrawal logic or FAIL status.",
  },
  effective_tax_rate: {
    horizon: "The percentage of your total income that goes to taxes. Lower is better, and smart planning can reduce it significantly.",
    velocity: "totalTaxesPaid / totalIncomeEarned across all simulation years. Includes federal, state, FICA, and CG taxes.",
  },
  social_security: {
    horizon: "Monthly payments from the government in retirement based on your work history. Claiming later means bigger checks.",
    velocity: "OASDI benefit. FRA at 67. Early (62): -30%. Delayed (70): +24%. Up to 85% taxable above combined income thresholds.",
  },
  filing_status: {
    horizon: "Whether you file taxes as a couple (married filing jointly) or on your own (single). This affects your tax brackets.",
    velocity: "MFJ or Single. Determines bracket thresholds, standard deduction, CG brackets, and SS taxability thresholds.",
  },
  retirement_age: {
    horizon: "The age you plan to stop working full-time. You can always adjust this to see how it changes your plan.",
    velocity: "Age at which W2/W9 income ceases. Key lever: each year earlier requires ~25x monthly expenses in additional savings.",
  },
  investment_style: {
    horizon: "How much risk you're comfortable with. Conservative means steadier but slower growth. Aggressive means more ups and downs but potentially higher returns.",
    velocity: "Growth rate preset. Conservative: 7%/8%. Moderate: 10%/12%. Aggressive: 13%/15%. Applied to 401k and Roth/portfolio respectively.",
  },
  employer_match: {
    horizon: "Free money from your employer! They add money to your 401k based on what you contribute. Always try to get the full match.",
    velocity: "Employer 401k match as % of salary. Modeled as additional contribution. Not subject to employee deferral limit.",
  },
  mega_backdoor_roth: {
    horizon: "An advanced strategy to put extra money into your Roth account through your employer's 401k. Not all employers allow this.",
    velocity: "After-tax 401k contributions converted to Roth. Total 415(c) limit: $69K (2024). Requires plan support for in-plan conversions.",
  },
  backdoor_roth: {
    horizon: "A workaround for high earners to contribute to a Roth IRA. You put money into a Traditional IRA first, then convert it.",
    velocity: "Non-deductible Traditional IRA contribution immediately converted to Roth. Avoids income phase-out. Pro-rata rule applies if existing deductible IRA balances.",
  },
  rmd: {
    horizon: "Starting at age 73, the government requires you to take money out of your Traditional retirement accounts each year.",
    velocity: "Required Minimum Distributions. SECURE 2.0: age 73 (2023), age 75 (2033). Based on Uniform Lifetime Table. Taxed as ordinary income.",
  },
  aca_optimization: {
    horizon: "In early retirement, keeping your income in a certain range can qualify you for affordable health insurance subsidies.",
    velocity: "ACA premium tax credit optimization. Keep MAGI in subsidy range (138-400% FPL). Roth conversions and CG harvesting interact with MAGI.",
  },
  catch_up_contributions: {
    horizon: "Once you turn 50, you can put extra money into your 401k and IRA above the normal limits.",
    velocity: "401k catch-up: $7,500 (age 50-59), $11,250 (age 60-63). IRA catch-up: $1,000 (age 50+). SECURE 2.0 super catch-up.",
  },
  medicare: {
    horizon: "Government health insurance that starts at age 65. It's much cheaper than private insurance, so your healthcare costs drop.",
    velocity: "Part A/B eligibility at 65. Reduces modeled medical expenses ~30%. IRMAA surcharges apply above $206K MAGI (MFJ).",
  },
  five_year_rule: {
    horizon: "After converting money to a Roth account, you need to wait 5 years before withdrawing it penalty-free (before age 59.5).",
    velocity: "Roth conversion 5-year rule: each conversion has its own 5-year clock for penalty-free distribution before 59.5. After 59.5, all qualified.",
  },
  goal_solver: {
    horizon: "We calculate exactly how much you need to save each month to reach your retirement goal, and show you where to put it.",
    velocity: "Reverse-engineers required annual savings to reach target NW. Accounts for existing balances, employer match, and growth. Outputs optimal allocation split.",
  },
  savings_rate: {
    horizon: "The percentage of your income that goes toward retirement savings. Higher is better, but even small increases make a big difference over time.",
    velocity: "annualSavings / totalGrossIncome. FIRE targets: 50%+ for early retirement. Conventional: 15-20%.",
  },
  inflation: {
    horizon: "Prices go up over time. We factor this in so your plan accounts for things costing more in the future.",
    velocity: "General: 3% default. Medical: 6% default. Applied as compound multiplier to expenses each year. Income growth offset separately.",
  },
};

export function getTooltip(term: string, mode: "horizon" | "velocity"): string {
  const entry = tooltips[term];
  if (!entry) return "";
  return entry[mode];
}
