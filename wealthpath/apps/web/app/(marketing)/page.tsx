"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import NetWorthChart from "@/components/charts/NetWorthChart";
import AnimatedNumber from "@/components/charts/AnimatedNumber";
import { generateMockYears } from "@/components/charts/__mocks__/mockData";

const FEATURES = [
  {
    title: "38 Financial Moves",
    description:
      "Toggle strategies like Roth conversions, early withdrawal, and Social Security timing. See the impact instantly.",
    icon: "toggle",
  },
  {
    title: "Real Tax Intelligence",
    description:
      "Progressive federal brackets, capital gains optimization, state taxes for all 50 states. Not a flat estimate.",
    icon: "tax",
  },
  {
    title: "Stress-Tested",
    description:
      "Bear and bull market scenarios built in. Know your plan survives more than just the average case.",
    icon: "shield",
  },
];

const TIERS = [
  {
    name: "Free",
    price: 0,
    annualPrice: 0,
    features: ["Basic calculator", "1 plan", "Net worth projection"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 12,
    annualPrice: 10,
    features: [
      "3 plans",
      "38-move system",
      "Sensitivity analysis",
      "CG tax insights",
      "3 scenarios per plan",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Premium",
    price: 20,
    annualPrice: 17,
    features: [
      "Unlimited plans",
      "Everything in Pro",
      "Unlimited scenarios",
      "Monte Carlo (v2)",
      "PDF export",
      "Priority support",
    ],
    cta: "Start Premium Trial",
    highlighted: false,
  },
];

export default function LandingPage() {
  const [retireAge, setRetireAge] = useState(55);
  const [annualBilling, setAnnualBilling] = useState(false);

  const demoYears = useMemo(() => generateMockYears(41, retireAge), [retireAge]);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight">
          See Your Retirement Before You Get There
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          The financial planning tool that shows you exactly how every decision
          affects your future. Not a guess — a simulation.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-6 py-3 text-lg font-medium text-white hover:bg-emerald-700"
          >
            Start Free — No Credit Card
          </Link>
        </div>

        {/* Hero chart */}
        <div className="mx-auto mt-12 max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <NetWorthChart
            years={demoYears}
            retirementAge={retireAge}
            firstFailureAge={null}
            theme="horizon"
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">What Makes This Different</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-3 text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-8">
              <p className="text-4xl font-bold text-emerald-600">
                <AnimatedNumber value={2371} format="integer" duration={800} />
              </p>
              <p className="mt-2 text-gray-600">Formulas in the simulation engine</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-8">
              <p className="text-4xl font-bold text-emerald-600">38</p>
              <p className="mt-2 text-gray-600">Financial moves you can toggle and combine</p>
            </div>
          </div>
          <p className="mt-8 text-gray-500">
            Used by early retirees and FIRE planners.
          </p>
        </div>
      </section>

      {/* Two Experiences */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold">Two Experiences, One Engine</h2>
          <p className="mt-4 text-gray-600">Choose the one that fits you. Switch anytime.</p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border-2 border-amber-200 bg-[#FAF9F6] p-8">
              <h3 className="text-xl font-semibold text-amber-800">Horizon Mode</h3>
              <p className="mt-2 text-gray-600">Warm, guided experience for ages 50+. Simplified charts, clear next steps.</p>
            </div>
            <div className="rounded-xl border-2 border-blue-600 bg-[#0F172A] p-8 text-white">
              <h3 className="text-xl font-semibold text-blue-400">Velocity Mode</h3>
              <p className="mt-2 text-gray-400">Dense, data-rich dashboard for FIRE planners ages 25-49.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold">Try It</h2>
          <p className="mt-4 text-gray-600">Drag the slider and watch the chart update.</p>
          <div className="mt-8">
            <label className="text-sm font-medium text-gray-700">
              Retirement Age: {retireAge}
            </label>
            <input
              type="range"
              min={45}
              max={70}
              value={retireAge}
              onChange={(e) => setRetireAge(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <NetWorthChart
              years={demoYears}
              retirementAge={retireAge}
              firstFailureAge={null}
              theme="horizon"
            />
          </div>
          <p className="mt-6 text-sm text-gray-500">
            This is just the surface. Sign up to unlock the full engine.
          </p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="text-sm text-gray-600"
            >
              {annualBilling ? "Showing annual pricing" : "Show annual pricing"}
              {annualBilling && " (save ~17%)"}
            </button>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border-2 p-8 ${
                  tier.highlighted
                    ? "border-emerald-600 bg-white shadow-lg"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-2">
                  <span className="text-4xl font-bold">
                    ${annualBilling ? tier.annualPrice : tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-gray-500">/mo</span>
                  )}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-lg px-4 py-2 text-center font-medium ${
                    tier.highlighted
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
