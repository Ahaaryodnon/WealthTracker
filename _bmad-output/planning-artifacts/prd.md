---
stepsCompleted: [1, 2, 3, 4, 6, 7, 8]
inputDocuments:
  - "product-brief-WealthTracker-2026-01-03.md"
  - "Project Idea.md"
workflowType: 'prd'
lastStep: 8
date: 2026-01-03
author: Aaron
project: WealthTracker
---

# Product Requirements Document - WealthTracker

**Author:** Aaron
**Date:** 2026-01-03

## Executive Summary

**WealthTracker** is a public-facing web application that transforms how people understand extreme wealth by making billionaire passive income visible in real-time.

### Vision

Traditional rich lists show static net worth figures — "$200 billion" — which are too abstract to comprehend. WealthTracker reframes inequality by showing the *flow* of wealth: how much the world's richest people earn every second, minute, and hour without lifting a finger. The goal is to shift public perception toward support for wealth taxation by letting the mathematics of inequality speak for itself.

### Core Value Proposition

The centrepiece is **The Accumulator** — a live counter showing the combined passive income of the top 10 richest people, ticking up in real-time as visitors watch. This creates an immediate, visceral understanding that static numbers cannot achieve.

**Positioning:** "A calculator for inequality, not a celebrity tracker."

### What Makes This Special

| Differentiator | Description |
|----------------|-------------|
| **The Accumulator** | Live, ticking counter creates "inequality happening now" feeling |
| **Passive income focus** | Shows the *flow* of wealth generation, not static snapshots |
| **Multi-source transparency** | Averaged data from Forbes, Bloomberg, public filings — with full visibility |
| **Relatable comparisons** | Translates billions into human terms: "earns your salary every X minutes" |
| **Credible but pointed** | Facts without moralizing; the math does the advocacy |

**Target aha moment:** *"They make more asleep than I'll make in my lifetime."*

---

## Project Classification

| Dimension | Value |
|-----------|-------|
| **Technical Type** | Web App (SPA) |
| **Domain** | General (Advocacy/Media) |
| **Complexity** | Low |
| **Project Context** | Greenfield — new project |

### Technical Implications

- Browser-based, public-facing application
- Real-time counter updates (client-side calculations)
- SEO important for organic discovery
- Mobile-responsive design essential for social sharing
- No regulated industry compliance requirements

---

## Success Criteria

### User Success

**Primary user success indicators:**

| Success Moment | What It Means | How We Measure |
|----------------|---------------|----------------|
| **Gut-punch landing** | User lands on Accumulator and immediately feels the inequality | Time on Accumulator page > baseline threshold |
| **Aha moment** | User internalizes "they make more asleep than I'll make in my lifetime" | Return visits, engagement depth |
| **Share behavior** | User shares WealthTracker with others | Social share button clicks, organic shares |
| **Understanding shift** | User leaves with shifted perception toward wealth taxation | Qualitative feedback, survey responses (future) |

**User success definition:** A user successfully experiences WealthTracker when they land on the Accumulator, watch the counter tick up, feel the visceral impact of inequality, and leave with a memorable takeaway that shifts their understanding.

---

### Business Success

**3-Month Objectives:**
- Establish tracking baseline for all metrics
- Achieve first media citation
- Validate that the Accumulator resonates with users
- Generate initial organic traffic through shares

**12-Month Objectives:**
- Become a go-to reference for inequality data
- Consistent media citations (regular coverage)
- Sustained organic traffic growth
- Recognition as credible source in inequality discussions

**Business success definition:** WealthTracker succeeds when it achieves measurable reach (unique visitors) and credibility (media citations), establishing itself as a trusted reference that amplifies the wealth inequality conversation.

---

### Technical Success

**Performance Requirements:**
- **Real-time counter accuracy**: Accumulator updates smoothly without lag
- **Data freshness**: Billionaire net worth data updated at least weekly
- **Page load performance**: Accumulator visible within 2 seconds on 3G connection
- **Uptime**: 99.5% availability (allows for maintenance windows)

