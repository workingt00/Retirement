---
name: timeline-builder
description: "Core development skill for building WealthPath's interactive financial timeline — the central UI and product feature. Use this skill whenever working on: the vertical scrolling timeline, timeline node types (life events, tax cards, milestones, scenarios), the wizard-to-timeline transition animation, profile editing integration within the timeline, scenario simulation and saved versions, tax opportunity card engine, confidence scoring, past/future event management, or the summary bar. Also trigger when working on the dual calculation engine (lightweight onboarding vs comprehensive simulation), real-time timeline recalculation, or any UI component that lives on or interacts with the timeline. If you're touching anything timeline-related in WealthPath, read this skill first."
---

# WealthPath Interactive Financial Timeline

## Related Skills

When building timeline UI components, also read the **UI Builder skill** — it covers dual-mode patterns (Horizon/Velocity), design tokens, animation rules, slider best practices, component architecture, and server verification. This timeline skill tells you *what to build*; the UI Builder skill tells you *how to build it*.

## What This Skill Covers

This skill defines how to build the core product feature of WealthPath: a vertical, interactive financial timeline that serves as the primary user interface. Everything in WealthPath — tax optimization, scenario planning, profile management — is a layer on top of this timeline.

The product philosophy: **life first, calculator behind the scenes**. Users plan their life and the money follows.

For the full product spec with detailed rationale, read `references/product-spec.md`. This SKILL.md focuses on implementation guidance.

---

## Architecture Overview

### Three-Tier User Journey

The user experience flows through three tiers with seamless visual transitions:

1. **Basic Onboarding Wizard** (already implemented, do not modify)
   - Gamified horizontal experience: avatar selects a car, drives along a horizontal timeline toward a house
   - Car quality and house quality reflect financial health based on inputs
   - Avatar is positioned at the user's current age on the horizontal line (not at the start)
   - Car moves forward/backward in real time as user adjusts inputs

2. **Full Interactive Timeline** (the core product, this skill)
   - Vertical scrolling timeline that appears after wizard completion and registration
   - Past events above, future projections below, divided by a "today" marker
   - Profile editing is integrated directly into the timeline (no separate profile screen)

3. **Profile Refinement** (integrated into Tier 2)
   - Incomplete data nodes glow/pulse on the timeline
   - Tapping opens a slide-out panel with relevant fields
   - Timeline updates live as user fills in data

### Dual Calculation Engine

WealthPath uses two engines. Understanding when each fires is critical:

- **Lightweight Onboarding Engine**: Powers the wizard and initial timeline generation. Fast, simplified assumptions, minimal inputs. Must update in real time during wizard interaction.
- **Comprehensive Simulation Engine**: Powers the full timeline with detailed tax calculations, scenario simulations, and opportunity detection. Runs when sufficient profile data exists. Handles: federal/state tax brackets, Roth conversion optimization, Social Security timing, RMD calculations, Medicare IRMAA, capital gains timing, inflation-adjusted projections.

---

## The Wizard-to-Timeline Transition

This is the most important UX moment in the entire product. It bridges the playful wizard and the serious timeline. Invest significant engineering time here.

### What Exists (Do Not Change)
- The wizard has a horizontal timeline with an avatar driving a car toward a house
- The avatar sits at the user's current age position on the line
- Past road extends behind the avatar, future road extends ahead toward the house

### The Animation Sequence (On Register/Login Screen)

**Phase 1 — Simplification** (~0.5s): All gamified chrome fades — avatar details, car decorations, road textures, house details dissolve. What remains: the clean horizontal timeline line, the user's age position marker, and the destination marker (retirement target).

**Phase 2 — Rotation** (~0.5s): After a brief pause, the horizontal line rotates to vertical. The user's current age marker moves to the middle of the viewport. Past years extend upward. Future years extend downward toward the retirement destination.

**Phase 3 — Population** (~2s): Nodes cascade downward from the user's current age. Life events appear, tax opportunity cards fade in, milestone markers emerge. The timeline comes alive. The cascade should feel like the future is unfolding — not instant, not sluggish.

