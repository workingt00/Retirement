# WealthPath Onboarding Wizard — Agent Build Spec

## Overview

Build the onboarding wizard for WealthPath, a retirement planning SaaS product. This wizard is the **first thing a new user sees** — before they have an account. It collects minimal financial inputs, shows an engaging real-time projection using the "Time Machine" visual concept, and converts the user into a registered account at the end.

The core philosophy: **retirement planning should feel fun, exciting, and motivating.** This is not a form. This is not a calculator. This is an experience that makes people feel connected to their future selves and compelled to take action.

---

## Tech Stack

- **React** (functional components with hooks)
- **Tailwind CSS** for layout and utility styling
- **Framer Motion** for animations and transitions
- **SVG** for avatars, scene elements, and icons
- **Single-page application** — the entire wizard lives in one view with animated step transitions, no page reloads

---

## Design Direction

### Aesthetic
Warm, optimistic, approachable. Think modern wellness app meets financial tool. Not corporate, not cold, not clinical. The palette should feel like a sunrise — warm golds, soft oranges, calming greens for positive states, with muted earth tones as a grounding base. Dark backgrounds for the scene panels to make visual elements pop.

### Typography
Use a distinctive, friendly display font for headings and the retirement age reveal (something with personality — rounded, warm, confident). Pair with a clean readable sans-serif for body text and input labels. **Do not use Inter, Roboto, Arial, or system fonts.**

### Motion Philosophy
Every transition should feel organic and intentional. Elements fade and float in, never snap. The scene on the right should feel alive — subtle ambient animations (gentle sway on trees, soft pulsing glow on lit windows, slow drifting clouds). Input transitions should slide horizontally like turning pages in a book.

### Key Design Rule
**No element should appear without animation.** If something enters the screen, it animates in. If something changes, it transitions. Stillness is reserved for moments of calm (the final reveal).

---

## Screen Architecture

The wizard uses a **vertical stacked layout** on all screen sizes — the visual scene sits on top, the question/input area below. This keeps the flow feeling like a natural top-down journey and ensures the visual is always in a consistent, prominent position.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   TOP PANEL — Time Machine Visual               │
│   - "You Today" (left half)                     │
│   - "Future You" (right half)                   │
│   - Timeline connecting them at the bottom      │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   BOTTOM PANEL — Questions / Input              │
│   - Step indicator                              │
│   - Question text                               │
│   - Input field                                 │
│   - Quick-select chips                          │
│   - Navigation (back / continue)                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Desktop (≥1024px):** The visual panel takes roughly 55% of the viewport height. The question panel occupies the remaining 45%, centered horizontally with a comfortable max-width (~600px) so the input area feels focused and intimate, not stretched across a wide monitor.

**Tablet & Mobile (<1024px):** Same stacked layout. The visual panel compresses to ~40% of viewport height with simplified scene elements. The question panel scrolls if needed but inputs should be designed to fit without scrolling on most devices.

---

## Wizard Flow — Step by Step

### Screen 0: Avatar Selection

**Purpose:** Set the tone. This is a game, not a form. Make the user feel invested before any financial question.

**UI:**
- Full-width screen (no split yet) with a warm welcome message
- Headline: "Let's meet your future self" or similar warm, intriguing copy
- Subtitle: "Pick the character that feels like you"
- Display 6 avatar options in a 3×2 grid (or horizontal scroll on mobile)
- Avatars are simple, friendly, stylized SVG illustrations — diverse in appearance (skin tone, hair, accessories), gender-neutral labels, no text labels at all
- Each avatar sits in a soft circular frame
- On hover: gentle scale-up and glow effect
- On select: the chosen avatar gets a highlight ring, others fade slightly
- A "Continue" button appears after selection (or auto-advance after a short delay)

**Avatar Design Guidance:**
Since Claude Code cannot produce illustrated artwork, build avatars as **composed SVG elements** — geometric faces with distinct features (hairstyles, glasses, facial hair, skin tones). Think clean, modern, icon-style illustration similar to Apple Memoji simplified to flat SVG. Each avatar should be visually distinct at a glance. Aim for warmth — rounded shapes, soft colors, friendly expressions.

