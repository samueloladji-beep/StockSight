import { useState, useEffect, useCallback } from "react";

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
const MUTED  = "#3a4455";
const DIM    = "#111520";

const CONFIDENCE_MAP = {
  "STRONG BUY":  { color:"#00f5a0", pct:"85–100%", label:"STRONG BUY"  },
  "BUY":         { color:"#7ee8a2", pct:"70–84%",  label:"BUY"         },
  "SPECULATIVE": { color:"#f5c842", pct:"50–69%",  label:"SPECULATIVE" },
  "HOLD":        { color:"#4da6ff", pct:"40–49%",  label:"HOLD"        },
  "SELL":        { color:"#ff3d6b", pct:"20–39%",  label:"SELL"        },
  "STRONG SELL": { color:"#cc0033", pct:"0–19%",   label:"STRONG SELL" },
};

// ─── SMART MONEY TRADERS ─────────────────────────────────────────────────────
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
    id: "burry_protege",
    name: "Cathie Wood",
    role: "ARK Invest",
    category: "FUND MANAGER",
    categoryColor: PURPLE,
    track: "ARK Public Daily Holdings",
    knownFor: "Publishes daily portfolio changes publicly. Known for high-conviction disruptive tech bets — TSLA (early), COIN, ROKU, CRISPR. ARK Innovation ETF (ARKK) 5-year returns are publicly tracked.",
    historicalReturn: "+346% in 2020; volatile since",
    dataSource: "ARK Invest Daily Holdings (public)",
    avatar: "CW",
    avatarColor: PURPLE,
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
    id: "nancy_pelosi_2",
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

const TRADER_CATEGORIES = ["ALL", "CONGRESS", "HEDGE FUND", "FUND MANAGER"];

const ALL_STOCKS = [
  { ticker:"NVDA",  name:"NVIDIA Corporation",       sector:"Semiconductors",    tag:"AI-CORE"    },
  { ticker:"AMD",   name:"Advanced Micro Devices",   sector:"Semiconductors",    tag:"AI-PLAY"    },
  { ticker:"SMCI",  name:"Super Micro Computer",     sector:"AI Infrastructure", tag:"HOT"        },
  { ticker:"AVGO",  name:"Broadcom Inc.",              sector:"Semiconductors",    tag:"DIVIDEND"   },
  { ticker:"META",  name:"Meta Platforms",             sector:"Social / AI",       tag:"MOMENTUM"   },
  { ticker:"GOOGL", name:"Alphabet Inc.",               sector:"Cloud / AI",        tag:"VALUE"      },
  { ticker:"MSFT",  name:"Microsoft Corporation",    sector:"Cloud / AI",        tag:"BLUE-CHIP"  },
  { ticker:"AMZN",  name:"Amazon.com Inc.",             sector:"Cloud / Retail",    tag:"GROWTH"     },
  { ticker:"AAPL",  name:"Apple Inc.",                  sector:"Consumer Tech",     tag:"BLUE-CHIP"  },
  { ticker:"PLTR",  name:"Palantir Technologies",    sector:"AI / Data",         tag:"SPECULATIVE"},
  { ticker:"TSLA",  name:"Tesla Inc.",                  sector:"EV / Energy",       tag:"VOLATILE"   },
  { ticker:"MSTR",  name:"MicroStrategy Inc.",        sector:"Bitcoin / Tech",    tag:"VOLATILE"   },
  { ticker:"LLY",   name:"Eli Lilly & Co.",             sector:"Biotech",           tag:"HOT"        },
  { ticker:"MRNA",  name:"Moderna Inc.",              sector:"Biotech",           tag:"SPECULATIVE"},
  { ticker:"V",     name:"Visa Inc.",                   sector:"Fintech",           tag:"STABLE"     },
  { ticker:"JPM",   name:"JPMorgan Chase & Co.",     sector:"Banking",           tag:"BLUE-CHIP"  },
  { ticker:"XOM",   name:"Exxon Mobil Corporation",  sector:"Energy",            tag:"DIVIDEND"   },
  { ticker:"NEE",   name:"NextEra Energy Inc.",       sector:"Clean Energy",      tag:"GROWTH"     },
  { ticker:"COST",  name:"Costco Wholesale Corp.",   sector:"Retail",            tag:"STABLE"     },
  { ticker:"NKE",   name:"Nike Inc.",                   sector:"Consumer Goods",    tag:"VALUE"      },
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

const OPTIONS_UNIVERSE = [
  ...ALL_STOCKS.filter(s=>["NVDA","TSLA","META","AAPL","AMZN","GOOGL","MSFT","PLTR","AMD"].includes(s.ticker)),
  { ticker:"SPY", name:"SPDR S&P 500 ETF",      sector:"Index ETF", tag:"MARKET" },
  { ticker:"QQQ", name:"Invesco Nasdaq-100 ETF", sector:"Index ETF", tag:"MARKET" },
];

const SECTORS = ["All",...Array.from(new Set(ALL_STOCKS.map(s=>s.sector)))];
const TAGS    = ["All",...Array.from(new Set(ALL_STOCKS.map(s=>s.tag)))];

function getMarketStatus() {
  const et  = new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  const day = et.getDay(), mins = et.getHours()*60+et.getMinutes();
  if(day===0||day===6)     return {open:false,label:"CLOSED — Weekend",         color:RED  };
  if(mins>=480&&mins<570)  return {open:false,label:"PRE-MARKET  8–9:30 AM ET", color:GOLD };
  if(mins>=570&&mins<960)  return {open:true, label:"MARKET OPEN",              color:GREEN};
  if(mins>=960&&mins<1200) return {open:false,label:"AFTER-HOURS 4–8 PM ET",   color:GOLD };
  return {open:false,label:"CLOSED",color:RED};
}

// ─── MULTI-AI ENGINE ─────────────────────────────────────────────────────────
// Claude (Anthropic) — Deep analysis, options strategies, smart money reasoning
async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({ model:(import.meta.env.VITE_CLAUDE_MODEL||"claude-sonnet-4-20250514"), max_tokens:1000, system,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:user}] })
  });
  const data = await res.json();
  const text = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// Perplexity — Real-time news & live market data (always searches the web)
async function callPerplexity(system, user) {
  const res = await fetch("https://api.perplexity.ai/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`},
    body:JSON.stringify({
      model:(import.meta.env.VITE_PERPLEXITY_MODEL||"llama-3.1-sonar-large-128k-online"),
      messages:[
        {role:"system",content:system},
        {role:"user",content:user}
      ],
      max_tokens:1000,
      temperature:0.2,
      search_recency_filter:"week"
    })
  });
  const data = await res.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// OpenAI GPT-4o — Financial data interpretation & backup engine
