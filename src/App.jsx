import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FREE_LIMIT = 999;
const BETA_MODE = true; // ← Change to false after beta test ends

const BG     = "#07090d";
const CARD   = "#0d1117";
const BORDER = "#161c26";
const GREEN  = "#00f5a0";
const RED    = "#ff3d6b";
const GOLD   = "#f5c842";
const BLUE   = "#4da6ff";
const PURPLE = "#b06bff";
const CYAN   = "#00d4ff";
const ORANGE = "#ff8c42";
const PINK   = "#ff6eb4";
const WHITE  = "#f0f4fc";
const MUTED  = "#94a3b8";
const DIM    = "#0e1420";

const CONFIDENCE_MAP = {
  "STRONG BUY":  { color:"#00f5a0", pct:"85–100%", label:"STRONG BUY"  },
  "BUY":         { color:"#7ee8a2", pct:"70–84%",  label:"BUY"         },
  "SPECULATIVE": { color:"#f5c842", pct:"50–69%",  label:"SPECULATIVE" },
  "HOLD":        { color:"#4da6ff", pct:"40–49%",  label:"HOLD"        },
  "SELL":        { color:"#ff3d6b", pct:"20–39%",  label:"SELL"        },
  "STRONG SELL": { color:"#cc0033", pct:"0–19%",   label:"STRONG SELL" },
};

const RISK_CONFIG = {
  CONSERVATIVE:{ color:GREEN,  icon:"[S]", desc:"Lower risk, defined max loss" },
  MODERATE:    { color:GOLD,   icon:"[M]", desc:"Balanced risk/reward"         },
  AGGRESSIVE:  { color:RED,    icon:"[A]", desc:"High risk, experienced only"  },
};

const BIAS_CONFIG = {
  BULLISH: {color:GREEN,  icon:""},
  BEARISH: {color:RED,    icon:""},
  NEUTRAL: {color:BLUE,   icon:""},
  VOLATILE:{color:ORANGE, icon:""},
};

const SMART_MONEY_TRADERS = [
  // Congressional — STOCK Act public disclosures
  {
    id: "pelosi",
    name: "Nancy Pelosi",
    role: "U.S. Representative (D-CA)",
    category: "CONGRESS",
    categoryColor: BLUE,
    track: "House STOCK Act Disclosures",
    knownFor: "Consistently timed tech trades ahead of major moves. Husband Paul Pelosi's options trades in NVDA, AAPL, and MSFT have repeatedly outperformed the market. All publicly disclosed under STOCK Act.",
    historicalReturn: "+~24% avg vs S&P ~10%",
    dataSource: "House Financial Disclosures / DisclosureRecords.com",
    avatar: "NP",
    avatarColor: BLUE,
  },
  {
    id: "tuberville",
    name: "Tommy Tuberville",
    role: "U.S. Senator (R-AL)",
    category: "CONGRESS",
    categoryColor: BLUE,
    track: "Senate STOCK Act Disclosures",
    knownFor: "One of the most active stock traders in the Senate. Frequently buys energy, defense, and financial stocks. Filed 130+ trades in 2022. Often cited for timely defense stock buys before military appropriations.",
    historicalReturn: "+~19% reported trades",
    dataSource: "Senate Financial Disclosures",
    avatar: "TT",
    avatarColor: CYAN,
  },
  {
    id: "austin_scott",
    name: "Austin Scott",
    role: "U.S. Representative (R-GA)",
    category: "CONGRESS",
    categoryColor: BLUE,
    track: "House STOCK Act Disclosures",
    knownFor: "Active trader on the House Armed Services Committee. Notable for technology and defense sector trades correlated with committee work.",
    historicalReturn: "Top 10% congressional traders",
    dataSource: "House Financial Disclosures",
    avatar: "AS",
    avatarColor: PURPLE,
  },
  {
    id: "josh_gottheimer",
    name: "Josh Gottheimer",
    role: "U.S. Representative (D-NJ)",
    category: "CONGRESS",
    categoryColor: BLUE,
    track: "House STOCK Act Disclosures",
    knownFor: "Among the most active congressional stock traders. Heavy tech exposure with consistent gains in semiconductor and AI names.",
    historicalReturn: "Consistently top-performing disclosures",
    dataSource: "House Financial Disclosures",
    avatar: "JG",
    avatarColor: GREEN,
  },
  // Hedge Fund Whales — 13F SEC filings (public, quarterly)
  {
    id: "burry",
    name: "Michael Burry",
    role: "Scion Asset Management",
    category: "HEDGE FUND",
    categoryColor: GOLD,
    track: "SEC 13F Quarterly Filings",
    knownFor: "Famous for the 'Big Short' — predicted the 2008 housing crash. Known for deep contrarian value plays. His 13F filings are watched globally. Has shorted Nvidia, Tesla, and major indexes at key turns.",
    historicalReturn: "+489% on Big Short; consistently contrarian",
    dataSource: "SEC EDGAR 13F Filings",
    avatar: "MB",
    avatarColor: GOLD,
  },
  {
    id: "ackman",
    name: "Bill Ackman",
    role: "Pershing Square Capital",
    category: "HEDGE FUND",
    categoryColor: GOLD,
    track: "SEC 13F + Public Announcements",
    knownFor: "Activist investor known for concentrated bets and public campaigns. Made $2.6B shorting markets in March 2020. Also made massive gains on Chipotle, Lowe's, and Alphabet.",
    historicalReturn: "+70%+ in 2020; long-run outperformer",
    dataSource: "SEC EDGAR / Public filings",
    avatar: "BA",
    avatarColor: ORANGE,
  },

  {
    id: "druckenmiller",
    name: "Stan Druckenmiller",
    role: "Duquesne Family Office",
    category: "HEDGE FUND",
    categoryColor: GOLD,
    track: "SEC 13F Quarterly Filings",
    knownFor: "George Soros' former partner. 30+ years without a losing year. Known for macro bets and tech pivots — was early in AI names. His 13F filings are considered among the most valuable in the market.",
    historicalReturn: "+30% avg annual for 30 years",
    dataSource: "SEC EDGAR 13F Filings",
    avatar: "SD",
    avatarColor: GREEN,
  },
  {
    id: "cohen",
    name: "Steve Cohen",
    role: "Point72 Asset Management",
    category: "HEDGE FUND",
    categoryColor: GOLD,
    track: "SEC 13F Quarterly Filings",
    knownFor: "One of the most successful hedge fund managers ever. $35B+ AUM. Known for short-term trading edge and technology concentration. Point72 13Fs show consistent concentration in AI, semis, and biotech.",
    historicalReturn: "+30% avg annual returns",
    dataSource: "SEC EDGAR 13F Filings",
    avatar: "SC",
    avatarColor: RED,
  },
  {
    id: "tepper",
    name: "David Tepper",
    role: "Appaloosa Management",
    category: "HEDGE FUND",
    categoryColor: GOLD,
    track: "SEC 13F Quarterly Filings",
    knownFor: "Known as one of the greatest traders alive. Made $7B in 2009 buying distressed bank stocks. His quotes move markets. 13F filings heavily tracked for sector rotation signals.",
    historicalReturn: "+25%+ avg annual over career",
    dataSource: "SEC EDGAR 13F Filings",
    avatar: "DT",
    avatarColor: CYAN,
  },
  {
    id: "warren_buffett",
    name: "Warren Buffett",
    role: "CEO, Berkshire Hathaway",
    category: "HEDGE FUND",
    categoryColor: GOLD,
    track: "Berkshire Hathaway 13F SEC Filings",
    knownFor: "World's greatest value investor. Berkshire's 13F filings are among the most watched in history. Known for long-term concentrated positions in consumer, financial, and energy sectors.",
    historicalReturn: "+20% avg annual over 50+ years vs S&P ~10%",
    dataSource: "SEC EDGAR 13F Filings / Berkshire Hathaway Annual Reports",
    avatar: "WB",
    avatarColor: GOLD,
  },
  {
    id: "ray_dalio",
    name: "Ray Dalio",
    role: "Founder, Bridgewater Associates",
    category: "HEDGE FUND",
    categoryColor: BLUE,
    track: "SEC 13F Quarterly Filings",
    knownFor: "Founder of world's largest hedge fund. Known for 'All Weather' portfolio strategy and macro-driven trades. Predicted 2008 crash. Heavy diversification across global assets.",
    historicalReturn: "+12% avg annual, world's most consistent hedge fund",
    dataSource: "SEC EDGAR 13F Filings",
    avatar: "RD",
    avatarColor: BLUE,
  },
  {
    id: "cathie_wood",
    name: "Cathie Wood",
    role: "CEO & CIO, ARK Invest",
    category: "HEDGE FUND",
    categoryColor: PURPLE,
    track: "ARK Daily Trade Disclosures (real-time)",
    knownFor: "Most transparent fund manager — ARK publishes ALL trades daily. Focuses on disruptive innovation: AI, robotics, genomics, fintech, space. Known for high-conviction concentrated bets.",
    historicalReturn: "+152% in 2020; high volatility, high potential",
    dataSource: "ARK Invest Daily Holdings / SEC Filings",
    avatar: "CW",
    avatarColor: PURPLE,
  },
  {
    id: "dan_crenshaw",
    name: "Dan Crenshaw",
    role: "U.S. Representative (R-TX)",
    category: "CONGRESS",
    categoryColor: BLUE,
    track: "House STOCK Act Disclosures",
    knownFor: "Active congressional trader with focus on energy and defense sectors. Sits on key committees with oversight of industries he trades in.",
    historicalReturn: "Consistently outperforms S&P in disclosed trades",
    dataSource: "House Financial Disclosures",
    avatar: "DC",
    avatarColor: BLUE,
  },
  {
    id: "israel_englander",
    name: "Israel Englander",
    role: "Founder & CEO, Millennium Management",
    category: "HEDGE FUND",
    categoryColor: CYAN,
    track: "SEC 13F Quarterly Filings",
    knownFor: "One of the most sophisticated quant-driven hedge funds. $60B+ AUM. Known for multi-strategy approach and exceptional risk-adjusted returns across all market conditions.",
    historicalReturn: "+20%+ avg annual since 1989",
    dataSource: "SEC EDGAR 13F Filings",
    avatar: "IE",
    avatarColor: CYAN,
  },
];

const TRADER_CATEGORIES = ["ALL", "CONGRESS", "HEDGE FUND"];

const UPCOMING_IPOS = [
  { name:"Anthropic",        sector:"AI / Foundation Models", description:"Claude AI creator; ~$60B valuation; most anticipated AI IPO",           estTiming:"2025–2026"},
  { name:"Stripe",           sector:"Fintech / Payments",     description:"Global payments infrastructure; $65B+ valuation; massive revenue base", estTiming:"2025"     },
  { name:"Chime",            sector:"Neobanking",             description:"Largest US neobank; 22M+ customers; fee-free model",                    estTiming:"2025"     },
  { name:"Databricks",       sector:"Data / AI Platform",     description:"Data+AI lakehouse; $62B valuation; hypergrowth enterprise",             estTiming:"2025–2026"},
  { name:"SpaceX (Starlink)",sector:"Space / Satellite",      description:"Starlink spin-off; 3M+ subscribers; dominant LEO position",            estTiming:"TBD"      },
  { name:"Klarna",           sector:"BNPL / Fintech",         description:"BNPL leader; filed S-1 2024; profitability restored",                  estTiming:"2025"     },
  { name:"Cerebras Systems", sector:"AI Chips",               description:"Wafer-scale AI chip; direct NVIDIA challenger; filed S-1 2024",        estTiming:"2025"     },
  { name:"Reddit",           sector:"Social / Community",     description:"IPO'd Mar 2024; early innings; AI data licensing revenue",             estTiming:"PUBLIC"   },
];

const HIDDEN_GEMS = [
  { ticker:"IONQ",  name:"IonQ Inc.",                   sector:"Quantum Computing",  why:"Leading pure-play quantum computing with commercial contracts" },
  { ticker:"RKLB",  name:"Rocket Lab USA",              sector:"Space / Defense",    why:"Low-cost orbital launch with growing constellation business"  },
  { ticker:"TMDX",  name:"TransMedics Group",           sector:"MedTech",            why:"Organ transplant logistics revolution, near-monopoly position" },
  { ticker:"DUOL",  name:"Duolingo Inc.",                sector:"EdTech / AI",        why:"Dominant language app with accelerating AI-driven monetization"},
  { ticker:"AXON",  name:"Axon Enterprise",             sector:"Public Safety Tech", why:"Taser + body cam monopoly expanding into AI evidence mgmt"    },
  { ticker:"CELH",  name:"Celsius Holdings",            sector:"Consumer / Beverage",why:"Energy drink challenger brand with explosive distribution growth"},
  { ticker:"SOUN",  name:"SoundHound AI",               sector:"Voice AI",           why:"Auto + restaurant AI voice tech with surging enterprise wins"  },
  { ticker:"LUNR",  name:"Intuitive Machines",         sector:"Space / Lunar",      why:"NASA lunar lander contracts — first US moon landing since Apollo"},
];

const ALL_STOCKS = [
  { ticker:"NVDA",  name:"NVIDIA Corporation",      sector:"AI / Semiconductors", tag:"AI"       },
  { ticker:"TSLA",  name:"Tesla Inc.",               sector:"EV / Energy",          tag:"MOMENTUM" },
  { ticker:"META",  name:"Meta Platforms",           sector:"Social / AI",          tag:"AI"       },
  { ticker:"AAPL",  name:"Apple Inc.",               sector:"Consumer Tech",        tag:"VALUE"    },
  { ticker:"AMZN",  name:"Amazon.com Inc.",          sector:"E-Commerce / Cloud",   tag:"GROWTH"   },
  { ticker:"GOOGL", name:"Alphabet Inc.",            sector:"Search / AI",          tag:"AI"       },
  { ticker:"MSFT",  name:"Microsoft Corporation",   sector:"Cloud / AI",           tag:"AI"       },
  { ticker:"PLTR",  name:"Palantir Technologies",   sector:"AI / Defense",         tag:"AI"       },
  { ticker:"AMD",   name:"Advanced Micro Devices",  sector:"Semiconductors",       tag:"MOMENTUM" },
  { ticker:"COIN",  name:"Coinbase Global",         sector:"Crypto / Fintech",     tag:"HOT"      },
  { ticker:"HOOD",  name:"Robinhood Markets",       sector:"Fintech",              tag:"GROWTH"   },
  { ticker:"SOFI",  name:"SoFi Technologies",       sector:"Fintech",              tag:"GROWTH"   },
  { ticker:"RBLX",  name:"Roblox Corporation",      sector:"Gaming / Metaverse",   tag:"GROWTH"   },
  { ticker:"SNOW",  name:"Snowflake Inc.",           sector:"Cloud Data",           tag:"GROWTH"   },
  { ticker:"NET",   name:"Cloudflare Inc.",          sector:"Cybersecurity",        tag:"GROWTH"   },
];

const OPTIONS_UNIVERSE = [
  ...ALL_STOCKS.filter(s=>["NVDA","TSLA","META","AAPL","AMZN","GOOGL","MSFT","PLTR","AMD"].includes(s.ticker)),
  { ticker:"SPY", name:"SPDR S&P 500 ETF",      sector:"Index ETF", tag:"MARKET" },
  { ticker:"QQQ", name:"Invesco Nasdaq-100 ETF", sector:"Index ETF", tag:"MARKET" },
];

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────
const STOCK_SYSTEM = `You are a professional stock analyst with real-time market access. Search for the latest data on the requested stock. Return ONLY valid JSON (no markdown):
{
  "ticker": "XXXX",
  "name": "Company Name",
  "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD"|"SELL"|"STRONG SELL",
  "confidence": 0-100,
  "price": "$XXX.XX",
  "priceTarget": "$XXX",
  "analystConsensus": "Buy/Hold/Sell",
  "upside": "+XX%",
  "eps": "Latest EPS vs estimate",
  "revenue": "Latest revenue vs estimate",
  "nextEarnings": "Month DD YYYY",
  "peRatio": "XX.X",
  "catalysts": ["catalyst 1","catalyst 2","catalyst 3"],
  "risks": ["risk 1","risk 2"],
  "recentNews": ["news 1","news 2","news 3"],
  "whyThisRating": "3-4 sentence explanation of the rating",
  "dataSources": ["source1","source2"]
}`;

const GEM_SYSTEM = `You are a small/mid-cap specialist. Search for the latest data on this hidden gem stock. Return ONLY valid JSON (no markdown, no backticks):
{
  "ticker": "XXXX",
  "name": "Company Name",
  "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD"|"SELL"|"STRONG SELL",
  "confidence": 0-100,
  "price": "$XXX.XX",
  "priceTarget": "$XXX",
  "analystConsensus": "Buy/Hold/Sell",
  "upside": "+XX%",
  "eps": "Latest EPS vs estimate",
  "revenue": "Latest revenue vs estimate",
  "nextEarnings": "Month DD YYYY",
  "peRatio": "XX.X",
  "catalysts": ["catalyst 1","catalyst 2","catalyst 3"],
  "risks": ["risk 1","risk 2"],
  "recentNews": ["news 1","news 2","news 3"],
  "whyThisRating": "3-4 sentence explanation of why this is a hidden gem worth investing in",
  "dataSources": ["source1","source2"]
}`;

const IPO_SYSTEM = `You are an IPO analyst. Search for the latest data on this upcoming IPO. Return ONLY valid JSON:
{
  "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD"|"AVOID",
  "confidence": 0-100,
  "valuation": "$XXB",
  "priceRange": "$XX-$XX",
  "whyThisRating": "3-4 sentence explanation",
  "catalysts": ["catalyst 1","catalyst 2"],
  "risks": ["risk 1","risk 2"],
  "comparable": "Comparable public company",
  "dataSources": ["source1"]
}`;