**Data collected:** Avatar choice (stored as avatar ID, used throughout the wizard and into the product)

**Transition to next screen:** The full-width welcome screen compresses upward — the selected avatar rises into the top visual panel as it establishes itself. The bottom question panel slides up from below. The vertical two-panel layout locks into place with a smooth choreographed animation. The avatar lands in the "You Today" position (left side of the visual panel).

---

### Screen 1: Age

**Question:** "How old are you?"

**Input:** Single number input, large font. Could also be a stylized dial/slider for a more playful feel. Acceptable range: 18–80. Default: empty (no pre-filled value — the user must engage).

**Visual Panel Update (top):**
The visual panel is now active. On the left half of the visual panel: "You Today" — the selected avatar in a scene representing their current life stage. The avatar is centered with a small ground/platform beneath them. The scene is simple at this point — just the avatar and a timeline indicator showing their age.

On the right half of the visual panel: "Future You" — a silhouette or faded version of the same avatar, surrounded by fog/blur. This represents the unknown future. A dotted line or path connects the two versions.

The timeline between them is a horizontal bar at the bottom of the visual panel, spanning from the entered age to ~85. A glowing dot marks "now."

**Calculations triggered:** None yet (no financial data). But the timeline is now anchored.

**Animation:** When age is entered, the "You Today" avatar settles into its scene with a soft bounce. The timeline populates with age markers. The "Future You" silhouette pulses gently as if waiting.

---

### Screen 2: Annual Household Income

**Question:** "What's your annual household income?" (with helper text: "Before taxes — your total salary or combined if married")

**Input:** Currency input with formatting ($ prefix, comma separators as they type). No cents. Suggested range indicators or presets could help (e.g., subtle chips showing "$50k / $100k / $150k / $200k+" as quick-select starting points that populate the field, which the user can then adjust).

**Visual Panel Update (top):**
The "You Today" scene gains context. A workspace element appears near the avatar — could be a simple desk, laptop, briefcase, or building silhouette behind them, representing their professional life. The visual richness of this element should subtly scale with income (not in a judgmental way — just more "developed" at higher incomes, like a taller building or a more detailed workspace).

On the "Future You" side: the fog begins to thin very slightly. You can almost make out a shape behind it — the first hint that the future is becoming knowable.

A floating stat card appears below or beside the timeline: "Earning power: $XXX,XXX/yr"

**Calculations triggered:**
- Estimate annual federal + state taxes using simplified brackets (assume single filer, standard deduction, Georgia state rate as default — these refine later)
- Estimate take-home pay
- Estimate Social Security benefit at 67 based on income (simplified: use ~40% replacement rate for incomes under $60K, ~30% for $60–150K, ~25% for $150K+, with a cap)
- Begin storing derived values in state

**Animation:** Workspace elements fade in and assemble around the "You Today" avatar. The fog on "Future You" side animates to slightly less opacity. The stat card floats up from below.

---

### Screen 3: Total Retirement Savings

**Question:** "How much do you have saved for retirement?" (with helper text: "All accounts combined — 401k, IRA, brokerage, savings. A rough estimate is fine.")

**Input:** Currency input (same style as income). Quick-select chips could show "$0 / $50k / $100k / $250k / $500k+" as anchors.

**Visual Panel Update (top):**
This is the first moment "Future You" starts to materialize. The fog clears significantly. The future avatar becomes visible (no longer a silhouette) and a scene starts to build around them. The scene reflects savings strength:

- **$0–$25K:** Future avatar is visible but the scene is sparse — bare room, single window, minimal furniture. Not depressing, just early-stage.
- **$25K–$100K:** A modest but comfortable home scene — a chair, a small plant, a window with light coming through.
- **$100K–$300K:** The scene fills in more — bookshelves, a nicer home, a garden starting to grow outside the window.
- **$300K–$500K:** Rich scene — well-furnished room, garden in bloom, maybe a pet or hobby item appearing.
- **$500K+:** Expansive scene — beautiful home, travel elements visible, fully alive environment.