async function callOpenAI(system, user) {
  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`},
    body:JSON.stringify({
      model:(import.meta.env.VITE_OPENAI_MODEL||"gpt-4o"),
      max_tokens:1000,
      messages:[
        {role:"system",content:system},
        {role:"user",content:user}
      ],
      temperature:0.3
    })
  });
  const data = await res.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// Smart AI Router — picks the best engine, falls back automatically
async function callAI(system, user, preferredEngine="claude") {
  const engines = {
    claude: ()=>callClaude(system,user),
    perplexity: ()=>callPerplexity(system,user),
    openai: ()=>callOpenAI(system,user),
  };
  // Try preferred engine first, then fall back to others
  const order = preferredEngine==="perplexity"
    ? ["perplexity","claude","openai"]
    : preferredEngine==="openai"
    ? ["openai","claude","perplexity"]
    : ["claude","perplexity","openai"];
  
  for(const engine of order){
    try{
      const key = engine==="claude" ? import.meta.env.VITE_ANTHROPIC_API_KEY
                : engine==="perplexity" ? import.meta.env.VITE_PERPLEXITY_API_KEY
                : import.meta.env.VITE_OPENAI_API_KEY;
      if(!key||key==="undefined") continue; // skip if key not set
      return await engines[engine]();
    }catch(e){
      console.warn(`${engine} failed, trying next engine...`, e.message);
      continue;
    }
  }
  throw new Error("All AI engines failed. Please check your API keys.");
}

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────
const STOCK_SYSTEM = `You are a senior Wall Street quantitative analyst. Search for live earnings, analyst ratings, and recent news. Return ONLY valid JSON (no markdown):
{"verdict":"STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD"|"SELL"|"STRONG SELL","confidence":0-100,"targetUpside":"+XX%","targetPrice":"$XXX","timeframe":"3–6 months"|"6–12 months"|"12–18 months","momentum":0-100,"fundamentals":0-100,"sentiment":0-100,"growth":0-100,"riskScore":0-100,"recentEarnings":"Q[N] YYYY: Revenue $XB (beat/miss X%), EPS $X.XX","epsGrowthYoY":"+XX%","revenueGrowthYoY":"+XX%","peRatio":"XX.X","analystConsensus":"XX Buy/XX Hold/XX Sell — Avg PT $XXX","catalysts":["c1","c2","c3","c4"],"risks":["r1","r2","r3"],"newsHighlights":["n1","n2","n3"],"macroFactors":"2 sentences","whyThisRating":"3–5 sentences with specific numbers","dataSources":["s1","s2","s3"],"lastUpdated":"Month DD YYYY"}`;

const GEM_SYSTEM = `You are a growth equity analyst. Search recent data. Return ONLY valid JSON (no markdown):
{"verdict":"STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD","confidence":0-100,"targetUpside":"+XX%","targetPrice":"$XXX","timeframe":"6–18 months","growthScore":0-100,"riskScore":0-100,"marketCap":"$XB","revenueGrowthYoY":"+XX%","industryTailwind":"1–2 sentences","competitiveEdge":"1–2 sentences","catalysts":["c1","c2","c3"],"risks":["r1","r2"],"whyThisRating":"3–5 sentences with data","dataSources":["s1","s2"]}`;

const IPO_SYSTEM = `You are an IPO analyst. Search latest valuation and filing data. Return ONLY valid JSON (no markdown):
{"buyConfidence":0-100,"verdict":"STRONG BUY"|"BUY"|"SPECULATIVE"|"AVOID","estimatedValuation":"$XB","revenueLatest":"$XB","revenueGrowth":"+XX% YoY","keyStrength":"1 sentence","mainRisk":"1 sentence","whyThisRating":"3–4 sentences","catalysts":["c1","c2","c3"],"comparable":"comp + multiple","dataSources":["s1","s2"]}`;

const OPTIONS_SYSTEM = `You are an expert options trading strategist. Search for earnings date, IV, technicals, options flow. Return ONLY valid JSON (no markdown):
{"ticker":"XXXX","currentPrice":"$XXX","nextEarningsDate":"Month DD YYYY","impliedMove":"±X%","ivRank":"XX%","ivVsHV":"IV XX% vs HV XX%","marketBias":"BULLISH"|"BEARISH"|"NEUTRAL"|"VOLATILE","biasSummary":"2–3 sentences","trades":[{"id":1,"name":"trade name","action":"BUY"|"SELL","type":"CALL"|"PUT","strategy":"Single Leg"|"Vertical Spread"|"Straddle"|"Strangle"|"Iron Condor"|"Cash-Secured Put"|"Covered Call","strike":"$XXX","expiration":"Month DD YYYY","daysToExpiry":0,"contractCost":"$X.XX per contract ($XXX total)","maxProfit":"$XXX","maxLoss":"$XXX","breakeven":"$XXX","profitProbability":"XX%","riskReward":"1:X","riskLevel":"CONSERVATIVE"|"MODERATE"|"AGGRESSIVE","idealFor":"1 sentence","entryTiming":"when to enter","exitStrategy":"take profit/cut loss levels","whyThisTrade":"3–4 sentences with data","warningLabel":"risk warning"},{"id":2},{"id":3}],"keyLevels":{"support":"$XXX","resistance":"$XXX","ma50":"$XXX","ma200":"$XXX"},"optionsDisclaimer":"options risk disclaimer","dataSources":["s1","s2","s3"]}`;

const SMART_MONEY_SYSTEM = `You are a financial intelligence analyst who specializes in tracking smart money — congressional stock disclosures (STOCK Act filings), SEC 13F hedge fund filings, and public fund manager activity. You have deep knowledge of public disclosure databases.

Search for:
1. The most recent publicly disclosed trades by this person/fund (STOCK Act disclosures for Congress, 13F SEC filings for hedge funds, public holdings for fund managers)
2. Their current known portfolio positions and recent buys/sells
3. Any notable trades from the last 6 months with dates and amounts
4. Their overall track record and return history
5. What sectors/stocks they are currently concentrated in

Return ONLY valid JSON (no markdown, no backticks):
{
  "traderName": "Full name",
  "role": "Title / Fund",
  "lastFilingDate": "Month DD YYYY",
  "filingType": "STOCK Act / 13F / Public Holdings",
  "portfolioValue": "$XXB estimated",
  "ytdReturn": "+XX% estimated or per public reports",
  "overallTrackRecord": "1–2 sentences summarizing their historical performance with specific numbers",
  "recentTrades": [
    {
      "date": "Month DD YYYY",
      "ticker": "XXXX",
      "companyName": "Full Company Name",
      "action": "BUY"|"SELL"|"CALL OPTION"|"PUT OPTION",
      "amount": "$XX,XXX – $XXX,XXX (range or exact)",
      "currentSignal": "STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD"|"SELL",
      "signalConfidence": 0-100,
      "whyItMatters": "1–2 sentences on why this trade is significant and what it may signal"
    }
  ],
  "topHoldings": [
    { "ticker": "XXXX", "company": "Name", "sector": "Sector", "concentration": "XX% of portfolio" }
  ],
  "currentSectorFocus": ["Sector 1", "Sector 2", "Sector 3"],
  "investmentStyle": "1–2 sentences describing their approach",
  "copyTradeSignal": "STRONG BUY"|"BUY"|"SPECULATIVE"|"HOLD",
  "copyTradeConfidence": 0-100,
  "copyTradeReasoning": "3–4 sentences on whether retail investors should follow this trader's recent moves RIGHT NOW, citing specific trades, timing, and risk factors.",
  "redFlags": ["flag 1 if any", "flag 2"],
  "dataSources": ["source 1", "source 2", "source 3"],
  "dataDisclaimer": "Note about filing delays or data limitations"
}`;


const TRENDING_SYSTEM = `You are a market intelligence analyst. Search for the hottest stocks right now based on: unusual options activity, social media buzz, analyst upgrades, earnings beats, and momentum. Return ONLY valid JSON (no markdown):
{
  "lastUpdated": "Month DD YYYY HH:MM",
  "marketMood": "BULLISH"|"BEARISH"|"MIXED"|"VOLATILE",
  "moodReason": "1 sentence on overall market sentiment right now",
  "trending": [
    {
      "ticker": "XXXX",
      "name": "Full Company Name",
      "sector": "Sector",
      "reason": "Why it's trending right now in 1 sentence",
      "catalyst": "Specific catalyst: earnings beat / analyst upgrade / news event",
      "momentum": "STRONG"|"MODERATE"|"EARLY",
      "profitPotential": "HIGH"|"MEDIUM"|"SPECULATIVE",
      "confidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE"
    }
  ],
  "topPickToday": "TICKER",
  "topPickReason": "2 sentences on why this is the single best opportunity today"
}`;

const DYNAMIC_WATCHLIST_SYSTEM = `You are a quantitative portfolio analyst. Based on current market conditions, identify the 12 highest profit-potential stocks RIGHT NOW. Search for: momentum leaders, stocks with upcoming catalysts, recent earnings beats, sector rotation trends. Return ONLY valid JSON (no markdown):
{
  "generatedAt": "Month DD YYYY",
  "marketContext": "1 sentence on current market conditions driving these picks",
  "stocks": [
    {
      "ticker": "XXXX",
      "name": "Full Company Name",
      "sector": "Sector",
      "tag": "AI-CORE"|"HOT"|"MOMENTUM"|"VALUE"|"GROWTH"|"SPECULATIVE"|"VOLATILE"|"DIVIDEND"|"BLUE-CHIP",
      "whyNow": "1 sentence on why this stock has high profit potential right now",
      "upside": "+XX%",
      "confidence": 0-100
    }
  ]
}`;


const DYNAMIC_IPO_SYSTEM = `You are an IPO research analyst with access to real-time market data. Search for the most current upcoming IPOs and recent IPO filings. Return ONLY valid JSON (no markdown):
{
  "lastUpdated": "Month DD YYYY",
  "marketNote": "1 sentence on current IPO market conditions",
  "ipos": [
    {
      "name": "Company Name",
      "ticker": "Expected ticker or TBD",
      "sector": "Sector",
      "description": "What the company does and why it matters",
      "estTiming": "Q1 2026 or specific date if known",
      "valuation": "$XXB estimated valuation",
      "lead_underwriter": "Goldman Sachs / Morgan Stanley etc",
      "profitPotential": "HIGH"|"MEDIUM"|"SPECULATIVE",
      "buyConfidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"WATCH"|"AVOID",
      "whyNow": "Key catalyst or reason this IPO is noteworthy right now",
      "risks": "Main risk in 1 sentence"
    }
  ]
}`;

const DYNAMIC_GEMS_SYSTEM = `You are a small/mid-cap stock analyst specializing in finding undervalued breakout opportunities. Search for stocks that are currently flying under the radar but have strong fundamentals and catalysts for significant price appreciation. Focus on stocks under $20B market cap with high growth potential. Return ONLY valid JSON (no markdown):
{
  "lastUpdated": "Month DD YYYY",
  "marketContext": "1 sentence on why these gems are compelling right now",
  "gems": [
    {
      "ticker": "XXXX",
      "name": "Full Company Name",
      "sector": "Sector",
      "marketCap": "$XB",
      "why": "Why this is a hidden gem — specific catalyst or undervaluation thesis",
      "catalyst": "Upcoming catalyst that could drive price up",
      "upside": "+XX% estimated upside",
      "timeframe": "3-6 months",
      "confidence": 0-100,
      "verdict": "STRONG BUY"|"BUY"|"SPECULATIVE",
      "risk": "Main risk in 1 sentence"
    }
  ]
}`;

const DYNAMIC_SMART_MONEY_SYSTEM = `You are a financial intelligence analyst tracking congressional and institutional trading disclosures. Search for the most recent STOCK Act filings from Congress members and SEC 13F filings from top hedge funds. Find any NEW trades, position changes, or notable activity disclosed in the last 45 days. Return ONLY valid JSON (no markdown):
{
  "lastUpdated": "Month DD YYYY HH:MM",
  "totalDisclosures": 0,
  "recentActivity": [
    {
      "trader": "Full Name",
      "role": "U.S. Senator / Hedge Fund Manager etc",
      "category": "CONGRESS"|"HEDGE FUND",
      "trade": "Bought/Sold TICKER",
      "amount": "$XX,000 - $XXX,000",
      "date": "Month DD YYYY",
      "significance": "Why this trade matters — what signal it sends",
      "followSignal": "STRONG BUY"|"BUY"|"WATCH"|"NEUTRAL",
      "confidence": 0-100
    }
  ],
  "hotStocks": ["TICKER1", "TICKER2", "TICKER3"],
  "summary": "2 sentence summary of what smart money is doing right now"
}`;

const DYNAMIC_OPTIONS_SYSTEM = `You are an elite options trader and market analyst. Search for the best options trading opportunities RIGHT NOW based on: unusual options activity (UOA), high implied volatility relative to historical volatility, upcoming earnings catalysts, technical breakout setups, and unusual call/put flow. Return ONLY valid JSON (no markdown):
{
  "lastUpdated": "Month DD YYYY HH:MM",
  "marketVIX": "XX.X",
  "marketCondition": "LOW VOL"|"NORMAL"|"HIGH VOL"|"EXTREME",
  "topOpportunities": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "strategy": "Bull Call Spread / Long Call / Cash Secured Put / Iron Condor etc",
      "signal": "Why this options trade is compelling right now",
      "strike": "$XXX",
      "expiry": "Month DD YYYY",
      "type": "CALL"|"PUT"|"SPREAD",
      "riskLevel": "CONSERVATIVE"|"MODERATE"|"AGGRESSIVE",
      "maxProfit": "+XX%",
      "maxLoss": "-XX%",
      "confidence": 0-100,
      "catalyst": "Specific upcoming catalyst driving this trade",
      "unusualActivity": true|false
    }
  ],
  "unusualActivityAlerts": [
    {
      "ticker": "XXXX",
      "activity": "Description of unusual options flow",
      "bullish": true|false,
      "size": "$XXM in contracts"
    }
  ]
}`;


// ─── DAY TRADING SYSTEM PROMPTS ──────────────────────────────────────────────

const MOMENTUM_MOVERS_SYSTEM = `You are an elite day trading analyst with real-time market access. Search for stocks that are moving significantly RIGHT NOW or in after-hours/pre-market trading. Include stocks with earnings releases, news catalysts, unusual volume, and technical breakouts. Return ONLY valid JSON (no markdown):
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
      "volume": "XXM (Xх avg)",
      "catalyst": "Exact reason for the move — earnings beat/miss, FDA approval, contract win, analyst upgrade, etc",
      "session": "REGULAR"|"AFTER-HOURS"|"PRE-MARKET",
      "momentum": "STRONG"|"BUILDING"|"FADING",
      "entryZone": "$XXX - $XXX",
      "target1": "$XXX",
      "target2": "$XXX",
      "stopLoss": "$XXX",
      "riskReward": "1:X",
      "tradeType": "LONG"|"SHORT",
      "confidence": 0-100,
      "signal": "STRONG BUY"|"BUY"|"WATCH"|"SHORT"|"STRONG SHORT"
    }
  ],
  "marketHighlight": "Most important market development happening right now in 2 sentences"
}`;

const SCALP_SETUPS_SYSTEM = `You are a professional scalp trader specializing in intraday momentum plays. Search for the best scalping opportunities right now — stocks with clear technical setups, high liquidity, and catalyst-driven momentum for quick 1-5% gains. Return ONLY valid JSON (no markdown):
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "session": "PRE-MARKET"|"REGULAR"|"AFTER-HOURS"|"CLOSED",
  "setups": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "setupType": "Breakout"|"Pullback"|"Gap and Go"|"Reversal"|"Squeeze Play"|"Earnings Play",
      "timeframe": "1min"|"5min"|"15min",
      "entry": "$XXX.XX",
      "target": "$XXX.XX",
      "stopLoss": "$XXX.XX",
      "potentialGain": "+X.X%",
      "maxLoss": "-X.X%",
      "riskReward": "1:X",
      "keyLevel": "$XXX (support/resistance)",
      "catalyst": "What is driving this setup",
      "volume": "Current volume vs average",
      "urgency": "NOW"|"WATCH"|"PENDING",
      "confidence": 0-100,
      "notes": "Key things to watch — what invalidates this setup"
    }
  ]
}`;

const SHORT_SQUEEZE_SYSTEM = `You are a short squeeze specialist. Search for stocks with high short interest that are showing signs of an active or imminent short squeeze. Look for: high short float %, rising price despite sell pressure, increasing volume, positive catalysts, and gamma squeeze potential. Return ONLY valid JSON (no markdown):
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "candidates": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "shortFloat": "XX%",
      "daysTocover": "X.X days",
      "shortInterest": "XXM shares",
      "squeezeStage": "BUILDING"|"ACTIVE"|"IMMINENT"|"COOLING",
      "catalyst": "What could trigger or is triggering the squeeze",
      "priceVs52wHigh": "XX% below 52w high",
      "institutionalSupport": "High"|"Medium"|"Low",
      "socialBuzz": "High"|"Medium"|"Low",
      "entryZone": "$XXX - $XXX",
      "squeezeTarget": "$XXX",
      "stopLoss": "$XXX",
      "confidence": 0-100,
      "risk": "Main risk to this squeeze thesis"
    }
  ],
  "activeSqueezes": ["TICKER1", "TICKER2"],
  "summary": "1 sentence on current short squeeze environment"
}`;

const AFTERHOURS_SYSTEM = `You are a market analyst specializing in after-hours and pre-market trading. Search for stocks with significant price movements happening RIGHT NOW in after-hours or pre-market trading. Find earnings releases, news events, analyst actions, and any other catalysts driving after-hours moves. Return ONLY valid JSON (no markdown):
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "session": "AFTER-HOURS"|"PRE-MARKET"|"CLOSED",
  "bigMovers": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "regularClose": "$XXX.XX",
      "afterHoursPrice": "$XXX.XX",
      "afterHoursChange": "+X.XX",
      "afterHoursPct": "+XX.X%",
      "direction": "UP"|"DOWN",
      "catalyst": "Exact reason — earnings beat EPS by $X.XX, revenue $XB vs $XB expected, guidance raised/lowered, etc",
      "catalystType": "EARNINGS"|"NEWS"|"ANALYST"|"FDA"|"CONTRACT"|"OTHER",
      "volume": "After-hours volume",
      "gapType": "EARNINGS_BEAT"|"EARNINGS_MISS"|"NEWS_POSITIVE"|"NEWS_NEGATIVE"|"UPGRADE"|"DOWNGRADE",
      "nextDayOutlook": "BULLISH"|"BEARISH"|"UNCERTAIN",
      "dayTradePlan": "How to trade this tomorrow at open — gap and go vs fade strategy",
      "keyLevels": "Key price levels to watch at open",
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
      "impliedMove": "±X%",
      "optionsSignal": "BULLISH"|"BEARISH"|"NEUTRAL"
    }
  ],
  "tomorrowWatchlist": ["TICKER1","TICKER2","TICKER3"],
  "summary": "2 sentences on key after-hours developments and what to watch tomorrow"
}`;

const PREMARKET_SYSTEM = `You are a pre-market trading specialist. Search for stocks showing significant pre-market activity and identify the best day trading opportunities for today's market open. Return ONLY valid JSON (no markdown):
{
  "timestamp": "Month DD YYYY HH:MM ET",
  "marketOutlook": "BULLISH OPEN"|"BEARISH OPEN"|"FLAT OPEN"|"VOLATILE OPEN",
  "futuresSnapshot": {
    "sp500": "+/-X.X%",
    "nasdaq": "+/-X.X%",
    "dow": "+/-X.X%",
    "vix": "XX.X"
  },
  "preMarketMovers": [
    {
      "ticker": "XXXX",
      "name": "Company Name",
      "preMarketPrice": "$XXX.XX",
      "preMarketChange": "+/-X.XX",
      "preMarketPct": "+/-XX.X%",
      "catalyst": "What happened overnight or this morning",
      "gapDirection": "UP"|"DOWN",
      "gapSize": "SMALL (<2%)"|"MEDIUM (2-5%)"|"LARGE (5-10%)"|"HUGE (10%+)",
      "tradeStrategy": "Gap and Go"|"Gap Fill"|"Wait and See",
      "keyOpenLevel": "$XXX",
      "firstTarget": "$XXX",
      "stopLoss": "$XXX",
      "confidence": 0-100
    }
  ],
  "earningsBeforeOpen": ["TICKER1","TICKER2"],
  "economicEvents": "Key economic data releases today that could move markets",
  "dayTradingBias": "Overall direction bias for today's session based on pre-market data"
}`;

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const fm = (color,size=12,extra={})=>({fontFamily:"'DM Sans',sans-serif",fontSize:size,color,...extra});

function Pulse({color,size=7}){
  return <span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`,animation:"pulseDot 1.4s ease-in-out infinite"}}/>;
}
function Tag({label,color=MUTED}){
  return <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:0.5,color,background:color+"18",border:`1px solid ${color}44`,borderRadius:4,padding:"3px 9px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;
}
function ScoreRow({label,value,color}){
  return(
    <div style={{marginBottom:6}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:MUTED,letterSpacing:0.3,textTransform:"uppercase"}}>{label}</span>
        <span style={fm(color,9)}>{value}/100</span>
      </div>
      <div style={{background:DIM,borderRadius:2,height:3}}>
        <div style={{width:`${value}%`,height:"100%",background:color,borderRadius:2,boxShadow:`0 0 5px ${color}88`,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
    </div>
  );
}
function ConfidenceMeter({confidence,verdict}){
  const c=CONFIDENCE_MAP[verdict]||CONFIDENCE_MAP["HOLD"];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase"})}>Buy Confidence</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:c.color,textShadow:`0 0 14px ${c.color}66`}}>{confidence}%</span>
          <span style={{...fm(c.color,9),background:c.color+"18",border:`1px solid ${c.color}33`,borderRadius:3,padding:"2px 8px",letterSpacing:1}}>{c.pct}</span>
        </div>
      </div>
      <div style={{background:DIM,borderRadius:8,height:8,overflow:"hidden"}}>
        <div style={{width:`${confidence}%`,height:"100%",background:`linear-gradient(90deg,${c.color}66,${c.color})`,borderRadius:8,boxShadow:`0 0 10px ${c.color}55`,transition:"width 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
    </div>
  );
}
function InfoBox({label,value,color=WHITE,bg=DIM}){
  return(
    <div style={{background:bg,border:`1px solid ${BORDER}`,borderRadius:5,padding:"8px 11px"}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:MUTED,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color,lineHeight:1.5,fontWeight:500}}>{value}</div>
    </div>
  );
}
function WhyBox({text,icon="🔍",label="WHY THIS RATING — DATA-BACKED REASONING"}){
  return(
    <div style={{background:"#0a1020",border:`1px solid ${BLUE}33`,borderRadius:6,padding:"13px 14px",borderLeft:`3px solid ${BLUE}`}}>
      <div style={fm(BLUE,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:8})}>{icon} {label}</div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#b0c4de",lineHeight:1.8}}>{text}</p>
    </div>
  );
}
function LoadingAnim({msg="FETCHING LIVE DATA..."}){
  return(
    <div style={{padding:"22px 0",textAlign:"center"}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:GREEN,letterSpacing:1,marginBottom:10}}>{msg}</div>
      <div style={{display:"flex",justifyContent:"center",gap:3}}>
        {Array.from({length:9},(_,i)=>(
          <div key={i} style={{width:3,borderRadius:2,background:GREEN,height:18,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`,opacity:0.75}}/>
        ))}
      </div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:MUTED,marginTop:9}}>Searching public disclosures · SEC filings · STOCK Act records</div>
    </div>
  );
}
function MiniSpark({trend,color}){
  const base=trend==="up"?[26,29,27,34,31,38,36,43,41,49,46,54]:[54,51,49,53,46,48,41,44,38,40,34,30];
  const noise=base.map(p=>p+(Math.random()-.5)*3);
  const w=100,h=34,min=Math.min(...noise),max=Math.max(...noise);
  const pts=noise.map((p,i)=>`${(i/(noise.length-1))*w},${h-((p-min)/(max-min+.001))*(h-4)-2}`).join(" ");
  const uid=`sg${Math.random().toString(36).slice(2,7)}`;
  return(
    <svg width={w} height={h}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.22"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${uid})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function SectionLabel({children,color=MUTED,icon=""}){
  return <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8,color}}>{icon&&icon+" "}{children}</div>;
}

// ─── TICKER TAPE ──────────────────────────────────────────────────────────────
function TickerTape({marketStatus}){
  const items=ALL_STOCKS.map(s=>({t:s.ticker,v:((Math.random()-.45)*7).toFixed(2)}));
  return(
    <div style={{background:"#04060a",borderBottom:`1px solid ${BORDER}`,overflow:"hidden",padding:"5px 0",display:"flex",alignItems:"center"}}>
      <div style={{minWidth:160,padding:"0 14px",borderRight:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
        <Pulse color={marketStatus.color}/><span style={fm(marketStatus.color,9,{letterSpacing:1,whiteSpace:"nowrap"})}>{marketStatus.label}</span>
      </div>
      <div style={{overflow:"hidden",flex:1}}>
        <div style={{display:"flex",gap:28,whiteSpace:"nowrap",animation:"tickerScroll 35s linear infinite",width:"max-content"}}>
          {[...items,...items].map((item,i)=>(
            <span key={i} style={fm(item.v>=0?GREEN:RED,10)}>{item.t} {item.v>=0?"+":""}{item.v}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}
function Legend(){
  return(
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:7,padding:"11px 16px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:WHITE,letterSpacing:0.5,textTransform:"uppercase",marginRight:8}}>Confidence Scale:</span>
      {Object.entries(CONFIDENCE_MAP).map(([v,c])=>(
        <div key={v} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c.color,boxShadow:`0 0 6px ${c.color}`}}/>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:c.color}}>{c.pct} — {c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SMART MONEY TAB ──────────────────────────────────────────────────────────
function SmartMoneyTraderCard({ trader, subscribed, onPaywall }) {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!subscribed) { onPaywall(); return; }
    setState("loading");
    setResult(null);
    setError(null);
    try {
      const r = await callAI(SMART_MONEY_SYSTEM,
        `Research the most recent public trading disclosures for ${trader.name} (${trader.role}). Data source: ${trader.dataSource}. Search for: (1) their most recent STOCK Act disclosures or 13F SEC filings or public holdings updates, (2) specific stocks bought/sold in the last 3–6 months with dates and amounts, (3) their current portfolio concentration, (4) any notable recent trades that retail investors should be aware of. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Be specific with tickers, amounts, and dates from actual public records.`
      );
      setResult(r);
      setState("done");
    } catch(e) {
      setError("Failed to load disclosures — please retry.");
      setState("error");
    }
  };

  const cc = result ? (CONFIDENCE_MAP[result.copyTradeSignal] || CONFIDENCE_MAP["HOLD"]) : null;

  return (
    <div style={{
      background: CARD, border: `1px solid ${cc ? cc.color+"33" : BORDER}`,
      borderRadius: 10, overflow:"hidden",
      boxShadow: cc ? `0 0 24px ${cc.color}0a` : "none",
      transition: "border-color .3s, box-shadow .3s"
    }}>
      {/* Trader Header */}
      <div style={{ padding:"18px 18px 14px", background: trader.categoryColor+"08", borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          {/* Avatar */}
          <div style={{
            width:52, height:52, borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg, ${trader.avatarColor}33, ${trader.avatarColor}11)`,
            border:`2px solid ${trader.avatarColor}55`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 16px ${trader.avatarColor}22`
          }}>
            <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:18, color:trader.avatarColor, letterSpacing:1 }}>{trader.avatar}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
              <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, color:WHITE, letterSpacing:2, lineHeight:1 }}>{trader.name}</span>
              <Tag label={trader.category} color={trader.categoryColor}/>
            </div>
            <div style={fm(MUTED,12,{marginBottom:6})}>{trader.role}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Tag label={trader.track} color={MUTED}/>
              <Tag label={trader.historicalReturn} color={GREEN}/>
            </div>
          </div>
        </div>

        {/* Known For */}
        <div style={{ marginTop:12, background:DIM, borderRadius:5, padding:"9px 11px", borderLeft:`2px solid ${trader.avatarColor}` }}>
          <div style={fm(trader.avatarColor,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>🏆 Known For</div>
          <p style={fm("#8a9aaa",13,{lineHeight:1.7})}>{trader.knownFor}</p>
        </div>

        {/* Data source badge */}
        <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10 }}>📂</span>
          <span style={fm(MUTED,12,{letterSpacing:1})}>Source: {trader.dataSource} (public record)</span>
        </div>
      </div>

      {/* Action area */}
      <div style={{ padding:"14px 18px 18px" }}>
        {state === "idle" && (
          <button onClick={run} style={{
            width:"100%",
            background: subscribed ? `linear-gradient(135deg, ${PINK}18, ${PINK}08)` : DIM,
            border: `1px solid ${subscribed ? PINK+"44" : BORDER}`,
            color: subscribed ? PINK : MUTED,
            fontFamily:"'Space Mono',monospace", fontSize:12, letterSpacing:2,
            padding:"11px 0", borderRadius:5, cursor:"pointer", textTransform:"uppercase"
          }}>
            {subscribed ? `👁 LOAD ${trader.name.split(" ").pop().toUpperCase()}'S TRADES` : "🔒 PRO — Unlock Smart Money Tracker"}
          </button>
        )}

        {state === "loading" && <LoadingAnim msg={`SEARCHING ${trader.name.toUpperCase()} PUBLIC DISCLOSURES...`}/>}

        {state === "error" && (
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={fm(RED,9)}>{error}</span>
            <button onClick={()=>setState("idle")} style={{ background:"none", border:"none", color:GREEN, cursor:"pointer",...fm(GREEN,9) }}>Retry</button>
          </div>
        )}

        {state === "done" && result && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Copy Trade Signal */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:cc.color+"0d", border:`1px solid ${cc.color}33`, borderRadius:7 }}>
              <div>
                <div style={fm(MUTED,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:4})}>Copy Trade Signal</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, color:cc.color, letterSpacing:3, textShadow:`0 0 12px ${cc.color}55` }}>{result.copyTradeSignal}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:34, color:cc.color, textShadow:`0 0 16px ${cc.color}66`, lineHeight:1 }}>{result.copyTradeConfidence}%</div>
                <div style={fm(MUTED,8)}>Follow Confidence</div>
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase"})}>Follow Signal Strength</span>
                <span style={fm(cc.color,9)}>{result.copyTradeConfidence}%</span>
              </div>
              <div style={{ background:DIM, borderRadius:8, height:8 }}>
                <div style={{ width:`${result.copyTradeConfidence}%`, height:"100%", background:`linear-gradient(90deg,${cc.color}55,${cc.color})`, borderRadius:8, boxShadow:`0 0 10px ${cc.color}44`, transition:"width 1.4s cubic-bezier(.4,0,.2,1)" }}/>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <InfoBox label="Last Filing Date"   value={result.lastFilingDate   || "—"} color={GOLD}/>
              <InfoBox label="Portfolio Est."      value={result.portfolioValue   || "—"} color={WHITE}/>
              <InfoBox label="YTD Return"          value={result.ytdReturn        || "—"} color={GREEN}/>
              <InfoBox label="Filing Type"         value={result.filingType       || "—"} color={CYAN}/>
            </div>

            {/* Track record */}
            {result.overallTrackRecord && (
              <div style={{ background:DIM, borderRadius:5, padding:"9px 11px", borderLeft:`2px solid ${GOLD}` }}>
                <SectionLabel color={GOLD} icon="📈">Track Record</SectionLabel>
                <p style={fm("#9aabb8",13,{lineHeight:1.7})}>{result.overallTrackRecord}</p>
              </div>
            )}

            {/* Recent trades */}
            {result.recentTrades?.length > 0 && (
              <div>
                <SectionLabel color={PINK} icon="🔔">Recent Public Disclosures</SectionLabel>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {result.recentTrades.map((trade, i) => {
                    const tc = CONFIDENCE_MAP[trade.currentSignal] || CONFIDENCE_MAP["HOLD"];
                    const isB = trade.action.includes("BUY") || trade.action.includes("CALL");
                    return (
                      <div key={i} style={{
                        background: DIM, border:`1px solid ${isB ? GREEN+"33" : RED+"33"}`,
                        borderRadius:6, padding:"11px 13px"
                      }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:18, color:WHITE, letterSpacing:2 }}>{trade.ticker}</span>
                            <span style={{
                              fontFamily:"'Bebas Neue',cursive", fontSize:12, letterSpacing:2,
                              color: isB ? GREEN : RED,
                              background: isB ? GREEN+"14" : RED+"14",
                              border: `1px solid ${isB ? GREEN+"44" : RED+"44"}`,
                              borderRadius:4, padding:"2px 8px"
                            }}>{isB ? "↑" : "↓"} {trade.action}</span>
                            <Tag label={trade.currentSignal} color={tc.color}/>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={fm(GOLD,10,{fontWeight:"bold"})}>{trade.amount}</div>
                            <div style={fm(MUTED,8)}>{trade.date}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                          <span style={fm(MUTED,9)}>{trade.companyName}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <span style={fm(MUTED,8)}>Signal:</span>
                            <span style={fm(tc.color,9,{letterSpacing:1})}>{trade.signalConfidence}%</span>
                          </div>
                        </div>
                        {/* Signal confidence mini bar */}
                        <div style={{ background:"#0a0e14", borderRadius:3, height:3, marginBottom:8 }}>
                          <div style={{ width:`${trade.signalConfidence}%`, height:"100%", background:tc.color, borderRadius:3 }}/>
                        </div>
                        <p style={fm("#8ab0cc",13,{lineHeight:1.65})}>{trade.whyItMatters}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top holdings */}
            {result.topHoldings?.length > 0 && (
              <div>
                <SectionLabel color={MUTED} icon="💼">Top Portfolio Holdings</SectionLabel>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {result.topHoldings.map((h,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:DIM, borderRadius:4 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:16, color:WHITE, letterSpacing:2, minWidth:55 }}>{h.ticker}</span>
                        <span style={fm(MUTED,9)}>{h.company}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Tag label={h.sector} color={MUTED}/>
                        <span style={fm(GOLD,13,{minWidth:60,textAlign:"right"})}>{h.concentration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sector focus */}
            {result.currentSectorFocus?.length > 0 && (
              <div>
                <SectionLabel color={MUTED} icon="🎯">Current Sector Focus</SectionLabel>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {result.currentSectorFocus.map((s,i) => <Tag key={i} label={s} color={BLUE}/>)}
                </div>
              </div>
            )}

            {/* Copy trade reasoning */}
            {result.copyTradeReasoning && (
              <div style={{ background:"#0a1020", border:`1px solid ${PINK}33`, borderRadius:6, padding:"13px 14px", borderLeft:`3px solid ${PINK}` }}>
                <div style={fm(PINK,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:8})}>🤔 SHOULD YOU FOLLOW THIS TRADER?</div>
                <p style={fm("#cfa0b5",13,{lineHeight:1.9})}>{result.copyTradeReasoning}</p>
              </div>
            )}

            {/* Red flags */}
            {result.redFlags?.filter(f=>f&&f.length>3).length > 0 && (
              <div style={{ background:RED+"08", border:`1px solid ${RED}33`, borderRadius:5, padding:"10px 12px" }}>
                <SectionLabel color={RED} icon="⚠">Watch Out For</SectionLabel>
                {result.redFlags.filter(f=>f&&f.length>3).map((rf,i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <span style={{ color:RED, fontSize:12, flexShrink:0 }}>▼</span>
                    <span style={fm("#9a7a7a",9,{lineHeight:1.65})}>{rf}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Investment style */}
            {result.investmentStyle && (
              <div style={{ background:DIM, borderRadius:5, padding:"8px 10px" }}>
                <SectionLabel color={PURPLE} icon="🧠">Investment Style</SectionLabel>
                <p style={fm("#8a8aaa",9,{lineHeight:1.65})}>{result.investmentStyle}</p>
              </div>
            )}

            {/* Data disclaimer */}
            {result.dataDisclaimer && (
              <div style={{ background:ORANGE+"08", border:`1px solid ${ORANGE}33`, borderRadius:5, padding:"9px 12px", display:"flex", gap:8 }}>
                <span style={{ fontSize:12, flexShrink:0 }}>⚠️</span>
                <p style={fm(ORANGE,12,{lineHeight:1.7})}>{result.dataDisclaimer}</p>
              </div>
            )}

            {/* Sources */}
            {result.dataSources?.length > 0 && (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {result.dataSources.map((ds,i) => <Tag key={i} label={ds} color={MUTED}/>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SmartMoneyTab({ subscribed, onPaywall }) {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const filtered = categoryFilter === "ALL"
    ? SMART_MONEY_TRADERS
    : SMART_MONEY_TRADERS.filter(t => t.category === categoryFilter);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, color:PINK, letterSpacing:3, textShadow:`0 0 20px ${PINK}44`, marginBottom:6 }}>
          Smart Money Tracker 🕵️
        </div>
        <p style={fm(MUTED,10,{lineHeight:1.7,maxWidth:660})}>
          Track the publicly disclosed trades of elite investors — congressional members (via STOCK Act filings), hedge fund whales (via SEC 13F reports), and star fund managers (via public holdings). All data is sourced from legally required public records.
        </p>
      </div>

      {/* How it works */}
      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"14px 18px", marginBottom:18 }}>
        <div style={fm(MUTED,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:10})}>📚 How Smart Money Data Works</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          {[
            { icon:"🏛️", label:"Congress (STOCK Act)", desc:"Members of Congress must disclose trades within 45 days. Data is public via house.gov and senate.gov.", color:BLUE },
            { icon:"🏦", label:"Hedge Funds (13F)", desc:"Funds >$100M AUM must file quarterly 13Fs with the SEC showing all long equity positions.", color:GOLD },
            { icon:"📊", label:"Fund Managers", desc:"Some managers like Cathie Wood publish daily holdings changes publicly on their fund websites.", color:PURPLE },
          ].map(({icon,label,desc,color})=>(
            <div key={label} style={{ background:DIM, borderRadius:5, padding:"10px 12px", borderLeft:`2px solid ${color}` }}>
              <div style={fm(color,9,{letterSpacing:1,marginBottom:4})}>{icon} {label}</div>
              <p style={fm(MUTED,12,{lineHeight:1.65})}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {TRADER_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
            background: categoryFilter === cat ? PINK+"22" : DIM,
            border: `1px solid ${categoryFilter === cat ? PINK+"55" : BORDER}`,
            color: categoryFilter === cat ? PINK : MUTED,
            fontFamily:"'Bebas Neue',cursive", fontSize:13, letterSpacing:2,
            padding:"6px 16px", borderRadius:5, cursor:"pointer", transition:"all .15s"
          }}>{cat}</button>
        ))}
        <span style={fm(MUTED,12,{alignSelf:"center",marginLeft:4})}>{filtered.length} traders</span>
      </div>

      {/* Legal note */}
      <div style={{ background:"#0a0e14", border:`1px solid ${BLUE}22`, borderRadius:6, padding:"10px 14px", marginBottom:20, display:"flex", gap:10 }}>
        <span style={{ fontSize:13, flexShrink:0 }}>⚖️</span>
        <p style={fm(MUTED,12,{lineHeight:1.7})}>
          <span style={{ color:BLUE }}>All data shown is from legally mandated public disclosures.</span> Congressional trades are disclosed via the STOCK Act (2012). Hedge fund positions come from SEC 13F quarterly filings. Copy-trading based on this data is legal. Note: Congress disclosures can lag up to 45 days; 13F filings lag up to 45 days after quarter end.
        </p>
      </div>

      {/* Live Activity Section */}
      <div style={{background:`${GOLD}08`,border:`1px solid ${GOLD}33`,borderRadius:8,padding:18,marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:liveActivity?14:0}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:GOLD,letterSpacing:2,marginBottom:3}}>⚡ Live Activity Feed</div>
            <div style={fm(MUTED,12)}>Most recent congressional trades & hedge fund moves — updated in real time</div>
          </div>
          <button onClick={onRefreshActivity} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"8px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
            {activityLoading?"FETCHING...":"🔄 REFRESH ACTIVITY"}
          </button>
        </div>

        {activityLoading&&(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={fm(GOLD,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>SCANNING LATEST DISCLOSURES & FILINGS...</div>
            <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:7},(_,i)=><div key={i} style={{width:3,height:16,background:GOLD,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.1}s infinite alternate`,opacity:0.8}}/>)}</div>
          </div>
        )}

        {!liveActivity&&!activityLoading&&(
          <div style={{textAlign:"center",padding:"12px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>
            Click "Refresh Activity" to see the latest smart money moves
          </div>
        )}

        {liveActivity&&!activityLoading&&(
          <div>
            <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <p style={fm(MUTED,12,{flex:1,lineHeight:1.6})}>{liveActivity.summary}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {liveActivity.hotStocks?.map((s,i)=>(
                  <div key={i} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:GREEN,letterSpacing:1}}>{s}</div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
              {liveActivity.recentActivity?.map((act,i)=>{
                const signalColor = act.followSignal==="STRONG BUY"?GREEN:act.followSignal==="BUY"?GREEN:act.followSignal==="WATCH"?GOLD:MUTED;
                return(
                  <div key={i} style={{background:"#0a0e16",border:`1px solid ${signalColor}33`,borderRadius:6,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:WHITE,marginBottom:2}}>{act.trader}</div>
                        <div style={fm(MUTED,11)}>{act.role}</div>
                      </div>
                      <Tag label={act.category} color={act.category==="CONGRESS"?BLUE:GOLD}/>
                    </div>
                    <div style={{background:DIM,borderRadius:4,padding:"6px 10px",marginBottom:8,borderLeft:`2px solid ${signalColor}`}}>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:signalColor,letterSpacing:1,marginBottom:2}}>{act.trade}</div>
                      <div style={fm(MUTED,11)}>{act.amount} • {act.date}</div>
                    </div>
                    <p style={fm("#8a9aaa",12,{lineHeight:1.6,marginBottom:8})}>{act.significance}</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <Tag label={act.followSignal} color={signalColor}/>
                      <Tag label={`${act.confidence}% CONFIDENCE`} color={signalColor}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Trader grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))", gap:18 }}>
        {filtered.map(trader => (
          <SmartMoneyTraderCard
            key={trader.id}
            trader={trader}
            subscribed={subscribed}
            onPaywall={onPaywall}
          />
        ))}
      </div>
    </div>
  );
}

// ─── OPTIONS TAB ──────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  CONSERVATIVE:{ color:GREEN,  icon:"🛡️", desc:"Lower risk, defined max loss" },
  MODERATE:    { color:GOLD,   icon:"⚖️", desc:"Balanced risk/reward"         },
  AGGRESSIVE:  { color:RED,    icon:"🔥", desc:"High risk, experienced only"  },
};
const BIAS_CONFIG = {
  BULLISH: {color:GREEN,  icon:"🐂"},
  BEARISH: {color:RED,    icon:"🐻"},
  NEUTRAL: {color:BLUE,   icon:"➡️"},
  VOLATILE:{color:ORANGE, icon:"⚡"},
};

function OptionTradeCard({trade,index}){
  const [expanded,setExpanded]=useState(false);
  const ac={BUY:{color:GREEN,bg:GREEN+"12",border:GREEN+"44",icon:"↑",label:"BUY"},SELL:{color:RED,bg:RED+"12",border:RED+"44",icon:"↓",label:"SELL"}}[trade.action]||{color:GREEN,bg:GREEN+"12",border:GREEN+"44",icon:"↑",label:"BUY"};
  const tc={CALL:{color:GREEN,icon:"📈",desc:"Profits when stock goes UP"},PUT:{color:RED,icon:"📉",desc:"Profits when stock goes DOWN"}}[trade.type]||{color:GREEN,icon:"📈"};
  const rc=RISK_CONFIG[trade.riskLevel]||RISK_CONFIG.MODERATE;
  return(
    <div style={{background:DIM,border:`1px solid ${expanded?ac.color+"55":BORDER}`,borderRadius:8,overflow:"hidden",transition:"border-color .2s"}}>
      <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,background:ac.bg}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:ac.color+"22",border:`1px solid ${ac.color}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:ac.color}}>{index}</span>
          </div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:17,color:WHITE,letterSpacing:2,marginBottom:4}}>{trade.name}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:12,color:ac.color,background:ac.bg,border:`1px solid ${ac.border}`,borderRadius:4,padding:"2px 10px",letterSpacing:2}}>{ac.icon} {ac.label}</span>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:12,color:tc.color,background:tc.color+"12",border:`1px solid ${tc.color}44`,borderRadius:4,padding:"2px 10px",letterSpacing:2}}>{tc.icon} {trade.type}</span>
              <span style={{...fm(rc.color,8),background:rc.color+"14",border:`1px solid ${rc.color}33`,borderRadius:3,padding:"2px 8px",letterSpacing:1,textTransform:"uppercase"}}>{rc.icon} {trade.riskLevel}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          {[["STRIKE",trade.strike,GOLD],["EXPIRY",`${trade.daysToExpiry}d`,CYAN],["WIN %",trade.profitProbability,GREEN]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:17,color:c}}>{v}</div>
              <div style={fm(MUTED,12,{letterSpacing:1})}>{l}</div>
            </div>
          ))}
          <button onClick={()=>setExpanded(e=>!e)} style={{background:ac.color+"18",border:`1px solid ${ac.color}44`,color:ac.color,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>{expanded?"▲":"▼"}</button>
        </div>
      </div>
      {expanded&&(
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,borderTop:`1px solid ${BORDER}`}}>
          <div style={{background:"#0a1520",border:`1px solid ${CYAN}33`,borderRadius:6,padding:"12px 14px"}}>
            <div style={fm(CYAN,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:8})}>💡 PLAIN ENGLISH EXPLANATION</div>
            <p style={fm(WHITE,10,{lineHeight:1.9})}>
              You are <strong style={{color:ac.color}}>{trade.action}ING</strong> a <strong style={{color:tc.color}}>{trade.type}</strong> option.{" "}
              {trade.type==="CALL"?`A CALL gives you the right to buy 100 shares at ${trade.strike}. You profit when the stock rises above ${trade.breakeven} before expiry.`:`A PUT gives you the right to sell 100 shares at ${trade.strike}. You profit when the stock falls below ${trade.breakeven} before expiry.`}
              {" "}{trade.action==="BUY"?`You PAY ${trade.contractCost} upfront. Max loss is limited to the premium paid.`:`You COLLECT premium upfront. Your risk is larger if the stock moves against you.`}
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[["Cost",trade.contractCost,GOLD],["Max Profit",trade.maxProfit,GREEN],["Max Loss",trade.maxLoss,RED],["Breakeven",trade.breakeven,WHITE],["Risk/Reward",trade.riskReward,CYAN],["Expires",trade.expiration,PURPLE]].map(([l,v,c])=>(
              <InfoBox key={l} label={l} value={v} color={c}/>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:GREEN+"0d",border:`1px solid ${GREEN}33`,borderRadius:5,padding:"10px 12px"}}><div style={fm(GREEN,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:6})}>⏰ When to Enter</div><p style={fm(WHITE,13,{lineHeight:1.7})}>{trade.entryTiming}</p></div>
            <div style={{background:GOLD+"0d",border:`1px solid ${GOLD}33`,borderRadius:5,padding:"10px 12px"}}><div style={fm(GOLD,12,{letterSpacing:1,textTransform:"uppercase",marginBottom:6})}>🎯 How to Exit</div><p style={fm(WHITE,13,{lineHeight:1.7})}>{trade.exitStrategy}</p></div>
          </div>
          <WhyBox text={trade.whyThisTrade} icon="📊" label="WHY THIS TRADE — DATA-BACKED"/>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{fontSize:13}}>👤</span><div><div style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase",marginBottom:3})}>Ideal For</div><p style={fm("#9aabb8",13,{lineHeight:1.6})}>{trade.idealFor}</p></div></div>
          {trade.warningLabel&&<div style={{background:ORANGE+"0d",border:`1px solid ${ORANGE}44`,borderRadius:5,padding:"9px 12px",display:"flex",gap:8}}><span style={{fontSize:13,flexShrink:0}}>⚠️</span><p style={fm(ORANGE,13,{lineHeight:1.65})}>{trade.warningLabel}</p></div>}
        </div>
      )}
    </div>
  );
}

