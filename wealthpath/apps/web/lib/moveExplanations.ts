/**
 * Plain-language explanations for each of the 38 financial moves.
 * Each move has a short summary and a detailed explanation suitable for
 * users who may not have a financial background.
 */
export const moveExplanations: Record<string, { summary: string; detail: string }> = {
  // Contributions
  C1: {
    summary: "Put pre-tax money into your employer 401k each year.",
    detail:
      "Traditional 401k contributions come out of your paycheck before taxes, lowering your tax bill now. The money grows tax-deferred, but you'll pay ordinary income tax when you withdraw it in retirement. This is one of the most powerful tax-reduction tools while working. The 2025 limit is $23,000/year (plus catch-up if 50+).",
  },
  C2: {
    summary: "Put after-tax money into a Roth 401k through your employer.",
    detail:
      "Unlike Traditional 401k (C1), Roth 401k contributions don't reduce your taxes today — but all withdrawals in retirement are completely tax-free, including the growth. This is powerful if you expect to be in a higher tax bracket later, or if you want tax-free income in retirement. You share the same $23,000 limit with C1, so you can do one or the other, not both.",
  },
  C3: {
    summary: "Contribute to a personal Roth IRA each year.",
    detail:
      "A Roth IRA is a personal retirement account (not through your employer). You contribute after-tax dollars, but everything — contributions and growth — comes out tax-free in retirement after age 59½. The limit is $7,500/year. There are income limits: if your household earns above ~$230K (married), you may need the Backdoor Roth (C8) instead.",
  },
  C4: {
    summary: "Invest in a regular taxable brokerage account.",
    detail:
      "A private portfolio (brokerage account) has no contribution limits and no withdrawal restrictions — total flexibility. The downside: you'll pay capital gains tax when you sell investments at a profit. However, in early retirement when your income is low, you may qualify for the 0% capital gains rate, making this very tax-efficient.",
  },
  C5: {
    summary: "Save for education expenses in a tax-advantaged 529 plan.",
    detail:
      "529 plans grow tax-free when used for qualified education expenses (college, K-12 tuition). If you have kids heading to college, this shelters money from taxes. Recent rules also allow rolling unused 529 funds into a Roth IRA (with limits), so the money isn't wasted if your kids get scholarships.",
  },
  C7: {
    summary: "Make extra after-tax 401k contributions and convert them to Roth.",
    detail:
      "The Mega Backdoor Roth lets you contribute beyond the normal $23K limit — up to ~$69K total (including employer match) — by making after-tax contributions to your 401k and immediately converting them to Roth. This is one of the fastest ways to build tax-free wealth, but it requires your employer's plan to support after-tax contributions and in-plan conversions.",
  },
  C8: {
    summary: "Contribute to a Traditional IRA and immediately convert to Roth.",
    detail:
      "The Backdoor Roth is a workaround for high earners who exceed Roth IRA income limits. You contribute to a Traditional IRA (non-deductible) and immediately convert it to a Roth IRA. Since you already paid tax on the contribution, there's no additional tax on conversion (assuming no other pre-tax IRA balances). This gives you $7,500/year of Roth access regardless of income.",
  },

  // Conversions
  X1: {
    summary: "Move money from Traditional 401k to Roth each year, paying tax now for tax-free growth later.",
    detail:
      "A Roth conversion ladder means converting a set amount from your Traditional 401k to your Roth IRA each year. You pay ordinary income tax on the converted amount that year, but once it's in the Roth, it grows and can be withdrawn tax-free. The strategy is to convert during low-income years (like early retirement) when you're in a lower tax bracket. Note: converted amounts have a 5-year waiting period before penalty-free withdrawal.",
  },
  X2: {
    summary: "Move your Roth 401k balance into your Roth IRA in one transfer.",
    detail:
      "When you leave your employer or retire, you can roll your Roth 401k into a Roth IRA. This is a tax-free, Roth-to-Roth transfer. The benefit: Roth IRAs have no required minimum distributions (RMDs), so the money can grow tax-free for as long as you want. It also simplifies your accounts.",
  },
  X3: {
    summary: "Roll your Traditional 401k into a Traditional IRA after leaving your employer.",
    detail:
      "A Traditional-to-Traditional rollover consolidates your old 401k into an IRA. There's no tax impact (it stays pre-tax). This gives you more investment options and enables subsequent partial Roth conversions (X4). It's a common first step in a Roth conversion strategy.",
  },
  X4: {
    summary: "Convert a portion of your Traditional IRA to Roth each year.",
    detail:
      "After rolling your 401k into a Traditional IRA (X3), you can convert portions to Roth each year. Like X1, you pay ordinary income tax on the converted amount, but the money then grows tax-free forever. The key is to convert just enough to fill your current tax bracket without jumping into a higher one — that's the sweet spot.",
  },

  // Withdrawals
  W0: {
    summary: "Let the system automatically withdraw from accounts in the most tax-efficient order.",
    detail:
      "Auto-Withdraw uses a priority queue to fill your expense gap each year: first it sells from your taxable portfolio (capital gains rates — cheapest), then Traditional accounts (ordinary income), and finally Roth (tax-free — preserved as long as possible). This minimizes your lifetime tax bill without you having to manage the details. It's the recommended approach for most retirees.",
  },
  W1: {
    summary: "Sell a fixed dollar amount from your brokerage portfolio each year.",
    detail:
      "A flat annual withdrawal from your portfolio. You'll pay capital gains tax on the profit portion of what you sell (typically 0%, 15%, or 20% depending on your income). This is simpler than W0 but may not be as tax-efficient since it doesn't adapt to your changing income situation each year.",
  },
  W7: {
    summary: "Live off dividend income from your portfolio instead of selling shares.",
    detail:
      "Instead of selling shares, this strategy uses dividend payments (typically 2-4% of your portfolio value) as income. Qualified dividends are taxed at favorable capital gains rates. The advantage: your principal stays intact longer. The risk: dividend income may not cover all your expenses, especially in early retirement.",
  },
  W2: {
    summary: "Take money out of your Roth IRA each year.",
    detail:
      "Roth IRA withdrawals are completely tax-free after age 59½ (and the account has been open 5+ years). This is your most valuable retirement asset from a tax perspective — every dollar withdrawn is a full dollar in your pocket. Most strategies try to preserve Roth until later in retirement when other accounts are depleted.",
  },
  W3: {
    summary: "Withdraw from your 401k penalty-free starting at age 55 using the Rule of 55.",
    detail:
      "If you leave your employer in or after the year you turn 55, you can withdraw from that employer's 401k without the usual 10% early withdrawal penalty. You still pay ordinary income tax, but avoiding the penalty saves you significant money. This only applies to your most recent employer's plan — not old 401ks.",
  },
  W4: {
    summary: "Take distributions from your Traditional IRA.",
    detail:
      "Traditional IRA withdrawals are taxed as ordinary income. Before age 59½, there's a 10% early withdrawal penalty (with some exceptions). After 59½, it's just income tax. You'll be forced to start taking Required Minimum Distributions (RMDs) at age 73 regardless.",
  },
  W5: {
    summary: "Cash out your foreign pension and add the proceeds to your portfolio.",
    detail:
      "If you have a pension from working abroad, this move liquidates it in one shot. Expect roughly 35% to go to taxes (varies by country and treaty). The remaining cash goes into your taxable portfolio where it can be invested and withdrawn more flexibly. This simplifies your retirement accounts and gives you more control.",
  },
  W6: {
    summary: "Use 529 funds for qualified education expenses.",
    detail:
      "Withdrawals from a 529 plan are tax-free when used for qualified education expenses (tuition, books, room and board). If used for non-qualified expenses, the earnings portion is taxed and penalized 10%. Recent rules allow limited rollovers to Roth IRA for unused funds.",
  },
  W8: {
    summary: "Cash out your entire Traditional 401k in one lump sum.",
    detail:
      "This is the nuclear option — withdrawing everything from your 401k at once. The entire amount is taxed as ordinary income, likely pushing you into the highest tax brackets. Before age 59½, you also pay a 10% penalty. This is almost never optimal, but the simulator includes it so you can see just how much it costs compared to gradual withdrawals.",
  },
  W9: {
    summary: "Cash out your entire Roth IRA at once.",
    detail:
      "Liquidating your Roth IRA gives you immediate access to all funds. Contributions can always be withdrawn tax-free, but earnings withdrawn before age 59½ (or before the 5-year rule is met) face taxes and a 10% penalty. Since Roth money is the most tax-efficient in retirement, liquidating early usually destroys long-term value.",
  },
  W10: {
    summary: "Cash out your entire Traditional IRA in one lump sum.",
    detail:
      "Like W8, this pulls everything out at once — taxed as ordinary income with a potential 10% penalty before 59½. The massive income spike means much of it is taxed at your highest marginal rate. Gradual withdrawals (W4) are almost always better.",
  },
  W11: {
    summary: "Cash out every retirement account simultaneously.",
    detail:
      "The ultimate nuclear option: liquidate all Traditional, Roth, and taxable accounts in a single year. The tax bill would be enormous — potentially 30-40% of your total savings. This exists in the simulator as a stress test and comparison baseline, not as a recommended strategy.",
  },

  // Income
  I1: {
    summary: "Earn supplemental income from part-time work or freelancing in retirement.",
    detail:
      "Many early retirees work part-time for the first few years to bridge the gap before Social Security kicks in. Even $30K/year can significantly extend your runway. This income is taxed as ordinary income, but it reduces how much you need to withdraw from investments, letting them compound longer.",
  },
  I2: {
    summary: "Receive net rental income from investment property.",
    detail:
      "If you own rental property, this is the net income after expenses (mortgage, repairs, management, vacancy). Rental income is taxed as ordinary income but can be partially offset by depreciation deductions. It provides steady cash flow that doesn't require selling investments.",
  },
  I3: {
    summary: "Receive guaranteed payments from an annuity or pension.",
    detail:
      "Pensions and annuities provide predictable monthly income regardless of market conditions. The tax treatment varies: employer pensions are fully taxable, while annuity payments may be partially tax-free (return of basis). This income stream reduces your reliance on portfolio withdrawals.",
  },

  // Social Security
  S1: {
    summary: "Begin receiving Social Security benefits at your chosen claiming age.",
    detail:
      "You can claim Social Security anytime between ages 62 and 70. Claiming at 62 gives you the smallest monthly check (~70% of your full benefit). Waiting until 67 gives you 100%. Waiting until 70 gives you ~124% — the maximum. Each year you delay increases your benefit by about 7-8%. The optimal age depends on your health, other income, and how long you expect to live. Up to 85% of your benefit may be taxable depending on your total income.",
  },

  // Lifestyle
  L1: {
    summary: "Sell your home and eliminate all housing costs.",
    detail:
      "Selling eliminates mortgage, property tax, insurance, HOA, and maintenance costs — often the largest line item in retirement expenses. Married couples can exclude up to $500K in home sale profit from capital gains tax. The trade-off: you need somewhere else to live (rent, downsize, relocate).",
  },
  L2: {
    summary: "Pay off your remaining mortgage in one lump sum from your portfolio.",
    detail:
      "Paying off the mortgage eliminates your largest monthly payment, dramatically improving cash flow. The money comes from your taxable portfolio. This makes sense when your mortgage rate exceeds your after-tax investment returns, or when the psychological benefit of being debt-free matters to you.",
  },
  L3: {
    summary: "Keep income low enough to qualify for Affordable Care Act (ACA) insurance subsidies.",
    detail:
      "Before Medicare at 65, health insurance can cost $15,000-25,000/year. ACA subsidies can reduce this dramatically — but only if your Modified Adjusted Gross Income (MAGI) stays in the right range. This move means strategically managing Roth conversions, portfolio sales, and other income to stay below the subsidy cliff.",
  },
  L4: {
    summary: "Move to a lower cost-of-living area to reduce expenses by ~20%.",
    detail:
      "Relocating from a high-cost city to a more affordable area can cut your expenses by 20% or more. This includes housing, groceries, services, and potentially state income tax (moving from California to Texas, for example, eliminates state tax entirely). The savings compound year over year.",
  },
  L5: {
    summary: "Sell your current home and buy a smaller, cheaper one, adding the equity to your portfolio.",
    detail:
      "Downsizing captures home equity (the difference between sale price and new purchase price) and adds it to your investment portfolio. It also reduces ongoing housing costs. Up to $500K in home sale profit is tax-free for married couples. This is less drastic than selling entirely (L1) but still frees up significant capital.",
  },
  L6: {
    summary: "Pay off all outstanding debts using money from your portfolio.",
    detail:
      "Eliminating debts (car loans, student loans, credit cards) before or at retirement removes fixed obligations from your monthly budget. The portfolio withdrawal to pay off debt triggers capital gains tax, but the math usually favors paying off high-interest debt. This simplifies your financial life and reduces stress.",
  },

  // Rules
  R1: {
    summary: "At age 50+, you can contribute extra to your 401k above the normal limit.",
    detail:
      "The IRS allows catch-up contributions for people 50 and older: an extra $7,500/year on top of the $23,000 regular limit (total: $30,500). At ages 60-63, the catch-up increases to $11,250 (total: $34,250). This is one of the best ways to accelerate retirement savings in your peak earning years.",
  },
  R2: {
    summary: "At 65, Medicare eligibility reduces your healthcare costs by ~30%.",
    detail:
      "Medicare replaces expensive private insurance (or ACA plans) with government-provided coverage at age 65. This typically reduces healthcare costs by about 30%. The simulation automatically adjusts your medical expenses downward at this age. Medicare Part B premiums are income-based (IRMAA), so high-income retirees pay more.",
  },
  R3: {
    summary: "At 73, the IRS forces you to withdraw minimum amounts from Traditional accounts.",
    detail:
      "Required Minimum Distributions (RMDs) start at age 73 under current law. The IRS calculates a minimum withdrawal based on your account balance and life expectancy. This money is taxed as ordinary income whether you need it or not. This is why Roth conversions before 73 are valuable — they reduce the balance subject to RMDs.",
  },
  R4: {
    summary: "Roth conversions must age 5 years before the earnings can be withdrawn penalty-free.",
    detail:
      "When you convert Traditional money to Roth, the converted amount can be withdrawn tax-free, but you must wait 5 years to avoid a 10% penalty (if under 59½). Each conversion starts its own 5-year clock. This rule is important for early retirees planning a Roth conversion ladder — you need to plan 5 years ahead.",
  },
  R5: {
    summary: "Thanks to the SECURE Act, you can contribute to IRAs at any age.",
    detail:
      "Before the SECURE Act (2019), you couldn't contribute to a Traditional IRA after age 70½. That restriction is gone. As long as you have earned income, you can contribute at any age. This is an informational rule — the simulation tracks it but it doesn't require action.",
  },
};