const OPTIONS_SYSTEM = `You are an elite options trader. Search for live data on this stock and generate 3 options setups. Return ONLY valid JSON:
{
  "ticker": "XXXX",
  "stockPrice": "$XXX",
  "marketBias": "BULLISH"|"BEARISH"|"NEUTRAL"|"VOLATILE",
  "ivRank": "XX%",
  "nextEarnings": "Month DD YYYY",
  "trades": [
    {
      "type": "CALL"|"PUT"|"SPREAD"|"CONDOR",
      "riskLevel": "CONSERVATIVE"|"MODERATE"|"AGGRESSIVE",
      "strategy": "Strategy name",
      "strike": "$XXX",
      "expiry": "Month DD YYYY",
      "premium": "$X.XX",
      "maxProfit": "+XX%",
      "maxLoss": "-XX%",
      "breakeven": "$XXX",
      "rationale": "Why this trade makes sense",
      "catalyst": "What could drive the move"
    }
  ],
  "optionsDisclaimer": "Brief risk warning"
}`;

const SMART_MONEY_SYSTEM = `You are a financial intelligence analyst. Search for the most recent disclosed trades for this investor. Return ONLY valid JSON:
{
  "traderName": "Full Name",
  "lastUpdated": "Month DD YYYY",
  "recentTrades": [
    {
      "ticker": "XXXX",
      "action": "BUY"|"SELL",
      "amount": "$XX,000-$XX,000",
      "date": "Month DD YYYY",
      "notes": "Context about this trade"
    }
  ],
  "currentTopHoldings": ["TICKER1","TICKER2","TICKER3"],
  "recentThesis": "What their recent trades suggest about their market outlook",
  "followSignal": "STRONG BUY"|"BUY"|"WATCH"|"NEUTRAL",
  "followConfidence": 0-100,
  "dataSource": "Source name"
}`;

const DYNAMIC_WATCHLIST_SYSTEM = `You are a senior portfolio manager at a top-tier hedge fund with real-time market access. Your job is to curate the highest-conviction, highest-profit-potential stock picks for this week. Search for current market data. Prioritize: stocks with strong earnings momentum, sector leaders with institutional buying, upcoming catalysts (earnings, FDA decisions, product launches, analyst upgrades), and technically strong setups at key breakout levels. Eliminate any stock that is speculative without a clear near-term catalyst. Return ONLY valid JSON (no markdown):
{
  "generatedAt": "Month DD YYYY HH:MM ET",
  "weekOf": "Week of Month DD YYYY",
  "marketContext": "2 sentences on the market environment this week and what is driving opportunities",
  "marketBias": "BULLISH"|"BEARISH"|"MIXED"|"VOLATILE",
  "editorNote": "1 sentence on your highest conviction theme this week",
  "stocks": [
    {
      "ticker": "XXXX",
      "name": "Full Company Name",
      "sector": "Sector",
      "tag": "MOMENTUM"|"VALUE"|"GROWTH"|"EARNINGS"|"BREAKOUT"|"CATALYST"|"INSTITUTIONAL",
      "price": "$XXX.XX",
      "changeToday": "+/-X.X%",
      "weeklyChange": "+/-X.X%",
      "whyThisWeek": "Why this stock has high profit potential THIS WEEK specifically — be precise",
      "catalyst": "Specific upcoming catalyst with date if known",
      "technicalSetup": "Key technical level or pattern",
      "confidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE",
      "target": "$XXX",
      "stopLoss": "$XXX",
      "timeframe": "Days or weeks to target"
    }
  ]
}`;

const TRENDING_SYSTEM = `You are a market intelligence desk analyst at a premier trading firm. Your role is to surface the highest-profit-potential stocks with active momentum RIGHT NOW — not just what is trending socially, but what has real institutional sponsorship, unusual options flow, and a credible near-term catalyst. Only use REAL ticker symbols. Return ONLY valid JSON (no markdown):
{
  "lastUpdated": "Month DD YYYY HH:MM ET",
  "marketMood": "BULLISH"|"BEARISH"|"MIXED"|"VOLATILE",
  "moodReason": "1 sentence on the dominant market force right now",
  "trending": [
    {
      "ticker": "XXXX",
      "name": "Full Company Name",
      "sector": "Sector",
      "reason": "Precise reason this has high profit potential right now",
      "catalyst": "Specific catalyst — earnings date, news event, technical breakout level",
      "unusualFlow": true,
      "momentum": "STRONG"|"MODERATE"|"EARLY",
      "profitPotential": "HIGH"|"MEDIUM"|"SPECULATIVE",
      "entry": "$XXX",
      "target": "$XXX",
      "stopLoss": "$XXX",
      "confidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE"
    }
  ],
  "topPickToday": "TICKER",
  "topPickReason": "2 sentences on why this is the single best opportunity right now"
}`;

const DYNAMIC_SMART_MONEY_SYSTEM = `You are a financial intelligence analyst. Search for the most recent congressional STOCK Act trade disclosures and SEC 13F filings. ONLY use REAL names and REAL tickers. If no real recent data, return empty recentActivity array. Return ONLY valid JSON:
{
  "lastUpdated": "Month DD YYYY HH:MM ET",
  "recentActivity": [
    {
      "trader": "Full Name",
      "role": "Title",
      "category": "CONGRESS"|"HEDGE FUND",
      "trade": "Bought/Sold TICKER",
      "amount": "$XX,000-$XX,000",
      "date": "Month DD YYYY",
      "significance": "Why this matters",
      "followSignal": "STRONG BUY"|"BUY"|"WATCH"|"NEUTRAL",
      "confidence": 0-100
    }
  ],
  "hotStocks": ["TICKER1","TICKER2","TICKER3"],
  "summary": "2 sentence summary of smart money activity right now"
}`;

const DYNAMIC_IPO_SYSTEM = `You are a senior IPO analyst at an investment bank. Search for the most current IPO pipeline. Evaluate each on: valuation vs peers, revenue growth, path to profitability, lock-up expiry risk, and first-day pop potential. Only include companies with real filed S-1s or confirmed IPO dates. ONLY use REAL companies. Return ONLY valid JSON:
{
  "lastUpdated": "Month DD YYYY",
  "marketNote": "1 sentence on current IPO market",
  "ipos": [
    {
      "name": "Company Name",
      "ticker": "Expected ticker or TBD",
      "sector": "Sector",
      "description": "What the company does",
      "estTiming": "Q1 2026 or specific date",
      "valuation": "$XXB",
      "profitPotential": "HIGH"|"MEDIUM"|"SPECULATIVE",
      "buyConfidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"WATCH"|"AVOID",
      "whyNow": "Why noteworthy right now",
      "risks": "Main risk"
    }
  ]
}`;

const DYNAMIC_GEMS_SYSTEM = `You are a veteran small and mid-cap fund manager. Your edge is finding overlooked, undervalued stocks before institutions pile in. Search for stocks that are: trading below intrinsic value with an imminent re-rating catalyst, seeing insider buying or institutional accumulation, breaking out of long consolidation bases, or benefiting from a sector tailwind the market has not yet priced in. Minimum market cap $300M. ONLY use REAL tickers. Return ONLY valid JSON:
{
  "lastUpdated": "Month DD YYYY",
  "weekOf": "Week of Month DD YYYY",
  "marketContext": "1-2 sentences on why this is a good environment for small/mid-cap gems right now",
  "gems": [
    {
      "ticker": "XXXX",
      "name": "Full Company Name",
      "sector": "Sector",
      "marketCap": "$XB",
      "price": "$XXX.XX",
      "why": "Precise thesis — why this is undervalued and poised to move",
      "catalyst": "Specific upcoming catalyst with approximate timing",
      "insiderActivity": "Insider buying/selling activity if known",
      "upside": "+XX%",
      "priceTarget": "$XXX",
      "stopLoss": "$XXX",
      "timeframe": "Weeks or months",
      "confidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE",
      "risk": "Main risk to the thesis"
    }
  ]
}`;

const DYNAMIC_OPTIONS_SYSTEM = `You are the head options strategist at a top derivatives desk. Identify the highest-probability options trades available RIGHT NOW. Prioritize: stocks with earnings within 2 weeks (high IV crush potential), unusual call or put sweeps above $500K notional, stocks at key technical breakout levels, and sector leaders with defined catalysts. For each trade specify the exact contract. ONLY use REAL tickers. Return ONLY valid JSON:
{
  "lastUpdated": "Month DD YYYY HH:MM ET",
  "marketVIX": "XX.X",
  "marketCondition": "LOW VOL"|"NORMAL"|"HIGH VOL"|"EXTREME",
  "vixTrend": "RISING"|"FALLING"|"STABLE",
  "topOpportunities": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "stockPrice": "$XXX.XX",
      "strategy": "Specific strategy name",
      "signal": "Precise reason this is the best options trade right now",
      "strike": "$XXX",
      "expiry": "Month DD YYYY",
      "type": "CALL"|"PUT"|"SPREAD"|"CONDOR",
      "riskLevel": "CONSERVATIVE"|"MODERATE"|"AGGRESSIVE",
      "estimatedPremium": "$X.XX",
      "maxProfit": "+XX%",
      "maxLoss": "-XX%",
      "breakeven": "$XXX",
      "confidence": 0-100,
      "catalyst": "Specific dated catalyst",
      "unusualActivity": true,
      "daysToExpiry": "XX days"
    }
  ],
  "unusualActivityAlerts": [
    {
      "ticker": "XXXX",
      "activity": "Specific description — e.g. 5,000 calls swept at $X.XX",
      "bullish": true,
      "size": "$XXM",
      "expiry": "Month DD YYYY"
    }
  ],
  "earningsPlays": ["TICKER1 — Month DD","TICKER2 — Month DD"]
}`;

const MOMENTUM_MOVERS_SYSTEM = `You are the head of a professional day trading desk. Your job is to identify the highest-conviction intraday trades available RIGHT NOW — stocks with genuine price momentum, real catalysts, clear technical setups, and favorable risk/reward ratios. Exclude low-float penny stocks. Prioritize liquid, exchange-listed stocks with institutional participation. ONLY use REAL ticker symbols. Return ONLY valid JSON:
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "marketSession": "PRE-MARKET"|"REGULAR"|"AFTER-HOURS"|"CLOSED",
  "marketMood": "RISK-ON"|"RISK-OFF"|"MIXED"|"VOLATILE",
  "topMovers": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "sector": "Sector",
      "price": "$XXX.XX",
      "change": "+X.XX",
      "changePct": "+XX.X%",
      "direction": "UP"|"DOWN",
      "volume": "XXM (Xx avg)",
      "catalyst": "Exact reason with specifics — earnings beat, upgrade, news event",
      "session": "REGULAR"|"AFTER-HOURS"|"PRE-MARKET",
      "momentum": "STRONG"|"BUILDING"|"FADING",
      "entryZone": "$XXX-$XXX",
      "target1": "$XXX",
      "target2": "$XXX",
      "stopLoss": "$XXX",
      "riskReward": "1:X",
      "confidence": 0-100,
      "signal": "STRONG BUY"|"BUY"|"WATCH"|"SHORT"
    }
  ],
  "marketHighlight": "Most important development driving the market right now",
  "bestDayTradeSetup": "TICKER — 1 sentence on why this is the top intraday setup"
}`;

const SCALP_SETUPS_SYSTEM = `You are a professional scalp trader with a live feed to market data. Identify the cleanest, highest-probability scalp setups available RIGHT NOW. Focus only on liquid, high-volume stocks (avg volume >2M/day) with clear technical levels. Each setup must have a defined catalyst, precise entry trigger, and tight stop. ONLY use REAL tickers. If market is closed, return empty setups array. Return ONLY valid JSON:
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "session": "PRE-MARKET"|"REGULAR"|"AFTER-HOURS"|"CLOSED",
  "marketCondition": "Trending"|"Range-Bound"|"Volatile"|"Low Volume",
  "setups": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "currentPrice": "$XXX.XX",
      "avgVolume": "XXM/day",
      "setupType": "Breakout"|"Pullback"|"Gap and Go"|"Reversal"|"Squeeze Play"|"VWAP Reclaim",
      "timeframe": "1min"|"5min"|"15min",
      "entryTrigger": "Exact price action trigger — e.g. break above $XXX with volume",
      "entry": "$XXX.XX",
      "target1": "$XXX.XX",
      "target2": "$XXX.XX",
      "stopLoss": "$XXX.XX",
      "potentialGain": "+X.X%",
      "maxLoss": "-X.X%",
      "riskReward": "1:X",
      "catalyst": "Precise catalyst driving this setup",
      "urgency": "NOW"|"WATCH"|"PENDING",
      "confidence": 0-100,
      "notes": "Key invalidation level and what to watch for"
    }
  ],
  "avoidList": ["TICKER1","TICKER2"],
  "avoidReason": "Why to avoid these today"
}`;

const SHORT_SQUEEZE_SYSTEM = `You are a short interest analyst specializing in identifying gamma and short squeezes before they peak. Search for stocks with: short float above 15%, days-to-cover above 3, recent unusual call buying, positive news catalyst, and price beginning to move against shorts. Rank by squeeze probability. ONLY use REAL tickers. Return ONLY valid JSON:
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "squeezeEnvironment": "FAVORABLE"|"NEUTRAL"|"UNFAVORABLE",
  "environmentNote": "1 sentence on current market conditions for squeezes",
  "candidates": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "currentPrice": "$XXX.XX",
      "shortFloat": "XX%",
      "shortInterest": "XX million shares",
      "daysToCover": "X.X days",
      "borrowRate": "XX% annually",
      "squeezeStage": "BUILDING"|"ACTIVE"|"IMMINENT"|"COOLING",
      "catalyst": "Specific catalyst that could force shorts to cover",
      "unusualCallActivity": true,
      "entryZone": "$XXX-$XXX",
      "squeezeTarget": "$XXX",
      "conservativeTarget": "$XXX",
      "stopLoss": "$XXX",
      "squeezeProbability": "HIGH"|"MEDIUM"|"LOW",
      "confidence": 0-100,
      "risk": "Main risk — e.g. dilution, weak fundamentals"
    }
  ],
  "activeSqueezes": ["TICKER1","TICKER2"],
  "watchForSqueeze": ["TICKER3","TICKER4"],
  "summary": "2 sentences on the current short squeeze landscape"
}`;

const AFTERHOURS_SYSTEM = `You are an after-hours specialist. Search for stocks moving in extended hours RIGHT NOW. ONLY use REAL company names and REAL tickers verified against market data. Focus on moves with actionable next-day setups — earnings beats/misses, guidance raises/cuts, M&A, FDA decisions. Include specific trading plans with levels. Return ONLY valid JSON:
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "session": "AFTER-HOURS"|"PRE-MARKET"|"CLOSED",
  "bigMovers": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "regularClose": "$XXX.XX",
      "afterHoursPrice": "$XXX.XX",
      "afterHoursPct": "+/-XX.X%",
      "direction": "UP"|"DOWN",
      "catalyst": "Exact reason",
      "gapType": "EARNINGS_BEAT"|"EARNINGS_MISS"|"NEWS_POSITIVE"|"NEWS_NEGATIVE",
      "nextDayOutlook": "BULLISH"|"BEARISH"|"UNCERTAIN",
      "dayTradePlan": "How to trade tomorrow",
      "keyLevels": "Key price levels",
      "confidence": 0-100
    }
  ],
  "earningsTonight": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "reportTime": "After Close"|"Before Open",
      "epsEstimate": "$X.XX",
      "revenueEstimate": "$XB",
      "impliedMove": "±X%"
    }
  ],
  "tomorrowWatchlist": ["TICKER1","TICKER2","TICKER3"],
  "summary": "2 sentences on key after-hours developments"
}`;

const PREMARKET_SYSTEM = `You are the pre-market desk analyst at a trading firm. Search for pre-market movers, overnight futures, and economic events. Identify the most actionable gap plays and provide a concrete day-trading bias for each mover. ONLY use REAL tickers. Return ONLY valid JSON:
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "marketOutlook": "BULLISH OPEN"|"BEARISH OPEN"|"FLAT OPEN"|"VOLATILE OPEN",
  "futuresSnapshot": { "sp500": "+/-X.X%", "nasdaq": "+/-X.X%", "dow": "+/-X.X%", "vix": "XX.X" },
  "preMarketMovers": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "preMarketPrice": "$XXX.XX",
      "preMarketPct": "+/-XX.X%",
      "catalyst": "What happened",
      "gapDirection": "UP"|"DOWN",
      "gapSize": "SMALL (<2%)"|"MEDIUM (2-5%)"|"LARGE (5-10%)"|"HUGE (10%+)",
      "tradeStrategy": "Gap and Go"|"Gap Fill"|"Wait and See",
      "keyOpenLevel": "$XXX",
      "firstTarget": "$XXX",
      "stopLoss": "$XXX",
      "confidence": 0-100
    }
  ],
  "economicEvents": "Key events today",
  "dayTradingBias": "Overall bias for today"
}`;



// ─── AI ENGINE ───────────────────────────────────────────────────────────────
async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:(import.meta.env.VITE_CLAUDE_MODEL||"claude-sonnet-4-20250514"),max_tokens:1500,system,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:user}]})
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  const text = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

