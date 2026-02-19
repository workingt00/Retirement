import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-4xl font-bold">About WealthPath</h1>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">From Spreadsheet to Simulation</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          WealthPath started as a personal Excel spreadsheet — 2,371 formulas tracking every
          aspect of a retirement plan: 7 account types, 38 financial moves, progressive tax
          brackets, Social Security timing, Roth conversion ladders, and bear market scenarios.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          The spreadsheet worked, but it was fragile, impossible to share, and locked to one
          person&apos;s assumptions. So we rebuilt it as a web application — the same engine,
          now accessible to anyone who wants more than a retirement &quot;estimate.&quot;
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Built for People Who Want More Than a Guess</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Most retirement calculators ask for your age, savings, and expected return, then give
          you a single number. WealthPath simulates your finances year by year — every tax
          bracket, every account, every move — so you can see exactly what happens when you
          change a strategy.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Toggle a Roth conversion and watch your tax bracket shift. Delay Social Security and
          see the crossover point. Stress-test with bear market returns. This is planning, not
          guessing.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Your Data Is Yours</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          All financial data is encrypted at rest and in transit. We never share, sell, or
          monetize your information. Our business model is subscriptions — we make money when
          you find the tool valuable enough to pay for, not by harvesting your data.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="mt-4 text-gray-600">
          Questions or feedback? Reach us at{" "}
          <a href="mailto:support@wealthpath.app" className="text-emerald-600 hover:underline">
            support@wealthpath.app
          </a>
        </p>
      </section>

      <div className="mt-16">
        <Link
          href="/signup"
          className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