### Implementation Notes
- The transition must feel like one continuous motion, not three separate steps
- The house from the wizard becomes the retirement node at the bottom
- The avatar marker becomes the "you are here" indicator at current age
- All data from the wizard (age, savings, retirement target) is pre-populated on the timeline
- The past section above the age marker is initially sparse (user hasn't added past events yet) but should show the structural space for them

---

## Timeline Structure

### Orientation: Vertical (Non-Negotiable)

The timeline scrolls vertically. Rationale: natural scroll behavior on all devices, room for full-width content cards, mirrors temporal thinking (top = now, bottom = future), and drag-and-drop works cleanly (no conflict with mobile swipe-to-go-back).

### Layout

```
┌──────────────────────────────────┐
│  [Summary Bar - pinned]          │
│  Age 41 | Retire 55 | 72% conf  │
├──────────────────────────────────┤
│                                  │
│  ── Past Section (muted) ──      │
│  │                               │
│  ○ Age 35: Started maxing 401k   │
│  │                               │
│  ○ Age 38: Roth conversion $50K  │
│  │                               │
│  ═══ TODAY (age 41) ═══════════  │
│  │                               │
│  ○ Age 43: Oldest starts college │
│  │                               │
│  ◇ Tax: Roth conversion window   │
│  │                               │
│  ★ Milestone: $1M net worth      │
│  │                               │
│  ○ Age 52: Could go part-time    │
│  │                               │
│  ○ Age 55: Retirement target 🏠  │
│  │                               │
│  ○ Age 70: RMDs begin            │
│                                  │
└──────────────────────────────────┘
```

- **Rail**: Thin vertical line running down the left side (~20-25% from left edge) with age/year markers
- **Cards**: Event content extends to the right of the rail
- **Mobile**: Rail left-aligned, cards full-width
- **Today Marker**: Thick, prominent horizontal divider — the most important visual anchor

### Summary Bar (Pinned at Top)

Always visible during scroll. Shows:
- Current age
- Target retirement age
- Overall confidence score
- Current net worth estimate

Updates in real time when the user makes changes to the timeline.

---

## Node Types

Each node type has a distinct visual treatment so users instantly understand what they're looking at.

### 1. Life Event Nodes
- **Visual**: Solid, permanent appearance
- **Behavior**: User-controlled — can be added, moved (future section only), or removed
- **Examples**: College expenses, home purchase, career change, retirement
- **Interaction**: Tap to expand details, drag to reposition in future section

### 2. Tax Opportunity Cards
- **Visual**: Lighter weight, dashed border or distinct background color — clearly "suggested"
- **Behavior**: Engine-generated, appear between life events at tax-advantaged windows
- **Actions**: Tap to expand (shows before/after impact), Accept (locks into plan), Dismiss
- **Density**: Maximum 3-5 visible at a time, prioritized by lifetime impact
- **Detail**: See `references/product-spec.md` Section 5 for the three-layer tax intelligence system

### 3. Milestone Markers
- **Visual**: Celebratory treatment — visual flourish, distinct icon
- **Behavior**: Auto-generated when engine detects significant achievements
- **Examples**: Hit $1M net worth, crossover point, earliest viable retirement, debt-free

### 4. Incomplete Profile Nodes
- **Visual**: Glowing or pulsing, clearly indicating "needs attention"
- **Behavior**: Tapping opens a slide-out panel or bottom sheet with relevant profile fields
- **Categories**: Income, Savings, Tax Status, and other profile sections
- **Feedback**: When user fills in data and closes panel, timeline visibly updates (nodes shift, confidence changes, new cards may appear)

### 5. Scenario Event Nodes
- **Visual**: Distinct style indicating hypothetical — different from permanent life events
- **Behavior**: Injected from the scenario menu, recalculates everything downstream
- **Interaction**: Can be removed to revert to base timeline

---

## Past Events

The section above the today marker serves two purposes: showing actual history for context, and letting users build a financial memoir.

### Rules
- Past events are **addable**: Users can record historical financial moments (past conversions, home purchases, job changes, market events)
- Past events **feed the engine**: A past Roth conversion affects cost basis and RMD calculations, so the engine incorporates it for forward projection accuracy
- Past events are **visually muted**: Grayscale or desaturated color treatment
- Past events are **not retroactively editable** for manipulation — users add context, they don't rewrite history
- The recalculation from adding past events should be invisible — the timeline quietly gets smarter

---

## Scenario Simulation

### Event Menu
Provide a curated menu of pre-built scenario cards:

**Negative**: Bear market, major crash, job loss, health expense, disability, divorce, prolonged inflation, housing downturn

**Positive**: Bull market, inheritance, windfall/bonus, home value surge, early mortgage payoff, career advancement, side business income

Power users can also create custom scenarios with user-defined parameters.

### Interaction
- User selects a scenario card from the menu and drops it onto a specific year
- Engine recalculates everything downstream only (past stays locked)
- Multiple scenarios can be layered on the same timeline
- Scenarios are visually distinct from permanent events

### Saved Versions
- Each saved timeline state gets a **name** and **notes**
- V1: Load one version at a time from a list
- Data model must support future side-by-side comparison and shareable read-only links

---

## Profile Editing Integration

There is NO separate profile screen. Profile editing happens within the timeline:

1. Incomplete profile nodes appear on the timeline at relevant positions
2. User taps a node → slide-out panel or bottom sheet opens with relevant fields
3. User fills in data → closes panel → timeline updates immediately
4. The panel should NOT cover the full timeline — user should see the timeline shifting as they enter data

The original profile categories (Income, Savings, Tax Status, etc.) become categories of completable nodes distributed along the timeline.

Some fields are mandatory (visually distinct), others are optional refinements.

---

## Confidence & Risk

### Dynamic Confidence
- Confidence changes as you scroll: near-term is high confidence, far-future carries more uncertainty
- Each node displays its own confidence level

### Confidence Bands
- Show ranges, not single numbers: "Age 55: $1.8M–$2.4M"
- Can be a color-coded ring or small range beneath the primary figure
- Single numbers feel like false precision — savvy users will lose trust

---

## Data Model Considerations

The schema must support (even if not all are V1):
- Multiple saved timeline versions per user (name + notes)
- Past events that feed into forward calculations
- Layered scenario events (independently addable/removable)
- Accepted and dismissed tax opportunity cards
- Incomplete profile fields with default/estimated values
- Future: couples view (second person on same timeline)
- Future: shareable read-only links to saved versions
- Future: side-by-side version comparison

---

## Key Implementation Principles

1. **The timeline IS the product.** Every feature is a layer on the timeline, not a separate screen.
2. **Real-time responsiveness is critical.** If the timeline feels sluggish during drag/drop or data entry, the experience breaks. Use optimistic UI updates with background recalculation.
3. **Visual consistency matters.** Each node type must be instantly distinguishable. Users should never confuse a suggestion with a life event.
4. **The wizard transition is the wow moment.** The horizontal-to-vertical animation is the single most important UX investment.
5. **Transparency builds trust.** Every calculation should be verifiable. Power users will check the math — let them.
6. **Don't overwhelm.** Cap visible tax cards at 3-5. Past events show financially significant moments, not every transaction. The timeline should feel like a life story, not a spreadsheet.