These thresholds are illustrative — implement as a smooth gradient, not hard jumps. Elements should fade in proportionally.

A "retirement foundation" indicator appears — a visual meter or badge showing the savings total with a label like "Your head start: $XXX,XXX"

**Calculations triggered:**
- Store total savings as the portfolio starting balance
- Project forward at a default blended growth rate of 7% real (10% nominal minus 3% inflation)
- Calculate preliminary future value at age 65 with zero additional contributions (just to have a baseline)

**Animation:** The fog on "Future You" side dramatically clears with a satisfying whoosh/dissolve. Scene elements fade in and arrange themselves over 1–2 seconds, staggered. The savings indicator animates upward like a progress bar filling.

---

### Screen 4: Monthly Spending

**Question:** "Roughly how much do you spend per month?" (with helper text: "Include housing, food, bills, everything. Don't overthink it — a ballpark works.")

**Input:** Currency input. Quick-select chips: "$2,000 / $4,000 / $6,000 / $8,000 / $10,000+"

This is the hardest question for most people. Consider adding a micro-interaction: a small expandable "Not sure?" helper that shows a simple breakdown prompt — "Housing: $___  + Everything else: $___" — two fields that auto-sum. This is optional but reduces friction for users who freeze on the single-number question.

**Visual Panel Update (top):**
This is the **pivotal moment**. Monthly spending determines sustainability, so this is when the retirement age is first calculated and revealed.

When the user enters spending:
1. A calendar or date display animates into "Future You's" scene — this shows the **projected retirement age**
2. The timeline at the bottom updates: a flag/marker drops at the calculated retirement age with a label: **"Your freedom day: Age XX"**
3. The "path" between present and future solidifies — the dotted line becomes a solid line up to the retirement age

The scene around "Future You" may adjust slightly based on how spending relates to income:
- Spending well below income (high savings potential): the scene brightens, the calendar shows an earlier age, optimistic feel
- Spending close to income (low savings potential): the scene stays as-is or mutes slightly, the calendar shows a later age

**Do NOT make high-spending feel punishing.** The tone is always informational and motivating, never judgmental. Even a late retirement age is presented as "here's where you are — and here's how to improve it."

**Calculations triggered:**
This is where the core projection runs for the first time:
- Annual spending = monthly × 12
- Annual savings estimate = take-home income − annual spending
- Project net worth forward year by year: starting balance × (1 + growth rate) + annual savings, minus annual spending in retirement years
- Inflation-adjust spending at 3% annually
- Find the **retirement age**: the earliest age where projected savings can sustain inflation-adjusted spending for 30 years (to age 90+)
- If current trajectory never sustains retirement: show "85+" as the age and frame it as "let's work on this together"
- Apply Social Security income starting at 67 in the projection

**Core projection model (simplified for onboarding):**
```
For each year from current_age to 90:
  if year <= retirement_age:
    net_worth = previous_net_worth × (1 + growth_rate) + annual_savings - taxes_on_savings
  else:
    net_worth = previous_net_worth × (1 + growth_rate) - inflation_adjusted_spending + social_security
  
  if net_worth <= 0: money runs out at this age

retirement_age = earliest age where net_worth stays > 0 through age 90
```

Use a default 7% real growth rate (blended across all account types). Use simplified tax treatment — roughly 20% effective rate on income during working years, 15% on withdrawals in retirement. These don't need to be precise — the full simulator handles precision. This just needs to be directionally correct and responsive.

**Animation:** The retirement age reveal is the biggest animation in the wizard. The calendar/date should animate in with emphasis — maybe a flip animation, a counter ticking to the final number, or a dramatic fade-in with a subtle particle burst. The timeline flag drops with a satisfying motion. A brief pause lets the number sink in before the "Continue" button appears.

---

### Screen 5: Monthly Retirement Savings

**Question:** "How much are you putting toward retirement each month?" (with helper text: "401k contributions, IRA, any investing you do regularly")

**Input:** Currency input. Quick-select chips: "$0 / $500 / $1,000 / $2,000 / $3,000+"