async function callPerplexity(system, user) {
  const res = await fetch("https://api.perplexity.ai/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`},
    body:JSON.stringify({model:(import.meta.env.VITE_PERPLEXITY_MODEL||"llama-3.1-sonar-large-128k-online"),messages:[{role:"system",content:system},{role:"user",content:user}],max_tokens:1500,temperature:0.2,search_recency_filter:"day"})
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

async function callOpenAI(system, user) {
  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`},
    body:JSON.stringify({model:(import.meta.env.VITE_OPENAI_MODEL||"gpt-4o"),max_tokens:1500,messages:[{role:"system",content:system},{role:"user",content:user}],temperature:0.3})
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

async function callAI(system, user, preferred="claude") {
  const engines = {claude:()=>callClaude(system,user),perplexity:()=>callPerplexity(system,user),openai:()=>callOpenAI(system,user)};
  const order = preferred==="perplexity"?["perplexity","claude","openai"]:preferred==="openai"?["openai","claude","perplexity"]:["claude","perplexity","openai"];
  for(const eng of order){
    try{
      const key = eng==="claude"?import.meta.env.VITE_ANTHROPIC_API_KEY:eng==="perplexity"?import.meta.env.VITE_PERPLEXITY_API_KEY:import.meta.env.VITE_OPENAI_API_KEY;
      if(!key||key==="undefined") continue;
      return await engines[eng]();
    }catch(e){ console.warn(`${eng} failed:`,e.message); }
  }
  throw new Error("All AI engines failed.");
}

// ─── MARKET STATUS ────────────────────────────────────────────────────────────
function getMarketStatus(){
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US",{timeZone:"America/New_York"}));
  const day = et.getDay();
  const h = et.getHours();
  const m = et.getMinutes();
  const mins = h*60+m;
  if(day===0||day===6) return {label:"CLOSED – Weekend",color:"#4a5568"};
  if(mins>=570&&mins<960) return {label:"OPEN – Regular Session",color:"#00f5a0"};
  if(mins>=240&&mins<570) return {label:"PRE-MARKET",color:"#f5c842"};
  if(mins>=960&&mins<1200) return {label:"AFTER-HOURS",color:"#ff8c42"};
  return {label:"CLOSED",color:"#4a5568"};
}

// ─── LIVE MINI CHART ──────────────────────────────────────────────────────────
// Uses TradingView Lightweight Charts via CDN for live sparklines
function LiveMiniChart({ticker, color=GREEN}){
  const containerRef = useRef(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    if(!ticker||!containerRef.current) return;
    let chart = null;
    let cleanup = false;

    const loadChart = async () => {
      try {
        // Use Yahoo Finance proxy via allorigins for CORS
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=5m&range=1d`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        
        if(cleanup) return;
        
        const result = data?.chart?.result?.[0];
        if(!result) { setError(true); return; }
        
        const timestamps = result.timestamp || [];
        const closes = result.indicators?.quote?.[0]?.close || [];
        const opens = result.indicators?.quote?.[0]?.open || [];
        
        if(timestamps.length < 2) { setError(true); return; }
        
        // Build candlestick data
        const candleData = timestamps.map((t,i) => ({
          time: t,
          open: opens[i] || closes[i],
          high: Math.max(opens[i]||closes[i], closes[i]),
          low: Math.min(opens[i]||closes[i], closes[i]),
          close: closes[i],
        })).filter(c => c.close != null && !isNaN(c.close));

        if(candleData.length < 2) { setError(true); return; }

        // Dynamically load lightweight-charts
        if(!window.LightweightCharts) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if(cleanup || !containerRef.current) return;

        const isUp = candleData[candleData.length-1].close >= candleData[0].close;
        const lineColor = isUp ? GREEN : RED;

        chart = window.LightweightCharts.createChart(containerRef.current, {
          width: containerRef.current.offsetWidth || 160,
          height: 56,
          layout: { background:{type:"Solid",color:"transparent"}, textColor:"transparent" },
          grid: { vertLines:{visible:false}, horzLines:{visible:false} },
          crosshair: { mode: 0 },
          rightPriceScale: { visible:false },
          leftPriceScale: { visible:false },
          timeScale: { visible:false, borderVisible:false },
          handleScroll: false,
          handleScale: false,
        });

        const lineSeries = chart.addLineSeries({
          color: lineColor,
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        });

        const lineData = candleData.map(c => ({time: c.time, value: c.close}));
        lineSeries.setData(lineData);
        chart.timeScale().fitContent();
        setLoaded(true);

      } catch(e) {
        console.warn("Chart load failed:", e.message);
        if(!cleanup) setError(true);
      }
    };

    loadChart();

    return () => {
      cleanup = true;
      if(chart) { try{ chart.remove(); }catch(e){} }
    };
  }, [ticker]);

  if(error) {
    // Fallback: simple SVG sparkline
    return (
      <svg width="160" height="56" viewBox="0 0 160 56" style={{opacity:0.5}}>
        <polyline points="0,40 20,35 40,38 60,28 80,25 100,20 120,15 140,18 160,12" fill="none" stroke={color} strokeWidth="2"/>
      </svg>
    );
  }

  return (
    <div style={{position:"relative",width:160,height:56}}>
      {!loaded && (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:color,animation:"pulse 1s infinite"}}/>
        </div>
      )}
      <div ref={containerRef} style={{width:"100%",height:"100%",opacity:loaded?1:0,transition:"opacity 0.3s"}}/>
    </div>
  );
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const fm = (color,size=13,extra={})=>({fontFamily:"'DM Sans',sans-serif",fontSize:size,color,...extra});

function Tag({label,color=MUTED}){
  return <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:0.5,color,background:color+"18",border:`1px solid ${color}44`,borderRadius:4,padding:"3px 9px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;
}

function SectionLabel({children,color=MUTED,icon=""}){
  return <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8,color}}>{icon&&icon+" "}{children}</div>;
}

function LoadingAnim({color=GREEN,message="ANALYZING..."}){
  return (
    <div style={{textAlign:"center",padding:"28px 0"}}>
      <div style={fm(color,12,{letterSpacing:1,marginBottom:12,fontWeight:600})}>{message}</div>
      <div style={{display:"flex",justifyContent:"center",gap:3}}>
        {Array.from({length:9},(_,i)=>(
          <div key={i} style={{width:3,height:18,background:color,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`,opacity:0.8}}/>
        ))}
      </div>
    </div>
  );
}

function Legend(){
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",background:CARD,borderRadius:6,padding:"8px 12px",border:`1px solid ${BORDER}`}}>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:WHITE,letterSpacing:0.5,marginRight:8}}>Confidence Scale:</span>
      {Object.values(CONFIDENCE_MAP).map(c=>(
        <span key={c.label} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:c.color}}>{c.pct} — {c.label}</span>
      ))}
    </div>
  );
}

function InfoBox({label,value,color=WHITE}){
  return (
    <div style={{background:DIM,borderRadius:5,padding:"8px 12px",minWidth:90}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:MUTED,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color,lineHeight:1.5,fontWeight:500}}>{value}</div>
    </div>
  );
}

function WhyBox({text}){
  return (
    <div style={{background:`${BLUE}08`,border:`1px solid ${BLUE}33`,borderRadius:6,padding:"12px 14px",borderLeft:`3px solid ${BLUE}`}}>
      <SectionLabel color={BLUE} icon="">Why This Rating</SectionLabel>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#b0c4de",lineHeight:1.8}}>{text}</p>
    </div>
  );
}

function ScoreBar({label,value,color}){
  return (
    <div style={{marginBottom:6}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:MUTED,letterSpacing:0.3,textTransform:"uppercase"}}>{label}</span>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color}}>{value}%</span>
      </div>
      <div style={{height:4,background:BORDER,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:2,transition:"width 0.8s ease"}}/>
      </div>
    </div>
  );
}

// ─── LEGAL COMPONENTS ─────────────────────────────────────────────────────────
function DisclaimerBanner({onViewTerms,onViewPrivacy}){
  const [dismissed,setDismissed]=useState(false);
  if(dismissed) return null;
  return(
    <div style={{background:"#0a0e16",borderBottom:`1px solid ${GOLD}44`,padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:500}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
        <span style={{fontSize:14}}></span>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:GOLD,lineHeight:1.5}}>
          <strong>Financial Disclaimer:</strong> StockMoolah provides AI-generated analysis for informational purposes only. This is NOT financial advice. You may lose money. Always consult a licensed financial advisor before investing.
        </span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        <button onClick={onViewTerms} style={{background:"none",border:"none",color:BLUE,fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Terms</button>
        <button onClick={onViewPrivacy} style={{background:"none",border:"none",color:BLUE,fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Privacy</button>
        <button onClick={()=>setDismissed(true)} style={{background:GOLD+"22",border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:11,padding:"4px 12px",borderRadius:4,cursor:"pointer"}}>I Understand</button>
      </div>
    </div>
  );
}

function TermsModal({onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#0d1117",border:`1px solid ${BORDER}`,borderRadius:12,maxWidth:700,width:"100%",maxHeight:"85vh",overflow:"auto",padding:32}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:WHITE,letterSpacing:2}}>Terms of Service</h2>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:16}}></button>
        </div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#b0bec5",lineHeight:1.9}}>
          <p style={{marginBottom:12,color:MUTED,fontSize:11}}>Last updated: March 2026</p>
          {[
            ["1. No Financial Advice","StockMoolah provides AI-generated analysis for educational and informational purposes only. Nothing on this platform constitutes financial, investment, trading, legal, tax, or accounting advice."],
            ["2. Investment Risk Disclosure","Investing involves substantial risk of loss. You may lose some or all of your invested capital. Past performance does not guarantee future results. AI-generated analysis may be inaccurate or outdated."],
            ["3. AI Limitations","Analysis is generated by AI models that can make errors. Content is provided 'as is' without warranty of any kind."],
            ["4. Not a Registered Advisor","StockMoolah is not a registered investment advisor, broker-dealer, or financial planner. We are not licensed by the SEC, FINRA, or any regulatory body."],
            ["5. Limitation of Liability","To the fullest extent permitted by law, StockMoolah and its affiliates shall not be liable for any financial losses arising from your use of this Service."],
            ["6. Subscription & Payments","Pro subscriptions are billed monthly at $19.00 USD. Subscriptions auto-renew until cancelled. Refunds not provided for partial months. Payments processed by Stripe."],
            ["7. Governing Law","These Terms are governed by the laws of the United States. Disputes resolved through binding arbitration, not class action lawsuits."],
          ].map(([title,text])=>(
            <div key={title}>
              <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>{title}</h3>
              <p style={{marginBottom:16}}>{text}</p>
            </div>
          ))}
          <p style={{marginTop:24,padding:"12px 16px",background:"#0a0e16",borderRadius:6,border:`1px solid ${GOLD}33`,color:GOLD,fontSize:12}}>
             BY USING STOCKMOOLAH, YOU AGREE TO THESE TERMS AND ACKNOWLEDGE YOU ARE SOLELY RESPONSIBLE FOR YOUR INVESTMENT DECISIONS.
          </p>
        </div>
      </div>
    </div>
  );
}

function PrivacyModal({onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#0d1117",border:`1px solid ${BORDER}`,borderRadius:12,maxWidth:700,width:"100%",maxHeight:"85vh",overflow:"auto",padding:32}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:WHITE,letterSpacing:2}}>Privacy Policy</h2>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:16}}></button>
        </div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#b0bec5",lineHeight:1.9}}>
          <p style={{marginBottom:12,color:MUTED,fontSize:11}}>Last updated: March 2026</p>
          {[
            ["1. Information We Collect","We collect minimal information: email (if provided for billing), payment info (processed by Stripe — we never see card details), and anonymous usage data."],
            ["2. How We Use Your Information","We use data solely to process payments, provide our service, and send service notifications. We never sell or share your personal information for marketing."],
            ["3. AI Data Processing","Your stock queries are sent to third-party AI providers (Anthropic, OpenAI, Perplexity). We do not store your analysis content on our servers."],
            ["4. Payment Security","All payments processed by Stripe (PCI-compliant). StockMoolah never stores or accesses your credit card information."],
            ["5. Your Rights","You have the right to access, correct, or delete your personal data at any time by contacting us."],
          ].map(([title,text])=>(
            <div key={title}>
              <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>{title}</h3>
              <p style={{marginBottom:16}}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



// ─── PAYWALL ──────────────────────────────────────────────────────────────────
function Paywall({onClose,onSubscribe}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#0d1117",border:`1px solid ${GOLD}55`,borderRadius:14,maxWidth:480,width:"100%",padding:32,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:GOLD,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>Free Trial Complete</div>
        <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:WHITE,letterSpacing:3,marginBottom:4}}>Unlock Full</h2>
        <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:GREEN,letterSpacing:3,marginBottom:24,textShadow:`0 0 20px ${GREEN}44`}}>Market Intelligence</h2>
        <div style={{background:DIM,borderRadius:8,padding:"16px 20px",marginBottom:24,textAlign:"left"}}>
          {["Unlimited Stock Analyses (live data)","Smart Money Tracker — Congress + Hedge Funds","Options Trading — 3 AI Setups Per Stock","Day Trading Terminal — Movers, Scalps, Squeezes","Data-Backed WHY THIS RATING Explanations","Hidden Gems — Breakout Stocks","IPO Watch with % Buy Confidence","Stock Screener & Portfolio Tracker"].map(f=>(
            <div key={f} style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
              <span style={{color:GREEN,fontSize:14}}></span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:WHITE}}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:WHITE}}>$19</span>
          <span style={fm(MUTED,13)}>/mo</span>
          <div style={fm(MUTED,11,{marginTop:4})}>MONTHLY • Cancel anytime</div>
        </div>
        <button onClick={onSubscribe} style={{width:"100%",background:`linear-gradient(135deg,${GREEN},#00cc66)`,color:"#000",border:"none",borderRadius:8,padding:"16px 0",fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:3,cursor:"pointer",marginBottom:12,fontWeight:900}}>START FOR $19/MO</button>
        <button onClick={onClose} style={{background:"none",border:"none",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>Maybe later</button>
      </div>
    </div>
  );
}

// ─── STOCK RESULT ─────────────────────────────────────────────────────────────
function StockResult({result}){
  if(!result) return null;
  const c = CONFIDENCE_MAP[result.verdict]||CONFIDENCE_MAP["HOLD"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Verdict bar */}
      <div style={{background:DIM,borderRadius:8,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,borderLeft:`3px solid ${c.color}`}}>
        <div>
          <Tag label={result.verdict||"N/A"} color={c.color}/>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:c.color,marginTop:4,letterSpacing:2}}>{result.confidence}% CONFIDENCE</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {result.price&&<InfoBox label="Price" value={result.price}/>}
          {result.priceTarget&&<InfoBox label="Target" value={result.priceTarget} color={GREEN}/>}
          {result.upside&&<InfoBox label="Upside" value={result.upside} color={GREEN}/>}
          {result.analystConsensus&&<InfoBox label="Analyst" value={result.analystConsensus}/>}
        </div>
      </div>
      {/* Score bar */}
      <ScoreBar label="Buy Confidence" value={result.confidence||0} color={c.color}/>
      {/* Key metrics */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {result.eps&&<InfoBox label="EPS" value={result.eps}/>}
        {result.revenue&&<InfoBox label="Revenue" value={result.revenue}/>}
        {result.peRatio&&<InfoBox label="P/E" value={result.peRatio}/>}
        {result.nextEarnings&&<InfoBox label="Next Earnings" value={result.nextEarnings} color={GOLD}/>}
      </div>
      {/* Catalysts */}
      {result.catalysts?.length>0&&(
        <div style={{background:DIM,borderRadius:6,padding:"10px 14px",borderLeft:`2px solid ${GREEN}`}}>
          <SectionLabel color={GREEN} icon="">Catalysts</SectionLabel>
          {result.catalysts.map((c,i)=><div key={i} style={fm("#8ab0cc",13,{marginBottom:4,lineHeight:1.6})}>• {c}</div>)}
        </div>
      )}
      {/* Risks */}
      {result.risks?.length>0&&(
        <div style={{background:DIM,borderRadius:6,padding:"10px 14px",borderLeft:`2px solid ${RED}`}}>
          <SectionLabel color={RED} icon="">Risks</SectionLabel>
          {result.risks.map((r,i)=><div key={i} style={fm("#cc9090",13,{marginBottom:4,lineHeight:1.6})}>• {r}</div>)}
        </div>
      )}
      {/* News */}
      {result.recentNews?.length>0&&(
        <div style={{background:DIM,borderRadius:6,padding:"10px 14px",borderLeft:`2px solid ${MUTED}`}}>
          <SectionLabel color={MUTED} icon="">Recent News</SectionLabel>
          {result.recentNews.map((n,i)=><div key={i} style={fm(MUTED,12,{marginBottom:4,lineHeight:1.6})}>• {n}</div>)}
        </div>
      )}
      {/* Why */}
      {result.whyThisRating&&<WhyBox text={result.whyThisRating}/>}
      {/* Sources */}
      {result.dataSources?.length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {result.dataSources.map((s,i)=><Tag key={i} label={s} color={MUTED}/>)}
        </div>
      )}
    </div>
  );
}

// ─── DYNAMIC WATCHLIST STOCK CARD ─────────────────────────────────────────────
function DynStockCard({stock, subscribed, onPaywall, onUseAnalysis, analysesUsed}){
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const c = CONFIDENCE_MAP[stock.verdict]||CONFIDENCE_MAP["BUY"];
  const isLocked = !BETA_MODE && !subscribed && analysesUsed >= FREE_LIMIT;

  const analyze = async () => {
    if(isLocked){ onPaywall(); return; }
    if(!onUseAnalysis()) return;
    setState("loading");
    try{
      const r = await callAI(STOCK_SYSTEM,
        `Analyze ${stock.ticker} (${stock.name}) in ${stock.sector}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. ${stock.whyToday||""}`,
      );
      setResult(r);
      setState("done");
    }catch(e){ setState("error"); }
  };

  return(
    <div style={{background:CARD,border:`1px solid ${state==="done"?c.color+"55":BORDER}`,borderRadius:10,overflow:"hidden",transition:"border-color 0.3s"}}>
      {/* Card header */}
      <div style={{padding:"14px 16px",background:DIM}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:WHITE,letterSpacing:2}}>{stock.ticker}</span>
              <Tag label={stock.tag||"MOMENTUM"} color={c.color}/>
              {stock.verdict&&<Tag label={stock.verdict} color={c.color}/>}
            </div>
            <div style={fm(MUTED,13,{marginBottom:3})}>{stock.name}</div>
            <Tag label={stock.sector} color={MUTED}/>
          </div>
          <div style={{textAlign:"right"}}>
            {stock.price&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:WHITE,letterSpacing:1}}>{stock.price}</div>}
            {stock.changeToday&&(
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:stock.changeToday?.startsWith("+")?GREEN:RED}}>{stock.changeToday}</div>
            )}
            {stock.weeklyChange&&(
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:MUTED}}>Week: {stock.weeklyChange}</div>
            )}
          </div>
        </div>
        {/* Live chart */}
        <div style={{marginBottom:8,borderRadius:6,overflow:"hidden"}}>
          <LiveMiniChart ticker={stock.ticker} color={c.color}/>
        </div>
        {/* Why this week */}
        {(stock.whyThisWeek||stock.whyToday)&&(
          <div style={{background:CARD,borderRadius:5,padding:"6px 10px",marginBottom:8,borderLeft:`2px solid ${c.color}`}}>
            <div style={fm(c.color,9,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:2})}>This Week</div>
            <p style={fm("#8a9aaa",12,{lineHeight:1.6})}>{stock.whyThisWeek||stock.whyToday}</p>
          </div>
        )}
        {/* Catalyst */}
        {stock.catalyst&&(
          <div style={{background:CARD,borderRadius:5,padding:"5px 10px",marginBottom:8,borderLeft:`2px solid ${GOLD}`}}>
            <div style={fm(GOLD,9,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:2})}>Catalyst</div>
            <p style={fm("#9a8a6a",12,{lineHeight:1.5})}>{stock.catalyst}</p>
          </div>
        )}
        {/* Technical setup */}
        {stock.technicalSetup&&(
          <div style={{background:CARD,borderRadius:5,padding:"5px 10px",marginBottom:8,borderLeft:`2px solid ${BLUE}`}}>
            <div style={fm(BLUE,9,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:2})}>Setup</div>
            <p style={fm("#6a8aaa",12,{lineHeight:1.5})}>{stock.technicalSetup}</p>
          </div>
        )}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {stock.target&&<Tag label={`Target: ${stock.target}`} color={GREEN}/>}
          {stock.stopLoss&&<Tag label={`Stop: ${stock.stopLoss}`} color={RED}/>}
          {stock.confidence&&<Tag label={`${stock.confidence}% CONF`} color={c.color}/>}
          {stock.timeframe&&<Tag label={stock.timeframe} color={MUTED}/>}
        </div>
        <button onClick={analyze} disabled={state==="loading"} style={{width:"100%",background:state==="loading"?`${c.color}11`:`linear-gradient(135deg,${c.color}22,${c.color}11)`,border:`1px solid ${c.color}55`,color:state==="done"?MUTED:c.color,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,padding:"10px 0",borderRadius:6,cursor:state==="loading"?"wait":"pointer",textTransform:"uppercase",transition:"all 0.2s"}}>
          {state==="loading"?"ANALYZING...":(state==="done"?"ANALYSIS COMPLETE":"ANALYZE WITH LIVE DATA")}
        </button>
      </div>
      {/* Analysis result */}
      {state==="done"&&result&&(
        <div style={{padding:"14px 16px"}}>
          <StockResult result={result}/>
        </div>
      )}
      {state==="error"&&(
        <div style={{padding:"10px 16px"}}>
          <div style={fm(RED,12)}>Analysis failed. Please try again.</div>
        </div>
      )}
    </div>
  );
}

