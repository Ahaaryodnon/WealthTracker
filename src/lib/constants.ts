/** Default annual return rate (e.g. 5%) used for passive income calculation. */
export const DEFAULT_RETURN_RATE = 0.05;

/** Comparisons used in the visual comparison section. */
export const COMPARISONS = [
  {
    label: "Median US salary",
    value: 59_384,
    source: "US Census Bureau",
  },
  {
    label: "Average US home price",
    value: 420_800,
    source: "US Census Bureau / HUD",
  },
  {
    label: "Teacher's annual salary (US avg)",
    value: 69_544,
    source: "Bureau of Labor Statistics",
  },
] as const;

/**
 * Public budget items for "What could this fund?" section.
 * Annual costs in USD. Sources are approximate US federal/program budgets.
 */
export const BUDGET_ITEMS = [
  {
    label: "National Park Service",
    annualCost: 4.5e9,
    icon: "🌲",
    description: "Protect and maintain all 63 national parks for a year",
    source: "NPS FY2025 Budget",
  },
  {
    label: "Head Start program",
    annualCost: 12.3e9,
    icon: "👶",
    description: "Early childhood education for ~800,000 low-income children",
    source: "HHS FY2025 Budget",
  },
  {
    label: "School lunch program",
    annualCost: 15.7e9,
    icon: "🍎",
    description: "Free and reduced-price meals for 30 million students",
    source: "USDA National School Lunch Program",
  },
  {
    label: "CDC budget",
    annualCost: 17.3e9,
    icon: "🏥",
    description: "Disease prevention, outbreak response, and public health research",
    source: "CDC FY2025 Budget",
  },
  {
    label: "NASA budget",
    annualCost: 25.4e9,
    icon: "🚀",
    description: "Space exploration, climate research, and aeronautics",
    source: "NASA FY2025 Budget",
  },
  {
    label: "Pell Grants",
    annualCost: 30.6e9,
    icon: "🎓",
    description: "College financial aid for ~7 million low-income students",
    source: "Dept. of Education FY2025 Budget",
  },
  {
    label: "Clean water infrastructure",
    annualCost: 55e9,
    icon: "💧",
    description: "Upgrade aging water systems and replace lead pipes nationwide",
    source: "EPA & ASCE Infrastructure Report",
  },
  {
    label: "SNAP benefits",
    annualCost: 113e9,
    icon: "🛒",
    description: "Food assistance for ~42 million Americans",
    source: "USDA FY2025 Budget",
  },
] as const;