**Data Quality:**
- Multi-source aggregation functioning correctly
- Transparent source citations displayed
- Methodology calculations accurate and verifiable

**Technical success definition:** The Accumulator performs reliably, data remains current, and the site loads quickly on mobile devices where most social shares occur.

---

### Measurable Outcomes

**North Star Metrics:**
- **Unique Visitors** (monthly) — baseline TBD, track growth
- **Media Citations** — first citation within 3 months, then track frequency

**Secondary Metrics:**
- **Social Shares** — share button clicks + social monitoring
- **Time on Accumulator** — average session time on homepage
- **Methodology page visits** — % of visitors who view methodology

**Success Gates:**
- ✅ First media citation within 3 months → proceed to v2
- ✅ Significant viral traffic spike → validate Accumulator resonates
- ✅ Baseline engagement metrics established → inform future targets

---

## Product Scope

### MVP - Minimum Viable Product

**Single page. Maximum impact.**

**Core Features:**
- Live Accumulator (top 10 richest, real-time ticking)
- "Since you arrived" session counter
- Year-to-date cumulative total
- Top 10 list with names, net worth, individual passive income rates
- Relatable comparisons ("earns your annual salary every X minutes")
- Methodology section (transparent calculation explanation)
- Share functionality (social sharing buttons)

**Data Requirements:**
- Top 10 billionaires by net worth (multi-source aggregated)
- Passive income calculations (3%/5%/7% return assumptions)
- Median salary data for comparison baseline
- Source citations and timestamps

**MVP Success Criteria:**
- First media citation within 3 months
- Significant traffic spike from social share
- Users watching Accumulator (time on page baseline established)
- Organic shares without prompting

**Go/No-Go Decision:** 3-month review of baseline metrics to determine v2 investment.

---

### Growth Features (Post-MVP)

**Phase 2 (6-12 months):**
- Full profile pages for 100+ billionaires
- Interactive return assumption sliders
- "What could this fund?" public budget comparisons
- Embeddable widgets for journalists and educators

**Phase 3 (12-24 months):**
- Multi-country comparisons (UK, US, global baselines)
- Automated milestone alerts for press
- Tax scenario modelling tools
- Partnership integrations with advocacy organizations

---

### Vision (Future)

**Long-term vision:**
- The go-to reference for inequality data
- Cited in major publications as authoritative source
- Used in classrooms and policy discussions
- A permanent, trusted calculator that shifts how people understand wealth

**Ultimate success:** WealthTracker becomes the definitive tool that makes wealth inequality visible, credible, and impossible to ignore.

---

## User Journeys

### Journey 1: Sarah — The Scrolling Public

Sarah, a nurse in Manchester, is scrolling Twitter during her lunch break when she sees a friend share: "The 10 richest people just earned more in the last hour than I'll make this year." Intrigued, she taps the link.

She lands on WealthTracker's homepage. The Accumulator is ticking up in real-time: £47,000... £48,000... £49,000. A small counter shows "Since you arrived: £312." She's been on the page for 2 minutes.

Below, she reads: "Jeff Bezos earns your annual salary (£32,000) every 47 seconds." Her jaw drops. She watches the Accumulator for another minute — it climbs another £156 while she watches. That's more than her daily wage.

She scrolls to see the top 10 list. Each name shows net worth and passive income per minute. She taps "Methodology" to understand how this is calculated. The page explains the 3%/5%/7% return assumptions clearly, with sources cited.

She shares it on Twitter: "This is devastating. They make more while sleeping than I'll make in my lifetime." She closes the tab, but the number keeps ticking in her head. That evening, she brings it up with her partner: "You won't believe what I saw today..."