function OptionsResult({result}){
  if(!result) return null;
  const bias = result.marketBias?(BIAS_CONFIG[result.marketBias]||BIAS_CONFIG.NEUTRAL):null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {bias&&(
        <div style={{background:DIM,borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:18}}>{bias.icon}</span>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:bias.color,letterSpacing:2}}>{result.marketBias} BIAS</span>
          {result.ivRank&&<Tag label={`IV Rank: ${result.ivRank}`} color={MUTED}/>}
          {result.nextEarnings&&<Tag label={`Earnings: ${result.nextEarnings}`} color={GOLD}/>}
        </div>
      )}
      <div>
        <div style={fm(MUTED,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:8})}>3 Trade Setups</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{result.trades?.map((trade,i)=><OptionTradeCard key={i} trade={trade} index={i+1}/>)}</div>
      </div>
    </div>
  );
}

function OptionsTab({subscribed,onPaywall}){
  const [selectedTicker,setSelectedTicker]=useState("NVDA");
  const [state,setState]=useState("idle");
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const [customOptTicker,setCustomOptTicker]=useState("");
  const [customOptLoading,setCustomOptLoading]=useState(false);
  const [customOptResult,setCustomOptResult]=useState(null);
  const selectedStock=OPTIONS_UNIVERSE.find(s=>s.ticker===selectedTicker)||OPTIONS_UNIVERSE[0];

  const analyzeCustomOptions = async () => {
    if(!customOptTicker.trim()) return;
    if(!subscribed&&!BETA_MODE){onPaywall();return;}
    setCustomOptLoading(true);
    setCustomOptResult(null);
    const ticker = customOptTicker.toUpperCase().trim();
    try{
      const r = await callAI(OPTIONS_SYSTEM,
        `Generate 3 options setups for ${ticker}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Search for: current stock price, next earnings date, current implied volatility vs historical volatility, recent price action, key support/resistance levels, any upcoming catalysts. Provide 3 distinct trades — conservative, moderate, aggressive.`
      );
      setCustomOptResult({ticker, result: r});
    }catch(e){
      alert("Could not analyze options for "+ticker+". Check the ticker and try again.");
    }
    setCustomOptLoading(false);
  };
  const run=async()=>{
    if(!subscribed&&!BETA_MODE){onPaywall();return;}
    setState("loading");setResult(null);setError(null);
    try{
      const r=await callAI(OPTIONS_SYSTEM,`Generate 3 options setups for ${selectedTicker} (${selectedStock.name}). Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Search for next earnings date, current IV vs HV, recent price action, key levels. Provide 3 distinct trades — conservative, moderate, aggressive.`);
      setResult(r);setState("done");
    }catch(e){setError("Options analysis failed.");setState("error");}
  };
  const bias=result?(BIAS_CONFIG[result.marketBias]||BIAS_CONFIG.NEUTRAL):null;
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:ORANGE,letterSpacing:3,textShadow:`0 0 20px ${ORANGE}44`,marginBottom:6}}>Options Trading 📊</div>
        <p style={fm(MUTED,12,{lineHeight:1.7,maxWidth:640})}>AI-powered options trade suggestions based on live earnings dates, IV, technicals, and market catalysts. 3 setups per stock — conservative to aggressive.</p>
      </div>

      {/* ── HOT OPTIONS OPPORTUNITIES ─────────────────────────────── */}
      <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:8,padding:18,marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:ORANGE,letterSpacing:2,marginBottom:3}}>🔥 Hot Options Right Now</div>
            <div style={fm(MUTED,12)}>AI-detected unusual options activity, high-profit setups, and upcoming earnings plays</div>
          </div>
          <button onClick={onFetchDynamic} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"8px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
            {dynamicOptionsLoading?"SCANNING...":"🔄 SCAN MARKET"}
          </button>
        </div>

        {dynamicOptionsLoading&&(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={fm(ORANGE,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>SCANNING FOR UNUSUAL OPTIONS ACTIVITY...</div>
            <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:7},(_,i)=><div key={i} style={{width:3,height:16,background:ORANGE,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.1}s infinite alternate`,opacity:0.8}}/>)}</div>
            <div style={fm(MUTED,11,{marginTop:8})}>Searching for high-profit options setups and unusual activity...</div>
          </div>
        )}

        {!dynamicOptions&&!dynamicOptionsLoading&&(
          <div style={{textAlign:"center",padding:"12px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>
            Click "Scan Market" to find today's highest-profit options opportunities
          </div>
        )}

        {dynamicOptions&&!dynamicOptionsLoading&&(
          <div>
            {/* Market conditions banner */}
            <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div>
                  <div style={fm(MUTED,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2})}>VIX</div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:ORANGE}}>{dynamicOptions.marketVIX}</div>
                </div>
                <Tag label={dynamicOptions.marketCondition} color={dynamicOptions.marketCondition==="LOW VOL"?GREEN:dynamicOptions.marketCondition==="HIGH VOL"?RED:GOLD}/>
              </div>
              <div style={fm(MUTED,11)}>Updated: {dynamicOptions.lastUpdated}</div>
            </div>

            {/* Unusual Activity Alerts */}
            {dynamicOptions.unusualActivityAlerts?.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={fm(RED,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:10})}>⚡ Unusual Activity Alerts</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {dynamicOptions.unusualActivityAlerts.map((alert,i)=>(
                    <div key={i} style={{background:DIM,borderRadius:5,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,borderLeft:`2px solid ${alert.bullish?GREEN:RED}`}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:WHITE,letterSpacing:1}}>{alert.ticker}</span>
                        <Tag label={alert.bullish?"BULLISH FLOW":"BEARISH FLOW"} color={alert.bullish?GREEN:RED}/>
                        <span style={fm(MUTED,12)}>{alert.activity}</span>
                      </div>
                      <Tag label={alert.size} color={GOLD}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top opportunities grid */}
            <div style={fm(ORANGE,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:12})}>Top Opportunities ({dynamicOptions.topOpportunities?.length})</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
              {dynamicOptions.topOpportunities?.map((opp,i)=>{
                const rc=RISK_CONFIG[opp.riskLevel]||RISK_CONFIG.MODERATE;
                return(
                  <div key={i} style={{background:"#0a0e16",border:`1px solid ${rc.color}44`,borderRadius:7,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{opp.ticker}</span>
                          {opp.unusualActivity&&<Tag label="🔥 UOA" color={RED}/>}
                        </div>
                        <div style={fm(MUTED,12,{marginBottom:4})}>{opp.name}</div>
                        <Tag label={`${opp.type} • ${opp.strategy}`} color={opp.type==="CALL"?GREEN:opp.type==="PUT"?RED:GOLD}/>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:GREEN}}>{opp.maxProfit}</div>
                        <div style={fm(MUTED,9)}>MAX PROFIT</div>
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

      {/* ── CUSTOM TICKER SEARCH ──────────────────────────────────── */}
      <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:8,padding:18,marginBottom:22}}>
        <div style={fm(ORANGE,11,{letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:10})}>🔍 Analyze Any Stock Options</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
          <input
            placeholder="Enter any ticker (e.g. HOOD, SOFI, RBLX...)"
            value={customOptTicker}
            onChange={e=>setCustomOptTicker(e.target.value.toUpperCase())}
            onKeyDown={e=>e.key==="Enter"&&analyzeCustomOptions()}
            style={{background:DIM,border:`1px solid ${ORANGE}55`,color:WHITE,fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:3,padding:"10px 14px",borderRadius:5,width:280,outline:"none"}}
          />
          <button onClick={analyzeCustomOptions} disabled={customOptLoading||!customOptTicker.trim()} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:0.5,padding:"11px 20px",borderRadius:5,cursor:"pointer",textTransform:"uppercase",opacity:customOptTicker.trim()?1:0.5}}>
            {customOptLoading?"ANALYZING...":"▶ GET OPTIONS"}
          </button>
          {customOptResult&&<button onClick={()=>setCustomOptResult(null)} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:11,padding:"10px 14px",borderRadius:5,cursor:"pointer"}}>✕ Clear</button>}
        </div>
        <div style={fm(MUTED,11)}>Get 3 AI-generated options setups for any US-listed stock</div>
      </div>

      {/* Custom options result */}
      {customOptResult&&(
        <div style={{marginBottom:24}}>
          <div style={fm(ORANGE,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:12})}>📊 Options Analysis — {customOptResult.ticker}</div>
          {customOptResult.result&&<OptionsResult result={customOptResult.result}/>}
        </div>
      )}

      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:7,padding:"12px 16px",marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <span style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase",marginRight:4})}>Quick Guide:</span>
        {[["BUY CALL",GREEN,"Stock goes UP → profit"],["BUY PUT",RED,"Stock goes DOWN → profit"],["SELL CALL",GREEN,"Collect premium, bullish/neutral"],["SELL PUT",RED,"Collect premium, bullish on dip"]].map(([l,c,d])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`}}/><span style={fm(c,8,{letterSpacing:1})}>{l}</span><span style={fm(MUTED,12,{marginLeft:4})}>{d}</span></div>
        ))}
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:18,marginBottom:20}}>
        <div style={fm(MUTED,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:12})}>Select Stock</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {OPTIONS_UNIVERSE.map(s=>(
            <button key={s.ticker} onClick={()=>{setSelectedTicker(s.ticker);setState("idle");setResult(null);}} style={{background:selectedTicker===s.ticker?ORANGE+"22":DIM,border:`1px solid ${selectedTicker===s.ticker?ORANGE+"66":BORDER}`,color:selectedTicker===s.ticker?ORANGE:MUTED,fontFamily:"'Bebas Neue',cursive",fontSize:14,letterSpacing:2,padding:"6px 14px",borderRadius:5,cursor:"pointer",transition:"all .15s"}}>{s.ticker}</button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div><div style={fm(WHITE,11)}>{selectedStock.name}</div><Tag label={selectedStock.sector} color={MUTED}/></div>
          <button onClick={run} style={{background:subscribed?`${ORANGE}22`:DIM,border:`1px solid ${subscribed?ORANGE+"55":BORDER}`,color:subscribed?ORANGE:MUTED,fontFamily:"'Space Mono',monospace",fontSize:13,letterSpacing:2,padding:"11px 24px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
            {subscribed?`▶ ANALYZE ${selectedTicker} OPTIONS`:"🔒 PRO — Unlock Options Analysis"}
          </button>
        </div>
      </div>
      {state==="loading"&&<LoadingAnim msg={`ANALYZING ${selectedTicker} OPTIONS...`}/>}
      {state==="error"&&<div style={{...fm(RED,9),padding:16}}>{error} <button onClick={()=>setState("idle")} style={{background:"none",border:"none",color:GREEN,cursor:"pointer",...fm(GREEN,9)}}>Retry</button></div>}
      {state==="done"&&result&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:CARD,border:`1px solid ${bias?.color+"33"||BORDER}`,borderRadius:8,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:14}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:WHITE,letterSpacing:3}}>{result.ticker}</span><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:bias?.color||BLUE}}>{bias?.icon} {result.marketBias}</span></div>
                <p style={fm("#8a9aaa",13,{lineHeight:1.7,maxWidth:480})}>{result.biasSummary}</p>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[["Price",result.currentPrice,WHITE],["Earnings",result.nextEarningsDate,GOLD],["Implied Move",result.impliedMove,ORANGE],["IV Rank",result.ivRank,PURPLE]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:DIM,border:`1px solid ${BORDER}`,borderRadius:5,padding:"8px 12px",minWidth:80}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:MUTED,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {result.keyLevels&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["🟢 Support",result.keyLevels.support,GREEN],["🔴 Resistance",result.keyLevels.resistance,RED],["📊 50MA",result.keyLevels.ma50,BLUE],["📈 200MA",result.keyLevels.ma200,PURPLE]].map(([l,v,c])=>(
                  <div key={l} style={{background:c+"0d",border:`1px solid ${c}33`,borderRadius:5,padding:"6px 10px"}}><span style={fm(MUTED,12,{marginRight:5})}>{l}</span><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:c}}>{v}</span></div>
                ))}
              </div>
            )}
          </div>
          <div><div style={fm(MUTED,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:10})}>3 Trade Setups — Click to Expand</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{result.trades?.map((trade,i)=><OptionTradeCard key={i} trade={trade} index={i+1}/>)}</div></div>
          {result.dataSources?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.dataSources.map((ds,i)=><Tag key={i} label={ds} color={MUTED}/>)}</div>}
          <div style={{background:"#0a0c10",border:`1px solid ${ORANGE}22`,borderRadius:6,padding:"12px 14px",display:"flex",gap:10}}><span style={{fontSize:14,flexShrink:0}}>⚠️</span><p style={fm(MUTED,12,{lineHeight:1.7})}>{result.optionsDisclaimer||"Options trading involves substantial risk. These are AI-generated educational suggestions, not financial advice. You can lose your entire premium."}</p></div>
        </div>
      )}
    </div>
  );
}