**Visual Panel Update (top):**
Each dollar saved enhances "Future You's" world:
- The retirement age on the calendar **ticks earlier** (if the math supports it) — this should animate as a counter rolling down, which is deeply satisfying
- New elements appear in Future You's scene — a suitcase (travel), a hobby item (easel, guitar, golf clubs, book), a garden expanding, a pet arriving
- The avatar's posture or expression subtly improves — standing taller, more relaxed
- The path on the timeline gets a "boost" visual — maybe a glow or acceleration effect at the point where savings compound

If savings are $0, the scene doesn't degrade — it simply doesn't improve. The message is "here's what adding savings could do" not "you're failing."

**Calculations triggered:**
- Re-run the full projection with actual savings rate
- Recalculate retirement age
- Compute key summary stats:
  - Projected net worth at retirement age
  - Projected monthly retirement income (from portfolio withdrawals + SS)
  - Years of runway (how long money lasts if they retire at the projected age)

**Animation:** The retirement age counter animates (ticking down if savings improve the picture, staying if they don't). Scene elements pop in with playful spring animations. The timeline glow effect animates forward.

---

### Screen 6: The Reveal — Your Full Projection

**Purpose:** This is not a question screen. This is the payoff — the full picture. The user has earned this view by completing all 5 questions.

**UI — Full width, visual expands:**
The two-panel layout dissolves. The visual panel expands to fill the full viewport. "You Today" and "Future You" merge into a single panoramic scene — a journey from left (now) to right (retirement). The path between them is fully visible with milestones marked along it. The stats, chart, and CTA appear below the expanded scene as the user scrolls or as they animate in.

**Central display:**
- **"You can retire at age [XX]"** — large, prominent, celebratory typography
- The avatar stands at the retirement point on the timeline, in their fully realized future scene
- Below: 3 key stat cards with animated counters:
  1. **Projected net worth at retirement:** "$X,XXX,XXX"
  2. **Monthly retirement income:** "$X,XXX" (withdrawals + SS)
  3. **Years of financial freedom:** "XX years" (how long the money lasts)

**Below the stats:**
- A simple net worth growth curve — a clean line chart from now to age 90 showing the portfolio growing during working years and drawing down in retirement. This is the one traditional chart in the experience, but styled to match the visual language (warm colors, smooth curves, animated draw-on effect).
- A subtle CTA: "Want to improve these numbers? There's a lot more we can do."

**Milestone markers on the timeline (grayed/teaser):**
Show future features they'll unlock after registration:
- "Age 50: Catch-up contributions unlock"
- "Age 59½: Penalty-free withdrawals"
- "Age 62–70: Social Security optimization"
- "Age 65: Medicare"
- "Roth conversion strategies"
- "Tax optimization moves"

These are not interactive yet — they're teasers that communicate the depth of the product and motivate registration.

**Animation:** This is the most cinematic moment. The visual panel expanding to full height should feel like a curtain rising. The retirement age number counts up to its value. The stat cards stagger in one by one below. The net worth chart draws itself from left to right. The milestone markers fade in sequentially along the timeline.

---

### Screen 7: Registration

**Purpose:** Convert the engaged user into a registered account. They've seen value — now capture the account.

**UI:**
The projection remains visible but recedes slightly into the background (dimmed or blurred behind a modal/card). The registration form appears as a clean centered card.

**Registration card contents:**
- Headline: "Save your plan and unlock the full toolkit"
- Bullet points (3 max, with icons):
  - "Optimize your taxes with smart strategy moves"
  - "Compare scenarios side by side"
  - "Track your progress over time"
- **Email field**
- **Password field** (with show/hide toggle, strength indicator)
- **Confirm password field**
- "Create my account" button (primary, prominent)
- "Or continue with Google" (secondary option — if OAuth is in scope)
- Small print: Terms of service and privacy policy links
- A "Skip for now" option (small, de-emphasized) — lets them leave without registering but they lose the projection. This creates urgency without being aggressive.

**After registration:**
- Wizard data is handed off to the main WealthPath app via the integration point defined in the Calculation Engine section
- The main app pre-populates Strategy Config inputs from the wizard data
- The full simulation engine runs with these seed values and generates the complete dashboard
- Redirect to the main WealthPath dashboard where the user sees their full projection, seeded from onboarding data
- The dashboard should immediately prompt them to "refine your plan" by adding advanced details (filing status, account breakdown, housing, etc.) — each refinement makes the full engine more accurate

**Animation:** The background projection blurs softly. The registration card fades in from center with a gentle scale-up. After successful registration, a celebration moment — confetti, a checkmark animation, the avatar waving or celebrating — then a smooth transition into the main app.

---

## Calculation Engine

### Two Engines — Not One

WealthPath has two separate calculation engines:

1. **The Full Simulation Engine** — already built and integrated into the main app. It handles marginal tax brackets, account-specific growth rates, Roth conversions, RMDs, Social Security optimization, inflation-adjusted expense categories, strategy moves, and year-by-year projections across multiple account types. This is the engine that powers the dashboard, scenarios, and strategy config after the user registers.

2. **The Onboarding Projection Engine** — a lightweight, simplified engine built specifically for this wizard. It exists to produce a fast, directionally correct projection from just 5 inputs. It does NOT replace or duplicate the full engine. It is a separate module that lives within the wizard code.

### Why a Separate Engine?

The full engine requires detailed inputs (account breakdowns, filing status, state, expense categories, strategy moves) that the user hasn't provided yet during onboarding. Trying to feed 5 basic inputs into the full engine would require dozens of assumptions that could produce misleading results. The onboarding engine is purpose-built to be accurate *given limited information* and transparent about its simplifications.

### Integration Point

After registration, the wizard data is handed off to the main app:

```typescript
// After successful registration, pass wizard data to the main app
const wizardHandoff = {
  age: wizardState.age,
  annualIncome: wizardState.annualIncome,
  totalSavings: wizardState.totalSavings,
  monthlySpending: wizardState.monthlySpending,
  monthlySavings: wizardState.monthlySavings,
  avatarId: wizardState.avatarId,
  onboardingProjection: wizardState.projection  // for reference/comparison
};

// The main app receives this and pre-populates its own inputs:
// - totalSavings → Private Portfolio balance (as a starting point until they break it out)
// - annualIncome → W2 Income in Strategy Config
// - monthlySpending → maps to the combined expense total
// - monthlySavings → maps to total contributions (401k + Roth IRA + brokerage)
// - age → sets the simulation start year
//
// The main app then runs the FULL engine with these seed values + defaults,
// and presents the user with the advanced dashboard.
// The user's first task in the dashboard is refining these inputs for precision.
```

The onboarding projection should be close enough to the full engine's output (with equivalent defaults) that the user doesn't feel whiplash when they land on the dashboard. If the onboarding says "retire at 62" and the full engine says "retire at 58" or "retire at 68" with the same inputs, that's a trust problem. Test both engines with the same 5 inputs and verify they produce similar retirement ages (within 2–3 years).

### Onboarding Engine — Inputs
| Variable | Source |
|----------|--------|
| `currentAge` | Screen 1 |
| `annualIncome` | Screen 2 |
| `totalSavings` | Screen 3 |
| `monthlySpending` | Screen 4 |
| `monthlySavings` | Screen 5 |

### Constants (Defaults)
| Constant | Value | Notes |
|----------|-------|-------|
| `growthRate` | 0.07 | Blended real return |
| `inflationRate` | 0.03 | Applied to spending |
| `taxRateDuringWork` | 0.22 | Simplified effective rate |
| `taxRateInRetirement` | 0.15 | Lower bracket in retirement |
| `ssStartAge` | 67 | Default SS claiming age |
| `ssMonthlyBenefit` | Estimated from income | See formula below |
| `endAge` | 90 | Planning horizon |

### Social Security Estimate
```
if annualIncome <= 36,000:    ssAnnual = annualIncome × 0.40
elif annualIncome <= 150,000:  ssAnnual = annualIncome × 0.30
elif annualIncome <= 250,000:  ssAnnual = annualIncome × 0.25
else:                          ssAnnual = 50,000  (approximate cap)
```
This is rough. It gets replaced by the user's actual SSA estimate in the advanced flow.

### Projection Loop
```
annualSpending = monthlySpending × 12
annualSavings = monthlySavings × 12
netWorth = totalSavings

for age in range(currentAge, endAge + 1):
    if age <= retirementAge:
        // Working years
        netWorth = netWorth × (1 + growthRate) + annualSavings
    else:
        // Retirement years
        ssIncome = ssAnnual if age >= ssStartAge else 0
        withdrawal = inflationAdjustedSpending - ssIncome
        tax = withdrawal × taxRateInRetirement
        netWorth = netWorth × (1 + growthRate) - withdrawal - tax
    
    inflationAdjustedSpending = annualSpending × (1 + inflationRate) ^ (age - currentAge)
    
    yearlyData[age] = { netWorth, spending, income, ssIncome }
```

### Finding Retirement Age
Iterate possible retirement ages from `currentAge + 1` to `endAge`. For each candidate, run the projection loop. The earliest age where `netWorth > 0` for all years through `endAge` is the projected retirement age. If no age works, return `endAge` (display as "85+" with appropriate messaging).

### Real-Time Recalculation
The projection must recalculate on every input change — as the user types or adjusts a slider. Debounce by 200ms to avoid excessive recalculation during typing, but the update should feel instant. The visual scene and retirement age must react within that frame.

---

## State Management

Use React Context or a lightweight store (Zustand recommended if adding a dependency is acceptable, otherwise Context + useReducer).

### State Shape
```typescript
interface WizardState {
  // Step tracking
  currentStep: number;           // 0-7
  completedSteps: number[];      
  
  // User inputs
  avatarId: string | null;
  age: number | null;
  annualIncome: number | null;
  totalSavings: number | null;
  monthlySpending: number | null;
  monthlySavings: number | null;
  
  // Registration
  email: string;
  password: string;
  
  // Derived / calculated
  projection: {
    retirementAge: number;
    netWorthAtRetirement: number;
    monthlyRetirementIncome: number;
    yearsOfRunway: number;
    yearByYearData: Array<{
      age: number;
      netWorth: number;
      spending: number;
      income: number;
      ssIncome: number;
    }>;
  } | null;
}
```

---

## Scene Element System

Since we're building scenes with SVG/code rather than illustrated artwork, define a system of **scene elements** that compose into the visual.

### Element Library (SVG components)
Build each as a reusable React component with animation props:

**Environment elements:**
- `Sky` — gradient background that shifts from dawn (early career) to golden hour (retirement)
- `Ground` — platform/terrain beneath the avatar
- `Clouds` — soft shapes that drift slowly (ambient animation)
- `Trees` — simple geometric trees that grow/appear as savings increase
- `Garden` — flowers/plants that bloom based on financial health
- `Sun` — position and brightness correlate with projection strength

**Home/Life elements:**
- `House` — starts small and simple, grows more detailed with better projections
- `Window` — with warm interior light that turns on as the scene develops
- `Furniture` — chair, table, bookshelf — items that populate the home
- `Workspace` — desk, laptop, briefcase — for the "today" scene

**Aspiration elements (appear based on savings/projection strength):**
- `Suitcase` — travel
- `Easel` / `Guitar` / `Book` — hobbies
- `Pet` — a simple dog or cat silhouette
- `GardenExpansion` — extended garden with more variety
- `Car` — appears at higher savings levels

**UI elements:**
- `Timeline` — horizontal bar with age markers and milestone flags
- `RetirementFlag` — drops at the calculated retirement age
- `CalendarDisplay` — shows the retirement age in Future You's scene
- `StatCard` — floating card showing a metric with animated counter
- `FogOverlay` — blur/opacity layer over Future You that clears progressively

### Scene Composition Rules
Each screen has a `sceneConfig` that defines which elements are visible and their state:

```typescript
interface SceneConfig {
  fogOpacity: number;           // 0 (clear) to 1 (fully fogged)
  todayElements: string[];      // IDs of visible elements in "today" scene
  futureElements: string[];     // IDs of visible elements in "future" scene
  futureElementScale: number;   // 0 to 1, how "developed" the future scene is
  timelineProgress: number;     // 0 to 1, how much of the timeline is solidified
  retirementAge: number | null; // null = not yet calculated
  ambientAnimation: boolean;    // whether ambient motion is active
}
```

Scene configs update reactively based on wizard state. Define smooth interpolation between configs so elements don't pop in/out — they always transition.

---

## Responsive Design

### Breakpoints
- **Desktop:** ≥1024px — visual panel ~55% viewport height, question panel centered at max-width 600px
- **Tablet:** 768–1023px — visual panel ~45% viewport height, question panel full-width with horizontal padding
- **Mobile:** <768px — visual panel ~35% viewport height with simplified scene elements, question panel full-width

### Mobile Considerations
- The visual panel compresses but never disappears — the user must always see their projection updating
- Simplify scene elements on mobile — fewer decorative elements, focus on avatar + retirement age + key stats
- Input fields should be large touch targets (min 48px height)
- Quick-select chips should be horizontally scrollable
- The reveal screen (Screen 6) stacks naturally: scene on top, stats below, chart below that

---

## Accessibility

- All inputs must have proper labels and ARIA attributes
- Avatar selection must be keyboard-navigable (arrow keys to move between, Enter to select)
- Color should never be the only indicator — use shape, text, and icons alongside
- Animations should respect `prefers-reduced-motion` — provide static fallbacks for all animated elements
- The retirement age and key stats must be announced to screen readers when they update
- Minimum contrast ratio of 4.5:1 for all text
- Focus states must be clearly visible on all interactive elements

---

## Performance

- The projection calculation runs on every input change (debounced at 200ms)
- Scene animations should use CSS transforms and opacity only (GPU-accelerated properties) — avoid animating layout properties
- SVG scene elements should be lightweight — no complex paths or excessive detail
- Lazy load Screen 6 (the reveal) and Screen 7 (registration) assets since the user won't see them immediately
- Target: the wizard should feel instant. No loading spinners, no perceptible delay between input and visual update

---

## Error Handling & Edge Cases

- **Age < 18 or > 80:** Show gentle message: "WealthPath is designed for planning between ages 18 and 80"
- **Income = $0:** Allow it. The projection still works (living off savings). Adjust the "today" scene to not show a workspace.
- **Savings = $0:** Allow it. Future You's scene starts minimal. The message is motivating: "everyone starts somewhere."
- **Spending > income:** Allow it (people do spend more than they earn via debt). Show the retirement age as very high/85+ and frame it as "here's the opportunity."
- **Savings = $0 per month:** Allow it. Show what their existing savings can do alone, and how much adding even small savings would help.
- **All fields at $0 except age:** Handle gracefully. The scene is minimal, the retirement age is 85+, and the message is "let's build a plan together."
- **Browser back button:** Should navigate to the previous wizard step, not leave the wizard
- **Page refresh:** Wizard state should persist in sessionStorage so users don't lose progress on accidental refresh

---

## What This Spec Does NOT Cover (Already Exists or Out of Scope)

- **The main WealthPath app** — the dashboard, strategy config, scenarios, simulator, and move catalog are already built. This wizard is a new front door to that existing app.
- **The full simulation engine** — already implemented in the main app. The onboarding engine described here is a separate lightweight module.
- The advanced question flow (filing status, account breakdown, housing details, etc.) — this lives in the main app as a "refine your plan" experience post-registration
- Payment / subscription flow
- Email verification
- OAuth / social login implementation details
- Backend API for account creation (assume a POST to `/api/register` with `{ email, password, wizardData }`)
- Data persistence beyond sessionStorage (the backend handles saving the projection after registration)

---

## File Structure

```
src/
├── components/
│   ├── wizard/
│   │   ├── WizardContainer.tsx        # Main wizard wrapper, step routing, layout
│   │   ├── StepAvatar.tsx             # Screen 0: Avatar selection
│   │   ├── StepAge.tsx                # Screen 1: Age input
│   │   ├── StepIncome.tsx             # Screen 2: Income input
│   │   ├── StepSavings.tsx            # Screen 3: Total savings input
│   │   ├── StepSpending.tsx           # Screen 4: Monthly spending input
│   │   ├── StepMonthlySavings.tsx     # Screen 5: Monthly retirement savings input
│   │   ├── StepReveal.tsx             # Screen 6: Full projection reveal
│   │   └── StepRegister.tsx           # Screen 7: Registration form
│   ├── scene/
│   │   ├── SceneContainer.tsx         # Top visual panel — manages today/future layout
│   │   ├── TodayScene.tsx             # "You Today" half of the scene
│   │   ├── FutureScene.tsx            # "Future You" half of the scene
│   │   ├── Timeline.tsx               # Age timeline with markers and flags
│   │   ├── FogOverlay.tsx             # Animated fog/blur over future scene
│   │   └── RetirementReveal.tsx       # Calendar/age display in future scene
│   ├── scene-elements/
│   │   ├── Avatar.tsx                 # SVG avatar component (configurable by ID)
│   │   ├── Sky.tsx
│   │   ├── Ground.tsx
│   │   ├── House.tsx
│   │   ├── Trees.tsx
│   │   ├── Garden.tsx
│   │   ├── Workspace.tsx
│   │   ├── Furniture.tsx
│   │   ├── Suitcase.tsx
│   │   ├── HobbyItems.tsx
│   │   ├── Pet.tsx
│   │   ├── Sun.tsx
│   │   ├── Clouds.tsx
│   │   └── index.ts                   # Export all scene elements
│   ├── ui/
│   │   ├── CurrencyInput.tsx          # Formatted currency input with $ prefix
│   │   ├── QuickSelectChips.tsx       # Preset value chips below inputs
│   │   ├── StatCard.tsx               # Animated stat display card
│   │   ├── NetWorthChart.tsx          # Line chart for the reveal screen
│   │   ├── ProgressIndicator.tsx      # Step indicator (dots or segments)
│   │   └── AnimatedCounter.tsx        # Number that counts up/down to target
├── engine/
│   │   ├── projection.ts             # Core projection calculation
│   │   ├── ssEstimate.ts             # Social Security estimation
│   │   └── taxEstimate.ts            # Simplified tax calculation
├── store/
│   │   ├── wizardStore.ts            # State management (Context + useReducer or Zustand)
│   │   └── types.ts                  # TypeScript interfaces
├── hooks/
│   │   ├── useProjection.ts          # Hook that runs projection on state change (debounced)
│   │   └── useSceneConfig.ts         # Hook that derives scene configuration from state
├── utils/
│   │   ├── formatCurrency.ts         # Number formatting helpers
│   │   ├── animations.ts             # Shared Framer Motion animation configs
│   │   └── persistence.ts            # sessionStorage save/restore
└── styles/
        └── theme.ts                   # Color palette, fonts, spacing tokens
```

---

## Summary: The Build Checklist

1. **Set up project** with React, Tailwind, Framer Motion
2. **Build the calculation engine** (`engine/`) — this is the foundation. Test it independently.
3. **Build the SVG scene elements** (`scene-elements/`) — each as an animated component
4. **Build the scene composition system** (`scene/`) — the split screen, fog, timeline, element arrangement
5. **Build the UI components** (`ui/`) — currency input, chips, stat cards, progress indicator
6. **Build each wizard step** (`wizard/`) — one at a time, in order, wiring up the visual updates
7. **Wire state management** — inputs → projection engine → scene config → visual update
8. **Build the reveal screen** — the full projection with chart and milestone teasers
9. **Build the registration screen** — clean form with background projection
10. **Polish animations** — ambient motion, transitions between steps, the reveal choreography
11. **Responsive design pass** — ensure mobile layout works with stacked visual
12. **Accessibility pass** — keyboard navigation, screen reader support, reduced motion
13. **Persistence** — sessionStorage for wizard state across refreshes
