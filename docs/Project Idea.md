Wealth Tracker: concept, framing, and research plan

What the site is

A public-facing “rich list” style tracker that focuses less on fascination and more on exposure: showing how extreme wealth converts into ongoing, mostly-passive income and how that compares to typical wages, public budgets, and poverty thresholds.

Positioning statement (plain language):
	•	“This isn’t about gossip. It’s a calculator for inequality.”

Primary audiences:
	•	General public (high-impact visuals, simple explanations)
	•	Journalists/educators (downloadable charts, sources)
	•	Policy-curious readers (tax/returns assumptions, sensitivity ranges)

⸻

Core ideas and page concepts

1) Profile pages (one per billionaire)

Each profile should answer:
	•	How much wealth (with date + source)
	•	How fast it grows under typical market returns
	•	What that means per day/hour/minute
	•	How it compares to wages and living costs
	•	Where it comes from (company ownership, sector, inherited vs self-made where available)

Key modules on the page:
	•	Passive income counter (ranges: conservative/base/aggressive)
	•	“While you read this” ticker (earnings during session)
	•	Wealth composition (if reliable: public equity vs other)
	•	Inequality comparisons (median wage multiples; “lifetimes of pay”)
	•	Context notes: methodology, uncertainty, sources

2) Live “Inequality Dashboard”

A home page that’s visually immediate:
	•	Total wealth tracked
	•	Total estimated passive income per day (range)
	•	Distribution charts (top 10, top 100, top 0.1%)
	•	“What could this fund?” tiles (healthcare staffing, housing units, school meals, etc. — pick a geography and stick to it)

3) “Return Engine” explainer

A dedicated page that explains why wealth begets more wealth:
	•	Dividend yield vs total return
	•	Buybacks and capital gains
	•	Access to private deals, preferential borrowing, leverage
	•	“Why the wealthy can live off assets without working”

4) Scenarios and tools

Interactive tools people can play with:
	•	Return assumptions slider (e.g., 2%–10% real/nominal)
	•	Tax scenario modelling (clearly labelled as hypothetical)
	•	Inflation toggle (nominal vs real)
	•	Time machine: “If you started with X at age 25 earning Y, how long to reach £1m/£100m?”

5) Stories, not just stats

Editorial features that keep it from being a spreadsheet:
	•	“A day of passive income vs a nurse’s annual salary”
	•	“Billionaire wealth growth since 2020 vs median household wealth”
	•	“Inherited wealth: what the data says” (only where sourced)

⸻

The key metric: estimating “passive income” (methodology)

You’ll need to be explicit: passive income is not directly observable from net worth, so you model it.

A simple, defensible approach

Use three scenarios based on widely-understood assumptions:
	1.	Conservative: 3% annual return
	2.	Base: 5% annual return
	3.	High: 7% annual return

Then compute:
	•	Annual passive income estimate = Net worth × return assumption
	•	Daily = annual ÷ 365
	•	Hourly = daily ÷ 24
	•	Per minute = hourly ÷ 60

Add a “What this represents” note:
	•	This is an asset return model (dividends, interest, rent, buybacks/capital gains), not declared cash income.

When you have better data

For founders heavily tied to a public company, you can optionally:
	•	Estimate dividend income from known holdings and dividend rates (when holdings are sourced)
	•	Show “paper gains” separately from cash yields (label clearly)

Make uncertainty a feature

Instead of hiding it:
	•	Display a range and let users toggle assumptions
	•	Provide a “Why this is uncertain” tooltip (private assets, valuation swings, leverage, timing)

⸻

Research and data sources to plan around

Rich list / net worth sources

You’ll likely want multiple sources and show disagreements:
	•	Forbes-style estimates
	•	Bloomberg-style estimates (if accessible)
	•	Public filings and proxy statements for major holdings
	•	Company market cap data for founder stakes (when stakes are known)

Inequality context sources

Use reputable, method-heavy sources:
	•	World Inequality Database (WID)
	•	OECD inequality and income distribution stats
	•	National statistics (e.g., ONS for UK comparisons)
	•	Academic and NGO reports (e.g., Oxfam) — useful, but label as advocacy where relevant

Wages and living standards

Choose a baseline geography first (UK-only, US-only, or global comparisons) to avoid muddle:
	•	Median/mean wages
	•	Minimum wage
	•	Poverty thresholds (relative and absolute)
	•	Typical household wealth/asset distribution

“What could this fund?” references

Only do these if you can cite unit costs:
	•	Per-pupil school funding
	•	NHS staffing costs
	•	Social housing build costs
	•	Meals, shelters, public services

⸻

Design principles that support the mission
	•	No glamour photography: keep it informational, not celebratory.
	•	Show sources everywhere: “as of date”, link to methodology.
	•	Avoid moralising copy: let the maths do the work.
	•	Comparisons grounded in reality: median wage, typical rent, public budgets—pick a consistent set.

Accessibility/clarity:
	•	“Billion” and “million” helpers (people misread zeros)
	•	Toggle between £/$ and between nominal/real
	•	Plain-English glossary (net worth, capital gains, dividends)

⸻

Legal/ethical considerations (important)
	•	Net worth estimates can be contested; avoid definitive claims like “earns £X” without model language.
	•	Use “estimated”, “modelled”, “range”, “as of”.
	•	Be careful with “self-made vs inherited” labels unless sourced.
	•	Respect privacy: stick to public figures and public information.
	•	Provide a correction policy and contact route.

⸻

MVP scope (practical first release)
	1.	Top 50–100 profiles with:
	•	net worth
	•	passive income model (3/5/7%)
	•	basic comparisons (median wage multiple, per-day counter)
	2.	One dashboard page
	3.	One methodology page
	4.	Sources page + correction policy

Optional but high impact:
	•	A shareable “fact card” image generator per profile (for social sharing)

⸻

If you want a clear next step

Pick one baseline comparison region (UK vs US vs global) and one rich list source for the MVP, then I can propose:
	•	a concrete site map,
	•	a data schema (profiles, snapshots, assumptions),
	•	and a set of copy blocks for the methodology so the site reads consistently.