// ─── STOCK RESULT ─────────────────────────────────────────────────────────────
function StockResult({result}){
  const c=CONFIDENCE_MAP[result.verdict]||CONFIDENCE_MAP["HOLD"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:c.color+"0d",border:`1px solid ${c.color}33`,borderRadius:6}}>
        <div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:c.color,letterSpacing:3}}>{result.verdict}</div><div style={fm(MUTED,8)}>{result.timeframe} · Target {result.targetPrice}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:c.color}}>{result.targetUpside}</div><div style={fm(MUTED,8)}>Upside</div></div>
      </div>
      <ConfidenceMeter confidence={result.confidence} verdict={result.verdict}/>
      <div><ScoreRow label="Momentum" value={result.momentum} color={GREEN}/><ScoreRow label="Fundamentals" value={result.fundamentals} color={BLUE}/><ScoreRow label="Sentiment" value={result.sentiment} color={PURPLE}/><ScoreRow label="Growth" value={result.growth} color={GOLD}/><ScoreRow label="Risk" value={result.riskScore} color={RED}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><InfoBox label="Revenue Growth" value={result.revenueGrowthYoY||"—"} color={GREEN}/><InfoBox label="EPS Growth" value={result.epsGrowthYoY||"—"} color={GREEN}/><InfoBox label="P/E Ratio" value={result.peRatio||"—"} color={GOLD}/></div>
      {result.recentEarnings&&<InfoBox label="📊 Latest Earnings" value={result.recentEarnings} color={WHITE}/>}
      {result.analystConsensus&&<InfoBox label="🏦 Analyst Consensus" value={result.analystConsensus} color={CYAN}/>}
      {result.whyThisRating&&<WhyBox text={result.whyThisRating}/>}
      {result.newsHighlights?.length>0&&<div><SectionLabel color={MUTED} icon="📰">Recent News</SectionLabel>{result.newsHighlights.map((n,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:BLUE,fontSize:12,flexShrink:0}}>◆</span><span style={fm("#8ab0cc",13,{lineHeight:1.65})}>{n}</span></div>)}</div>}
      {result.catalysts?.length>0&&<div><SectionLabel color={MUTED} icon="▲">Catalysts</SectionLabel>{result.catalysts.map((c2,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:GREEN,fontSize:12,flexShrink:0}}>▲</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9aabb8",lineHeight:1.7}}>{c2}</span></div>)}</div>}
      {result.risks?.length>0&&<div><SectionLabel color={MUTED} icon="▼">Risks</SectionLabel>{result.risks.map((r,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:RED,fontSize:12,flexShrink:0}}>▼</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9aabb8",lineHeight:1.7}}>{r}</span></div>)}</div>}
      {result.macroFactors&&<div style={{background:DIM,border:`1px solid ${PURPLE}33`,borderRadius:5,padding:"9px 11px",borderLeft:`2px solid ${PURPLE}`}}><SectionLabel color={PURPLE} icon="🌐">Macro Context</SectionLabel><p style={fm("#8a9aaa",13,{lineHeight:1.7})}>{result.macroFactors}</p></div>}
      {result.dataSources?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.dataSources.map((ds,i)=><Tag key={i} label={ds} color={MUTED}/>)}</div>}
      <div style={fm("#1e2a38",8)}>Updated: {result.lastUpdated||new Date().toLocaleDateString()}</div>
    </div>
  );
}
function StockCard({stock,subscribed,analysesUsed,onUseAnalysis,onPaywall,prefetchedResult=null}){
  const [state,setState]=useState(prefetchedResult?"done":"idle");
  const [result,setResult]=useState(prefetchedResult||null);
  const [error,setError]=useState(null);
  const isLocked=!subscribed&&analysesUsed>=FREE_LIMIT;
  const c=result?(CONFIDENCE_MAP[result.verdict]||CONFIDENCE_MAP["HOLD"]):null;
  const run=async()=>{
    if(isLocked){onPaywall();return;}
    if(!onUseAnalysis())return;
    setState("loading");
    try{const r=await callAI(STOCK_SYSTEM,`Analyze ${stock.ticker} (${stock.name}) in ${stock.sector||"Unknown"}. Search latest earnings, analyst ratings, recent news. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setResult(r);setState("done");}
    catch(e){setError("Failed. Retry.");setState("error");}
  };
  return(
    <div style={{background:CARD,border:`1px solid ${c?c.color+"33":BORDER}`,borderRadius:8,padding:18,display:"flex",flexDirection:"column",gap:12,boxShadow:c?`0 0 22px ${c.color}0a`:"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:WHITE,letterSpacing:3}}>{stock.ticker}</span><Tag label={stock.tag} color={stock.tag==="HOT"?RED:stock.tag==="VOLATILE"?GOLD:stock.tag==="AI-CORE"?GREEN:BLUE}/></div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:MUTED,marginBottom:5}}>{stock.name}</div><Tag label={stock.sector} color={MUTED}/></div>
        <MiniSpark trend={result?(result.verdict.includes("BUY")?"up":"down"):"up"} color={c?.color||GREEN}/>
      </div>
      {state==="idle"&&<button onClick={run} style={{background:isLocked?DIM:`${GREEN}14`,border:`1px solid ${isLocked?BORDER:GREEN+"44"}`,color:isLocked?MUTED:GREEN,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:2,padding:"10px 0",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{isLocked?"🔒 UNLOCK WITH PRO":"▶ ANALYZE WITH LIVE DATA"}</button>}
      {state==="loading"&&<LoadingAnim msg="FETCHING LIVE DATA..."/>}
      {state==="error"&&<div style={fm(RED,9)}>{error} <button onClick={()=>setState("idle")} style={{background:"none",border:"none",color:GREEN,cursor:"pointer",...fm(GREEN,9)}}>Retry</button></div>}
      {state==="done"&&result&&<StockResult result={result}/>}
    </div>
  );
}

// ─── GEM + IPO + SCREENER + PORTFOLIO (condensed) ────────────────────────────
function GemCard({gem,subscribed,onPaywall}){
  const [state,setState]=useState("idle");const [result,setResult]=useState(null);
  const c=result?(CONFIDENCE_MAP[result.verdict]||CONFIDENCE_MAP["SPECULATIVE"]):null;
  const run=async()=>{if(!subscribed&&!BETA_MODE){onPaywall();return;}setState("loading");try{const r=await callAI(GEM_SYSTEM,`Analyze ${gem.ticker} (${gem.name}) in ${gem.sector}. Thesis: ${gem.why}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setResult(r);setState("done");}catch{setState("error");}};
  return(
    <div style={{background:CARD,border:`1px solid ${c?c.color+"33":BORDER}`,borderRadius:8,padding:18,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:3}}>{gem.ticker}</span><Tag label="HIDDEN GEM" color={PURPLE}/></div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:MUTED,marginBottom:5}}>{gem.name}</div><Tag label={gem.sector} color={MUTED}/></div><MiniSpark trend="up" color={c?.color||PURPLE}/></div>
      <div style={{background:DIM,borderRadius:5,padding:"8px 10px",borderLeft:`2px solid ${PURPLE}`}}><div style={fm(PURPLE,12,{letterSpacing:1,textTransform:"uppercase",marginBottom:3})}>Investment Thesis</div><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9aabb8",lineHeight:1.7}}>{gem.why}</p></div>
      {state==="idle"&&<button onClick={run} style={{background:subscribed?`${PURPLE}14`:DIM,border:`1px solid ${subscribed?PURPLE+"44":BORDER}`,color:subscribed?PURPLE:MUTED,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:2,padding:"9px 0",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{subscribed?"▶ DEEP DIVE ANALYSIS":"🔒 PRO — Unlock"}</button>}
      {state==="loading"&&<LoadingAnim msg="RESEARCHING..."/>}
      {state==="done"&&result&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 13px",background:c.color+"0d",border:`1px solid ${c.color}33`,borderRadius:6}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:c.color,letterSpacing:3}}>{result.verdict}</div><div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:c.color}}>{result.targetUpside}</div><div style={fm(MUTED,8)}>Target: {result.targetPrice}</div></div></div>
          <ConfidenceMeter confidence={result.confidence} verdict={result.verdict}/>
          {result.whyThisRating&&<WhyBox text={result.whyThisRating}/>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><InfoBox label="Market Cap" value={result.marketCap||"—"} color={WHITE}/><InfoBox label="Revenue Growth" value={result.revenueGrowthYoY||"—"} color={GREEN}/></div>
          {result.industryTailwind&&<InfoBox label="🚀 Industry Tailwind" value={result.industryTailwind} color={GOLD}/>}
          {result.competitiveEdge&&<InfoBox label="⚡ Competitive Edge" value={result.competitiveEdge} color={GREEN}/>}
          {result.dataSources?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.dataSources.map((ds,i)=><Tag key={i} label={ds} color={MUTED}/>)}</div>}
        </div>
      )}
    </div>
  );
}

function IPOCard({ipo,subscribed,onPaywall}){
  const [state,setState]=useState("idle");const [result,setResult]=useState(null);
  const c=result?(CONFIDENCE_MAP[result.verdict]||CONFIDENCE_MAP["SPECULATIVE"]):null;
  const run=async()=>{if(!subscribed&&!BETA_MODE){onPaywall();return;}setState("loading");try{const r=await callAI(IPO_SYSTEM,`Analyze IPO: ${ipo.name} (${ipo.sector}). Info: ${ipo.description}. Timing: ${ipo.estTiming}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setResult(r);setState("done");}catch{setState("error");}};
  const confColor=result?result.buyConfidence>=75?GREEN:result.buyConfidence>=55?GOLD:result.buyConfidence>=35?BLUE:RED:MUTED;
  return(
    <div style={{background:CARD,border:`1px solid ${c?c.color+"33":BORDER}`,borderRadius:8,padding:18,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{ipo.name}</span>{ipo.estTiming==="PUBLIC"&&<Tag label="LIVE" color={GREEN}/>}</div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:MUTED,marginBottom:5}}>{ipo.sector}</div><Tag label={`Est. ${ipo.estTiming}`} color={GOLD}/></div><div style={{textAlign:"center"}}>{result?<div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,color:confColor}}>{result.buyConfidence}%</div><div style={fm(MUTED,8)}>Buy Confidence</div></div>:<div style={{width:50,height:50,borderRadius:"50%",border:`2px dashed ${BORDER}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={fm(MUTED,9)}>?</span></div>}</div></div>
      <p style={fm(MUTED,12,{lineHeight:1.65})}>{ipo.description}</p>
      {state==="idle"&&<button onClick={run} style={{background:subscribed?`${CYAN}14`:DIM,border:`1px solid ${subscribed?CYAN+"44":BORDER}`,color:subscribed?CYAN:MUTED,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:2,padding:"9px 0",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{subscribed?"▶ ANALYZE IPO":"🔒 PRO — Unlock"}</button>}
      {state==="loading"&&<LoadingAnim msg="RESEARCHING IPO..."/>}
      {state==="done"&&result&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:DIM,borderRadius:8,height:10,marginBottom:4}}><div style={{width:`${result.buyConfidence}%`,height:"100%",background:`linear-gradient(90deg,${confColor}66,${confColor})`,borderRadius:8,transition:"width 1.4s cubic-bezier(.4,0,.2,1)"}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><InfoBox label="Est. Valuation" value={result.estimatedValuation||"—"} color={GOLD}/><InfoBox label="Revenue" value={result.revenueLatest||"—"} color={WHITE}/><InfoBox label="Revenue Growth" value={result.revenueGrowth||"—"} color={GREEN}/><InfoBox label="Comparable" value={result.comparable||"—"} color={CYAN}/></div>
          {result.whyThisRating&&<WhyBox text={result.whyThisRating}/>}
          {result.dataSources?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.dataSources.map((ds,i)=><Tag key={i} label={ds} color={MUTED}/>)}</div>}
        </div>
      )}
    </div>
  );
}

function Screener({subscribed,onPaywall}){
  const [filters,setFilters]=useState({sector:"All",tag:"All",minConf:0,verdict:"All"});
  const [results,setResults]=useState([]);const [loading,setLoading]=useState(false);
  const run=async()=>{
    if(!subscribed&&!BETA_MODE){onPaywall();return;}
    setLoading(true);setResults([]);
    const pool=ALL_STOCKS.filter(s=>(filters.sector==="All"||s.sector===filters.sector)&&(filters.tag==="All"||s.tag===filters.tag)).slice(0,8);
    const out=[];
    for(const stock of pool){try{const r=await callAI(STOCK_SYSTEM,`Analyze ${stock.ticker} (${stock.name}) in ${stock.sector}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);if(r.confidence>=filters.minConf&&(filters.verdict==="All"||r.verdict===filters.verdict))out.push({stock,result:r});}catch{}}
    out.sort((a,b)=>b.result.confidence-a.result.confidence);setResults(out);setLoading(false);
  };
  return(
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:18}}>
        {[{label:"Sector",key:"sector",opts:SECTORS},{label:"Tag",key:"tag",opts:TAGS},{label:"Signal",key:"verdict",opts:["All","STRONG BUY","BUY","SPECULATIVE","HOLD","SELL"]}].map(({label,key,opts})=>(
          <div key={key}><div style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>{label}</div><select value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:13,padding:"7px 10px",borderRadius:4,cursor:"pointer"}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        ))}
        <div><div style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>Min Confidence</div><input type="number" min={0} max={100} value={filters.minConf} onChange={e=>setFilters(f=>({...f,minConf:+e.target.value}))} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:13,padding:"7px 10px",borderRadius:4,width:70}}/></div>
        <div style={{display:"flex",alignItems:"flex-end"}}><button onClick={run} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}55`,color:GOLD,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:2,padding:"8px 18px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{loading?"SCANNING...":"▶ RUN SCREENER"}</button></div>
      </div>
      {loading&&<LoadingAnim msg="SCREENING WITH LIVE DATA..."/>}
      {results.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={fm(MUTED,12,{letterSpacing:2,marginBottom:4})}>{results.length} MATCHED</div>{results.map(({stock,result:r})=>{const c=CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"];return(<div key={stock.ticker} style={{background:CARD,border:`1px solid ${c.color}33`,borderRadius:6,padding:"14px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{stock.ticker}</span><Tag label={r.verdict} color={c.color}/></div><div style={{display:"flex",gap:16}}>{[["CONFIDENCE",`${r.confidence}%`,c.color],["UPSIDE",r.targetUpside,c.color],["TARGET",r.targetPrice,GOLD]].map(([l,v,col])=><div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:col}}>{v}</div><div style={fm(MUTED,7)}>{l}</div></div>)}</div></div>{r.whyThisRating&&<WhyBox text={r.whyThisRating}/>}</div>);})}</div>}
      {!loading&&results.length===0&&<div style={{textAlign:"center",padding:40,...fm(MUTED,10)}}>Configure filters and run the screener.</div>}
    </div>
  );
}

function Portfolio({subscribed,onPaywall}){
  const [holdings,setHoldings]=useState([{ticker:"NVDA",shares:10,avgCost:520},{ticker:"META",shares:5,avgCost:480}]);
  const [newH,setNewH]=useState({ticker:"",shares:"",avgCost:""});
  const [analyses,setAnalyses]=useState({});const [loading,setLoading]=useState(null);
  const add=()=>{if(!newH.ticker||!newH.shares||!newH.avgCost)return;setHoldings(h=>[...h,{ticker:newH.ticker.toUpperCase(),shares:+newH.shares,avgCost:+newH.avgCost}]);setNewH({ticker:"",shares:"",avgCost:""});};
  const analyzeAll=async()=>{if(!subscribed&&!BETA_MODE){onPaywall();return;}for(const h of holdings){if(analyses[h.ticker])continue;setLoading(h.ticker);try{const stock=ALL_STOCKS.find(s=>s.ticker===h.ticker)||{ticker:h.ticker,name:h.ticker,sector:"Unknown"};const r=await callAI(STOCK_SYSTEM,`Analyze ${stock.ticker} (${stock.name}). Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setAnalyses(a=>({...a,[h.ticker]:r}));}catch{}setLoading(null);}};
  return(
    <div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:18,marginBottom:18}}>
        <div style={fm(MUTED,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:12})}>Add Position</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[{ph:"TICKER",key:"ticker",w:80},{ph:"Shares",key:"shares",w:80},{ph:"Avg Cost $",key:"avgCost",w:100}].map(({ph,key,w})=>(
            <input key={key} placeholder={ph} value={newH[key]} onChange={e=>setNewH(n=>({...n,[key]:e.target.value}))} style={{background:DIM,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:13,padding:"7px 10px",borderRadius:4,width:w}}/>
          ))}
          <button onClick={add} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}44`,color:GREEN,fontFamily:"'Space Mono',monospace",fontSize:12,padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>+ ADD</button>
        </div>
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 40px",padding:"9px 16px",background:DIM,borderBottom:`1px solid ${BORDER}`}}>{["TICKER","SHARES","AVG COST","SIGNAL","TARGET",""].map((h,i)=><span key={i} style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase"})}>{h}</span>)}</div>
        {holdings.map(h=>{const r=analyses[h.ticker];const c=r?(CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"]):null;return(<div key={h.ticker} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 40px",padding:"11px 16px",borderBottom:`1px solid ${BORDER}`,alignItems:"center"}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:WHITE,letterSpacing:2}}>{h.ticker}</span><span style={fm(WHITE,10)}>{h.shares}</span><span style={fm(WHITE,10)}>${h.avgCost}</span><span>{r?<Tag label={`${r.confidence}% ${r.verdict}`} color={c.color}/>:loading===h.ticker?<span style={fm(GREEN,8)}>Analyzing…</span>:<span style={fm(MUTED,9)}>—</span>}</span><span style={fm(r?c.color:MUTED,10)}>{r?r.targetUpside:"—"}</span><button onClick={()=>setHoldings(h2=>h2.filter(x=>x.ticker!==h.ticker))} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:11}}>✕</button></div>);})}
        <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={fm(MUTED,9)}>Cost Basis: <span style={{color:WHITE}}>${holdings.reduce((s,h)=>s+h.shares*h.avgCost,0).toLocaleString()}</span></span><button onClick={analyzeAll} style={{background:`${BLUE}18`,border:`1px solid ${BLUE}44`,color:BLUE,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:1,padding:"6px 14px",borderRadius:4,cursor:"pointer",textTransform:"uppercase"}}>▶ Analyze All</button></div>
      </div>
      {Object.keys(analyses).length>0&&<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:18}}><div style={fm(MUTED,12,{letterSpacing:2,textTransform:"uppercase",marginBottom:14})}>Portfolio Risk Overview</div><div style={{display:"flex",gap:16,flexWrap:"wrap"}}>{Object.entries(analyses).map(([t,r])=>{const c=CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"];return(<div key={t} style={{textAlign:"center",minWidth:70}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:WHITE,marginBottom:4}}>{t}</div><div style={{width:56,height:56,margin:"0 auto 4px",borderRadius:"50%",border:`3px solid ${c.color}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 12px ${c.color}33`}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:c.color}}>{r.confidence}%</span></div><div style={fm(c.color,8)}>{r.verdict}</div></div>);})}</div></div>}
    </div>
  );
}

function Paywall({onClose,onSubscribe}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#0b0e14",border:`1px solid ${GOLD}44`,borderRadius:12,padding:36,maxWidth:460,width:"92%",textAlign:"center",boxShadow:`0 0 80px ${GOLD}14`}}>
        <div style={fm(GOLD,13,{letterSpacing:4,textTransform:"uppercase",marginBottom:8})}>Free Trial Complete</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:WHITE,lineHeight:1.1,marginBottom:10}}>Unlock Full<br/><span style={{color:GREEN,textShadow:`0 0 20px ${GREEN}66`}}>Market Intelligence</span></div>
        <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:8,padding:18,marginBottom:22,textAlign:"left"}}>
          {[["Unlimited Stock Analyses (live data)",GREEN],["Smart Money Tracker — Congress + Hedge Funds",PINK],["Options Trading — 3 AI Setups Per Stock",ORANGE],["Data-Backed WHY THIS RATING Explanations",GREEN],["Hidden Gems — Breakout Stocks",PURPLE],["IPO Watch with % Buy Confidence",CYAN],["Stock Screener & Portfolio Tracker",BLUE]].map(([f,col],i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"center"}}><span style={{color:col,fontSize:11}}>✓</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#8899aa"}}>{f}</span></div>
          ))}
          <div style={{borderTop:`1px solid ${BORDER}`,marginTop:14,paddingTop:14,display:"flex",justifyContent:"space-between"}}>
            <span style={fm(MUTED,9)}>MONTHLY</span>
            <div><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,color:WHITE}}>$19</span><span style={fm(MUTED,10)}>/mo</span></div>
          </div>
        </div>
        <button onClick={onSubscribe} style={{width:"100%",background:`linear-gradient(135deg,${GREEN},#00cc66)`,color:"#000",border:"none",borderRadius:6,padding:"14px 0",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,cursor:"pointer",marginBottom:10}}>START FOR $19/MO</button>
        <button onClick={onClose} style={{width:"100%",background:"none",border:"none",color:MUTED,fontFamily:"'Space Mono',monospace",fontSize:12,cursor:"pointer",padding:8}}>Maybe later</button>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