**This journey reveals requirements for:**
- Instant visual impact (Accumulator visible immediately)
- Real-time counter updates (smooth, no lag)
- "Since you arrived" session counter
- Relatable salary comparisons (personalized to user's geography)
- Clear methodology explanation
- One-click social sharing

---

### Journey 2: Marcus — The Journalist

Marcus is writing an article about wealth inequality for a UK publication. He needs credible data to support his argument about passive income vs. wages. Google leads him to WealthTracker.

He lands on the homepage and sees the Accumulator. He notes the methodology link and clicks through. The methodology page explains the calculation method, sources (Forbes, Bloomberg, public filings), and assumptions. He sees timestamps: "Data as of January 3, 2026."

He scrolls back to the Accumulator and notes the year-to-date figure. He needs a specific comparison for his article. He sees "Top 10 have earned £4.2 billion in passive income since January 1st" — perfect for his piece.

He bookmarks the site and cites it in his article: "According to WealthTracker, which aggregates data from Forbes, Bloomberg, and public filings, the world's 10 richest people generate combined passive income of approximately £X per day based on conservative return assumptions."

His editor approves the citation. The article publishes. A reader comments: "Finally, someone showing the actual numbers." Marcus adds WealthTracker to his research toolkit.

**This journey reveals requirements for:**
- Methodology page with transparent calculations
- Source citations and timestamps
- Citable data presentation
- Year-to-date cumulative figures
- Clear, professional presentation for credibility

---

### Journey 3: David — The Policy-Curious Reader

David is interested in wealth tax policy. He's read academic papers but wants to understand how wealth compounds in practice. A policy discussion forum links to WealthTracker.

He lands on the Accumulator page. He's seen inequality data before, but the live counter makes it tangible. He watches it tick for 30 seconds — £780 earned while he watches.

He clicks "Methodology" to understand the assumptions. The page explains 3%/5%/7% return scenarios. He thinks: "If they're using 5% as base, and that's conservative, the real number might be higher."

He scrolls back to see individual billionaire breakdowns. He notes that most wealth is in public equity, which compounds faster than the 5% assumption suggests. This gives him concrete numbers for a policy discussion.

He shares it in the forum thread: "This tool shows the passive income calculations clearly. The methodology is transparent — you can see they're being conservative with 5% returns." The discussion deepens with actual numbers instead of abstract concepts.

**This journey reveals requirements for:**
- Methodology transparency (assumptions visible)
- Individual billionaire breakdowns (top 10 list)
- Clear explanation of return assumptions
- Data that supports deeper policy discussions

---

### Journey Requirements Summary

**Core Capabilities Revealed:**

| Capability | Required For | Priority |
|------------|--------------|----------|
| **Live Accumulator** | All users — core value | MVP Critical |
| **Real-time counter updates** | Sarah, David — engagement | MVP Critical |
| **"Since you arrived" counter** | Sarah — personal impact | MVP Critical |
| **Year-to-date total** | Marcus — citable data | MVP Critical |
| **Top 10 list with breakdowns** | David — deeper understanding | MVP Critical |
| **Relatable salary comparisons** | Sarah — visceral impact | MVP Critical |
| **Methodology page** | Marcus, David — credibility | MVP Critical |
| **Source citations & timestamps** | Marcus — journalistic use | MVP Critical |
| **Social sharing buttons** | Sarah — viral spread | MVP Critical |

**Technical Requirements:**
- Client-side real-time calculations (smooth counter updates)
- Responsive design (mobile-first for social shares)
- Fast page load (< 2 seconds on 3G)
- SEO optimization (discoverability for journalists)

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Challenging the Static Wealth Presentation Assumption**

**Traditional Approach:**
- Rich lists show static net worth figures ("$200 billion")
- Assumption: People can't comprehend large numbers anyway
- Result: Abstract, meaningless numbers that don't drive action

**WealthTracker's Challenge:**
- Reframe from static wealth to passive income flow
- Assumption: People will "feel" inequality when they see it happening in real-time
- Innovation: The Accumulator makes wealth generation visible as it happens

**Why This Matters:**
- No existing tool shows the *flow* of billionaire wealth generation
- Static numbers are abstract; live counters are visceral
- This reframe could shift how inequality is understood at scale

---

**2. Novel Combination: Real-Time Counter + Advocacy + Data Transparency**

**The Three-Part Innovation:**

| Component | Traditional Use | WealthTracker's Use |
|-----------|----------------|---------------------|
| **Real-time counter** | Trivial metrics (views, likes) | Critical social issue (inequality) |
| **Advocacy mission** | Often sacrifices credibility | Maintains credibility through transparency |
| **Data transparency** | Academic/static presentations | Engaging, accessible, citable |

**Why This Combination Is Novel:**
- Advocacy tools typically prioritize impact over credibility
- Data tools typically prioritize accuracy over engagement
- Real-time counters are typically for entertainment, not social change
- **WealthTracker combines all three without compromising any**

**The Innovation:**
- First tool to make inequality data both engaging AND credible AND actionable
- Proves advocacy can be data-driven without being dry
- Shows real-time visualization can serve serious purposes

---

### Market Context & Competitive Landscape

**Existing Solutions:**
- **Forbes/Bloomberg Rich Lists**: Static, aspirational, no income flow
- **Academic Inequality Reports**: Rigorous but inaccessible, dense PDFs
- **Viral Comparison Threads**: Engaging but uncitable, no methodology
- **NGO Advocacy Tools**: Impact-focused but often lack data credibility

**WealthTracker's Position:**
- **Only tool** combining real-time engagement + journalistic credibility + advocacy mission
- **First-mover advantage** in this specific combination
- **Defensible** through multi-source aggregation and transparent methodology

**Competitive Moat:**
- Multi-source data aggregation is technically challenging
- The Accumulator experience is unique and hard to replicate
- First-mover establishes credibility and citation patterns

---

### Validation Approach

**MVP Validation Strategy:**

| Innovation Aspect | How We Validate | Success Signal |
|-------------------|-----------------|----------------|
| **Assumption challenge** | Does Accumulator create gut-punch? | Time on page > baseline, shares |
| **Combination works** | Do journalists cite despite advocacy? | First media citation within 3 months |
| **Transparency builds trust** | Do users trust the data? | Methodology page visits, return visits |

**Risk Mitigation:**

| Risk | Mitigation Strategy |
|------|---------------------|
| Accumulator doesn't land | Iterate on presentation, test different visualizations |
| Journalists dismiss as biased | Strengthen methodology transparency, add more sources |
| Doesn't go viral | Refine share messaging, test different comparison angles |
| Combination doesn't work | Fallback to traditional static presentation with better comparisons |

**Fallback Plan:**
If the innovative combination doesn't resonate, WealthTracker can pivot to a more traditional data presentation while maintaining the multi-source transparency advantage.

---

## Web App Specific Requirements

### Project-Type Overview

WealthTracker is a **Single Page Application (SPA)** designed for maximum reach across all browsers and devices. The application prioritizes SEO for journalist discoverability, real-time counter performance, and accessibility for broad public access.

**Architecture Decision:**
- **SPA** — All content loads once, JavaScript handles Accumulator updates
- **Client-side calculations** — Real-time counter updates via JavaScript timers (no server polling needed)
- **Mobile-first responsive design** — Optimized for social sharing on mobile devices

---

### Browser Support Matrix

**Target Browsers:**

| Browser | Minimum Version | Priority | Notes |
|---------|----------------|----------|-------|
| **Chrome** | Last 2 versions | Critical | Primary mobile browser |
| **Safari** | Last 2 versions (iOS 14+) | Critical | iOS social sharing |
| **Firefox** | Last 2 versions | High | Desktop users |
| **Edge** | Last 2 versions | High | Windows users |
| **Samsung Internet** | Last 2 versions | Medium | Android alternative |
| **Opera** | Last 2 versions | Low | Small user base |

**Mobile Support:**
- iOS Safari 14+ (iPhone, iPad)
- Chrome Android (last 2 versions)
- Samsung Internet (last 2 versions)

**Progressive Enhancement:**
- Core Accumulator functionality works in all modern browsers
- Graceful degradation for older browsers (static display if JavaScript fails)
- Feature detection for real-time updates (fallback to static if unsupported)

---

### Responsive Design Requirements

**Mobile-First Approach:**
- Primary design target: Mobile devices (320px - 768px)
- Tablet optimization: 768px - 1024px
- Desktop enhancement: 1024px+

**Critical Mobile Considerations:**
- Accumulator visible above the fold on mobile
- Touch-friendly share buttons (minimum 44x44px)
- Readable text without zooming
- Fast load on 3G connections (< 2 seconds to Accumulator visible)

**Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Responsive Elements:**
- Accumulator counter scales appropriately
- Top 10 list stacks vertically on mobile
- Methodology section remains readable on small screens
- Share buttons accessible on all screen sizes

---

### Performance Targets

**Page Load Performance:**
- **First Contentful Paint (FCP)**: < 1.5 seconds on 3G
- **Time to Interactive (TTI)**: < 2.5 seconds on 3G
- **Accumulator Visible**: < 2 seconds on 3G connection
- **Largest Contentful Paint (LCP)**: < 2.5 seconds

**Real-Time Counter Performance:**
- Counter updates smoothly at 60fps (16.67ms per frame)
- No jank or stuttering during updates
- Client-side calculations don't block main thread
- Memory efficient (no memory leaks from timers)

**Optimization Strategies:**
- Lazy load non-critical content (methodology section)
- Minimize JavaScript bundle size
- Optimize images (if any)
- Use efficient DOM updates for counter
- Consider service worker for offline capability (future)

**Performance Budget:**
- Initial JavaScript bundle: < 100KB (gzipped)
- Total page weight: < 500KB (gzipped)
- Time to Accumulator visible: < 2 seconds on 3G

---

### SEO Strategy

**SEO Critical for:**
- Journalist discoverability (Google searches for inequality data)
- Organic traffic growth
- Citation credibility (appears in search results)

**Core SEO Requirements:**

**Technical SEO:**
- Server-side rendering (SSR) or static generation for initial HTML
- Semantic HTML structure
- Fast page load (Core Web Vitals)
- Mobile-friendly (mobile-first indexing)
- Proper meta tags (title, description, Open Graph)

**Content SEO:**
- Descriptive page title: "WealthTracker - Billionaire Passive Income Calculator"
- Meta description with key terms: "Real-time calculator showing how much the world's richest people earn passively. Transparent methodology, citable data."
- Structured data (JSON-LD) for rich snippets
- H1/H2 hierarchy for content structure

**Keyword Strategy:**
- Primary: "billionaire passive income", "wealth inequality calculator"
- Secondary: "billionaire earnings", "passive income tracker", "inequality data"
- Long-tail: "how much do billionaires make per day", "billionaire wealth calculator"

**Link Building:**
- Earn citations from journalists (natural backlinks)
- Shareable content drives organic links
- Methodology page builds authority

**SEO Monitoring:**
- Track rankings for target keywords
- Monitor organic traffic growth
- Track citation links from media

---

### Accessibility Level

**Target: WCAG 2.1 Level AA**

**Critical Accessibility Requirements:**

**Visual:**
- Color contrast ratio: 4.5:1 for text, 3:1 for UI components
- Text resizable up to 200% without loss of functionality
- Accumulator counter readable by screen readers
- Alternative text for any images/charts

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Focus indicators visible
- Logical tab order
- Skip links for main content

**Screen Reader Support:**
- Semantic HTML structure
- ARIA labels for Accumulator counter ("Combined passive income: £X, updating in real-time")
- Live region announcements for counter updates (optional, may be distracting)
- Descriptive link text ("View methodology" not "Click here")

**Motor Accessibility:**
- Touch targets minimum 44x44px
- No time-based interactions that can't be paused
- Error prevention and recovery

**Cognitive:**
- Clear, simple language
- Consistent navigation
- Error messages are clear and helpful

**Testing:**
- Automated testing with axe-core or similar
- Manual testing with screen readers (NVDA, VoiceOver)
- Keyboard-only navigation testing
- Color contrast validation

---

### Technical Architecture Considerations

**SPA Framework:**
- Modern JavaScript framework (React, Vue, or vanilla JS)
- Client-side routing (if needed for future expansion)
- State management for Accumulator calculations

**Real-Time Implementation:**
- Client-side JavaScript timer (setInterval or requestAnimationFrame)
- Calculate passive income per second: `(net_worth × return_rate) / (365 × 24 × 3600)`
- Update DOM efficiently (avoid layout thrashing)
- Pause/resume on tab visibility changes

**Data Management:**
- Static JSON file with billionaire data (updated weekly)
- Client-side aggregation and averaging
- Cache data in localStorage for offline capability

**Deployment:**
- Static hosting (Vercel, Netlify, or similar)
- CDN for global performance
- SSL certificate required
- Custom domain for credibility

---

### Implementation Considerations

**Development Priorities:**
1. Accumulator counter performance (smooth 60fps updates)
2. Mobile responsiveness (test on real devices)
3. SEO optimization (SSR or static generation)
4. Accessibility (WCAG 2.1 AA compliance)

**Future Considerations:**
- Service worker for offline capability
- Progressive Web App (PWA) features
- Analytics integration (privacy-conscious)
- A/B testing framework for share messaging

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — deliver the core user experience (Accumulator gut-punch) with essential functionality

**Resource Requirements:**
- **Team Size**: 1-2 developers (solo developer feasible)
- **Skills Needed**: Frontend development (SPA), data aggregation, basic design
- **Timeline**: 4-8 weeks for MVP (depending on team size)

**MVP Philosophy:**
- Single page, maximum impact
- Ship the gut-punch, validate it lands, then expand
- Fastest path to validated learning: 3-month review

---

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- ✅ Sarah (Scrolling Public) — complete journey supported
- ✅ Marcus (Journalist) — complete journey supported
- ✅ David (Policy-Curious) — complete journey supported

**Must-Have Capabilities:**

| Feature | Why Essential | Implementation Complexity |
|---------|---------------|--------------------------|
| **Live Accumulator** | Core value proposition | Medium (real-time updates) |
| **"Since you arrived" counter** | Personal impact | Low (session timer) |
| **Year-to-date total** | Citable data | Low (cumulative calculation) |
| **Top 10 list** | Deeper understanding | Low (static data display) |
| **Relatable comparisons** | Visceral impact | Low (hardcoded median salary) |
| **Methodology section** | Credibility | Low (static content) |
| **Share buttons** | Viral spread | Low (social sharing API) |
| **Source citations** | Journalistic use | Low (data attribution) |

**MVP Scope:**
- Single page application
- Client-side calculations (no backend)
- Static data file (updated weekly manually)
- No user accounts or authentication
- No complex integrations

---

### Post-MVP Features

**Phase 2 (6-12 months) - Growth Features:**
- Full profile pages for 100+ billionaires
- Interactive return assumption sliders (3%/5%/7% toggle)
- "What could this fund?" public budget comparisons
- Embeddable widgets for journalists and educators
- Automated data updates (API integrations)

**Phase 3 (12-24 months) - Expansion Features:**
- Multi-country comparisons (UK, US, global baselines)
- Automated milestone alerts for press
- Tax scenario modelling tools
- Partnership integrations with advocacy organizations
- User accounts (optional, for personalized comparisons)

---

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Mitigation | Fallback |
|------|------------|----------|
| Real-time counter performance | Use requestAnimationFrame, optimize DOM updates | Static display with manual refresh |
| Data aggregation complexity | Start with 2-3 sources, expand gradually | Single source initially |
| Mobile performance | Test on real devices, optimize bundle size | Progressive enhancement |

**Market Risks:**

| Risk | Validation Approach | Pivot Strategy |
|------|---------------------|----------------|
| Accumulator doesn't land | Time on page metric, user testing | Iterate on presentation, test visualizations |
| Journalists dismiss as biased | Methodology transparency, source citations | Strengthen credibility, add more sources |
| Doesn't go viral | Share button clicks, social monitoring | Refine share messaging, test angles |

**Resource Risks:**

| Risk | Contingency Plan |
|------|------------------|
| Smaller team | MVP is achievable solo, can launch with static data |
| Timeline pressure | Can launch with manual data updates, automate later |
| Budget constraints | Use free hosting (Vercel/Netlify), minimal infrastructure |
