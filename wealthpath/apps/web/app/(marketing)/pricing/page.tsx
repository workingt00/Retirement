"use client";

import { useState } from "react";
import Link from "next/link";

const FEATURES_TABLE = [
  { feature: "Basic calculator", free: true, pro: true, premium: true },
  { feature: "Plans", free: "1", pro: "3", premium: "Unlimited" },
  { feature: "38-move system", free: false, pro: true, premium: true },
  { feature: "Sensitivity analysis", free: false, pro: true, premium: true },
  { feature: "CG tax insights", free: false, pro: true, premium: true },
  { feature: "Scenarios", free: false, pro: "3/plan", premium: "Unlimited" },
  { feature: "Monte Carlo (v2)", free: false, pro: false, premium: true },
  { feature: "PDF export", free: false, pro: false, premium: true },
  { feature: "Priority support", free: false, pro: false, premium: true },
];

const FAQ = [
  {
    q: "Can I try before I pay?",
    a: "Yes. The Free plan gives you a basic calculator with no time limit. Pro and Premium include a 14-day free trial.",
  },
  {
    q: "What's the difference between Pro and Premium?",
    a: "Pro gives you the full 38-move system with 3 plans and 3 scenarios each. Premium adds unlimited plans, unlimited scenarios, Monte Carlo simulation, PDF exports, and priority support.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time. Your data stays accessible on the Free plan.",
  },
  {
    q: "Is my financial data secure?",
    a: "All data is encrypted at rest and in transit. We use industry-standard security practices and never share your information.",
  },
  {
    q: "Do you sell my data?",
    a: "No. We will never sell, share, or monetize your financial data. Our business model is subscriptions, not advertising.",
  },
  {
    q: "What if I need help?",
    a: "Free and Pro users get email support. Premium users get priority support with faster response times.",
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span>{value}</span>;
  return value ? (
    <span className="text-emerald-600">&#10003;</span>
  ) : (
    <span className="text-gray-300">&mdash;</span>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-center text-4xl font-bold">Pricing</h1>
      <p className="mt-4 text-center text-gray-600">
        Start free. Upgrade when you need more.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setAnnual(false)}
          className={`rounded-lg px-4 py-2 text-sm ${!annual ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setAnnual(true)}
          className={`rounded-lg px-4 py-2 text-sm ${annual ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Annual (save 17%)
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          { name: "Free", monthly: 0, annual: 0, highlighted: false },
          { name: "Pro", monthly: 12, annual: 10, highlighted: true },
          { name: "Premium", monthly: 20, annual: 17, highlighted: false },
        ].map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl border-2 p-8 ${
              tier.highlighted ? "border-emerald-600 shadow-lg" : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <p className="mt-2">
              <span className="text-4xl font-bold">
                ${annual ? tier.annual : tier.monthly}
              </span>
              {tier.monthly > 0 && <span className="text-gray-500">/mo</span>}
            </p>
            <Link
              href="/signup"
              className={`mt-6 block rounded-lg px-4 py-2 text-center font-medium ${
                tier.highlighted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tier.monthly === 0 ? "Get Started" : `Start ${tier.name} Trial`}
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mt-20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-left font-medium text-gray-500">Feature</th>
              <th className="pb-3 text-center font-medium text-gray-500">Free</th>
              <th className="pb-3 text-center font-medium text-gray-500">Pro</th>
              <th className="pb-3 text-center font-medium text-gray-500">Premium</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES_TABLE.map((row) => (
              <tr key={row.feature} className="border-b border-gray-100">
                <td className="py-3 text-gray-700">{row.feature}</td>
                <td className="py-3 text-center"><CellValue value={row.free} /></td>
                <td className="py-3 text-center"><CellValue value={row.pro} /></td>
                <td className="py-3 text-center"><CellValue value={row.premium} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mx-auto mt-8 max-w-2xl divide-y divide-gray-200">
          {FAQ.map((item, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between text-left font-medium"
              >
                {item.q}
                <span className="ml-4 text-gray-400">{openFaq === i ? "-" : "+"}</span>
              </button>
              {openFaq === i && (
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