// ─── LEGAL COMPONENTS ────────────────────────────────────────────────────────
function DisclaimerBanner({onViewTerms, onViewPrivacy}){
  const [dismissed, setDismissed] = useState(false);
  if(dismissed) return null;
  return(
    <div style={{background:"#0a0e16",borderBottom:`1px solid ${GOLD}44`,padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:500}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
        <span style={{fontSize:14}}>⚠️</span>
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
          <button onClick={onClose} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#b0bec5",lineHeight:1.9}}>
          <p style={{marginBottom:12,color:MUTED,fontSize:11}}>Last updated: March 2026</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>1. No Financial Advice</h3>
          <p style={{marginBottom:16}}>StockMoolah ("the Service") provides AI-generated stock analysis and market information for <strong style={{color:WHITE}}>educational and informational purposes only</strong>. Nothing on this platform constitutes financial, investment, trading, legal, tax, or accounting advice. The analysis, ratings, confidence scores, and recommendations generated by our AI models are not guarantees of future performance and should not be relied upon as the sole basis for any investment decision.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>2. Investment Risk Disclosure</h3>
          <p style={{marginBottom:16}}>Investing in stocks, options, and other securities involves substantial risk of loss. <strong style={{color:RED}}>You may lose some or all of your invested capital.</strong> Past performance is not indicative of future results. AI-generated analysis may be inaccurate, incomplete, or outdated. Always conduct your own research and consult with a qualified, licensed financial advisor before making any investment decisions.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>3. AI Limitations</h3>
          <p style={{marginBottom:16}}>Our analysis is generated by artificial intelligence models (including Claude by Anthropic, GPT-4 by OpenAI, and Perplexity AI). These models can make errors, hallucinate information, and may not reflect the most current market conditions. AI-generated content is provided "as is" without warranty of any kind, express or implied.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>4. Not a Registered Advisor</h3>
          <p style={{marginBottom:16}}>StockMoolah is not a registered investment advisor, broker-dealer, or financial planner. We are not licensed by the SEC, FINRA, or any other regulatory body. We do not manage money, execute trades, or provide personalized investment recommendations.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>5. Congressional & Hedge Fund Data</h3>
          <p style={{marginBottom:16}}>All Smart Money data is sourced from publicly available government disclosures (STOCK Act filings) and SEC 13F filings. This data may be delayed, incomplete, or inaccurate. Tracking public figures' disclosed trades does not guarantee similar returns and is provided for informational purposes only.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>6. Limitation of Liability</h3>
          <p style={{marginBottom:16}}>To the fullest extent permitted by law, StockMoolah, its owners, operators, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, or financial losses arising from your use of or reliance on this Service.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>7. Subscription & Payments</h3>
          <p style={{marginBottom:16}}>Pro subscriptions are billed monthly at $19.00 USD. Subscriptions automatically renew until cancelled. Refunds are not provided for partial months. You may cancel at any time by contacting us. Payments are processed securely by Stripe.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>8. Indemnification</h3>
          <p style={{marginBottom:16}}>You agree to indemnify and hold harmless StockMoolah and its affiliates from any claims, losses, liabilities, damages, costs, or expenses arising from your use of the Service or violation of these Terms.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>9. Governing Law</h3>
          <p style={{marginBottom:16}}>These Terms shall be governed by the laws of the United States. Any disputes shall be resolved through binding arbitration, not class action lawsuits.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>10. Changes to Terms</h3>
          <p style={{marginBottom:16}}>We reserve the right to modify these Terms at any time. Continued use of the Service constitutes acceptance of updated Terms.</p>

          <p style={{marginTop:24,padding:"12px 16px",background:"#0a0e16",borderRadius:6,border:`1px solid ${GOLD}33`,color:GOLD,fontSize:12}}>
            ⚠️ BY USING STOCKMOOLAH, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THESE TERMS, AND THAT YOU ARE SOLELY RESPONSIBLE FOR YOUR INVESTMENT DECISIONS.
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
          <button onClick={onClose} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#b0bec5",lineHeight:1.9}}>
          <p style={{marginBottom:12,color:MUTED,fontSize:11}}>Last updated: March 2026</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>1. Information We Collect</h3>
          <p style={{marginBottom:16}}>StockMoolah collects minimal information to provide our service. We may collect: your email address (if provided for billing), payment information (processed securely by Stripe — we never see your card details), and anonymous usage data such as which features you use.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>2. How We Use Your Information</h3>
          <p style={{marginBottom:16}}>We use collected information solely to: process your subscription payments, provide and improve our service, and send important service notifications. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>3. AI Data Processing</h3>
          <p style={{marginBottom:16}}>When you request stock analysis, your queries are sent to third-party AI providers (Anthropic, OpenAI, Perplexity). These providers process your requests according to their own privacy policies. We do not store the content of your analyses on our servers.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>4. Cookies & Local Storage</h3>
          <p style={{marginBottom:16}}>We use browser local storage to remember your disclaimer acceptance and subscription status. We do not use tracking cookies or third-party advertising cookies.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>5. Payment Security</h3>
          <p style={{marginBottom:16}}>All payments are processed by Stripe, a PCI-compliant payment processor. StockMoolah never stores or has access to your credit card information.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>6. Data Retention</h3>
          <p style={{marginBottom:16}}>We retain minimal data necessary to provide our service. You may request deletion of your data at any time by contacting us.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>7. Your Rights</h3>
          <p style={{marginBottom:16}}>You have the right to access, correct, or delete your personal data. You may also opt out of any communications from us at any time.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>8. Contact</h3>
          <p style={{marginBottom:16}}>For any privacy concerns or data requests, please contact us through our website. We will respond within 30 days.</p>

          <h3 style={{color:WHITE,fontSize:15,fontWeight:700,marginBottom:8,marginTop:20}}>9. Changes to Privacy Policy</h3>
          <p style={{marginBottom:16}}>We may update this Privacy Policy periodically. We will notify users of significant changes. Continued use of the Service constitutes acceptance of the updated policy.</p>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [tab,setTab]=useState("watchlist");
  const [showTerms,setShowTerms]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  // Dynamic IPO state
  const [dynamicIPOs,setDynamicIPOs]=useState(null);
  const [ipoLoading,setIpoLoading]=useState(false);
  // Dynamic Hidden Gems state
  const [dynamicGems,setDynamicGems]=useState(null);
  const [gemsLoading,setGemsLoading]=useState(false);
  // Dynamic Smart Money activity state
  const [smartMoneyActivity,setSmartMoneyActivity]=useState(null);
  const [smartMoneyLoading,setSmartMoneyLoading]=useState(false);
  // Day Trading state
  const [dtMomentum,setDtMomentum]=useState(null);
  const [dtMomentumLoading,setDtMomentumLoading]=useState(false);
  const [dtScalps,setDtScalps]=useState(null);
  const [dtScalpsLoading,setDtScalpsLoading]=useState(false);
  const [dtSqueeze,setDtSqueeze]=useState(null);
  const [dtSqueezeLoading,setDtSqueezeLoading]=useState(false);
  const [dtAfterHours,setDtAfterHours]=useState(null);
  const [dtAfterHoursLoading,setDtAfterHoursLoading]=useState(false);
  const [dtPreMarket,setDtPreMarket]=useState(null);
  const [dtPreMarketLoading,setDtPreMarketLoading]=useState(false);
  // Dynamic Options opportunities state
  const [dynamicOptions,setDynamicOptions]=useState(null);
  const [dynamicOptionsLoading,setDynamicOptionsLoading]=useState(false);
  // Options custom search
  const [optionsSearchTicker,setOptionsSearchTicker]=useState("");
  const [subscribed,setSubscribed]=useState(false);
  const [analysesUsed,setAnalysesUsed]=useState(0);
  const [showPaywall,setShowPaywall]=useState(false);
  const [showToast,setShowToast]=useState(false);
  const [marketStatus,setMarketStatus]=useState(getMarketStatus());
  const [clock,setClock]=useState(new Date());
  const [sectorFilter,setSectorFilter]=useState("All");
  const [tagFilter,setTagFilter]=useState("All");
  const [search,setSearch]=useState("");
  // Custom ticker search
  const [customTicker,setCustomTicker]=useState("");
  const [customStock,setCustomStock]=useState(null);
  const [customLoading,setCustomLoading]=useState(false);
  // Trending stocks
  const [trending,setTrending]=useState(null);
  const [trendingLoading,setTrendingLoading]=useState(false);
  const [trendingError,setTrendingError]=useState(null);
  // Dynamic watchlist
  const [dynamicWatchlist,setDynamicWatchlist]=useState(null);
  const [watchlistLoading,setWatchlistLoading]=useState(false);
  const [activeWatchlistMode,setActiveWatchlistMode]=useState("static"); // "static"|"dynamic"

  useEffect(()=>{const t=setInterval(()=>{setMarketStatus(getMarketStatus());setClock(new Date());},1000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get("subscribed")==="true"){
      setSubscribed(true);
      setShowToast(true);
      setTimeout(()=>setShowToast(false),4500);
    }
  },[]);

  // Day Trading fetch functions
  const fetchMomentumMovers = async () => {
    setDtMomentumLoading(true);
    try {
      const r = await callAI(MOMENTUM_MOVERS_SYSTEM,
        `Search for stocks moving significantly RIGHT NOW. Check after-hours trading, pre-market movers, and any stocks with breaking news catalysts. Include earnings releases, analyst upgrades/downgrades, FDA decisions, contract wins, and any other catalysts causing big price moves today. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}.`,
        "perplexity"
      );
      setDtMomentum(r);
    } catch(e) { console.error("Momentum fetch failed:", e); }
    setDtMomentumLoading(false);
  };

  const fetchScalpSetups = async () => {
    setDtScalpsLoading(true);
    try {
      const r = await callAI(SCALP_SETUPS_SYSTEM,
        `Find the best scalping opportunities right now for intraday traders. Look for stocks with clear technical setups, high liquidity, and momentum. Include pre-market and after-hours setups. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}.`,
        "perplexity"
      );
      setDtScalps(r);
    } catch(e) { console.error("Scalps fetch failed:", e); }
    setDtScalpsLoading(false);
  };

  const fetchShortSqueeze = async () => {
    setDtSqueezeLoading(true);
    try {
      const r = await callAI(SHORT_SQUEEZE_SYSTEM,
        `Search for stocks with high short interest showing signs of an active or imminent short squeeze. Look for stocks with short float above 20%, rising prices, increasing volume, and positive catalysts. Check social media buzz and options activity for gamma squeeze potential. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setDtSqueeze(r);
    } catch(e) { console.error("Squeeze fetch failed:", e); }
    setDtSqueezeLoading(false);
  };

  const fetchAfterHours = async () => {
    setDtAfterHoursLoading(true);
    try {
      const r = await callAI(AFTERHOURS_SYSTEM,
        `Search for all significant after-hours and pre-market stock movements happening RIGHT NOW. Find earnings releases after market close today, stocks gapping up or down significantly, any breaking news moving stocks in extended hours trading. Include earnings results with actual vs estimated EPS and revenue figures. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}.`,
        "perplexity"
      );
      setDtAfterHours(r);
    } catch(e) { console.error("After-hours fetch failed:", e); }
    setDtAfterHoursLoading(false);
  };

  const fetchPreMarket = async () => {
    setDtPreMarketLoading(true);
    try {
      const r = await callAI(PREMARKET_SYSTEM,
        `Search for pre-market stock movers and futures data for today. Find stocks with significant pre-market price moves, overnight earnings releases, analyst actions before open, and any breaking news. Check S&P 500 futures, Nasdaq futures, and VIX. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}.`,
        "perplexity"
      );
      setDtPreMarket(r);
    } catch(e) { console.error("Pre-market fetch failed:", e); }
    setDtPreMarketLoading(false);
  };

  // Fetch dynamic IPOs
  const fetchDynamicIPOs = async () => {
    setIpoLoading(true);
    try {
      const r = await callAI(DYNAMIC_IPO_SYSTEM,
        `Search for the most current upcoming IPOs filing for 2025-2026. Find companies that have recently filed S-1 or F-1 forms with the SEC, announced IPO plans, or are expected to go public soon. Focus on high-growth companies with significant profit potential. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setDynamicIPOs(r);
    } catch(e) { console.error("IPO fetch failed:", e); }
    setIpoLoading(false);
  };

  // Fetch dynamic Hidden Gems
  const fetchDynamicGems = async () => {
    setGemsLoading(true);
    try {
      const r = await callAI(DYNAMIC_GEMS_SYSTEM,
        `Search for small and mid-cap stocks that are currently undervalued or have significant upcoming catalysts. Look for stocks with recent analyst upgrades, insider buying, earnings beats, or technical breakouts. Find stocks that institutional investors are quietly accumulating. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setDynamicGems(r);
    } catch(e) { console.error("Gems fetch failed:", e); }
    setGemsLoading(false);
  };

  // Fetch dynamic Smart Money activity
  const fetchSmartMoneyActivity = async () => {
    setSmartMoneyLoading(true);
    try {
      const r = await callAI(DYNAMIC_SMART_MONEY_SYSTEM,
        `Search for the most recent congressional STOCK Act trade disclosures filed in the last 30 days and the latest SEC 13F filings from major hedge funds. Find any notable new positions, large trades, or unusual activity. Which stocks are smart money buying or selling right now? Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setSmartMoneyActivity(r);
    } catch(e) { console.error("Smart money fetch failed:", e); }
    setSmartMoneyLoading(false);
  };

  // Fetch dynamic Options opportunities
  const fetchDynamicOptions = async () => {
    setDynamicOptionsLoading(true);
    try {
      const r = await callAI(DYNAMIC_OPTIONS_SYSTEM,
        `Search for the best options trading opportunities right now. Look for: unusual options activity (large block trades, high volume vs open interest), stocks with earnings in the next 2 weeks, stocks with elevated IV crush opportunities, and any unusual call or put sweeps detected today. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`,
        "perplexity"
      );
      setDynamicOptions(r);
    } catch(e) { console.error("Dynamic options fetch failed:", e); }
    setDynamicOptionsLoading(false);
  };

  // Fetch trending stocks
  const fetchTrending = async () => {
    setTrendingLoading(true);
    setTrendingError(null);
    try {
      const r = await callAI(TRENDING_SYSTEM,
        `Search for the top 8 trending stocks with highest profit potential RIGHT NOW. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}. Focus on stocks with unusual options activity, analyst upgrades today, earnings beats this week, and strong momentum signals.`
      );
      setTrending(r);
    } catch(e) {
      setTrendingError("Could not load trending stocks. Please retry.");
    }
    setTrendingLoading(false);
  };

  // Fetch AI-generated dynamic watchlist
  const fetchDynamicWatchlist = async () => {
    if(!subscribed&&!BETA_MODE){setShowPaywall(true);return;}
    setWatchlistLoading(true);
    try {
      const r = await callAI(DYNAMIC_WATCHLIST_SYSTEM,
        `Identify the 12 stocks with highest profit potential right now based on current market conditions. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Search for momentum leaders, upcoming earnings catalysts, sector rotation, and analyst upgrades. Only include stocks with real breakout potential in the next 1-4 weeks.`
      );
      setDynamicWatchlist(r);
      setActiveWatchlistMode("dynamic");
    } catch(e) {
      console.error("Dynamic watchlist failed:", e);
    }
    setWatchlistLoading(false);
  };

  // Analyze custom ticker
  const analyzeCustomTicker = async () => {
    if(!customTicker.trim()) return;
    if(!subscribed && analysesUsed >= FREE_LIMIT){setShowPaywall(true);return;}
    setCustomLoading(true);
    const input = customTicker.trim();
    try {
      const r = await callAI(STOCK_SYSTEM,
        `The user searched for: "${input}". This could be a stock ticker symbol OR a company name. First identify the correct US stock ticker symbol for this input (e.g. if user typed "Apple" use AAPL, if "Nvidia" use NVDA, if "Tesla" use TSLA). Then analyze that stock. Search for: company name, ticker symbol, sector, latest earnings report, analyst ratings, recent news, and growth catalysts. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`
      );
      setCustomStock({ticker: r?.ticker||input.toUpperCase(), result: r});
      if(!subscribed&&!BETA_MODE) setAnalysesUsed(p=>p+1);
    } catch(e) {
      alert("Could not analyze " + ticker + ". Please check the ticker symbol and try again.");
    }
    setCustomLoading(false);
  };

    const handleUseAnalysis=useCallback(()=>{
    if(!subscribed&&analysesUsed>=FREE_LIMIT){setShowPaywall(true);return false;}
    setAnalysesUsed(p=>p+1);return true;
  },[subscribed,analysesUsed]);

  const handleSubscribe=()=>{window.location.href="https://buy.stripe.com/eVqeVca5teIn8EB7M4ow00";};

  const filteredStocks=ALL_STOCKS.filter(s=>{
    if(sectorFilter!=="All"&&s.sector!==sectorFilter)return false;
    if(tagFilter!=="All"&&s.tag!==tagFilter)return false;
    if(search&&!s.ticker.includes(search.toUpperCase())&&!s.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const TABS=[
    {id:"watchlist",  label:"Watchlist"},
    {id:"daytrading", label:"Day Trading ⚡"},
    {id:"smartmoney", label:"Smart Money 🕵️"},
    {id:"options",    label:"Options 📊"},
    {id:"screener",   label:"Screener"},
    {id:"gems",       label:"Hidden Gems"},
    {id:"ipos",       label:"IPO Watch"},
    {id:"portfolio",  label:"Portfolio"},
  ];

  const etTime=clock.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"America/New_York"})+" ET";

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${BG};color:${WHITE};font-family:'DM Sans','Space Mono',sans-serif;font-size:14px;line-height:1.6;}
        ::-webkit-scrollbar{width:4px;background:${BG};}
        ::-webkit-scrollbar-thumb{background:${DIM};border-radius:4px;}
        input,select,button{outline:none;}
        @keyframes tickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes barAnim{from{transform:scaleY(.2);opacity:.4}to{transform:scaleY(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{minHeight:"100vh",background:BG}}>
        <DisclaimerBanner onViewTerms={()=>setShowTerms(true)} onViewPrivacy={()=>setShowPrivacy(true)}/>
        <TickerTape marketStatus={marketStatus}/>
        <div style={{borderBottom:`1px solid ${BORDER}`,padding:"13px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,color:WHITE,letterSpacing:4}}>STOCK</span>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,color:GREEN,letterSpacing:4,textShadow:`0 0 16px ${GREEN}55`}}>SIGHT</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:MUTED,fontWeight:500}}>{etTime}</span>
            {(!subscribed&&!BETA_MODE)&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:MUTED,fontWeight:500}}>Free: <span style={{color:GOLD}}>{Math.max(0,FREE_LIMIT-analysesUsed)}</span> left</span>}
            {subscribed?<Tag label="PRO ACTIVE" color={GREEN}/>:<button onClick={()=>setShowPaywall(true)} style={{background:`${GOLD}14`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:1,padding:"6px 12px",borderRadius:4,cursor:"pointer"}}>UPGRADE →</button>}
          </div>
        </div>

        <div style={{borderBottom:`1px solid ${BORDER}`,padding:"0 28px",display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none",border:"none",
              borderBottom:`2px solid ${tab===t.id?(t.id==="smartmoney"?PINK:t.id==="options"?ORANGE:t.id==="daytrading"?RED:GREEN):"transparent"}`,
              color:tab===t.id?(t.id==="smartmoney"?PINK:t.id==="options"?ORANGE:t.id==="daytrading"?RED:GREEN):MUTED,
              fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,letterSpacing:0.3,
              padding:"14px 22px",cursor:"pointer",textTransform:"uppercase",transition:"color .2s",whiteSpace:"nowrap"
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{padding:"22px 28px",maxWidth:1400,margin:"0 auto"}}>
          {tab==="daytrading"&&(
            <div>
              {/* ── HEADER ─────────────────────────────────────────── */}
              <div style={{background:`${RED}08`,border:`1px solid ${RED}33`,borderRadius:8,padding:"16px 20px",marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:RED,letterSpacing:3,textShadow:`0 0 20px ${RED}44`,marginBottom:4}}>⚡ Day Trading Terminal</div>
                    <p style={fm(MUTED,13,{lineHeight:1.6})}>Real-time momentum movers, scalp setups, after-hours plays, and short squeeze alerts — updated live by AI</p>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={fetchAfterHours} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                      {dtAfterHoursLoading?"...":"🌙 After-Hours"}
                    </button>
                    <button onClick={fetchPreMarket} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                      {dtPreMarketLoading?"...":"🌅 Pre-Market"}
                    </button>
                    <button onClick={fetchMomentumMovers} style={{background:`${RED}18`,border:`1px solid ${RED}44`,color:RED,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                      {dtMomentumLoading?"SCANNING...":"🔥 Scan Movers"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── AFTER-HOURS / PRE-MARKET SECTION ───────────────── */}
              <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:ORANGE,letterSpacing:2,marginBottom:3}}>🌙 After-Hours & Pre-Market Movers</div>
                    <div style={fm(MUTED,12)}>Stocks moving in extended hours — earnings releases, breaking news, analyst actions</div>
                  </div>
                  <button onClick={fetchAfterHours} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {dtAfterHoursLoading?"FETCHING...":"🔄 REFRESH"}
                  </button>
                </div>

                {dtAfterHoursLoading&&(
                  <div style={{textAlign:"center",padding:"20px 0"}}>
                    <div style={fm(ORANGE,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>SCANNING AFTER-HOURS ACTIVITY...</div>
                    <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:8},(_,i)=><div key={i} style={{width:3,height:16,background:ORANGE,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.09}s infinite alternate`}}/>)}</div>
                  </div>
                )}

                {!dtAfterHours&&!dtAfterHoursLoading&&(
                  <div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "After-Hours" or "Refresh" to see extended hours movers</div>
                )}

                {dtAfterHours&&!dtAfterHoursLoading&&(
                  <div>
                    {/* Session + summary banner */}
                    <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                      <div>
                        <Tag label={dtAfterHours.session} color={ORANGE}/>
                        <span style={{...fm(MUTED,12),marginLeft:10}}>{dtAfterHours.summary}</span>
                      </div>
                      <span style={fm(MUTED,11)}>{dtAfterHours.timestamp}</span>
                    </div>

                    {/* Earnings tonight */}
                    {dtAfterHours.earningsTonight?.length>0&&(
                      <div style={{marginBottom:14}}>
                        <div style={fm(GOLD,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:8})}>📅 Earnings Tonight</div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {dtAfterHours.earningsTonight.map((e,i)=>(
                            <div key={i} style={{background:DIM,borderRadius:5,padding:"8px 12px",border:`1px solid ${GOLD}33`}}>
                              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:WHITE,letterSpacing:1,marginBottom:2}}>{e.ticker}</div>
                              <div style={fm(MUTED,11,{marginBottom:2})}>{e.name}</div>
                              <div style={fm(GOLD,11)}>{e.reportTime} • ±{e.impliedMove}</div>
                              <div style={fm(MUTED,10)}>EPS Est: {e.epsEstimate} | Rev Est: {e.revenueEstimate}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Big movers grid */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
                      {dtAfterHours.bigMovers?.map((mover,i)=>{
                        const isUp = mover.direction==="UP";
                        const clr = isUp?GREEN:RED;
                        return(
                          <div key={i} style={{background:DIM,border:`1px solid ${clr}33`,borderRadius:7,padding:"14px 16px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{mover.ticker}</span>
                                  <Tag label={mover.gapType?.replace(/_/g," ")} color={clr}/>
                                </div>
                                <div style={fm(MUTED,12,{marginBottom:4})}>{mover.name}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:clr}}>{mover.afterHoursPct}</div>
                                <div style={fm(MUTED,10)}>{mover.afterHoursChange}</div>
                              </div>
                            </div>
                            <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${ORANGE}`}}>
                              <div style={fm(ORANGE,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Catalyst</div>
                              <p style={fm("#9a8a6a",12,{lineHeight:1.6})}>{mover.catalyst}</p>
                            </div>
                            <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${clr}`}}>
                              <div style={fm(clr,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Tomorrow Plan</div>
                              <p style={fm("#8a9aaa",12,{lineHeight:1.6})}>{mover.dayTradePlan}</p>
                            </div>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              <Tag label={`Close: ${mover.regularClose}`} color={MUTED}/>
                              <Tag label={`AH: ${mover.afterHoursPrice}`} color={clr}/>
                              <Tag label={mover.nextDayOutlook} color={mover.nextDayOutlook==="BULLISH"?GREEN:mover.nextDayOutlook==="BEARISH"?RED:GOLD}/>
                            </div>
                            {mover.keyLevels&&<div style={{marginTop:8,fontSize:11,color:"#6a7a8a",fontFamily:"'DM Sans',sans-serif"}}><strong>Key Levels:</strong> {mover.keyLevels}</div>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tomorrow's watchlist */}
                    {dtAfterHours.tomorrowWatchlist?.length>0&&(
                      <div style={{marginTop:14,background:DIM,borderRadius:6,padding:"10px 14px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={fm(WHITE,12,{fontWeight:700})}>👀 Watch Tomorrow:</span>
                        {dtAfterHours.tomorrowWatchlist.map((t,i)=>(
                          <div key={i} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:GREEN,letterSpacing:1}}>{t}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── PRE-MARKET REPORT ───────────────────────────────── */}
              <div style={{background:CARD,border:`1px solid ${GOLD}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:GOLD,letterSpacing:2,marginBottom:3}}>🌅 Pre-Market Report</div>
                    <div style={fm(MUTED,12)}>Futures, overnight gaps, and today's day trading setup</div>
                  </div>
                  <button onClick={fetchPreMarket} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {dtPreMarketLoading?"LOADING...":"🔄 REFRESH"}
                  </button>
                </div>

                {dtPreMarketLoading&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={fm(GOLD,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>LOADING PRE-MARKET DATA...</div>
                    <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:8},(_,i)=><div key={i} style={{width:3,height:16,background:GOLD,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.09}s infinite alternate`}}/>)}</div>
                  </div>
                )}

                {!dtPreMarket&&!dtPreMarketLoading&&(
                  <div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Pre-Market" or "Refresh" to see today's pre-market setup</div>
                )}

                {dtPreMarket&&!dtPreMarketLoading&&(
                  <div>
                    {/* Futures snapshot */}
                    {dtPreMarket.futuresSnapshot&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:16}}>
                        {[
                          {label:"S&P 500",val:dtPreMarket.futuresSnapshot.sp500},
                          {label:"NASDAQ",val:dtPreMarket.futuresSnapshot.nasdaq},
                          {label:"DOW",val:dtPreMarket.futuresSnapshot.dow},
                          {label:"VIX",val:dtPreMarket.futuresSnapshot.vix,neutral:true},
                        ].map((f,i)=>{
                          const isPos = f.val?.startsWith("+");
                          const clr = f.neutral?ORANGE:isPos?GREEN:RED;
                          return(
                            <div key={i} style={{background:DIM,borderRadius:6,padding:"10px 14px",textAlign:"center",border:`1px solid ${clr}33`}}>
                              <div style={fm(MUTED,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>{f.label}</div>
                              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:clr}}>{f.val}</div>
                            </div>
                          );
                        })}
                        <div style={{background:DIM,borderRadius:6,padding:"10px 14px",textAlign:"center",border:`1px solid ${dtPreMarket.marketOutlook?.includes("BULL")?GREEN:dtPreMarket.marketOutlook?.includes("BEAR")?RED:GOLD}33`,gridColumn:"span 2"}}>
                          <div style={fm(MUTED,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>Today's Outlook</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:dtPreMarket.marketOutlook?.includes("BULL")?GREEN:dtPreMarket.marketOutlook?.includes("BEAR")?RED:GOLD}}>{dtPreMarket.marketOutlook}</div>
                        </div>
                      </div>
                    )}
                    {dtPreMarket.dayTradingBias&&(
                      <div style={{background:`${GOLD}08`,borderRadius:5,padding:"10px 14px",marginBottom:14,borderLeft:`2px solid ${GOLD}`}}>
                        <div style={fm(GOLD,10,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:3})}>Day Trading Bias</div>
                        <p style={fm("#9a8a6a",13,{lineHeight:1.6})}>{dtPreMarket.dayTradingBias}</p>
                      </div>
                    )}
                    {dtPreMarket.economicEvents&&(
                      <div style={{marginBottom:14,background:DIM,borderRadius:5,padding:"8px 12px",borderLeft:`2px solid ${PURPLE}`}}>
                        <div style={fm(PURPLE,10,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:3})}>📅 Economic Events Today</div>
                        <p style={fm(MUTED,12,{lineHeight:1.6})}>{dtPreMarket.economicEvents}</p>
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                      {dtPreMarket.preMarketMovers?.map((m,i)=>{
                        const isUp = m.gapDirection==="UP";
                        const clr = isUp?GREEN:RED;
                        const gapColor = m.gapSize?.includes("HUGE")?RED:m.gapSize?.includes("LARGE")?ORANGE:GOLD;
                        return(
                          <div key={i} style={{background:DIM,border:`1px solid ${clr}33`,borderRadius:7,padding:"13px 15px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{m.ticker}</span>
                                  <Tag label={m.gapSize} color={gapColor}/>
                                </div>
                                <div style={fm(MUTED,12)}>{m.name}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:clr}}>{m.preMarketPct}</div>
                                <div style={fm(MUTED,10)}>{m.preMarketPrice}</div>
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

              {/* ── MOMENTUM MOVERS ─────────────────────────────────── */}
              <div style={{background:CARD,border:`1px solid ${RED}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:RED,letterSpacing:2,marginBottom:3}}>🔥 Momentum Movers</div>
                    <div style={fm(MUTED,12)}>Stocks with the strongest price momentum and catalysts right now</div>
                  </div>
                  <button onClick={fetchMomentumMovers} style={{background:`${RED}18`,border:`1px solid ${RED}44`,color:RED,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {dtMomentumLoading?"SCANNING...":"🔄 REFRESH"}
                  </button>
                </div>
                {dtMomentumLoading&&(
                  <div style={{textAlign:"center",padding:"20px 0"}}>
                    <div style={fm(RED,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>SCANNING MARKET FOR MOMENTUM...</div>
                    <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:9},(_,i)=><div key={i} style={{width:3,height:18,background:RED,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`}}/>)}</div>
                  </div>
                )}
                {!dtMomentum&&!dtMomentumLoading&&(
                  <div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Scan Movers" to find stocks with strongest momentum right now</div>
                )}
                {dtMomentum&&!dtMomentumLoading&&(
                  <div>
                    <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center"}}>
                      <p style={fm(MUTED,12,{flex:1,lineHeight:1.6})}>{dtMomentum.marketHighlight}</p>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <Tag label={dtMomentum.marketSession} color={ORANGE}/>
                        <Tag label={dtMomentum.marketMood} color={dtMomentum.marketMood==="RISK-ON"?GREEN:dtMomentum.marketMood==="RISK-OFF"?RED:GOLD}/>
                        <span style={fm(MUTED,11)}>{dtMomentum.timestamp}</span>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
                      {dtMomentum.topMovers?.map((m,i)=>{
                        const isUp = m.direction==="UP";
                        const clr = isUp?GREEN:RED;
                        const momColor = m.momentum==="STRONG"?clr:m.momentum==="BUILDING"?GOLD:MUTED;
                        return(
                          <div key={i} style={{background:DIM,border:`1px solid ${clr}44`,borderRadius:8,padding:"15px 17px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{m.ticker}</span>
                                  <Tag label={m.session} color={ORANGE}/>
                                  <Tag label={m.momentum} color={momColor}/>
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
                              <Tag label={m.signal} color={m.signal?.includes("BUY")?GREEN:m.signal?.includes("SHORT")?RED:GOLD}/>
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

              {/* ── SCALP SETUPS ────────────────────────────────────── */}
              <div style={{background:CARD,border:`1px solid ${CYAN}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:CYAN,letterSpacing:2,marginBottom:3}}>🎯 Scalp Setups</div>
                    <div style={fm(MUTED,12)}>Quick 1–5% intraday setups with precise entry, target, and stop loss</div>
                  </div>
                  <button onClick={fetchScalpSetups} style={{background:`${CYAN}18`,border:`1px solid ${CYAN}44`,color:CYAN,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {dtScalpsLoading?"SCANNING...":"🔄 REFRESH"}
                  </button>
                </div>
                {dtScalpsLoading&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={fm(CYAN,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>FINDING SCALP SETUPS...</div>
                    <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:8},(_,i)=><div key={i} style={{width:3,height:16,background:CYAN,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.09}s infinite alternate`}}/>)}</div>
                  </div>
                )}
                {!dtScalps&&!dtScalpsLoading&&(
                  <div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Refresh" to find today's best scalp setups</div>
                )}
                {dtScalps&&!dtScalpsLoading&&(
                  <div>
                    <div style={fm(MUTED,11,{marginBottom:10})}>Session: {dtScalps.session} • {dtScalps.timestamp}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                      {dtScalps.setups?.map((s,i)=>{
                        const urgColor = s.urgency==="NOW"?RED:s.urgency==="WATCH"?GOLD:MUTED;
                        return(
                          <div key={i} style={{background:DIM,border:`1px solid ${urgColor}44`,borderRadius:7,padding:"13px 15px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{s.ticker}</span>
                                  <Tag label={s.urgency} color={urgColor}/>
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
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <Tag label={`R:R ${s.riskReward}`} color={MUTED}/>
                              <Tag label={`Key: ${s.keyLevel}`} color={GOLD}/>
                              <Tag label={`${s.confidence}%`} color={urgColor}/>
                            </div>
                            {s.notes&&<div style={{fontSize:11,color:"#5a7a8a",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}><strong>⚠️ Invalidation:</strong> {s.notes}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SHORT SQUEEZE WATCH ─────────────────────────────── */}
              <div style={{background:CARD,border:`1px solid ${PINK}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:PINK,letterSpacing:2,marginBottom:3}}>🩳 Short Squeeze Watch</div>
                    <div style={fm(MUTED,12)}>High short interest stocks with squeeze potential — active, imminent, or building</div>
                  </div>
                  <button onClick={fetchShortSqueeze} style={{background:`${PINK}18`,border:`1px solid ${PINK}44`,color:PINK,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {dtSqueezeLoading?"SCANNING...":"🔄 REFRESH"}
                  </button>
                </div>
                {dtSqueezeLoading&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={fm(PINK,12,{letterSpacing:1,marginBottom:8,fontWeight:600})}>SCANNING SHORT INTEREST DATA...</div>
                    <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:8},(_,i)=><div key={i} style={{width:3,height:16,background:PINK,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.09}s infinite alternate`}}/>)}</div>
                  </div>
                )}
                {!dtSqueeze&&!dtSqueezeLoading&&(
                  <div style={{textAlign:"center",padding:"14px 0",color:MUTED,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Click "Refresh" to find current short squeeze candidates</div>
                )}
                {dtSqueeze&&!dtSqueezeLoading&&(
                  <div>
                    {dtSqueeze.activeSqueezes?.length>0&&(
                      <div style={{background:`${RED}08`,border:`1px solid ${RED}33`,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={fm(RED,12,{fontWeight:700})}>🔥 ACTIVE SQUEEZES:</span>
                        {dtSqueeze.activeSqueezes.map((t,i)=>(
                          <div key={i} style={{background:`${RED}18`,border:`1px solid ${RED}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'Bebas Neue',cursive",fontSize:14,color:RED,letterSpacing:1}}>{t}</div>
                        ))}
                      </div>
                    )}
                    <div style={fm(MUTED,12,{marginBottom:12,lineHeight:1.6})}>{dtSqueeze.summary}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:12}}>
                      {dtSqueeze.candidates?.map((c,i)=>{
                        const stageColor = c.squeezeStage==="ACTIVE"?RED:c.squeezeStage==="IMMINENT"?ORANGE:c.squeezeStage==="BUILDING"?GOLD:MUTED;
                        return(
                          <div key={i} style={{background:DIM,border:`1px solid ${stageColor}44`,borderRadius:7,padding:"13px 15px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{c.ticker}</span>
                                  <Tag label={c.squeezeStage} color={stageColor}/>
                                </div>
                                <div style={fm(MUTED,12)}>{c.name}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:PINK}}>{c.shortFloat}</div>
                                <div style={fm(MUTED,10)}>Short Float</div>
                              </div>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                              {[{l:"Days to Cover",v:c.daysTocover},{l:"Short Interest",v:c.shortInterest}].map((item,j)=>(
                                <div key={j} style={{background:CARD,borderRadius:4,padding:"5px 8px",textAlign:"center"}}>
                                  <div style={fm(MUTED,9,{textTransform:"uppercase",marginBottom:1})}>{item.l}</div>
                                  <div style={fm(WHITE,12,{fontWeight:600})}>{item.v}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{background:CARD,borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${stageColor}`}}>
                              <div style={fm(stageColor,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:700})}>Squeeze Catalyst</div>
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
                            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                              <Tag label={`Social: ${c.socialBuzz}`} color={c.socialBuzz==="High"?RED:GOLD}/>
                              <Tag label={`Inst: ${c.institutionalSupport}`} color={MUTED}/>
                              <Tag label={`${c.confidence}% CONF`} color={stageColor}/>
                            </div>
                            {c.risk&&<div style={{fontSize:11,color:"#5a6a7a",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}><strong>⚠️ Risk:</strong> {c.risk}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div style={{background:`${RED}08`,border:`1px solid ${RED}22`,borderRadius:6,padding:"12px 16px",marginTop:8}}>
                <p style={fm(MUTED,11,{lineHeight:1.7})}>
                  ⚠️ <strong style={{color:RED}}>Day Trading Risk Warning:</strong> Day trading involves substantial risk of loss and is not appropriate for all investors. Most day traders lose money. The setups above are AI-generated for informational purposes only and do NOT constitute financial advice. Never risk more than you can afford to lose. Always use stop losses.
                </p>
              </div>
            </div>
          )}
          {
          {tab==="watchlist"&&(
            <div>
              <div style={{marginBottom:16}}><Legend/></div>

              {/* ── CUSTOM TICKER SEARCH ─────────────────────────── */}
              <div style={{background:CARD,border:`1px solid ${GREEN}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={fm(GREEN,13,{letterSpacing:2,textTransform:"uppercase",marginBottom:10})}>🔍 Analyze Any Stock — Type Any Ticker</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <input
                    placeholder="Enter ticker (e.g. TSLA, PLTR, IONQ, ABNB...)"
                    value={customTicker}
                    onChange={e=>setCustomTicker(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&analyzeCustomTicker()}
                    style={{background:DIM,border:`1px solid ${GREEN}55`,color:WHITE,fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:3,padding:"10px 14px",borderRadius:5,width:280,outline:"none"}}
                  />
                  <button onClick={analyzeCustomTicker} disabled={customLoading||!customTicker.trim()} style={{background:`linear-gradient(135deg,${GREEN}22,${GREEN}11)`,border:`1px solid ${GREEN}55`,color:GREEN,fontFamily:"'Space Mono',monospace",fontSize:13,letterSpacing:2,padding:"11px 20px",borderRadius:5,cursor:"pointer",textTransform:"uppercase",opacity:customTicker.trim()?1:0.5}}>
                    {customLoading?"ANALYZING...":"▶ ANALYZE"}
                  </button>
                  {customStock&&<button onClick={()=>setCustomStock(null)} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,fontFamily:"'Space Mono',monospace",fontSize:12,padding:"10px 14px",borderRadius:5,cursor:"pointer"}}>✕ Clear</button>}
                </div>
                <div style={fm(MUTED,12,{marginTop:8})}>Works with ticker symbols (AAPL) or company names (Apple) — press Enter or click Analyze</div>
              </div>

              {/* Custom stock result */}
              {customStock&&(
                <div style={{marginBottom:24}}>
                  <div style={fm(GREEN,13,{letterSpacing:2,textTransform:"uppercase",marginBottom:12})}>📊 Custom Analysis — {customStock.ticker}</div>
                  <StockCard
                    stock={{ticker:customStock.ticker,name:customStock.result?.analystConsensus?customStock.ticker:customStock.ticker,sector:"Custom Search",tag:"CUSTOM"}}
                    subscribed={true}
                    analysesUsed={0}
                    onUseAnalysis={()=>true}
                    onPaywall={()=>setShowPaywall(true)}
                    prefetchedResult={customStock.result}
                  />
                </div>
              )}

              {/* ── TRENDING STOCKS ───────────────────────────────── */}
              <div style={{background:CARD,border:`1px solid ${ORANGE}33`,borderRadius:8,padding:18,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:ORANGE,letterSpacing:3,textShadow:`0 0 16px ${ORANGE}44`}}>🔥 Trending Now</div>
                    <div style={fm(MUTED,9)}>AI-detected stocks with market buzz + high profit potential</div>
                  </div>
                  <button onClick={fetchTrending} style={{background:`${ORANGE}18`,border:`1px solid ${ORANGE}44`,color:ORANGE,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:2,padding:"8px 16px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {trendingLoading?"SCANNING...":"▶ REFRESH TRENDING"}
                  </button>
                </div>
                {!trending&&!trendingLoading&&!trendingError&&(
                  <div style={{textAlign:"center",padding:"20px 0",color:MUTED,fontFamily:"'Space Mono',monospace",fontSize:13}}>Click "Refresh Trending" to see today's hottest high-potential stocks</div>
                )}
                {trendingLoading&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={fm(ORANGE,13,{letterSpacing:2,marginBottom:8})}>SCANNING MARKET FOR HOT STOCKS...</div>
                    <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:7},(_,i)=><div key={i} style={{width:3,height:16,background:ORANGE,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.1}s infinite alternate`,opacity:0.8}}/>)}</div>
                  </div>
                )}
                {trendingError&&<div style={fm(RED,9)}>{trendingError}</div>}
                {trending&&(
                  <div>
                    {/* Market mood banner */}
                    <div style={{background:DIM,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                      <div style={fm(MUTED,9)}>{trending.moodReason}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={fm(MUTED,12,{letterSpacing:1,textTransform:"uppercase"})}>Market:</span>
                        <Tag label={trending.marketMood} color={trending.marketMood==="BULLISH"?GREEN:trending.marketMood==="BEARISH"?RED:GOLD}/>
                        <span style={fm(MUTED,8)}>Updated: {trending.lastUpdated}</span>
                      </div>
                    </div>
                    {/* Top pick highlight */}
                    {trending.topPickToday&&(
                      <div style={{background:`${GREEN}0a`,border:`1px solid ${GREEN}44`,borderRadius:6,padding:"12px 14px",marginBottom:14,borderLeft:`3px solid ${GREEN}`}}>
                        <div style={fm(GREEN,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:4})}>⭐ TOP PICK TODAY: {trending.topPickToday}</div>
                        <p style={fm("#7a9a7a",9,{lineHeight:1.7})}>{trending.topPickReason}</p>
                      </div>
                    )}
                    {/* Trending grid */}
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
                                <div style={fm(MUTED,7)}>CONFIDENCE</div>
                              </div>
                            </div>
                            <div style={{background:"#0a0e18",borderRadius:4,padding:"7px 10px",marginBottom:8,borderLeft:`2px solid ${ORANGE}`}}>
                              <div style={fm(ORANGE,7,{letterSpacing:1,textTransform:"uppercase",marginBottom:2})}>Why Trending</div>
                              <p style={fm("#8a9aaa",8,{lineHeight:1.6})}>{t.reason}</p>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <Tag label={t.verdict} color={c.color}/>
                              <Tag label={`${t.profitPotential} POTENTIAL`} color={t.profitPotential==="HIGH"?GREEN:t.profitPotential==="MEDIUM"?GOLD:PURPLE}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── WATCHLIST HEADER WITH MODE TOGGLE ────────────── */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:16}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2,marginBottom:4}}>
                    {activeWatchlistMode==="dynamic"?"🤖 AI-Curated Watchlist":"📋 Standard Watchlist"}
                  </div>
                  <div style={fm(MUTED,9)}>
                    {activeWatchlistMode==="dynamic"
                      ? `Updated ${dynamicWatchlist?.generatedAt||"today"} • ${dynamicWatchlist?.marketContext||""}`
                      : "20 high-profile stocks — always available"}
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setActiveWatchlistMode("static")} style={{background:activeWatchlistMode==="static"?GREEN+"22":DIM,border:`1px solid ${activeWatchlistMode==="static"?GREEN+"55":BORDER}`,color:activeWatchlistMode==="static"?GREEN:MUTED,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:1,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    Standard
                  </button>
                  <button onClick={fetchDynamicWatchlist} style={{background:activeWatchlistMode==="dynamic"?PURPLE+"22":DIM,border:`1px solid ${activeWatchlistMode==="dynamic"?PURPLE+"55":BORDER}`,color:activeWatchlistMode==="dynamic"?PURPLE:MUTED,fontFamily:"'Space Mono',monospace",fontSize:12,letterSpacing:1,padding:"7px 14px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>
                    {watchlistLoading?"AI PICKING...":"🤖 AI Picks"}
                  </button>
                </div>
              </div>

              {/* Dynamic watchlist loading */}
              {watchlistLoading&&(
                <div style={{textAlign:"center",padding:"24px 0",marginBottom:16}}>
                  <div style={fm(PURPLE,13,{letterSpacing:2,marginBottom:10})}>AI IS ANALYZING THE MARKET FOR TOP OPPORTUNITIES...</div>
                  <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:9},(_,i)=><div key={i} style={{width:3,height:18,background:PURPLE,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`,opacity:0.75}}/>)}</div>
                  <div style={fm(MUTED,12,{marginTop:8})}>Searching for highest profit potential stocks right now...</div>
                </div>
              )}

              {/* Dynamic watchlist info cards */}
              {activeWatchlistMode==="dynamic"&&dynamicWatchlist&&!watchlistLoading&&(
                <div style={{background:`${PURPLE}0a`,border:`1px solid ${PURPLE}33`,borderRadius:6,padding:"10px 14px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:14}}>🤖</span>
                  <span style={fm("#9a7aaa",9,{lineHeight:1.7,flex:1})}>AI selected these {dynamicWatchlist.stocks?.length} stocks based on current market conditions. Click Analyze on any to get the full data-backed report.</span>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {dynamicWatchlist.stocks?.slice(0,3).map((s,i)=>(
                      <div key={i} style={{background:DIM,borderRadius:4,padding:"4px 10px",display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:WHITE,letterSpacing:1}}>{s.ticker}</span>
                        <span style={fm(GREEN,8)}>{s.upside}</span>
                      </div>
                    ))}
                    {dynamicWatchlist.stocks?.length>3&&<span style={fm(MUTED,8)}>+{dynamicWatchlist.stocks.length-3} more</span>}
                  </div>
                </div>
              )}

              {/* Filters (only for static mode) */}
              {activeWatchlistMode==="static"&&(
                <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
                  <input placeholder="Search ticker or name…" value={search} onChange={e=>setSearch(e.target.value)} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:13,padding:"7px 12px",borderRadius:4,width:210}}/>
                  {[{l:"Sector",v:sectorFilter,s:setSectorFilter,opts:SECTORS},{l:"Tag",v:tagFilter,s:setTagFilter,opts:TAGS}].map(({l,v,s,opts})=>(
                    <select key={l} value={v} onChange={e=>s(e.target.value)} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:13,padding:"7px 10px",borderRadius:4,cursor:"pointer"}}>{opts.map(o=><option key={o} value={o}>{l}: {o}</option>)}</select>
                  ))}
                  <span style={fm(MUTED,8)}>{filteredStocks.length} stocks</span>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                {(activeWatchlistMode==="dynamic"&&dynamicWatchlist?.stocks
                  ? dynamicWatchlist.stocks.map(s=>({...s,confidence:s.confidence}))
                  : filteredStocks
                ).map((stock,i)=>{
                  const locked=!subscribed&&i>=FREE_LIMIT&&activeWatchlistMode==="static";
                  return locked?(
                    <div key={stock.ticker} style={{position:"relative"}}>
                      <div style={{pointerEvents:"none",filter:"blur(4px) brightness(.35)",userSelect:"none"}}><StockCard stock={stock} subscribed={false} analysesUsed={FREE_LIMIT+1} onUseAnalysis={()=>false} onPaywall={()=>{}}/></div>
                      <div onClick={()=>setShowPaywall(true)} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#07090dcc",borderRadius:8}}>
                        <div style={{fontSize:24,marginBottom:6}}>🔒</div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:GOLD,letterSpacing:3}}>PRO ONLY</div>
                        <div style={fm(MUTED,12,{marginTop:3})}>Subscribe to unlock all 20 stocks</div>
                      </div>
                    </div>
                  ):(
                    <StockCard key={stock.ticker} stock={stock} subscribed={subscribed} analysesUsed={analysesUsed} onUseAnalysis={handleUseAnalysis} onPaywall={()=>setShowPaywall(true)}/>
                  );
                })}
              </div>
            </div>
          )}
          {tab==="smartmoney"&&<SmartMoneyTab subscribed={subscribed} onPaywall={()=>setShowPaywall(true)} liveActivity={smartMoneyActivity} activityLoading={smartMoneyLoading} onRefreshActivity={fetchSmartMoneyActivity}/>}
          {tab==="options"&&<OptionsTab subscribed={subscribed} onPaywall={()=>setShowPaywall(true)} dynamicOptions={dynamicOptions} dynamicOptionsLoading={dynamicOptionsLoading} onFetchDynamic={fetchDynamicOptions}/>}
          {tab==="screener"&&<Screener subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>}
          {tab==="gems"&&(
            <div>
              {/* Header */}
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:PURPLE,letterSpacing:3,textShadow:`0 0 20px ${PURPLE}44`,marginBottom:4}}>Hidden Gems 💎</div>
                    <p style={fm(MUTED,12,{lineHeight:1.7,maxWidth:600})}>Underfollowed stocks with high breakout potential — AI-curated from real-time market data</p>
                  </div>
                  <button onClick={fetchDynamicGems} style={{background:`${PURPLE}18`,border:`1px solid ${PURPLE}44`,color:PURPLE,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:0.5,padding:"9px 18px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
                    {gemsLoading?"🔍 SCANNING...":"🔄 REFRESH GEMS"}
                  </button>
                </div>
              </div>

              {/* Dynamic Gems Section */}
              {gemsLoading&&(
                <div style={{textAlign:"center",padding:"24px 0",marginBottom:16}}>
                  <div style={fm(PURPLE,12,{letterSpacing:1,marginBottom:10,fontWeight:600})}>AI SCANNING FOR HIDDEN OPPORTUNITIES...</div>
                  <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:9},(_,i)=><div key={i} style={{width:3,height:18,background:PURPLE,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`,opacity:0.75}}/>)}</div>
                  <div style={fm(MUTED,11,{marginTop:8})}>Searching for undervalued stocks with high breakout potential...</div>
                </div>
              )}

              {dynamicGems&&!gemsLoading&&(
                <div style={{background:`${PURPLE}08`,border:`1px solid ${PURPLE}22`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={fm(MUTED,12,{flex:1})}>{dynamicGems.marketContext}</div>
                  <div style={fm(MUTED,11)}>Updated: {dynamicGems.lastUpdated}</div>
                </div>
              )}

              {/* Dynamic gems grid */}
              {dynamicGems&&!gemsLoading&&(
                <div style={{marginBottom:24}}>
                  <div style={fm(PURPLE,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:12})}>🤖 AI-Detected Opportunities ({dynamicGems.gems?.length} gems found)</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                    {dynamicGems.gems?.map((gem,i)=>{
                      const c=CONFIDENCE_MAP[gem.verdict]||CONFIDENCE_MAP["BUY"];
                      return(
                        <div key={i} style={{background:CARD,border:`1px solid ${c.color}33`,borderRadius:8,padding:18}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                            <div>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{gem.ticker}</span>
                                <Tag label={gem.verdict} color={c.color}/>
                              </div>
                              <div style={fm(MUTED,12,{marginBottom:4})}>{gem.name}</div>
                              <Tag label={gem.sector} color={MUTED}/>
                            </div>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:GREEN}}>{gem.upside}</div>
                              <div style={fm(MUTED,10)}>UPSIDE</div>
                            </div>
                          </div>
                          <div style={{background:DIM,borderRadius:5,padding:"8px 12px",marginBottom:10,borderLeft:`2px solid ${PURPLE}`}}>
                            <div style={fm(PURPLE,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:3,fontWeight:700})}>Why This Gem</div>
                            <p style={fm("#9a8ab5",12,{lineHeight:1.7})}>{gem.why}</p>
                          </div>
                          <div style={{background:DIM,borderRadius:5,padding:"8px 12px",marginBottom:10,borderLeft:`2px solid ${GOLD}`}}>
                            <div style={fm(GOLD,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:3,fontWeight:700})}>Upcoming Catalyst</div>
                            <p style={fm("#9a8a6a",12,{lineHeight:1.7})}>{gem.catalyst}</p>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                            <Tag label={`${gem.confidence}% CONFIDENCE`} color={c.color}/>
                            <Tag label={`⏱ ${gem.timeframe}`} color={MUTED}/>
                            <Tag label={`Mkt Cap: ${gem.marketCap}`} color={MUTED}/>
                          </div>
                          {gem.risk&&<div style={{marginTop:8,fontSize:11,color:"#6a5a7a",fontFamily:"'DM Sans',sans-serif"}}><strong>Risk:</strong> {gem.risk}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Static gems as fallback */}
              <div style={{marginTop:dynamicGems?24:0}}>
                {dynamicGems&&<div style={fm(MUTED,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:12})}>📋 Standard Watchlist Gems</div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                  {HIDDEN_GEMS.map(gem=><GemCard key={gem.ticker} gem={gem} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>)}
                </div>
              </div>
            </div>
          )}
          {tab==="ipos"&&(
            <div>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:18}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:CYAN,letterSpacing:3,textShadow:`0 0 20px ${CYAN}44`,marginBottom:4}}>IPO Watch 🚀</div>
                  <p style={fm(MUTED,12,{lineHeight:1.7,maxWidth:600})}>Real-time upcoming IPOs with AI profit analysis — updated as new filings emerge</p>
                </div>
                <button onClick={onRefresh} style={{background:`${CYAN}18`,border:`1px solid ${CYAN}44`,color:CYAN,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:"9px 18px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
                  {ipoLoading?"🔍 SCANNING...":"🔄 REFRESH IPO LIST"}
                </button>
              </div>
              <div style={{marginBottom:16}}><Legend/></div>

              {/* Dynamic IPO loading */}
              {ipoLoading&&(
                <div style={{textAlign:"center",padding:"24px 0",marginBottom:16}}>
                  <div style={fm(CYAN,12,{letterSpacing:1,marginBottom:10,fontWeight:600})}>SCANNING FOR LATEST IPO FILINGS...</div>
                  <div style={{display:"flex",justifyContent:"center",gap:3}}>{Array.from({length:9},(_,i)=><div key={i} style={{width:3,height:18,background:CYAN,borderRadius:2,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`,opacity:0.75}}/>)}</div>
                  <div style={fm(MUTED,11,{marginTop:8})}>Searching SEC filings, news, and financial data for upcoming IPOs...</div>
                </div>
              )}

              {/* Dynamic IPO market note */}
              {dynamicIPOs&&!ipoLoading&&(
                <div style={{background:`${CYAN}08`,border:`1px solid ${CYAN}22`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={fm(MUTED,12,{flex:1})}>{dynamicIPOs.marketNote}</div>
                  <div style={fm(MUTED,11)}>Updated: {dynamicIPOs.lastUpdated}</div>
                </div>
              )}

              {/* Dynamic IPO grid */}
              {dynamicIPOs&&!ipoLoading&&(
                <div style={{marginBottom:28}}>
                  <div style={fm(CYAN,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:12})}>🤖 Latest IPO Intelligence ({dynamicIPOs.ipos?.length} opportunities)</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                    {dynamicIPOs.ipos?.map((ipo,i)=>{
                      const c=CONFIDENCE_MAP[ipo.verdict]||CONFIDENCE_MAP["SPECULATIVE"];
                      return(
                        <div key={i} style={{background:CARD,border:`1px solid ${c.color}33`,borderRadius:8,padding:18}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                            <div>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{ipo.ticker||"TBD"}</span>
                                <Tag label={ipo.verdict} color={c.color}/>
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
                          <div style={{background:DIM,borderRadius:5,padding:"8px 12px",marginBottom:10,borderLeft:`2px solid ${CYAN}`}}>
                            <div style={fm(CYAN,10,{letterSpacing:1,textTransform:"uppercase",marginBottom:3,fontWeight:700})}>Why Now</div>
                            <p style={fm("#6a9aaa",12,{lineHeight:1.7})}>{ipo.whyNow}</p>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                            <Tag label={`📅 ${ipo.estTiming}`} color={MUTED}/>
                            <Tag label={ipo.valuation} color={GOLD}/>
                            <Tag label={ipo.profitPotential} color={ipo.profitPotential==="HIGH"?GREEN:ipo.profitPotential==="MEDIUM"?GOLD:PURPLE}/>
                          </div>
                          {ipo.risks&&<div style={{marginTop:8,fontSize:11,color:"#5a7a8a",fontFamily:"'DM Sans',sans-serif"}}><strong>Risk:</strong> {ipo.risks}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Static IPOs as fallback */}
              <div>
                {dynamicIPOs&&<div style={fm(MUTED,11,{letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:12})}>📋 Previously Tracked IPOs</div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                  {UPCOMING_IPOS.map(ipo=><IPOCard key={ipo.name} ipo={ipo} subscribed={subscribed} onPaywall={onPaywall}/>)}
                </div>
              </div>
            </div>
          )}
          {tab==="portfolio"&&<Portfolio subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>}
        </div>

        <div style={{borderTop:`1px solid ${BORDER}`,padding:"11px 28px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span style={fm("#1a2230",8)}>STOCKSIGHT © 2026 — FOR INFORMATIONAL PURPOSES ONLY. NOT FINANCIAL ADVICE. ALL CONGRESSIONAL & HEDGE FUND DATA IS FROM PUBLIC DISCLOSURES.</span>
          <span style={fm("#1a2230",12)}>FOR INFORMATIONAL PURPOSES ONLY — NOT FINANCIAL ADVICE</span>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8}}>
            <button onClick={()=>setShowTerms(true)} style={{background:"none",border:"none",color:"#2a3a4a",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</button>
            <button onClick={()=>setShowPrivacy(true)} style={{background:"none",border:"none",color:"#2a3a4a",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</button>
            <span style={{color:"#1a2a3a",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>© 2026 StockMoolah. All rights reserved.</span>
          </div>
        </div>
      </div>
      {showPaywall&&<Paywall onClose={()=>setShowPaywall(false)} onSubscribe={handleSubscribe}/>}
      {showTerms&&<TermsModal onClose={()=>setShowTerms(false)}/>}
      {showPrivacy&&<PrivacyModal onClose={()=>setShowPrivacy(false)}/>}
      {showToast&&(
        <div style={{position:"fixed",bottom:24,right:24,background:GREEN,color:"#000",fontFamily:"'Space Mono',monospace",fontSize:11,padding:"12px 20px",borderRadius:6,zIndex:300,boxShadow:`0 0 30px ${GREEN}66`,animation:"fadeUp .3s ease"}}>
          ✓ PRO UNLOCKED — All 7 features active
        </div>
      )}
    </>
  );
}