// ─── GEM CARD ─────────────────────────────────────────────────────────────────
function GemCard({gem, subscribed, onPaywall}){
  const [state,setState]=useState("idle");
  const [result,setResult]=useState(null);
  const c = CONFIDENCE_MAP[gem.verdict||"SPECULATIVE"]||CONFIDENCE_MAP["SPECULATIVE"];

  const run = async () => {
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    setState("loading");
    try{
      const r = await callAI(GEM_SYSTEM,`Analyze ${gem.ticker} (${gem.name}) in ${gem.sector||"Unknown"}. Thesis: ${gem.why}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);
      setResult(r); setState("done");
    }catch{ setState("error"); }
  };

  return(
    <div style={{background:CARD,border:`1px solid ${state==="done"?c.color+"55":BORDER}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:DIM}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{gem.ticker}</span>
              {gem.verdict&&<Tag label={gem.verdict} color={c.color}/>}
            </div>
            <div style={fm(MUTED,13,{marginBottom:4})}>{gem.name}</div>
            <Tag label={gem.sector||"Unknown"} color={MUTED}/>
          </div>
          <div style={{textAlign:"right"}}>
            {gem.upside&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:GREEN}}>{gem.upside}</div>}
            {gem.marketCap&&<div style={fm(MUTED,11)}>{gem.marketCap}</div>}
          </div>
        </div>
        <LiveMiniChart ticker={gem.ticker} color={c.color}/>
        {gem.why&&(
          <div style={{background:CARD,borderRadius:5,padding:"7px 10px",marginBottom:8,marginTop:8,borderLeft:`2px solid ${PURPLE}`}}>
            <div style={fm(PURPLE,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Why This Gem</div>
            <p style={fm("#9a8ab5",12,{lineHeight:1.7})}>{gem.why}</p>
          </div>
        )}
        {gem.catalyst&&(
          <div style={{background:CARD,borderRadius:5,padding:"7px 10px",marginBottom:10,borderLeft:`2px solid ${GOLD}`}}>
            <div style={fm(GOLD,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Catalyst</div>
            <p style={fm("#9a8a6a",12,{lineHeight:1.7})}>{gem.catalyst}</p>
          </div>
        )}
        <button onClick={run} disabled={state==="loading"} style={{width:"100%",background:state==="loading"?`${PURPLE}11`:`linear-gradient(135deg,${PURPLE}22,${PURPLE}11)`,border:`1px solid ${PURPLE}55`,color:state==="done"?MUTED:PURPLE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,padding:"10px 0",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
          {state==="loading"?"⏳ ANALYZING...":(state==="done"?" COMPLETE":" DEEP DIVE ANALYSIS")}
        </button>
      </div>
      {state==="done"&&result&&<div style={{padding:"14px 16px"}}><StockResult result={result}/></div>}
    </div>
  );
}

// ─── IPO CARD ─────────────────────────────────────────────────────────────────
function IPOCard({ipo, subscribed, onPaywall}){
  const [state,setState]=useState("idle");
  const [result,setResult]=useState(null);
  const c = CONFIDENCE_MAP[result?.verdict||"SPECULATIVE"]||CONFIDENCE_MAP["SPECULATIVE"];

  const run = async () => {
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    setState("loading");
    try{
      const r = await callAI(IPO_SYSTEM,`Analyze IPO: ${ipo.name} (${ipo.sector}). Info: ${ipo.description}. Timing: ${ipo.estTiming}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);
      setResult(r); setState("done");
    }catch{ setState("error"); }
  };

  return(
    <div style={{background:CARD,border:`1px solid ${state==="done"?c.color+"55":BORDER}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:DIM}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:CYAN,letterSpacing:2,marginBottom:4}}>{ipo.name}</div>
            <Tag label={ipo.sector} color={MUTED}/>
          </div>
          <div style={{textAlign:"right"}}>
            <Tag label={ipo.estTiming} color={CYAN}/>
          </div>
        </div>
        <p style={fm(MUTED,13,{lineHeight:1.7,marginBottom:10})}>{ipo.description}</p>
        <button onClick={run} disabled={state==="loading"} style={{width:"100%",background:state==="loading"?`${CYAN}11`:`linear-gradient(135deg,${CYAN}22,${CYAN}11)`,border:`1px solid ${CYAN}55`,color:state==="done"?MUTED:CYAN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,padding:"10px 0",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
          {state==="loading"?"⏳ ANALYZING...":(state==="done"?" COMPLETE":" ANALYZE IPO")}
        </button>
      </div>
      {state==="done"&&result&&(
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {result.verdict&&<Tag label={result.verdict} color={c.color}/>}
            {result.confidence&&<Tag label={`${result.confidence}% CONFIDENCE`} color={c.color}/>}
            {result.valuation&&<InfoBox label="Valuation" value={result.valuation}/>}
          </div>
          {result.whyThisRating&&<WhyBox text={result.whyThisRating}/>}
        </div>
      )}
    </div>
  );
}

// ─── OPTION TRADE CARD ────────────────────────────────────────────────────────
function OptionTradeCard({trade, index}){
  const rc = RISK_CONFIG[trade.riskLevel]||RISK_CONFIG.MODERATE;
  return(
    <div style={{background:DIM,border:`1px solid ${rc.color}44`,borderRadius:8,padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:MUTED,letterSpacing:1}}>#{index}</span>
          <Tag label={`${rc.icon} ${trade.riskLevel}`} color={rc.color}/>
          <Tag label={trade.type} color={trade.type==="CALL"?GREEN:trade.type==="PUT"?RED:GOLD}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Tag label={`+${trade.maxProfit}`} color={GREEN}/>
          <Tag label={trade.maxLoss} color={RED}/>
        </div>
      </div>
      <div style={fm(WHITE,13,{fontWeight:600,marginBottom:6})}>{trade.strategy}</div>
      <p style={fm(MUTED,12,{lineHeight:1.7,marginBottom:10})}>{trade.rationale}</p>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
        {trade.strike&&<Tag label={`Strike: ${trade.strike}`} color={MUTED}/>}
        {trade.expiry&&<Tag label={`Exp: ${trade.expiry}`} color={MUTED}/>}
        {trade.premium&&<Tag label={`Premium: ${trade.premium}`} color={GOLD}/>}
        {trade.breakeven&&<Tag label={`BE: ${trade.breakeven}`} color={MUTED}/>}
      </div>
      {trade.catalyst&&<div style={fm(MUTED,11,{lineHeight:1.5})}><strong style={{color:"#7a8aaa"}}>Catalyst:</strong> {trade.catalyst}</div>}
    </div>
  );
}



// ─── SMART MONEY TRADER CARD ──────────────────────────────────────────────────
function SmartMoneyTraderCard({trader, subscribed, onPaywall}){
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);

  const catColors = {CONGRESS:BLUE,"HEDGE FUND":GOLD,"FUND MANAGER":PURPLE};
  const catColor = catColors[trader.category]||MUTED;

  const load = async () => {
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    if(state!=="idle") return;
    setState("loading");
    try{
      const r = await callAI(SMART_MONEY_SYSTEM,`Search for the most recent publicly disclosed trades for ${trader.name} (${trader.role}). Data source: ${trader.dataSource}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,"perplexity");
      setResult(r); setState("done");
    }catch{ setState("error"); }
  };

  const toggle = () => {
    if(!expanded) load();
    setExpanded(p=>!p);
  };

  return(
    <div style={{background:DIM,border:`1px solid ${expanded?catColor+"55":BORDER}`,borderRadius:10,overflow:"hidden",transition:"border-color 0.2s"}}>
      {/* Header */}
      <div style={{padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,cursor:"pointer",background:expanded?catColor+"08":"transparent"}} onClick={toggle}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:catColor+"22",border:`2px solid ${catColor}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:catColor,letterSpacing:1}}>{trader.avatar}</span>
          </div>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:WHITE,marginBottom:3}}>{trader.name}</div>
            <div style={fm(MUTED,12,{marginBottom:6})}>{trader.role}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Tag label={trader.category} color={catColor}/>
              {trader.historicalReturn&&<Tag label={trader.historicalReturn} color={GREEN}/>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!BETA_MODE&&!subscribed?(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:18}}></div>
              <div style={fm(GOLD,9,{letterSpacing:1,textTransform:"uppercase"})}>PRO ONLY</div>
            </div>
          ):(
            <button style={{background:`${catColor}18`,border:`1px solid ${catColor}44`,color:catColor,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
              {expanded?" HIDE":" TRACK TRADES"}
            </button>
          )}
        </div>
      </div>
      {/* Known for */}
      <div style={{padding:"0 16px 14px"}}>
        <div style={fm(MUTED,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:4,fontWeight:700})}>Known For</div>
        <p style={fm("#8a9aaa",13,{lineHeight:1.7})}>{trader.knownFor}</p>
        <div style={fm(MUTED,11,{marginTop:6})}> Source: {trader.dataSource}</div>
      </div>
      {/* Expanded content */}
      {expanded&&(
        <div style={{padding:"0 16px 16px",borderTop:`1px solid ${BORDER}`}}>
          {state==="loading"&&<LoadingAnim color={catColor} message="FETCHING LATEST DISCLOSURES..."/>}
          {state==="error"&&<div style={fm(RED,12,{padding:"10px 0"})}>Failed to load trades. Please try again.</div>}
          {state==="done"&&result&&(
            <div style={{paddingTop:14}}>
              <div style={{background:CARD,borderRadius:6,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <p style={fm(MUTED,13,{flex:1,lineHeight:1.6})}>{result.recentThesis}</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {result.followSignal&&<Tag label={result.followSignal} color={result.followSignal?.includes("BUY")?GREEN:GOLD}/>}
                  {result.followConfidence&&<Tag label={`${result.followConfidence}% CONF`} color={GREEN}/>}
                </div>
              </div>
              {result.currentTopHoldings?.length>0&&(
                <div style={{marginBottom:12}}>
                  <SectionLabel color={MUTED}>Top Holdings</SectionLabel>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {result.currentTopHoldings.map((h,i)=>(
                      <div key={i} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:GREEN,letterSpacing:1}}>{h}</div>
                    ))}
                  </div>
                </div>
              )}
              {result.recentTrades?.length>0&&(
                <div>
                  <SectionLabel color={catColor}>Recent Disclosed Trades</SectionLabel>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {result.recentTrades.map((t,i)=>{
                      const ac = {BUY:{color:GREEN,icon:"↑"},SELL:{color:RED,icon:"↓"}}[t.action]||{color:MUTED,icon:"→"};
                      return(
                        <div key={i} style={{background:CARD,borderRadius:6,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,borderLeft:`2px solid ${ac.color}`}}>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:WHITE,letterSpacing:1}}>{t.ticker}</span>
                            <Tag label={`${ac.icon} ${t.action}`} color={ac.color}/>
                            <span style={fm(MUTED,12)}>{t.date}</span>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            {t.amount&&<Tag label={t.amount} color={GOLD}/>}
                          </div>
                          {t.notes&&<div style={{width:"100%",fontSize:12,color:"#6a7a8a",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>{t.notes}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {result.lastUpdated&&<div style={fm(MUTED,11,{marginTop:10})}>Last updated: {result.lastUpdated} • Source: {result.dataSource}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── OPTIONS TAB ──────────────────────────────────────────────────────────────
function OptionsTab({subscribed, onPaywall, dynamicOptions, dynamicOptionsLoading, onFetchDynamic}){
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [customTicker, setCustomTicker] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customResult, setCustomResult] = useState(null);

  const selectedStock = OPTIONS_UNIVERSE.find(s=>s.ticker===selectedTicker)||OPTIONS_UNIVERSE[0];

  const analyze = async () => {
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    setState("loading"); setResult(null);
    try{
      const r = await callAI(OPTIONS_SYSTEM,
        `Generate 3 options setups for ${selectedTicker} (${selectedStock.name}). Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Search for next earnings date, current IV vs HV, recent price action, key levels.`
      );
      setResult(r); setState("done");
    }catch{ setState("error"); }
  };

  const analyzeCustom = async () => {
    if(!customTicker.trim()) return;
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    setCustomLoading(true); setCustomResult(null);
    try{
      const r = await callAI(OPTIONS_SYSTEM,
        `Generate 3 options setups for ${customTicker.toUpperCase().trim()}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Search for stock price, next earnings, IV, HV, key levels.`
      );
      setCustomResult({ticker:customTicker.toUpperCase(),result:r});
    }catch{ alert("Could not analyze options for "+customTicker); }
    setCustomLoading(false);
  };

  const bias = result?(BIAS_CONFIG[result.marketBias]||BIAS_CONFIG.NEUTRAL):null;

  return(
    <div>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:ORANGE,letterSpacing:3,textShadow:`0 0 20px ${ORANGE}44`,marginBottom:6}}>Options Trading</div>
        <p style={fm(MUTED,13,{lineHeight:1.7,maxWidth:640})}>Options trade suggestions based on live earnings dates, IV, technicals, and market catalysts. 3 setups per stock — conservative to aggressive.</p>
      </div>

      {/* Hot Options Opportunities */}
      <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:10,padding:18,marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:ORANGE,letterSpacing:2,marginBottom:3}}> Hot Options Right Now</div>
            <div style={fm(MUTED,12)}>AI-detected unusual options activity, high-profit setups, and upcoming earnings plays</div>
          </div>
          <button onClick={onFetchDynamic} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"8px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
            {dynamicOptionsLoading?"SCANNING...":" SCAN MARKET"}
          </button>
        </div>
        {dynamicOptionsLoading&&<LoadingAnim color={ORANGE} message="SCANNING FOR UNUSUAL OPTIONS ACTIVITY..."/>}
        {!dynamicOptions&&!dynamicOptionsLoading&&(
          <div style={{textAlign:"center",padding:"12px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Scan Market" to find today's highest-profit options opportunities</div>
        )}
        {dynamicOptions&&!dynamicOptionsLoading&&(
          <div>
            <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <InfoBox label="VIX" value={dynamicOptions.marketVIX||"N/A"}/>
                <Tag label={dynamicOptions.marketCondition||"NORMAL"} color={GOLD}/>
              </div>
              <div style={fm(MUTED,11)}>Updated: {dynamicOptions.lastUpdated}</div>
            </div>
            {dynamicOptions.unusualActivityAlerts?.length>0&&(
              <div style={{marginBottom:16}}>
                <SectionLabel color={RED} icon="">Unusual Activity Alerts</SectionLabel>
                {dynamicOptions.unusualActivityAlerts.map((alert,i)=>(
                  <div key={i} style={{background:DIM,borderRadius:5,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,borderLeft:`2px solid ${alert.bullish?GREEN:RED}`,marginBottom:6}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:WHITE,letterSpacing:1}}>{alert.ticker}</span>
                      <Tag label={alert.bullish?"BULLISH FLOW":"BEARISH FLOW"} color={alert.bullish?GREEN:RED}/>
                      <span style={fm(MUTED,12)}>{alert.activity}</span>
                    </div>
                    <Tag label={alert.size} color={GOLD}/>
                  </div>
                ))}
              </div>
            )}
            {dynamicOptions.topOpportunities?.length>0&&(
              <div>
                <SectionLabel color={ORANGE}>Top Opportunities</SectionLabel>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                  {dynamicOptions.topOpportunities.map((opp,i)=>{
                    const rc = RISK_CONFIG[opp.riskLevel]||RISK_CONFIG.MODERATE;
                    return(
                      <div key={i} style={{background:"#0a0e16",border:`1px solid ${rc.color}44`,borderRadius:7,padding:"14px 16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{opp.ticker}</span>
                              {opp.unusualActivity&&<Tag label=" UOA" color={RED}/>}
                            </div>
                            <div style={fm(MUTED,12,{marginBottom:4})}>{opp.name}</div>
                            <Tag label={`${opp.type} • ${opp.strategy}`} color={opp.type==="CALL"?GREEN:opp.type==="PUT"?RED:GOLD}/>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:GREEN}}>{opp.maxProfit}</div>
                            <div style={fm(MUTED,10)}>MAX PROFIT</div>
                          </div>
                        </div>
                        <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${rc.color}`}}>
                          <div style={fm(rc.color,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>{rc.icon} {opp.riskLevel}</div>
                          <p style={fm("#8a9aaa",12,{lineHeight:1.6})}>{opp.signal}</p>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                          <Tag label={`Strike: ${opp.strike}`} color={MUTED}/>
                          <Tag label={`Exp: ${opp.expiry}`} color={MUTED}/>
                          <Tag label={`${opp.confidence}% CONF`} color={rc.color}/>
                        </div>
                        <div style={fm(MUTED,11,{lineHeight:1.5})}><strong style={{color:"#7a8aaa"}}>Catalyst:</strong> {opp.catalyst}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom options search */}
      <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:10,padding:18,marginBottom:22}}>
        <SectionLabel color={ORANGE} icon="">Analyze Any Stock Options</SectionLabel>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
          <input placeholder="Enter any ticker (e.g. HOOD, SOFI, RBLX...)" value={customTicker} onChange={e=>setCustomTicker(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&analyzeCustom()} style={{background:DIM,border:`1px solid ${ORANGE}55`,color:WHITE,fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:3,padding:"10px 14px",borderRadius:5,width:280,outline:"none"}}/>
          <button onClick={analyzeCustom} disabled={customLoading||!customTicker.trim()} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"11px 20px",borderRadius:5,cursor:"pointer",textTransform:"uppercase",opacity:customTicker.trim()?1:0.5}}>
            {customLoading?"ANALYZING...":" GET OPTIONS"}
          </button>
          {customResult&&<button onClick={()=>setCustomResult(null)} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:11,padding:"10px 14px",borderRadius:5,cursor:"pointer"}}> Clear</button>}
        </div>
        <div style={fm(MUTED,11)}>Get 3 AI-generated options setups for any US-listed stock</div>
        {customResult&&(
          <div style={{marginTop:14}}>
            <SectionLabel color={ORANGE}>Options Analysis — {customResult.ticker}</SectionLabel>
            {customResult.result?.trades?.map((t,i)=><OptionTradeCard key={i} trade={t} index={i+1}/>)}
          </div>
        )}
      </div>

      {/* Stock selector */}
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18,marginBottom:18}}>
        <SectionLabel color={MUTED}>Select Stock for Detailed Options Analysis</SectionLabel>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {OPTIONS_UNIVERSE.map(s=>(
            <button key={s.ticker} onClick={()=>setSelectedTicker(s.ticker)} style={{background:selectedTicker===s.ticker?`${ORANGE}22`:DIM,border:`1px solid ${selectedTicker===s.ticker?ORANGE+"55":BORDER}`,color:selectedTicker===s.ticker?ORANGE:MUTED,fontFamily:"'Bebas Neue',cursive",fontSize:14,letterSpacing:1,padding:"6px 14px",borderRadius:5,cursor:"pointer",transition:"all 0.15s"}}>
              {s.ticker}
            </button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2,marginBottom:3}}>{selectedStock.name}</div>
            <Tag label={selectedStock.sector} color={MUTED}/>
          </div>
          <button onClick={analyze} disabled={state==="loading"} style={{background:`linear-gradient(135deg,${ORANGE}22,${ORANGE}11)`,border:`1px solid ${ORANGE}55`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,padding:"11px 22px",borderRadius:6,cursor:"pointer",textTransform:"uppercase",letterSpacing:0.5}}>
            {state==="loading"?"⏳ ANALYZING...":" GENERATE OPTIONS SETUPS"}
          </button>
        </div>
        {state==="loading"&&<LoadingAnim color={ORANGE} message="ANALYZING OPTIONS CHAIN..."/>}
        {state==="done"&&result&&(
          <div>
            {bias&&(
              <div style={{background:DIM,borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:12}}>
                <span style={{fontSize:18}}>{bias.icon}</span>
                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:bias.color,letterSpacing:2}}>{result.marketBias} BIAS</span>
                {result.ivRank&&<Tag label={`IV Rank: ${result.ivRank}`} color={MUTED}/>}
                {result.nextEarnings&&<Tag label={`Earnings: ${result.nextEarnings}`} color={GOLD}/>}
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {result.trades?.map((t,i)=><OptionTradeCard key={i} trade={t} index={i+1}/>)}
            </div>
            {result.optionsDisclaimer&&(
              <div style={{marginTop:12,background:`${RED}08`,border:`1px solid ${RED}22`,borderRadius:5,padding:"10px 14px"}}>
                <p style={fm(MUTED,11,{lineHeight:1.7})}>{result.optionsDisclaimer}</p>
              </div>
            )}
          </div>
        )}
        {state==="error"&&<div style={fm(RED,12,{padding:"10px 0"})}>Analysis failed. Please try again.</div>}
      </div>
    </div>
  );
}

// ─── SCREENER ─────────────────────────────────────────────────────────────────
function Screener({subscribed, onPaywall}){
  const [filters,setFilters]=useState({minConf:70,verdict:"All"});
  const [running,setRunning]=useState(false);
  const [results,setResults]=useState([]);
  const POOL=["NVDA","MSFT","AAPL","TSLA","META","AMZN","GOOGL","AMD","PLTR","COIN","HOOD","SOFI","RBLX","SNOW","NET","DDOG","CRWD","PANW","UBER","LYFT"];

  const run = async () => {
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    setRunning(true); setResults([]);
    const out=[];
    for(const t of POOL.slice(0,8)){
      try{
        const r=await callAI(STOCK_SYSTEM,`Quick analysis of ${t}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);
        if(r.confidence>=filters.minConf&&(filters.verdict==="All"||r.verdict===filters.verdict)){
          out.push({ticker:t,result:r});
          setResults([...out]);
        }
      }catch{}
    }
    setRunning(false);
  };

  return(
    <div>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:BLUE,letterSpacing:3,textShadow:`0 0 20px ${BLUE}44`,marginBottom:6}}>Stock Screener</div>
      <p style={fm(MUTED,13,{lineHeight:1.7,maxWidth:600,marginBottom:20})}>Scans multiple stocks simultaneously and filters by your criteria.</p>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18,marginBottom:20}}>
        <SectionLabel color={MUTED}>Filter Settings</SectionLabel>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={fm(MUTED,11,{marginBottom:4})}>Min Confidence: {filters.minConf}%</div>
            <input type="range" min="0" max="100" value={filters.minConf} onChange={e=>setFilters(p=>({...p,minConf:+e.target.value}))} style={{width:160,accentColor:BLUE}}/>
          </div>
          <div>
            <div style={fm(MUTED,11,{marginBottom:4})}>Verdict Filter</div>
            <select value={filters.verdict} onChange={e=>setFilters(p=>({...p,verdict:e.target.value}))} style={{background:DIM,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'DM Sans',sans-serif",fontSize:12,padding:"6px 10px",borderRadius:4}}>
              {["All","STRONG BUY","BUY","SPECULATIVE","HOLD","SELL"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button onClick={run} disabled={running} style={{background:`linear-gradient(135deg,${BLUE}22,${BLUE}11)`,border:`1px solid ${BLUE}55`,color:BLUE,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,padding:"10px 22px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
            {running?"⏳ SCANNING...":" RUN SCREENER"}
          </button>
        </div>
        {running&&<LoadingAnim color={BLUE} message="SCANNING STOCKS..."/>}
      </div>
      {results.length>0&&(
        <div>
          <SectionLabel color={BLUE}>Results — {results.length} matches found</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
            {results.map(({ticker,result:r})=>{
              const c=CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"];
              return(
                <div key={ticker} style={{background:CARD,border:`1px solid ${c.color}33`,borderRadius:10,padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2,marginRight:8}}>{ticker}</span>
                      <Tag label={r.verdict} color={c.color}/>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:c.color}}>{r.confidence}%</div>
                  </div>
                  <ScoreBar label="Confidence" value={r.confidence} color={c.color}/>
                  {r.whyThisRating&&<p style={fm(MUTED,12,{lineHeight:1.6,marginTop:8})}>{r.whyThisRating?.slice(0,150)}...</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PORTFOLIO TRACKER ────────────────────────────────────────────────────────
function Portfolio({subscribed, onPaywall}){
  const [holdings,setHoldings]=useState([{ticker:"AAPL",shares:10,avgCost:150},{ticker:"NVDA",shares:5,avgCost:400}]);
  const [newTicker,setNewTicker]=useState("");
  const [newShares,setNewShares]=useState("");
  const [newCost,setNewCost]=useState("");
  const [analyses,setAnalyses]=useState({});
  const [loading,setLoading]=useState(null);

  const addHolding = () => {
    if(!newTicker.trim()) return;
    setHoldings(p=>[...p,{ticker:newTicker.toUpperCase(),shares:+newShares||1,avgCost:+newCost||0}]);
    setNewTicker(""); setNewShares(""); setNewCost("");
  };

  const analyzeAll = async () => {
    if(!BETA_MODE&&!subscribed){ onPaywall(); return; }
    for(const h of holdings){
      if(analyses[h.ticker]) continue;
      setLoading(h.ticker);
      try{
        const r=await callAI(STOCK_SYSTEM,`Analyze ${h.ticker}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);
        setAnalyses(a=>({...a,[h.ticker]:r}));
      }catch{}
      setLoading(null);
    }
  };

  return(
    <div>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:GREEN,letterSpacing:3,textShadow:`0 0 20px ${GREEN}44`,marginBottom:6}}>Portfolio Tracker</div>
      <p style={fm(MUTED,13,{lineHeight:1.7,maxWidth:600,marginBottom:20})}>Track your holdings and get analysis on each position.</p>
      {/* Add holding */}
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18,marginBottom:20}}>
        <SectionLabel color={GREEN}>Add Holding</SectionLabel>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input placeholder="Ticker" value={newTicker} onChange={e=>setNewTicker(e.target.value.toUpperCase())} style={{background:DIM,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:2,padding:"8px 12px",borderRadius:5,width:100,outline:"none"}}/>
          <input placeholder="Shares" value={newShares} onChange={e=>setNewShares(e.target.value)} type="number" style={{background:DIM,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"8px 12px",borderRadius:5,width:100,outline:"none"}}/>
          <input placeholder="Avg Cost $" value={newCost} onChange={e=>setNewCost(e.target.value)} type="number" style={{background:DIM,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"8px 12px",borderRadius:5,width:110,outline:"none"}}/>
          <button onClick={addHolding} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}44`,color:GREEN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"9px 16px",borderRadius:5,cursor:"pointer"}}>+ Add</button>
          <button onClick={analyzeAll} style={{background:`linear-gradient(135deg,${GREEN}22,${GREEN}11)`,border:`1px solid ${GREEN}55`,color:GREEN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,padding:"9px 18px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}> Analyze All</button>
        </div>
      </div>
      {/* Holdings list */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
        {holdings.map(h=>{
          const r=analyses[h.ticker];
          const c=r?(CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"]):null;
          const isLoading=loading===h.ticker;
          return(
            <div key={h.ticker} style={{background:CARD,border:`1px solid ${c?c.color+"44":BORDER}`,borderRadius:10,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{h.ticker}</span>
                  <div style={fm(MUTED,12,{marginTop:3})}>{h.shares} shares @ ${h.avgCost}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {r&&<Tag label={r.verdict} color={c.color}/>}
                  <button onClick={()=>setHoldings(p=>p.filter(x=>x.ticker!==h.ticker))} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:14}}></button>
                </div>
              </div>
              <LiveMiniChart ticker={h.ticker} color={c?c.color:GREEN}/>
              {isLoading&&<LoadingAnim color={GREEN} message="ANALYZING..."/>}
              {r&&!isLoading&&(
                <div style={{marginTop:10}}>
                  <ScoreBar label="Confidence" value={r.confidence||0} color={c.color}/>
                  {r.whyThisRating&&<p style={fm(MUTED,12,{lineHeight:1.6,marginTop:8})}>{r.whyThisRating?.slice(0,120)}...</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ─── DAY TRADING TAB ──────────────────────────────────────────────────────────
function DayTradingTab({subscribed,onPaywall,dtMomentum,dtMomentumLoading,onFetchMomentum,dtScalps,dtScalpsLoading,onFetchScalps,dtSqueeze,dtSqueezeLoading,onFetchSqueeze,dtAfterHours,dtAfterHoursLoading,onFetchAfterHours,dtPreMarket,dtPreMarketLoading,onFetchPreMarket}){
  return(
    <div>
      {/* Header */}
      <div style={{background:`${RED}08`,border:`1px solid ${RED}33`,borderRadius:10,padding:"16px 20px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:RED,letterSpacing:3,textShadow:`0 0 20px ${RED}44`,marginBottom:4}}> Day Trading Terminal</div>
            <p style={fm(MUTED,13,{lineHeight:1.6})}>Real-time momentum movers, scalp setups, after-hours plays, and short squeeze alerts — updated live by AI</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={onFetchAfterHours} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtAfterHoursLoading?"...":" After-Hours"}</button>
            <button onClick={onFetchPreMarket} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtPreMarketLoading?"...":" Pre-Market"}</button>
            <button onClick={onFetchMomentum} style={{background:`${RED}18`,border:`1px solid ${RED}44`,color:RED,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtMomentumLoading?"SCANNING...":" Scan Movers"}</button>
          </div>
        </div>
      </div>

      {/* After-Hours Section */}
      <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:10,padding:18,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:ORANGE,letterSpacing:2,marginBottom:3}}> After-Hours & Pre-Market Movers</div>
            <div style={fm(MUTED,12)}>Stocks moving in extended hours — earnings releases, breaking news, analyst actions</div>
          </div>
          <button onClick={onFetchAfterHours} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtAfterHoursLoading?"FETCHING...":" REFRESH"}</button>
        </div>
        {dtAfterHoursLoading&&<LoadingAnim color={ORANGE} message="SCANNING AFTER-HOURS ACTIVITY..."/>}
        {!dtAfterHours&&!dtAfterHoursLoading&&<div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "After-Hours" or "Refresh" to see extended hours movers</div>}
        {dtAfterHours&&!dtAfterHoursLoading&&(
          <div>
            <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div><Tag label={dtAfterHours.session||"CLOSED"} color={ORANGE}/><span style={{...fm(MUTED,12),marginLeft:10}}>{dtAfterHours.summary}</span></div>
              <span style={fm(MUTED,11)}>{dtAfterHours.timestamp}</span>
            </div>
            {dtAfterHours.earningsTonight?.length>0&&(
              <div style={{marginBottom:14}}>
                <SectionLabel color={GOLD} icon="">Earnings Tonight</SectionLabel>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {dtAfterHours.earningsTonight.map((e,i)=>(
                    <div key={i} style={{background:DIM,borderRadius:5,padding:"8px 12px",border:`1px solid ${GOLD}33`}}>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:WHITE,letterSpacing:1,marginBottom:2}}>{e.ticker}</div>
                      <div style={fm(MUTED,11,{marginBottom:2})}>{e.name}</div>
                      <div style={fm(GOLD,11)}>{e.reportTime} • ±{e.impliedMove}</div>
                      <div style={fm(MUTED,10)}>EPS Est: {e.epsEstimate} | Rev: {e.revenueEstimate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
              {dtAfterHours.bigMovers?.map((m,i)=>{
                const isUp=m.direction==="UP";
                const clr=isUp?GREEN:RED;
                return(
                  <div key={i} style={{background:DIM,border:`1px solid ${clr}33`,borderRadius:8,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{m.ticker}</span>
                          <Tag label={m.gapType?.replace(/_/g," ")||"MOVE"} color={clr}/>
                        </div>
                        <div style={fm(MUTED,12,{marginBottom:4})}>{m.name}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:clr}}>{m.afterHoursPct}</div>
                        <div style={fm(MUTED,11)}>AH: {m.afterHoursPrice}</div>
                      </div>
                    </div>
                    <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${ORANGE}`}}>
                      <div style={fm(ORANGE,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Catalyst</div>
                      <p style={fm("#9a8a6a",12,{lineHeight:1.6})}>{m.catalyst}</p>
                    </div>
                    <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${clr}`}}>
                      <div style={fm(clr,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Tomorrow Plan</div>
                      <p style={fm("#8a9aaa",12,{lineHeight:1.6})}>{m.dayTradePlan}</p>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Tag label={`Close: ${m.regularClose}`} color={MUTED}/>
                      <Tag label={m.nextDayOutlook||"UNCERTAIN"} color={m.nextDayOutlook==="BULLISH"?GREEN:m.nextDayOutlook==="BEARISH"?RED:GOLD}/>
                    </div>
                    {m.keyLevels&&<div style={{marginTop:8,fontSize:11,color:"#6a7a8a",fontFamily:"'DM Sans',sans-serif"}}><strong>Key Levels:</strong> {m.keyLevels}</div>}
                  </div>
                );
              })}
            </div>
            {dtAfterHours.tomorrowWatchlist?.length>0&&(
              <div style={{marginTop:14,background:DIM,borderRadius:6,padding:"10px 14px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={fm(WHITE,12,{fontWeight:700})}> Watch Tomorrow:</span>
                {dtAfterHours.tomorrowWatchlist.map((t,i)=>(
                  <div key={i} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:GREEN,letterSpacing:1}}>{t}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pre-Market Report */}
      <div style={{background:CARD,border:`1px solid ${GOLD}33`,borderRadius:10,padding:18,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:GOLD,letterSpacing:2,marginBottom:3}}> Pre-Market Report</div>
            <div style={fm(MUTED,12)}>Futures, overnight gaps, and today's day trading setup</div>
          </div>
          <button onClick={onFetchPreMarket} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtPreMarketLoading?"LOADING...":" REFRESH"}</button>
        </div>
        {dtPreMarketLoading&&<LoadingAnim color={GOLD} message="LOADING PRE-MARKET DATA..."/>}
        {!dtPreMarket&&!dtPreMarketLoading&&<div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Pre-Market" or "Refresh" to see today's pre-market setup</div>}
        {dtPreMarket&&!dtPreMarketLoading&&(
          <div>
            {dtPreMarket.futuresSnapshot&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10,marginBottom:14}}>
                {[{l:"S&P 500",v:dtPreMarket.futuresSnapshot.sp500},{l:"NASDAQ",v:dtPreMarket.futuresSnapshot.nasdaq},{l:"DOW",v:dtPreMarket.futuresSnapshot.dow},{l:"VIX",v:dtPreMarket.futuresSnapshot.vix,neutral:true}].map((f,i)=>{
                  const isPos=f.v?.startsWith("+");
                  const clr=f.neutral?ORANGE:isPos?GREEN:RED;
                  return(
                    <div key={i} style={{background:DIM,borderRadius:6,padding:"10px 14px",textAlign:"center",border:`1px solid ${clr}33`}}>
                      <div style={fm(MUTED,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>{f.l}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:clr}}>{f.v||"N/A"}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {dtPreMarket.dayTradingBias&&(
              <div style={{background:`${GOLD}08`,borderRadius:5,padding:"10px 14px",marginBottom:14,borderLeft:`2px solid ${GOLD}`}}>
                <SectionLabel color={GOLD}>Day Trading Bias</SectionLabel>
                <p style={fm("#9a8a6a",13,{lineHeight:1.6})}>{dtPreMarket.dayTradingBias}</p>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {dtPreMarket.preMarketMovers?.map((m,i)=>{
                const isUp=m.gapDirection==="UP";
                const clr=isUp?GREEN:RED;
                return(
                  <div key={i} style={{background:DIM,border:`1px solid ${clr}33`,borderRadius:7,padding:"13px 15px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{m.ticker}</span>
                          <Tag label={m.gapSize||"MOVE"} color={GOLD}/>
                        </div>
                        <div style={fm(MUTED,12)}>{m.name}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:clr}}>{m.preMarketPct}</div>
                        <div style={fm(MUTED,11)}>{m.preMarketPrice}</div>
                      </div>
                    </div>
                    <p style={fm(MUTED,12,{lineHeight:1.6,marginBottom:8})}>{m.catalyst}</p>
                    <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8}}>
                      <div style={fm(clr,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Strategy: {m.tradeStrategy}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                        <Tag label={`Open: ${m.keyOpenLevel}`} color={MUTED}/>
                        <Tag label={`T1: ${m.firstTarget}`} color={GREEN}/>
                        <Tag label={`SL: ${m.stopLoss}`} color={RED}/>
                      </div>
                    </div>
                    <Tag label={`${m.confidence}% CONFIDENCE`} color={clr}/>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Momentum Movers */}
      <div style={{background:CARD,border:`1px solid ${RED}33`,borderRadius:10,padding:18,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:RED,letterSpacing:2,marginBottom:3}}> Momentum Movers</div>
            <div style={fm(MUTED,12)}>Stocks with the strongest price momentum and catalysts right now</div>
          </div>
          <button onClick={onFetchMomentum} style={{background:`${RED}18`,border:`1px solid ${RED}44`,color:RED,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtMomentumLoading?"SCANNING...":" REFRESH"}</button>
        </div>
        {dtMomentumLoading&&<LoadingAnim color={RED} message="SCANNING MARKET FOR MOMENTUM..."/>}
        {!dtMomentum&&!dtMomentumLoading&&<div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Scan Movers" to find stocks with strongest momentum right now</div>}
        {dtMomentum&&!dtMomentumLoading&&(
          <div>
            <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <p style={fm(MUTED,12,{flex:1,lineHeight:1.6})}>{dtMomentum.marketHighlight}</p>
              <div style={{display:"flex",gap:8}}>
                <Tag label={dtMomentum.marketSession||"CLOSED"} color={ORANGE}/>
                <Tag label={dtMomentum.marketMood||"MIXED"} color={dtMomentum.marketMood==="RISK-ON"?GREEN:dtMomentum.marketMood==="RISK-OFF"?RED:GOLD}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
              {dtMomentum.topMovers?.map((m,i)=>{
                const isUp=m.direction==="UP";
                const clr=isUp?GREEN:RED;
                return(
                  <div key={i} style={{background:DIM,border:`1px solid ${clr}44`,borderRadius:8,padding:"15px 17px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{m.ticker}</span>
                          <Tag label={m.session||"REGULAR"} color={ORANGE}/>
                          <Tag label={m.momentum||"BUILDING"} color={m.momentum==="STRONG"?clr:GOLD}/>
                        </div>
                        <div style={fm(MUTED,12,{marginBottom:3})}>{m.name} • {m.sector}</div>
                        <div style={fm(MUTED,11)}>{m.volume}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:clr,lineHeight:1}}>{m.changePct}</div>
                        <div style={fm(clr,12)}>{m.change}</div>
                        <div style={fm(MUTED,11)}>{m.price}</div>
                      </div>
                    </div>
                    <div style={{background:CARD,borderRadius:5,padding:"8px 12px",marginBottom:10,borderLeft:`2px solid ${ORANGE}`}}>
                      <div style={fm(ORANGE,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Catalyst</div>
                      <p style={fm("#9a8a6a",12,{lineHeight:1.6})}>{m.catalyst}</p>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                      <div style={{background:CARD,borderRadius:4,padding:"6px 8px",textAlign:"center"}}>
                        <div style={fm(MUTED,9,{textTransform:"uppercase",marginBottom:2})}>Entry</div>
                        <div style={fm(WHITE,12,{fontWeight:600})}>{m.entryZone}</div>
                      </div>
                      <div style={{background:CARD,borderRadius:4,padding:"6px 8px",textAlign:"center"}}>
                        <div style={fm(MUTED,9,{textTransform:"uppercase",marginBottom:2})}>Target</div>
                        <div style={fm(GREEN,12,{fontWeight:600})}>{m.target1}</div>
                      </div>
                      <div style={{background:CARD,borderRadius:4,padding:"6px 8px",textAlign:"center"}}>
                        <div style={fm(MUTED,9,{textTransform:"uppercase",marginBottom:2})}>Stop</div>
                        <div style={fm(RED,12,{fontWeight:600})}>{m.stopLoss}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <Tag label={m.signal||"WATCH"} color={m.signal?.includes("BUY")?GREEN:m.signal?.includes("SHORT")?RED:GOLD}/>
                      <Tag label={`R:R ${m.riskReward}`} color={MUTED}/>
                      <Tag label={`${m.confidence}% CONF`} color={clr}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Scalp Setups */}
      <div style={{background:CARD,border:`1px solid ${CYAN}33`,borderRadius:10,padding:18,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:CYAN,letterSpacing:2,marginBottom:3}}> Scalp Setups</div>
            <div style={fm(MUTED,12)}>Quick 1–5% intraday setups with precise entry, target, and stop loss</div>
          </div>
          <button onClick={onFetchScalps} style={{background:`${CYAN}18`,border:`1px solid ${CYAN}44`,color:CYAN,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtScalpsLoading?"SCANNING...":" REFRESH"}</button>
        </div>
        {dtScalpsLoading&&<LoadingAnim color={CYAN} message="FINDING SCALP SETUPS..."/>}
        {!dtScalps&&!dtScalpsLoading&&<div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Refresh" to find today's best scalp setups</div>}
        {dtScalps&&!dtScalpsLoading&&(
          <div>
            <div style={fm(MUTED,11,{marginBottom:10})}>{dtScalps.session} • {dtScalps.timestamp}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
              {dtScalps.setups?.map((s,i)=>{
                const urgColor=s.urgency==="NOW"?RED:s.urgency==="WATCH"?GOLD:MUTED;
                return(
                  <div key={i} style={{background:DIM,border:`1px solid ${urgColor}44`,borderRadius:7,padding:"13px 15px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{s.ticker}</span>
                          <Tag label={s.urgency||"WATCH"} color={urgColor}/>
                        </div>
                        <div style={fm(MUTED,12,{marginBottom:3})}>{s.name}</div>
                        <Tag label={`${s.setupType} • ${s.timeframe}`} color={CYAN}/>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:GREEN}}>{s.potentialGain}</div>
                        <div style={fm(RED,11)}>Max loss: {s.maxLoss}</div>
                      </div>
                    </div>
                    <p style={fm(MUTED,12,{lineHeight:1.6,marginBottom:8})}>{s.catalyst}</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
                      {[{l:"Entry",v:s.entry,c:WHITE},{l:"Target",v:s.target,c:GREEN},{l:"Stop",v:s.stopLoss,c:RED}].map((item,j)=>(
                        <div key={j} style={{background:CARD,borderRadius:4,padding:"5px 8px",textAlign:"center"}}>
                          <div style={fm(MUTED,9,{textTransform:"uppercase",marginBottom:1})}>{item.l}</div>
                          <div style={fm(item.c,12,{fontWeight:600})}>{item.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:s.notes?6:0}}>
                      <Tag label={`R:R ${s.riskReward}`} color={MUTED}/>
                      <Tag label={`${s.confidence}%`} color={urgColor}/>
                    </div>
                    {s.notes&&<div style={{fontSize:11,color:"#5a7a8a",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}> {s.notes}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Short Squeeze Watch */}
      <div style={{background:CARD,border:`1px solid ${PINK}33`,borderRadius:10,padding:18,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:PINK,letterSpacing:2,marginBottom:3}}> Short Squeeze Watch</div>
            <div style={fm(MUTED,12)}>High short interest stocks with squeeze potential</div>
          </div>
          <button onClick={onFetchSqueeze} style={{background:`${PINK}18`,border:`1px solid ${PINK}44`,color:PINK,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{dtSqueezeLoading?"SCANNING...":" REFRESH"}</button>
        </div>
        {dtSqueezeLoading&&<LoadingAnim color={PINK} message="SCANNING SHORT INTEREST DATA..."/>}
        {!dtSqueeze&&!dtSqueezeLoading&&<div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Refresh" to find current short squeeze candidates</div>}
        {dtSqueeze&&!dtSqueezeLoading&&(
          <div>
            {dtSqueeze.activeSqueezes?.length>0&&(
              <div style={{background:`${RED}08`,border:`1px solid ${RED}33`,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <span style={fm(RED,12,{fontWeight:700})}> ACTIVE SQUEEZES:</span>
                {dtSqueeze.activeSqueezes.map((t,i)=><div key={i} style={{background:`${RED}18`,border:`1px solid ${RED}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:RED,letterSpacing:1}}>{t}</div>)}
              </div>
            )}
            {dtSqueeze.summary&&<div style={fm(MUTED,12,{marginBottom:12,lineHeight:1.6})}>{dtSqueeze.summary}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:12}}>
              {dtSqueeze.candidates?.map((c,i)=>{
                const stageColor=c.squeezeStage==="ACTIVE"?RED:c.squeezeStage==="IMMINENT"?ORANGE:c.squeezeStage==="BUILDING"?GOLD:MUTED;
                return(
                  <div key={i} style={{background:DIM,border:`1px solid ${stageColor}44`,borderRadius:7,padding:"13px 15px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{c.ticker}</span>
                          <Tag label={c.squeezeStage||"BUILDING"} color={stageColor}/>
                        </div>
                        <div style={fm(MUTED,12)}>{c.name}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:PINK}}>{c.shortFloat}</div>
                        <div style={fm(MUTED,10)}>Short Float</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                      <InfoBox label="Days to Cover" value={c.daysToCover||c.daysTocover||"N/A"}/>
                      <InfoBox label="Short Interest" value={c.shortInterest||"N/A"}/>
                    </div>
                    <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${stageColor}`}}>
                      <div style={fm(stageColor,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Catalyst</div>
                      <p style={fm("#8a7a9a",12,{lineHeight:1.6})}>{c.catalyst}</p>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
                      {[{l:"Entry",v:c.entryZone,cl:WHITE},{l:"Target",v:c.squeezeTarget,cl:GREEN},{l:"Stop",v:c.stopLoss,cl:RED}].map((item,j)=>(
                        <div key={j} style={{background:"#0a0e16",borderRadius:4,padding:"5px 8px",textAlign:"center"}}>
                          <div style={fm(MUTED,9,{textTransform:"uppercase",marginBottom:1})}>{item.l}</div>
                          <div style={fm(item.cl,11,{fontWeight:600})}>{item.v}</div>
                        </div>
                      ))}
                    </div>
                    <Tag label={`${c.confidence}% CONF`} color={stageColor}/>
                    {c.risk&&<div style={{marginTop:6,fontSize:11,color:"#5a6a7a",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}> {c.risk}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Risk warning */}
      <div style={{background:`${RED}08`,border:`1px solid ${RED}22`,borderRadius:6,padding:"12px 16px"}}>
        <p style={fm(MUTED,11,{lineHeight:1.7})}>
           <strong style={{color:RED}}>Day Trading Risk Warning:</strong> Day trading involves substantial risk of loss and is not appropriate for all investors. Most day traders lose money. The setups above are AI-generated for informational purposes only and do NOT constitute financial advice. Never risk more than you can afford to lose. Always use stop losses.
        </p>
      </div>
    </div>
  );
}



// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab] = useState("watchlist");
  // Live ticker state
  const [tickerData,setTickerData] = useState([]);
  const [tickerLoaded,setTickerLoaded] = useState(false);
  const [subscribed,setSubscribed] = useState(false);
  const [analysesUsed,setAnalysesUsed] = useState(0);
  const [showPaywall,setShowPaywall] = useState(false);
  const [showToast,setShowToast] = useState(false);
  const [showTerms,setShowTerms] = useState(false);
  const [showPrivacy,setShowPrivacy] = useState(false);
  const [marketStatus,setMarketStatus] = useState(getMarketStatus());
  const [clock,setClock] = useState(new Date());

  // Watchlist state - fully dynamic
  const [watchlist,setWatchlist] = useState(null);
  const [watchlistLoading,setWatchlistLoading] = useState(false);
  // Trending state
  const [trending,setTrending] = useState(null);
  const [trendingLoading,setTrendingLoading] = useState(false);
  // Custom search state
  const [customTicker,setCustomTicker] = useState("");
  const [customLoading,setCustomLoading] = useState(false);
  const [customStock,setCustomStock] = useState(null);
  // Smart Money state
  const [smActivity,setSmActivity] = useState(null);
  const [smActivityLoading,setSmActivityLoading] = useState(false);
  // Options state
  const [dynamicOptions,setDynamicOptions] = useState(null);
  const [dynamicOptionsLoading,setDynamicOptionsLoading] = useState(false);
  // IPO state
  const [dynamicIPOs,setDynamicIPOs] = useState(null);
  const [ipoLoading,setIpoLoading] = useState(false);
  // Gems state
  const [dynamicGems,setDynamicGems] = useState(null);
  const [gemsLoading,setGemsLoading] = useState(false);
  // Day Trading state
  const [dtMomentum,setDtMomentum] = useState(null);
  const [dtMomentumLoading,setDtMomentumLoading] = useState(false);
  const [dtScalps,setDtScalps] = useState(null);
  const [dtScalpsLoading,setDtScalpsLoading] = useState(false);
  const [dtSqueeze,setDtSqueeze] = useState(null);
  const [dtSqueezeLoading,setDtSqueezeLoading] = useState(false);
  const [dtAfterHours,setDtAfterHours] = useState(null);
  const [dtAfterHoursLoading,setDtAfterHoursLoading] = useState(false);
  const [dtPreMarket,setDtPreMarket] = useState(null);
  const [dtPreMarketLoading,setDtPreMarketLoading] = useState(false);

  // Clock
  useEffect(()=>{
    const t = setInterval(()=>{setMarketStatus(getMarketStatus());setClock(new Date());},1000);
    return ()=>clearInterval(t);
  },[]);

  // Check subscription from URL
  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    if(p.get("subscribed")==="true"){ setSubscribed(true); setShowToast(true); setTimeout(()=>setShowToast(false),4500); }
  },[]);

  // ── Persistent session cache ─────────────────────────────────────────────
  const CK = {
    watchlist:"sm_watchlist", trending:"sm_trending", smActivity:"sm_sm",
    dynamicOptions:"sm_opts", dynamicIPOs:"sm_ipos", dynamicGems:"sm_gems",
    dtMomentum:"sm_mom", dtScalps:"sm_scalps", dtSqueeze:"sm_squeeze",
    dtAfterHours:"sm_ah", dtPreMarket:"sm_pm",
  };
  const saveCache = (key,data)=>{ try{ sessionStorage.setItem(key,JSON.stringify({data,ts:Date.now()})); }catch(e){} };
  const loadCache = (key)=>{ try{ const r=sessionStorage.getItem(key); if(!r) return null; const {data,ts}=JSON.parse(r); return (Date.now()-ts<8*3600*1000)?data:null; }catch(e){ return null; } };

  // ── Auto-population: load cache + fetch fresh data intelligently ─────────
  // isMarketOpen: true 9:30am–4:00pm ET Mon–Fri
  const isMarketOpen = () => {
    const et = new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
    const day = et.getDay();
    const mins = et.getHours()*60+et.getMinutes();
    return day>=1&&day<=5&&mins>=570&&mins<960;
  };
  // isExtendedHours: pre-market 4am–9:30am or after-hours 4pm–8pm ET
  const isExtendedHours = () => {
    const et = new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
    const day = et.getDay();
    const mins = et.getHours()*60+et.getMinutes();
    return day>=1&&day<=5&&((mins>=240&&mins<570)||(mins>=960&&mins<1200));
  };

  // Staggered auto-fetch so all APIs don't fire simultaneously
  const autoFetchAll = useCallback(async () => {
    const open = isMarketOpen();
    const extended = isExtendedHours();
    // Helper: fetch only if cache is stale (older than maxAgeMs)
    const fetchIfStale = async (cacheKey, fetchFn, maxAgeMs=30*60*1000) => {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if(raw){
          const {ts} = JSON.parse(raw);
          if(Date.now()-ts < maxAgeMs) return; // cache fresh enough
        }
        await fetchFn();
      } catch(e){}
    };

    if(open||extended){
      // Wave 1 — highest priority: watchlist + trending (30 min cache)
      await fetchIfStale(CK.watchlist,   ()=>fetchWatchlist(),   30*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      await fetchIfStale(CK.trending,    ()=>fetchTrending(),    30*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      // Wave 2 — gems + IPOs (1 hour cache, less volatile)
      await fetchIfStale(CK.dynamicGems, ()=>fetchDynamicGems(), 60*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      await fetchIfStale(CK.dynamicIPOs, ()=>fetchDynamicIPOs(), 60*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      // Wave 3 — options + smart money (45 min cache)
      await fetchIfStale(CK.dynamicOptions, ()=>fetchDynamicOptions(), 45*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      await fetchIfStale(CK.smActivity,     ()=>fetchSmActivity(),     45*60*1000);
    }
    if(open){
      await new Promise(r=>setTimeout(r,1200));
      // Wave 4 — day trading data (15 min cache, most time-sensitive)
      await fetchIfStale(CK.dtMomentum,  ()=>fetchMomentum(),    15*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      await fetchIfStale(CK.dtScalps,    ()=>fetchScalps(),      15*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      await fetchIfStale(CK.dtSqueeze,   ()=>fetchSqueeze(),     30*60*1000);
    }
    if(extended){
      // Extended hours: after-hours and pre-market data
      await fetchIfStale(CK.dtAfterHours, ()=>fetchAfterHours(), 20*60*1000);
      await new Promise(r=>setTimeout(r,1200));
      await fetchIfStale(CK.dtPreMarket,  ()=>fetchPreMarket(),  20*60*1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // On mount: load cache instantly, then auto-fetch fresh data
  useEffect(()=>{
    // Step 1: Instantly restore last known data from cache
    const load = (key, setter) => { const d=loadCache(key); if(d) setter(d); };
    load(CK.watchlist,      setWatchlist);
    load(CK.trending,       setTrending);
    load(CK.smActivity,     setSmActivity);
    load(CK.dynamicOptions, setDynamicOptions);
    load(CK.dynamicIPOs,    setDynamicIPOs);
    load(CK.dynamicGems,    setDynamicGems);
    load(CK.dtMomentum,     setDtMomentum);
    load(CK.dtScalps,       setDtScalps);
    load(CK.dtSqueeze,      setDtSqueeze);
    load(CK.dtAfterHours,   setDtAfterHours);
    load(CK.dtPreMarket,    setDtPreMarket);

    // Step 2: Start staggered auto-fetch after a short delay
    const t = setTimeout(()=>autoFetchAll(), 2000);
    return ()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Auto-refresh every 15 minutes while market is open
  useEffect(()=>{
    const interval = setInterval(()=>{
      if(isMarketOpen()||isExtendedHours()) autoFetchAll();
    }, 15*60*1000);
    return ()=>clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[autoFetchAll]);

  // Detect market open transition: if market was closed and now opens, auto-fetch
  const prevMarketOpen = useRef(isMarketOpen());
  useEffect(()=>{
    const check = setInterval(()=>{
      const nowOpen = isMarketOpen();
      if(!prevMarketOpen.current && nowOpen){
        // Market just opened — fetch everything fresh
        autoFetchAll();
      }
      prevMarketOpen.current = nowOpen;
    }, 60*1000);
    return ()=>clearInterval(check);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[autoFetchAll]);

  const handleUseAnalysis = useCallback(()=>{
    if(BETA_MODE||subscribed) return true;
    if(analysesUsed>=FREE_LIMIT){ setShowPaywall(true); return false; }
    setAnalysesUsed(p=>p+1);
    return true;
  },[subscribed,analysesUsed]);

  const handleSubscribe = ()=>{ window.location.href="https://buy.stripe.com/eVqeVca5teIn8EB7M4ow00"; };

  // Fetch functions
  // Fetch live ticker data
  const fetchLiveTickers = useCallback(async () => {
    const SYMBOLS = [
      // Indices
      "^GSPC",  // S&P 500
      "^IXIC",  // NASDAQ
      "^DJI",   // Dow Jones
      "^RUT",   // Russell 2000
      "^VIX",   // VIX
      // Top stocks
      "NVDA","AAPL","MSFT","META","AMZN","GOOGL","TSLA","AMD","PLTR","COIN",
      // ETFs
      "SPY","QQQ","IWM",
      // Crypto
      "BTC-USD","ETH-USD",
    ];
    const labels = {
      "^GSPC":"S&P 500","^IXIC":"NASDAQ","^DJI":"DOW","^RUT":"RUSSELL 2K","^VIX":"VIX"
    };
    try {
      const results = await Promise.allSettled(
        SYMBOLS.map(async (sym) => {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`;
          const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          ];
          for(const proxy of proxies){
            try{
              const res = await fetch(proxy);
              if(!res.ok) continue;
              const data = await res.json();
              const result = data?.chart?.result?.[0];
              if(!result) continue;
              const meta = result.meta;
              const price = meta.regularMarketPrice ?? meta.previousClose;
              const prev = meta.previousClose ?? meta.chartPreviousClose;
              if(!price || !prev) continue;
              const change = price - prev;
              const changePct = ((change / prev) * 100).toFixed(2);
              return {
                ticker: labels[sym] || sym.replace("-USD",""),
                price: price > 10000 ? price.toFixed(0) : price > 1 ? price.toFixed(2) : price.toFixed(4),
                change: (change >= 0 ? "+" : "") + change.toFixed(2),
                changePct: (change >= 0 ? "+" : "") + changePct + "%",
                isUp: change >= 0,
              };
            }catch(e){ continue; }
          }
          return null;
        })
      );
      const valid = results.filter(r=>r.status==="fulfilled"&&r.value).map(r=>r.value);
      if(valid.length > 0) {
        setTickerData(valid);
        setTickerLoaded(true);
      }
    } catch(e) {
      console.warn("Ticker fetch failed:", e.message);
    }
  }, []);

  // Fetch tickers on mount and every 60 seconds
  useEffect(()=>{
    fetchLiveTickers();
    const interval = setInterval(fetchLiveTickers, 60000);
    return ()=>clearInterval(interval);
  },[fetchLiveTickers]);

  const fetchWatchlist = async () => {
    setWatchlistLoading(true);
    try{
      const r = await callAI(DYNAMIC_WATCHLIST_SYSTEM,
        `Today is ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}. Search for the 15 highest-conviction, highest-profit-potential stocks for THIS WEEK. Include: stocks with earnings catalysts this week, sector leaders with institutional buying, technical breakouts at key levels, analyst upgrades from the past 48 hours, and unusual options activity. Only US-listed stocks. Provide precise entry, target, and stop for each.`,
        "perplexity"
      );
      setWatchlist(r); saveCache(CK.watchlist,r);
    }catch(e){ console.error("Watchlist fetch failed:",e); }
    setWatchlistLoading(false);
  };

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try{
      const r = await callAI(TRENDING_SYSTEM,
        `Search for the top 8 stocks with the highest profit potential RIGHT NOW — not just social buzz, but real institutional momentum, unusual options flow, and near-term catalysts. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}. Provide entry, target, and stop for each. Only REAL ticker symbols.`,
        "perplexity"
      );
      setTrending(r); saveCache(CK.trending,r);
    }catch(e){ console.error("Trending fetch failed:",e); }
    setTrendingLoading(false);
  };

  const analyzeCustomTicker = async () => {
    if(!customTicker.trim()) return;
    if(!BETA_MODE&&!subscribed&&analysesUsed>=FREE_LIMIT){ setShowPaywall(true); return; }
    setCustomLoading(true);
    const input = customTicker.trim();
    try{
      const r = await callAI(STOCK_SYSTEM,
        `The user searched for: "${input}". This could be a ticker OR company name. Identify the correct US stock ticker and analyze it. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`
      );
      setCustomStock({ticker:r?.ticker||input.toUpperCase(),result:r});
      if(!BETA_MODE&&!subscribed) setAnalysesUsed(p=>p+1);
    }catch(e){ alert("Could not analyze "+input+". Please check the ticker and try again."); }
    setCustomLoading(false);
  };

  const fetchSmActivity = async () => {
    setSmActivityLoading(true);
    try{
      const r = await callAI(DYNAMIC_SMART_MONEY_SYSTEM,
        `Search for the most recent congressional STOCK Act disclosures from the last 45 days AND the latest SEC 13F filings from top hedge funds (Druckenmiller, Ackman, Tepper, Cohen, Dalio, ARK). Only REAL names and REAL tickers. Highlight which stocks appear in multiple filings. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setSmActivity(r); saveCache(CK.smActivity,r);
    }catch(e){ console.error("SM activity failed:",e); }
    setSmActivityLoading(false);
  };

  const fetchDynamicOptions = async () => {
    setDynamicOptionsLoading(true);
    try{
      const r = await callAI(DYNAMIC_OPTIONS_SYSTEM,
        `Search for the best options trades available RIGHT NOW. Look for: unusual call/put sweeps above $500K notional, stocks with earnings in the next 14 days, elevated IV rank above 50, and sector leaders at technical inflection points. Provide exact strike, expiry, and estimated premium. Only REAL tickers. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}.`,
        "perplexity"
      );
      setDynamicOptions(r); saveCache(CK.dynamicOptions,r);
    }catch(e){ console.error("Dynamic options failed:",e); }
    setDynamicOptionsLoading(false);
  };

  const fetchDynamicIPOs = async () => {
    setIpoLoading(true);
    try{
      const r = await callAI(DYNAMIC_IPO_SYSTEM,
        `Search for the most current IPO pipeline for 2025-2026. Include companies with filed S-1s, confirmed pricing dates, and recent roadshows. Evaluate valuation vs public comps and first-day pop potential. Only REAL companies with verifiable filings. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setDynamicIPOs(r); saveCache(CK.dynamicIPOs,r);
    }catch(e){ console.error("Dynamic IPOs failed:",e); }
    setIpoLoading(false);
  };

  const fetchDynamicGems = async () => {
    setGemsLoading(true);
    try{
      const r = await callAI(DYNAMIC_GEMS_SYSTEM,
        `Search for small and mid-cap stocks (market cap $300M-$10B) that are currently undervalued with a near-term re-rating catalyst. Look for: recent insider buying, institutional accumulation, earnings inflection, new product launches, or regulatory approvals. Minimum 3 months of positive fundamental trend. Only REAL tickers. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setDynamicGems(r); saveCache(CK.dynamicGems,r);
    }catch(e){ console.error("Dynamic gems failed:",e); }
    setGemsLoading(false);
  };

  const fetchMomentum = async () => {
    setDtMomentumLoading(true);
    try{ const r=await callAI(MOMENTUM_MOVERS_SYSTEM,`Search for the highest-conviction intraday trading opportunities RIGHT NOW. Find liquid stocks (>2M avg volume) with real catalysts — earnings, upgrades, news, technical breakouts. Include precise entry zones, targets, and stops. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}. REAL tickers only.`,"perplexity"); setDtMomentum(r); saveCache(CK.dtMomentum,r); }catch(e){ console.error(e); }
    setDtMomentumLoading(false);
  };

  const fetchScalps = async () => {
    setDtScalpsLoading(true);
    try{ const r=await callAI(SCALP_SETUPS_SYSTEM,`Find the 6 cleanest scalp setups available RIGHT NOW for liquid stocks with avg volume above 2M/day. Each must have a precise entry trigger, two targets, and a tight stop. Include setup type and urgency. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}. REAL tickers only.`,"perplexity"); setDtScalps(r); saveCache(CK.dtScalps,r); }catch(e){ console.error(e); }
    setDtScalpsLoading(false);
  };

  const fetchSqueeze = async () => {
    setDtSqueezeLoading(true);
    try{ const r=await callAI(SHORT_SQUEEZE_SYSTEM,`Search for stocks with short float above 15%, days-to-cover above 3, and recent unusual call buying or positive catalyst that could force short covering. Rank by squeeze probability. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. REAL tickers only.`,"perplexity"); setDtSqueeze(r); saveCache(CK.dtSqueeze,r); }catch(e){ console.error(e); }
    setDtSqueezeLoading(false);
  };

  const fetchAfterHours = async () => {
    setDtAfterHoursLoading(true);
    try{ const r=await callAI(AFTERHOURS_SYSTEM,`Search for significant after-hours and pre-market movers RIGHT NOW with real earnings releases, guidance, M&A, or analyst actions as catalysts. For each provide a specific next-day trading plan with entry, target, and stop. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}. REAL tickers only.`,"perplexity"); setDtAfterHours(r); saveCache(CK.dtAfterHours,r); }catch(e){ console.error(e); }
    setDtAfterHoursLoading(false);
  };

  const fetchPreMarket = async () => {
    setDtPreMarketLoading(true);
    try{ const r=await callAI(PREMARKET_SYSTEM,`Search for pre-market movers, overnight futures, and key economic events for today. For each gap mover provide a concrete gap-and-go or gap-fill trading strategy with entry, target, and stop. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}. REAL tickers only.`,"perplexity"); setDtPreMarket(r); saveCache(CK.dtPreMarket,r); }catch(e){ console.error(e); }
    setDtPreMarketLoading(false);
  };

  const etTime = clock.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"America/New_York"});

  const TABS = [
    {id:"watchlist",  label:"Watchlist"},
    {id:"daytrading", label:"Day Trading"},
    {id:"smartmoney", label:"Smart Money"},
    {id:"options",    label:"Options"},
    {id:"screener",   label:"Screener"},
    {id:"gems",       label:"Hidden Gems"},
    {id:"ipos",       label:"IPO Watch"},
    {id:"portfolio",  label:"Portfolio"},
  ];

  const tabColor = (id) => id==="daytrading"?RED:id==="smartmoney"?PINK:id==="options"?ORANGE:GREEN;

  return(
    <div style={{minHeight:"100vh",background:BG}}>
      <DisclaimerBanner onViewTerms={()=>setShowTerms(true)} onViewPrivacy={()=>setShowPrivacy(true)}/>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${BG};color:${WHITE};font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.6;}
        ::-webkit-scrollbar{width:4px;background:${BG};}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:2px;}
        input::placeholder{color:${MUTED};}
        select option{background:${CARD};}
        @keyframes barAnim{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
      `}</style>

      {/* Header */}
      <div style={{background:CARD,borderBottom:`1px solid ${BORDER}`,position:"sticky",top:DisclaimerBanner?"auto":0,zIndex:400}}>
        {/* Live Ticker tape */}
        <div style={{background:"#050810",borderBottom:`1px solid ${BORDER}`,height:28,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:60,background:"linear-gradient(to right,#050810,transparent)",zIndex:2,pointerEvents:"none"}}/>
          <div style={{position:"absolute",right:0,top:0,bottom:0,width:60,background:"linear-gradient(to left,#050810,transparent)",zIndex:2,pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,display:"flex",alignItems:"center",height:"100%",animation:`tickerScroll ${tickerLoaded?120:80}s linear infinite`,willChange:"transform"}}>
            {(()=>{
              const baseItems = tickerLoaded ? tickerData : [
                {ticker:"S&P 500",price:"--",changePct:"--",isUp:true},
                {ticker:"NASDAQ",price:"--",changePct:"--",isUp:true},
                {ticker:"DOW",price:"--",changePct:"--",isUp:true},
                {ticker:"VIX",price:"--",changePct:"--",isUp:false},
                {ticker:"NVDA",price:"--",changePct:"--",isUp:true},
                {ticker:"AAPL",price:"--",changePct:"--",isUp:true},
                {ticker:"TSLA",price:"--",changePct:"--",isUp:false},
                {ticker:"BTC",price:"--",changePct:"--",isUp:true},
              ];
              return [...baseItems,...baseItems,...baseItems].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"0 24px",borderRight:`1px solid ${BORDER}44`,flexShrink:0,height:"100%"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:WHITE,letterSpacing:0.5,whiteSpace:"nowrap"}}>{item.ticker}</span>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#7a8a9a",whiteSpace:"nowrap"}}>{item.price}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:item.isUp?GREEN:RED,whiteSpace:"nowrap"}}>
                    {item.isUp?"+":""}{item.changePct}
                  </span>
                </div>
              ));
            })()}
          </div>
          {!tickerLoaded&&(
            <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontFamily:"'DM Sans',sans-serif",fontSize:9,color:MUTED,letterSpacing:1}}>LOADING LIVE DATA...</div>
          )}
        </div>
        {/* Logo row */}
        <div style={{padding:"12px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:WHITE,letterSpacing:4}}>STOCK</span>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:GREEN,letterSpacing:4,textShadow:`0 0 20px ${GREEN}44`}}>SIGHT</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:MUTED,fontWeight:500}}>{etTime} ET</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:marketStatus.color,background:marketStatus.color+"18",border:`1px solid ${marketStatus.color}44`,borderRadius:4,padding:"3px 10px"}}>{marketStatus.label}</span>
            <span style={fm(MUTED,12,{display:"flex",alignItems:"center",gap:4})}>Free: <strong style={{color:WHITE}}>{Math.max(0,FREE_LIMIT-analysesUsed)}</strong> left</span>
            {!subscribed&&!BETA_MODE&&(
              <button onClick={()=>setShowPaywall(true)} style={{background:`linear-gradient(135deg,${GREEN}22,${GREEN}11)`,border:`1px solid ${GREEN}55`,color:GREEN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,padding:"7px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>UPGRADE →</button>
            )}
            {(subscribed||BETA_MODE)&&<Tag label="PRO ACTIVE" color={GREEN}/>}
          </div>
        </div>
        {/* Tab navigation */}
        <div style={{borderBottom:`1px solid ${BORDER}`,padding:"0 28px",display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?tabColor(t.id):"transparent"}`,color:tab===t.id?tabColor(t.id):MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:0.3,padding:"13px 20px",cursor:"pointer",textTransform:"uppercase",transition:"color 0.2s",whiteSpace:"nowrap"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto"}}>

        {/* ── WATCHLIST TAB ─────────────────────────────────────── */}
        {tab==="watchlist"&&(
          <div>
            <Legend/>
            <div style={{height:16}}/>

            {/* Custom ticker search */}
            <div style={{background:CARD,border:`1px solid ${GREEN}33`,borderRadius:10,padding:18,marginBottom:20}}>
              <SectionLabel color={GREEN} icon="">Analyze Any Stock — Type Any Ticker or Company Name</SectionLabel>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                <input placeholder="Enter ticker or company name (e.g. TSLA, Apple, Nvidia...)" value={customTicker} onChange={e=>setCustomTicker(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyzeCustomTicker()} style={{background:DIM,border:`1px solid ${GREEN}55`,color:WHITE,fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:3,padding:"10px 14px",borderRadius:5,width:340,outline:"none"}}/>
                <button onClick={analyzeCustomTicker} disabled={customLoading||!customTicker.trim()} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}55`,color:GREEN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,padding:"11px 20px",borderRadius:5,cursor:"pointer",textTransform:"uppercase",opacity:customTicker.trim()?1:0.5}}>
                  {customLoading?"ANALYZING...":" ANALYZE"}
                </button>
                {customStock&&<button onClick={()=>setCustomStock(null)} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:11,padding:"10px 14px",borderRadius:5,cursor:"pointer"}}> Clear</button>}
              </div>
              <div style={fm(MUTED,11)}>Works with ticker symbols (AAPL) or company names (Apple) — press Enter or click Analyze</div>
              {customStock&&(
                <div style={{marginTop:16}}>
                  <SectionLabel color={GREEN}>Custom Analysis — {customStock.ticker}</SectionLabel>
                  <StockResult result={customStock.result}/>
                </div>
              )}
            </div>

            {/* Trending section */}
            <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:10,padding:18,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:ORANGE,letterSpacing:3,textShadow:`0 0 16px ${ORANGE}44`}}> Trending Now</div>
                  <div style={fm(MUTED,12)}>Stocks with market buzz and high profit potential</div>
                </div>
                <button onClick={fetchTrending} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"8px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{trendingLoading?"SCANNING...":" REFRESH TRENDING"}</button>
              </div>
              {trendingLoading&&<LoadingAnim color={ORANGE} message="SCANNING MARKET FOR HOT STOCKS..."/>}
              {!trending&&!trendingLoading&&<div style={{textAlign:"center",padding:"16px 0",color:MUTED,fontSize:12}}>Click "Refresh Trending" to see today's hottest high-potential stocks</div>}
              {trending&&!trendingLoading&&(
                <div>
                  <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <div style={fm(MUTED,12,{flex:1})}>{trending.moodReason}</div>
                    <div style={{display:"flex",gap:8}}>
                      <Tag label={trending.marketMood} color={trending.marketMood==="BULLISH"?GREEN:trending.marketMood==="BEARISH"?RED:GOLD}/>
                      <span style={fm(MUTED,11)}>{trending.lastUpdated}</span>
                    </div>
                  </div>
                  {trending.topPickToday&&(
                    <div style={{background:`${GREEN}0a`,border:`1px solid ${GREEN}44`,borderRadius:6,padding:"12px 14px",marginBottom:14,borderLeft:`3px solid ${GREEN}`}}>
                      <div style={fm(GREEN,11,{letterSpacing:1,textTransform:"uppercase",marginBottom:4,fontWeight:700})}> TOP PICK TODAY: {trending.topPickToday}</div>
                      <p style={fm("#7a9a7a",12,{lineHeight:1.7})}>{trending.topPickReason}</p>
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
                    {trending.trending?.map((t,i)=>{
                      const c=CONFIDENCE_MAP[t.verdict]||CONFIDENCE_MAP["BUY"];
                      return(
                        <div key={i} style={{background:DIM,border:`1px solid ${c.color}33`,borderRadius:7,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <div>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{t.ticker}</span>
                                <Tag label={t.momentum} color={t.momentum==="STRONG"?GREEN:t.momentum==="EARLY"?PURPLE:GOLD}/>
                              </div>
                              <div style={fm(MUTED,12,{marginBottom:4})}>{t.name}</div>
                              <Tag label={t.sector} color={MUTED}/>
                            </div>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:c.color}}>{t.confidence}%</div>
                              <div style={fm(MUTED,10)}>CONF</div>
                            </div>
                          </div>
                          <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${ORANGE}`}}>
                            <p style={fm("#8a9aaa",12,{lineHeight:1.6})}>{t.reason}</p>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <Tag label={t.verdict} color={c.color}/>
                            <Tag label={`${t.profitPotential} POTENTIAL`} color={t.profitPotential==="HIGH"?GREEN:GOLD}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Watchlist */}
            <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2,marginBottom:4}}>
                    {watchlist?`Watchlist — ${watchlist.weekOf||"This Week"}` : "Watchlist"}
                  </div>
                  <div style={fm(MUTED,12)}>
                    {watchlist
                      ? `Updated ${watchlist.generatedAt} • ${watchlist.marketContext}`
                      : "Curated weekly picks with the highest profit potential based on live market data"}
                  </div>
                </div>
                <button onClick={fetchWatchlist} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}44`,color:GREEN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"9px 18px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
                  {watchlistLoading?"SCANNING...":"REFRESH"}
                </button>
              </div>
              {watchlist&&(
                <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:watchlist.editorNote?0:16,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <Tag label={watchlist.marketBias||"MIXED"} color={watchlist.marketBias==="BULLISH"?GREEN:watchlist.marketBias==="BEARISH"?RED:GOLD}/>
                  <span style={fm(MUTED,12,{flex:1})}>{watchlist.marketContext}</span>
                </div>
              )}
              {watchlist?.editorNote&&(
                <div style={{background:`${BLUE}08`,border:`1px solid ${BLUE}22`,borderRadius:6,padding:"8px 14px",marginBottom:16,borderLeft:`3px solid ${BLUE}`}}>
                  <span style={fm(BLUE,11,{fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginRight:8})}>Editor's Note</span>
                  <span style={fm("#7a9aaa",12)}>{watchlist.editorNote}</span>
                </div>
              )}
              {watchlistLoading&&<LoadingAnim color={GREEN} message="SCANNING MARKET FOR TOP PICKS..."/>}
              {!watchlist&&!watchlistLoading&&(
                <div style={{textAlign:"center",padding:"32px 0"}}>
                  <div style={fm(WHITE,14,{fontWeight:600,marginBottom:8})}>Curated Weekly Picks</div>
                  <div style={fm(MUTED,13,{marginBottom:20,maxWidth:400,margin:"0 auto 20px"})}>
                    Each week, the platform selects the 15 highest-conviction stocks based on earnings catalysts, institutional buying, technical setups, and analyst activity.
                  </div>
                  <button onClick={fetchWatchlist} style={{background:`linear-gradient(135deg,${GREEN}22,${GREEN}11)`,border:`1px solid ${GREEN}55`,color:GREEN,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,padding:"12px 24px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
                    Load This Week's Picks
                  </button>
                </div>
              )}
              {watchlist&&!watchlistLoading&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                  {watchlist.stocks?.map((stock,i)=>(
                    <DynStockCard key={i} stock={stock} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)} onUseAnalysis={handleUseAnalysis} analysesUsed={analysesUsed}/>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DAY TRADING TAB ───────────────────────────────────── */}
        {tab==="daytrading"&&(
          <DayTradingTab subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}
            dtMomentum={dtMomentum} dtMomentumLoading={dtMomentumLoading} onFetchMomentum={fetchMomentum}
            dtScalps={dtScalps} dtScalpsLoading={dtScalpsLoading} onFetchScalps={fetchScalps}
            dtSqueeze={dtSqueeze} dtSqueezeLoading={dtSqueezeLoading} onFetchSqueeze={fetchSqueeze}
            dtAfterHours={dtAfterHours} dtAfterHoursLoading={dtAfterHoursLoading} onFetchAfterHours={fetchAfterHours}
            dtPreMarket={dtPreMarket} dtPreMarketLoading={dtPreMarketLoading} onFetchPreMarket={fetchPreMarket}
          />
        )}

        {/* ── SMART MONEY TAB ───────────────────────────────────── */}
        {tab==="smartmoney"&&(
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:PINK,letterSpacing:3,textShadow:`0 0 20px ${PINK}44`,marginBottom:6}}>Smart Money Tracker</div>
            <p style={fm(MUTED,13,{lineHeight:1.7,maxWidth:660,marginBottom:20})}>Track publicly disclosed trades of elite investors — congressional members (STOCK Act filings), hedge fund whales (SEC 13F reports).</p>
            {/* Legal note */}
            <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:"12px 16px",marginBottom:20}}>
              <p style={fm(MUTED,12,{lineHeight:1.7})}> All data is sourced from legally mandated public disclosures. Congressional trades are disclosed via the STOCK Act (2012). Hedge fund positions come from SEC 13F quarterly filings. Copy-trading based on this data is legal. Note: Congress disclosures can lag up to 45 days; 13F filings lag up to 45 days after quarter end.</p>
            </div>
            {/* Live activity section */}
            <div style={{background:CARD,border:`1px solid ${GOLD}33`,borderRadius:10,padding:18,marginBottom:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:GOLD,letterSpacing:2,marginBottom:3}}> Live Activity Feed</div>
                  <div style={fm(MUTED,12)}>Most recent congressional trades & hedge fund moves</div>
                </div>
                <button onClick={fetchSmActivity} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"8px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{smActivityLoading?"FETCHING...":" REFRESH ACTIVITY"}</button>
              </div>
              {smActivityLoading&&<LoadingAnim color={GOLD} message="SCANNING LATEST DISCLOSURES..."/>}
              {!smActivity&&!smActivityLoading&&<div style={{textAlign:"center",padding:"12px 0",color:MUTED,fontSize:12}}>Click "Refresh Activity" to see the latest smart money moves</div>}
              {smActivity&&!smActivityLoading&&(
                <div>
                  <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <p style={fm(MUTED,12,{flex:1,lineHeight:1.6})}>{smActivity.summary}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {smActivity.hotStocks?.map((s,i)=>(
                        <div key={i} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:GREEN,letterSpacing:1}}>{s}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
                    {smActivity.recentActivity?.map((act,i)=>{
                      const sigClr=act.followSignal?.includes("BUY")?GREEN:act.followSignal==="WATCH"?GOLD:MUTED;
                      return(
                        <div key={i} style={{background:DIM,border:`1px solid ${sigClr}33`,borderRadius:6,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <div>
                              <div style={fm(WHITE,13,{fontWeight:700,marginBottom:2})}>{act.trader}</div>
                              <div style={fm(MUTED,11,{marginBottom:4})}>{act.role}</div>
                              <Tag label={act.category} color={act.category==="CONGRESS"?BLUE:GOLD}/>
                            </div>
                          </div>
                          <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${sigClr}`}}>
                            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:sigClr,letterSpacing:1,marginBottom:2}}>{act.trade}</div>
                            <div style={fm(MUTED,11)}>{act.amount} • {act.date}</div>
                          </div>
                          <p style={fm("#8a9aaa",12,{lineHeight:1.6,marginBottom:8})}>{act.significance}</p>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <Tag label={act.followSignal} color={sigClr}/>
                            <Tag label={`${act.confidence}% CONF`} color={sigClr}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Trader grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:18}}>
              {SMART_MONEY_TRADERS.map(trader=>(
                <SmartMoneyTraderCard key={trader.id} trader={trader} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>
              ))}
            </div>
          </div>
        )}

        {/* ── OPTIONS TAB ───────────────────────────────────────── */}
        {tab==="options"&&(
          <OptionsTab subscribed={subscribed} onPaywall={()=>setShowPaywall(true)} dynamicOptions={dynamicOptions} dynamicOptionsLoading={dynamicOptionsLoading} onFetchDynamic={fetchDynamicOptions}/>
        )}

        {/* ── SCREENER TAB ──────────────────────────────────────── */}
        {tab==="screener"&&(
          <Screener subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>
        )}

        {/* ── HIDDEN GEMS TAB ───────────────────────────────────── */}
        {tab==="gems"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:18}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:PURPLE,letterSpacing:3,textShadow:`0 0 20px ${PURPLE}44`,marginBottom:4}}>Hidden Gems</div>
                <p style={fm(MUTED,13,{lineHeight:1.7,maxWidth:600})}>Curated underfollowed stocks with high breakout potential</p>
              </div>
              <button onClick={fetchDynamicGems} style={{background:`${PURPLE}18`,border:`1px solid ${PURPLE}44`,color:PURPLE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"9px 18px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>{gemsLoading?" SCANNING...":" REFRESH GEMS"}</button>
            </div>
            {gemsLoading&&<LoadingAnim color={PURPLE} message="SCANNING FOR OPPORTUNITIES..."/>}
            {dynamicGems&&!gemsLoading&&(
              <div style={{background:`${PURPLE}08`,border:`1px solid ${PURPLE}22`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div style={fm(MUTED,12,{flex:1})}>{dynamicGems.marketContext}</div>
                <div style={fm(MUTED,11)}>Updated: {dynamicGems.lastUpdated}</div>
              </div>
            )}
            {dynamicGems&&!gemsLoading&&(
              <div style={{marginBottom:24}}>
                <SectionLabel color={PURPLE} icon="">AI-Detected Opportunities ({dynamicGems.gems?.length} found)</SectionLabel>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                  {dynamicGems.gems?.map((gem,i)=>(
                    <GemCard key={i} gem={gem} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>
                  ))}
                </div>
              </div>
            )}
            <div>
              {dynamicGems&&<SectionLabel color={MUTED}> Standard Hidden Gems</SectionLabel>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                {HIDDEN_GEMS.map(gem=><GemCard key={gem.ticker} gem={gem} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ── IPO WATCH TAB ─────────────────────────────────────── */}
        {tab==="ipos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:18}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:CYAN,letterSpacing:3,textShadow:`0 0 20px ${CYAN}44`,marginBottom:4}}>IPO Watch</div>
                <p style={fm(MUTED,13,{lineHeight:1.7,maxWidth:600})}>Real-time upcoming IPOs with profit analysis — updated as new filings emerge</p>
              </div>
              <button onClick={fetchDynamicIPOs} style={{background:`${CYAN}18`,border:`1px solid ${CYAN}44`,color:CYAN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"9px 18px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>{ipoLoading?" SCANNING...":" REFRESH IPO LIST"}</button>
            </div>
            <Legend/>
            <div style={{height:16}}/>
            {ipoLoading&&<LoadingAnim color={CYAN} message="SCANNING FOR LATEST IPO FILINGS..."/>}
            {dynamicIPOs&&!ipoLoading&&(
              <div style={{background:`${CYAN}08`,border:`1px solid ${CYAN}22`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div style={fm(MUTED,12,{flex:1})}>{dynamicIPOs.marketNote}</div>
                <div style={fm(MUTED,11)}>Updated: {dynamicIPOs.lastUpdated}</div>
              </div>
            )}
            {dynamicIPOs&&!ipoLoading&&(
              <div style={{marginBottom:28}}>
                <SectionLabel color={CYAN} icon="">Latest IPO Intelligence ({dynamicIPOs.ipos?.length} found)</SectionLabel>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                  {dynamicIPOs.ipos?.map((ipo,i)=>{
                    const c=CONFIDENCE_MAP[ipo.verdict||"SPECULATIVE"]||CONFIDENCE_MAP["SPECULATIVE"];
                    return(
                      <div key={i} style={{background:CARD,border:`1px solid ${c.color}33`,borderRadius:10,padding:18}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{ipo.ticker||"TBD"}</span>
                              <Tag label={ipo.verdict||"WATCH"} color={c.color}/>
                            </div>
                            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:CYAN,letterSpacing:1,marginBottom:3}}>{ipo.name}</div>
                            <Tag label={ipo.sector} color={MUTED}/>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:c.color}}>{ipo.buyConfidence}%</div>
                            <div style={fm(MUTED,10)}>BUY CONF</div>
                          </div>
                        </div>
                        <p style={fm(MUTED,12,{lineHeight:1.7,marginBottom:10})}>{ipo.description}</p>
                        {ipo.whyNow&&(
                          <div style={{background:DIM,borderRadius:5,padding:"8px 12px",marginBottom:10,borderLeft:`2px solid ${CYAN}`}}>
                            <p style={fm("#6a9aaa",12,{lineHeight:1.7})}>{ipo.whyNow}</p>
                          </div>
                        )}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <Tag label={` ${ipo.estTiming}`} color={MUTED}/>
                          {ipo.valuation&&<Tag label={ipo.valuation} color={GOLD}/>}
                          <Tag label={ipo.profitPotential||"MEDIUM"} color={ipo.profitPotential==="HIGH"?GREEN:GOLD}/>
                        </div>
                        {ipo.risks&&<div style={{marginTop:8,fontSize:11,color:"#5a7a8a",fontFamily:"'DM Sans',sans-serif"}}><strong>Risk:</strong> {ipo.risks}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              {dynamicIPOs&&<SectionLabel color={MUTED}> Previously Tracked IPOs</SectionLabel>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                {UPCOMING_IPOS.map(ipo=><IPOCard key={ipo.name} ipo={ipo} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO TAB ─────────────────────────────────────── */}
        {tab==="portfolio"&&(
          <Portfolio subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>
        )}

      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${BORDER}`,padding:"16px 28px",display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <span style={fm("#1a2a3a",12)}>FOR INFORMATIONAL PURPOSES ONLY — NOT FINANCIAL ADVICE</span>
        <button onClick={()=>setShowTerms(true)} style={{background:"none",border:"none",color:"#2a3a4a",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</button>
        <button onClick={()=>setShowPrivacy(true)} style={{background:"none",border:"none",color:"#2a3a4a",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</button>
        <span style={{color:"#1a2a3a",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>© 2026 StockMoolah. All rights reserved.</span>
      </div>

      {/* Modals */}
      {showPaywall&&<Paywall onClose={()=>setShowPaywall(false)} onSubscribe={handleSubscribe}/>}
      {showTerms&&<TermsModal onClose={()=>setShowTerms(false)}/>}
      {showPrivacy&&<PrivacyModal onClose={()=>setShowPrivacy(false)}/>}

      {/* Toast */}
      {showToast&&(
        <div style={{position:"fixed",bottom:24,right:24,background:GREEN,color:"#000",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,padding:"12px 20px",borderRadius:6,zIndex:300,boxShadow:`0 0 20px ${GREEN}44`}}>
           PRO UNLOCKED — All features active
        </div>
      )}
    </div>
  );
}
