import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FREE_LIMIT = 2;
const BG     = "#07090d";
const CARD   = "#0c0f15";
const BORDER = "#161c26";
const GREEN  = "#00f5a0";
const RED    = "#ff3d6b";
const GOLD   = "#f5c842";
const BLUE   = "#4da6ff";
const PURPLE = "#b06bff";
const CYAN   = "#00d4ff";
const ORANGE = "#ff8c42";
const PINK   = "#ff6eb4";
const WHITE  = "#e8edf5";
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

async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:user}] })
  });
  const data = await res.json();
  const text = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
  return JSON.parse(text.replace(/```json|```/g,"").trim());
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

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const fm = (color,size=9,extra={})=>({fontFamily:"'Space Mono',monospace",fontSize:size,color,...extra});

function Pulse({color,size=7}){
  return <span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`,animation:"pulseDot 1.4s ease-in-out infinite"}}/>;
}
function Tag({label,color=MUTED}){
  return <span style={{...fm(color,8),letterSpacing:1,background:color+"18",border:`1px solid ${color}33`,borderRadius:3,padding:"2px 7px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;
}
function ScoreRow({label,value,color}){
  return(
    <div style={{marginBottom:6}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase"})}>{label}</span>
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
        <span style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase"})}>Buy Confidence</span>
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
      <div style={fm(MUTED,7,{letterSpacing:1,textTransform:"uppercase",marginBottom:3})}>{label}</div>
      <div style={fm(color,10,{lineHeight:1.6})}>{value}</div>
    </div>
  );
}
function WhyBox({text,icon="🔍",label="WHY THIS RATING — DATA-BACKED REASONING"}){
  return(
    <div style={{background:"#0a1020",border:`1px solid ${BLUE}33`,borderRadius:6,padding:"13px 14px",borderLeft:`3px solid ${BLUE}`}}>
      <div style={fm(BLUE,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:8})}>{icon} {label}</div>
      <p style={fm("#8fa5be",10,{lineHeight:1.9})}>{text}</p>
    </div>
  );
}
function LoadingAnim({msg="FETCHING LIVE DATA..."}){
  return(
    <div style={{padding:"22px 0",textAlign:"center"}}>
      <div style={fm(GREEN,9,{letterSpacing:2,marginBottom:10})}>{msg}</div>
      <div style={{display:"flex",justifyContent:"center",gap:3}}>
        {Array.from({length:9},(_,i)=>(
          <div key={i} style={{width:3,borderRadius:2,background:GREEN,height:18,animation:`barAnim 0.9s ease-in-out ${i*0.08}s infinite alternate`,opacity:0.75}}/>
        ))}
      </div>
      <div style={fm(MUTED,8,{marginTop:9})}>Searching public disclosures · SEC filings · STOCK Act records</div>
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
  return <div style={fm(color,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:7})}>{icon&&icon+" "}{children}</div>;
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
      <span style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase",marginRight:4})}>Confidence Scale:</span>
      {Object.entries(CONFIDENCE_MAP).map(([v,c])=>(
        <div key={v} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c.color,boxShadow:`0 0 6px ${c.color}`}}/>
          <span style={fm(c.color,8)}>{c.pct} — {c.label}</span>
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
      const r = await callClaude(SMART_MONEY_SYSTEM,
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
            <div style={fm(MUTED,9,{marginBottom:6})}>{trader.role}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Tag label={trader.track} color={MUTED}/>
              <Tag label={trader.historicalReturn} color={GREEN}/>
            </div>
          </div>
        </div>

        {/* Known For */}
        <div style={{ marginTop:12, background:DIM, borderRadius:5, padding:"9px 11px", borderLeft:`2px solid ${trader.avatarColor}` }}>
          <div style={fm(trader.avatarColor,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>🏆 Known For</div>
          <p style={fm("#7a8aaa",9,{lineHeight:1.7})}>{trader.knownFor}</p>
        </div>

        {/* Data source badge */}
        <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10 }}>📂</span>
          <span style={fm(MUTED,8,{letterSpacing:1})}>Source: {trader.dataSource} (public record)</span>
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
            fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2,
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
                <div style={fm(MUTED,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:4})}>Copy Trade Signal</div>
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
                <span style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase"})}>Follow Signal Strength</span>
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
                <p style={fm("#8a9aaa",9,{lineHeight:1.7})}>{result.overallTrackRecord}</p>
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
                        <p style={fm("#6a8aaa",9,{lineHeight:1.65})}>{trade.whyItMatters}</p>
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
                        <span style={fm(GOLD,9,{minWidth:60,textAlign:"right"})}>{h.concentration}</span>
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
                <div style={fm(PINK,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:8})}>🤔 SHOULD YOU FOLLOW THIS TRADER?</div>
                <p style={fm("#be8fa5",10,{lineHeight:1.9})}>{result.copyTradeReasoning}</p>
              </div>
            )}

            {/* Red flags */}
            {result.redFlags?.filter(f=>f&&f.length>3).length > 0 && (
              <div style={{ background:RED+"08", border:`1px solid ${RED}33`, borderRadius:5, padding:"10px 12px" }}>
                <SectionLabel color={RED} icon="⚠">Watch Out For</SectionLabel>
                {result.redFlags.filter(f=>f&&f.length>3).map((rf,i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <span style={{ color:RED, fontSize:9, flexShrink:0 }}>▼</span>
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
                <p style={fm(ORANGE,8,{lineHeight:1.7})}>{result.dataDisclaimer}</p>
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
        <div style={fm(MUTED,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:10})}>📚 How Smart Money Data Works</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          {[
            { icon:"🏛️", label:"Congress (STOCK Act)", desc:"Members of Congress must disclose trades within 45 days. Data is public via house.gov and senate.gov.", color:BLUE },
            { icon:"🏦", label:"Hedge Funds (13F)", desc:"Funds >$100M AUM must file quarterly 13Fs with the SEC showing all long equity positions.", color:GOLD },
            { icon:"📊", label:"Fund Managers", desc:"Some managers like Cathie Wood publish daily holdings changes publicly on their fund websites.", color:PURPLE },
          ].map(({icon,label,desc,color})=>(
            <div key={label} style={{ background:DIM, borderRadius:5, padding:"10px 12px", borderLeft:`2px solid ${color}` }}>
              <div style={fm(color,9,{letterSpacing:1,marginBottom:4})}>{icon} {label}</div>
              <p style={fm(MUTED,8,{lineHeight:1.65})}>{desc}</p>
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
        <span style={fm(MUTED,8,{alignSelf:"center",marginLeft:4})}>{filtered.length} traders</span>
      </div>

      {/* Legal note */}
      <div style={{ background:"#0a0e14", border:`1px solid ${BLUE}22`, borderRadius:6, padding:"10px 14px", marginBottom:20, display:"flex", gap:10 }}>
        <span style={{ fontSize:13, flexShrink:0 }}>⚖️</span>
        <p style={fm(MUTED,8,{lineHeight:1.7})}>
          <span style={{ color:BLUE }}>All data shown is from legally mandated public disclosures.</span> Congressional trades are disclosed via the STOCK Act (2012). Hedge fund positions come from SEC 13F quarterly filings. Copy-trading based on this data is legal. Note: Congress disclosures can lag up to 45 days; 13F filings lag up to 45 days after quarter end.
        </p>
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
              <div style={fm(MUTED,7,{letterSpacing:1})}>{l}</div>
            </div>
          ))}
          <button onClick={()=>setExpanded(e=>!e)} style={{background:ac.color+"18",border:`1px solid ${ac.color}44`,color:ac.color,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>{expanded?"▲":"▼"}</button>
        </div>
      </div>
      {expanded&&(
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,borderTop:`1px solid ${BORDER}`}}>
          <div style={{background:"#0a1520",border:`1px solid ${CYAN}33`,borderRadius:6,padding:"12px 14px"}}>
            <div style={fm(CYAN,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:8})}>💡 PLAIN ENGLISH EXPLANATION</div>
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
            <div style={{background:GREEN+"0d",border:`1px solid ${GREEN}33`,borderRadius:5,padding:"10px 12px"}}><div style={fm(GREEN,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:6})}>⏰ When to Enter</div><p style={fm(WHITE,9,{lineHeight:1.7})}>{trade.entryTiming}</p></div>
            <div style={{background:GOLD+"0d",border:`1px solid ${GOLD}33`,borderRadius:5,padding:"10px 12px"}}><div style={fm(GOLD,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:6})}>🎯 How to Exit</div><p style={fm(WHITE,9,{lineHeight:1.7})}>{trade.exitStrategy}</p></div>
          </div>
          <WhyBox text={trade.whyThisTrade} icon="📊" label="WHY THIS TRADE — DATA-BACKED"/>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{fontSize:13}}>👤</span><div><div style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:3})}>Ideal For</div><p style={fm("#8a9aaa",9,{lineHeight:1.6})}>{trade.idealFor}</p></div></div>
          {trade.warningLabel&&<div style={{background:ORANGE+"0d",border:`1px solid ${ORANGE}44`,borderRadius:5,padding:"9px 12px",display:"flex",gap:8}}><span style={{fontSize:13,flexShrink:0}}>⚠️</span><p style={fm(ORANGE,9,{lineHeight:1.65})}>{trade.warningLabel}</p></div>}
        </div>
      )}
    </div>
  );
}

function OptionsTab({subscribed,onPaywall}){
  const [selectedTicker,setSelectedTicker]=useState("NVDA");
  const [state,setState]=useState("idle");
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const selectedStock=OPTIONS_UNIVERSE.find(s=>s.ticker===selectedTicker)||OPTIONS_UNIVERSE[0];
  const run=async()=>{
    if(!subscribed){onPaywall();return;}
    setState("loading");setResult(null);setError(null);
    try{
      const r=await callClaude(OPTIONS_SYSTEM,`Generate 3 options setups for ${selectedTicker} (${selectedStock.name}). Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}. Search for next earnings date, current IV vs HV, recent price action, key levels. Provide 3 distinct trades — conservative, moderate, aggressive.`);
      setResult(r);setState("done");
    }catch(e){setError("Options analysis failed.");setState("error");}
  };
  const bias=result?(BIAS_CONFIG[result.marketBias]||BIAS_CONFIG.NEUTRAL):null;
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:ORANGE,letterSpacing:3,textShadow:`0 0 20px ${ORANGE}44`,marginBottom:6}}>Options Trading 📊</div>
        <p style={fm(MUTED,10,{lineHeight:1.7,maxWidth:640})}>AI-powered options trade suggestions based on live earnings dates, IV, technicals, and market catalysts. 3 setups per stock — conservative to aggressive.</p>
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:7,padding:"12px 16px",marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <span style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase",marginRight:4})}>Quick Guide:</span>
        {[["BUY CALL",GREEN,"Stock goes UP → profit"],["BUY PUT",RED,"Stock goes DOWN → profit"],["SELL CALL",GREEN,"Collect premium, bullish/neutral"],["SELL PUT",RED,"Collect premium, bullish on dip"]].map(([l,c,d])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`}}/><span style={fm(c,8,{letterSpacing:1})}>{l}</span><span style={fm(MUTED,7,{marginLeft:4})}>{d}</span></div>
        ))}
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:18,marginBottom:20}}>
        <div style={fm(MUTED,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:12})}>Select Stock</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {OPTIONS_UNIVERSE.map(s=>(
            <button key={s.ticker} onClick={()=>{setSelectedTicker(s.ticker);setState("idle");setResult(null);}} style={{background:selectedTicker===s.ticker?ORANGE+"22":DIM,border:`1px solid ${selectedTicker===s.ticker?ORANGE+"66":BORDER}`,color:selectedTicker===s.ticker?ORANGE:MUTED,fontFamily:"'Bebas Neue',cursive",fontSize:14,letterSpacing:2,padding:"6px 14px",borderRadius:5,cursor:"pointer",transition:"all .15s"}}>{s.ticker}</button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div><div style={fm(WHITE,11)}>{selectedStock.name}</div><Tag label={selectedStock.sector} color={MUTED}/></div>
          <button onClick={run} style={{background:subscribed?`${ORANGE}22`:DIM,border:`1px solid ${subscribed?ORANGE+"55":BORDER}`,color:subscribed?ORANGE:MUTED,fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:2,padding:"11px 24px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>
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
                <p style={fm("#7a8aaa",9,{lineHeight:1.7,maxWidth:480})}>{result.biasSummary}</p>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[["Price",result.currentPrice,WHITE],["Earnings",result.nextEarningsDate,GOLD],["Implied Move",result.impliedMove,ORANGE],["IV Rank",result.ivRank,PURPLE]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:DIM,border:`1px solid ${BORDER}`,borderRadius:5,padding:"8px 12px",minWidth:80}}>
                    <div style={fm(MUTED,7,{letterSpacing:1,textTransform:"uppercase",marginBottom:3})}>{l}</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {result.keyLevels&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["🟢 Support",result.keyLevels.support,GREEN],["🔴 Resistance",result.keyLevels.resistance,RED],["📊 50MA",result.keyLevels.ma50,BLUE],["📈 200MA",result.keyLevels.ma200,PURPLE]].map(([l,v,c])=>(
                  <div key={l} style={{background:c+"0d",border:`1px solid ${c}33`,borderRadius:5,padding:"6px 10px"}}><span style={fm(MUTED,8,{marginRight:5})}>{l}</span><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:c}}>{v}</span></div>
                ))}
              </div>
            )}
          </div>
          <div><div style={fm(MUTED,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:10})}>3 Trade Setups — Click to Expand</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{result.trades?.map((trade,i)=><OptionTradeCard key={i} trade={trade} index={i+1}/>)}</div></div>
          {result.dataSources?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.dataSources.map((ds,i)=><Tag key={i} label={ds} color={MUTED}/>)}</div>}
          <div style={{background:"#0a0c10",border:`1px solid ${ORANGE}22`,borderRadius:6,padding:"12px 14px",display:"flex",gap:10}}><span style={{fontSize:14,flexShrink:0}}>⚠️</span><p style={fm(MUTED,8,{lineHeight:1.7})}>{result.optionsDisclaimer||"Options trading involves substantial risk. These are AI-generated educational suggestions, not financial advice. You can lose your entire premium."}</p></div>
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
      {result.newsHighlights?.length>0&&<div><SectionLabel color={MUTED} icon="📰">Recent News</SectionLabel>{result.newsHighlights.map((n,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:BLUE,fontSize:9,flexShrink:0}}>◆</span><span style={fm("#6a8aaa",9,{lineHeight:1.65})}>{n}</span></div>)}</div>}
      {result.catalysts?.length>0&&<div><SectionLabel color={MUTED} icon="▲">Catalysts</SectionLabel>{result.catalysts.map((c2,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:GREEN,fontSize:9,flexShrink:0}}>▲</span><span style={fm("#6a7a8a",9,{lineHeight:1.65})}>{c2}</span></div>)}</div>}
      {result.risks?.length>0&&<div><SectionLabel color={MUTED} icon="▼">Risks</SectionLabel>{result.risks.map((r,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:RED,fontSize:9,flexShrink:0}}>▼</span><span style={fm("#6a7a8a",9,{lineHeight:1.65})}>{r}</span></div>)}</div>}
      {result.macroFactors&&<div style={{background:DIM,border:`1px solid ${PURPLE}33`,borderRadius:5,padding:"9px 11px",borderLeft:`2px solid ${PURPLE}`}}><SectionLabel color={PURPLE} icon="🌐">Macro Context</SectionLabel><p style={fm("#7a8a9a",9,{lineHeight:1.7})}>{result.macroFactors}</p></div>}
      {result.dataSources?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.dataSources.map((ds,i)=><Tag key={i} label={ds} color={MUTED}/>)}</div>}
      <div style={fm("#1e2a38",8)}>Updated: {result.lastUpdated||new Date().toLocaleDateString()}</div>
    </div>
  );
}
function StockCard({stock,subscribed,analysesUsed,onUseAnalysis,onPaywall}){
  const [state,setState]=useState("idle");
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const isLocked=!subscribed&&analysesUsed>=FREE_LIMIT;
  const c=result?(CONFIDENCE_MAP[result.verdict]||CONFIDENCE_MAP["HOLD"]):null;
  const run=async()=>{
    if(isLocked){onPaywall();return;}
    if(!onUseAnalysis())return;
    setState("loading");
    try{const r=await callClaude(STOCK_SYSTEM,`Analyze ${stock.ticker} (${stock.name}) in ${stock.sector}. Search latest earnings, analyst ratings, recent news. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setResult(r);setState("done");}
    catch(e){setError("Failed. Retry.");setState("error");}
  };
  return(
    <div style={{background:CARD,border:`1px solid ${c?c.color+"33":BORDER}`,borderRadius:8,padding:18,display:"flex",flexDirection:"column",gap:12,boxShadow:c?`0 0 22px ${c.color}0a`:"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:WHITE,letterSpacing:3}}>{stock.ticker}</span><Tag label={stock.tag} color={stock.tag==="HOT"?RED:stock.tag==="VOLATILE"?GOLD:stock.tag==="AI-CORE"?GREEN:BLUE}/></div><div style={fm(MUTED,9,{marginBottom:4})}>{stock.name}</div><Tag label={stock.sector} color={MUTED}/></div>
        <MiniSpark trend={result?(result.verdict.includes("BUY")?"up":"down"):"up"} color={c?.color||GREEN}/>
      </div>
      {state==="idle"&&<button onClick={run} style={{background:isLocked?DIM:`${GREEN}14`,border:`1px solid ${isLocked?BORDER:GREEN+"44"}`,color:isLocked?MUTED:GREEN,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,padding:"10px 0",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{isLocked?"🔒 UNLOCK WITH PRO":"▶ ANALYZE WITH LIVE DATA"}</button>}
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
  const run=async()=>{if(!subscribed){onPaywall();return;}setState("loading");try{const r=await callClaude(GEM_SYSTEM,`Analyze ${gem.ticker} (${gem.name}) in ${gem.sector}. Thesis: ${gem.why}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setResult(r);setState("done");}catch{setState("error");}};
  return(
    <div style={{background:CARD,border:`1px solid ${c?c.color+"33":BORDER}`,borderRadius:8,padding:18,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:3}}>{gem.ticker}</span><Tag label="HIDDEN GEM" color={PURPLE}/></div><div style={fm(MUTED,9,{marginBottom:4})}>{gem.name}</div><Tag label={gem.sector} color={MUTED}/></div><MiniSpark trend="up" color={c?.color||PURPLE}/></div>
      <div style={{background:DIM,borderRadius:5,padding:"8px 10px",borderLeft:`2px solid ${PURPLE}`}}><div style={fm(PURPLE,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:3})}>Investment Thesis</div><p style={fm("#7a8aaa",9,{lineHeight:1.65})}>{gem.why}</p></div>
      {state==="idle"&&<button onClick={run} style={{background:subscribed?`${PURPLE}14`:DIM,border:`1px solid ${subscribed?PURPLE+"44":BORDER}`,color:subscribed?PURPLE:MUTED,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,padding:"9px 0",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{subscribed?"▶ DEEP DIVE ANALYSIS":"🔒 PRO — Unlock"}</button>}
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
  const run=async()=>{if(!subscribed){onPaywall();return;}setState("loading");try{const r=await callClaude(IPO_SYSTEM,`Analyze IPO: ${ipo.name} (${ipo.sector}). Info: ${ipo.description}. Timing: ${ipo.estTiming}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setResult(r);setState("done");}catch{setState("error");}};
  const confColor=result?result.buyConfidence>=75?GREEN:result.buyConfidence>=55?GOLD:result.buyConfidence>=35?BLUE:RED:MUTED;
  return(
    <div style={{background:CARD,border:`1px solid ${c?c.color+"33":BORDER}`,borderRadius:8,padding:18,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:WHITE,letterSpacing:2}}>{ipo.name}</span>{ipo.estTiming==="PUBLIC"&&<Tag label="LIVE" color={GREEN}/>}</div><div style={fm(MUTED,9,{marginBottom:4})}>{ipo.sector}</div><Tag label={`Est. ${ipo.estTiming}`} color={GOLD}/></div><div style={{textAlign:"center"}}>{result?<div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,color:confColor}}>{result.buyConfidence}%</div><div style={fm(MUTED,8)}>Buy Confidence</div></div>:<div style={{width:50,height:50,borderRadius:"50%",border:`2px dashed ${BORDER}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={fm(MUTED,9)}>?</span></div>}</div></div>
      <p style={fm(MUTED,9,{lineHeight:1.65})}>{ipo.description}</p>
      {state==="idle"&&<button onClick={run} style={{background:subscribed?`${CYAN}14`:DIM,border:`1px solid ${subscribed?CYAN+"44":BORDER}`,color:subscribed?CYAN:MUTED,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,padding:"9px 0",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{subscribed?"▶ ANALYZE IPO":"🔒 PRO — Unlock"}</button>}
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
    if(!subscribed){onPaywall();return;}
    setLoading(true);setResults([]);
    const pool=ALL_STOCKS.filter(s=>(filters.sector==="All"||s.sector===filters.sector)&&(filters.tag==="All"||s.tag===filters.tag)).slice(0,8);
    const out=[];
    for(const stock of pool){try{const r=await callClaude(STOCK_SYSTEM,`Analyze ${stock.ticker} (${stock.name}) in ${stock.sector}. Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);if(r.confidence>=filters.minConf&&(filters.verdict==="All"||r.verdict===filters.verdict))out.push({stock,result:r});}catch{}}
    out.sort((a,b)=>b.result.confidence-a.result.confidence);setResults(out);setLoading(false);
  };
  return(
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:18}}>
        {[{label:"Sector",key:"sector",opts:SECTORS},{label:"Tag",key:"tag",opts:TAGS},{label:"Signal",key:"verdict",opts:["All","STRONG BUY","BUY","SPECULATIVE","HOLD","SELL"]}].map(({label,key,opts})=>(
          <div key={key}><div style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>{label}</div><select value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:10,padding:"7px 10px",borderRadius:4,cursor:"pointer"}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        ))}
        <div><div style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase",marginBottom:4})}>Min Confidence</div><input type="number" min={0} max={100} value={filters.minConf} onChange={e=>setFilters(f=>({...f,minConf:+e.target.value}))} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:10,padding:"7px 10px",borderRadius:4,width:70}}/></div>
        <div style={{display:"flex",alignItems:"flex-end"}}><button onClick={run} style={{background:`${GOLD}18`,border:`1px solid ${GOLD}55`,color:GOLD,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,padding:"8px 18px",borderRadius:5,cursor:"pointer",textTransform:"uppercase"}}>{loading?"SCANNING...":"▶ RUN SCREENER"}</button></div>
      </div>
      {loading&&<LoadingAnim msg="SCREENING WITH LIVE DATA..."/>}
      {results.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={fm(MUTED,8,{letterSpacing:2,marginBottom:4})}>{results.length} MATCHED</div>{results.map(({stock,result:r})=>{const c=CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"];return(<div key={stock.ticker} style={{background:CARD,border:`1px solid ${c.color}33`,borderRadius:6,padding:"14px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:WHITE,letterSpacing:2}}>{stock.ticker}</span><Tag label={r.verdict} color={c.color}/></div><div style={{display:"flex",gap:16}}>{[["CONFIDENCE",`${r.confidence}%`,c.color],["UPSIDE",r.targetUpside,c.color],["TARGET",r.targetPrice,GOLD]].map(([l,v,col])=><div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:col}}>{v}</div><div style={fm(MUTED,7)}>{l}</div></div>)}</div></div>{r.whyThisRating&&<WhyBox text={r.whyThisRating}/>}</div>);})}</div>}
      {!loading&&results.length===0&&<div style={{textAlign:"center",padding:40,...fm(MUTED,10)}}>Configure filters and run the screener.</div>}
    </div>
  );
}

function Portfolio({subscribed,onPaywall}){
  const [holdings,setHoldings]=useState([{ticker:"NVDA",shares:10,avgCost:520},{ticker:"META",shares:5,avgCost:480}]);
  const [newH,setNewH]=useState({ticker:"",shares:"",avgCost:""});
  const [analyses,setAnalyses]=useState({});const [loading,setLoading]=useState(null);
  const add=()=>{if(!newH.ticker||!newH.shares||!newH.avgCost)return;setHoldings(h=>[...h,{ticker:newH.ticker.toUpperCase(),shares:+newH.shares,avgCost:+newH.avgCost}]);setNewH({ticker:"",shares:"",avgCost:""});};
  const analyzeAll=async()=>{if(!subscribed){onPaywall();return;}for(const h of holdings){if(analyses[h.ticker])continue;setLoading(h.ticker);try{const stock=ALL_STOCKS.find(s=>s.ticker===h.ticker)||{ticker:h.ticker,name:h.ticker,sector:"Unknown"};const r=await callClaude(STOCK_SYSTEM,`Analyze ${stock.ticker} (${stock.name}). Today: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}.`);setAnalyses(a=>({...a,[h.ticker]:r}));}catch{}setLoading(null);}};
  return(
    <div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:18,marginBottom:18}}>
        <div style={fm(MUTED,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:12})}>Add Position</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[{ph:"TICKER",key:"ticker",w:80},{ph:"Shares",key:"shares",w:80},{ph:"Avg Cost $",key:"avgCost",w:100}].map(({ph,key,w})=>(
            <input key={key} placeholder={ph} value={newH[key]} onChange={e=>setNewH(n=>({...n,[key]:e.target.value}))} style={{background:DIM,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:10,padding:"7px 10px",borderRadius:4,width:w}}/>
          ))}
          <button onClick={add} style={{background:`${GREEN}18`,border:`1px solid ${GREEN}44`,color:GREEN,fontFamily:"'Space Mono',monospace",fontSize:9,padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>+ ADD</button>
        </div>
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 40px",padding:"9px 16px",background:DIM,borderBottom:`1px solid ${BORDER}`}}>{["TICKER","SHARES","AVG COST","SIGNAL","TARGET",""].map((h,i)=><span key={i} style={fm(MUTED,8,{letterSpacing:1,textTransform:"uppercase"})}>{h}</span>)}</div>
        {holdings.map(h=>{const r=analyses[h.ticker];const c=r?(CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"]):null;return(<div key={h.ticker} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 40px",padding:"11px 16px",borderBottom:`1px solid ${BORDER}`,alignItems:"center"}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:WHITE,letterSpacing:2}}>{h.ticker}</span><span style={fm(WHITE,10)}>{h.shares}</span><span style={fm(WHITE,10)}>${h.avgCost}</span><span>{r?<Tag label={`${r.confidence}% ${r.verdict}`} color={c.color}/>:loading===h.ticker?<span style={fm(GREEN,8)}>Analyzing…</span>:<span style={fm(MUTED,9)}>—</span>}</span><span style={fm(r?c.color:MUTED,10)}>{r?r.targetUpside:"—"}</span><button onClick={()=>setHoldings(h2=>h2.filter(x=>x.ticker!==h.ticker))} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:11}}>✕</button></div>);})}
        <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={fm(MUTED,9)}>Cost Basis: <span style={{color:WHITE}}>${holdings.reduce((s,h)=>s+h.shares*h.avgCost,0).toLocaleString()}</span></span><button onClick={analyzeAll} style={{background:`${BLUE}18`,border:`1px solid ${BLUE}44`,color:BLUE,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:1,padding:"6px 14px",borderRadius:4,cursor:"pointer",textTransform:"uppercase"}}>▶ Analyze All</button></div>
      </div>
      {Object.keys(analyses).length>0&&<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:18}}><div style={fm(MUTED,8,{letterSpacing:2,textTransform:"uppercase",marginBottom:14})}>Portfolio Risk Overview</div><div style={{display:"flex",gap:16,flexWrap:"wrap"}}>{Object.entries(analyses).map(([t,r])=>{const c=CONFIDENCE_MAP[r.verdict]||CONFIDENCE_MAP["HOLD"];return(<div key={t} style={{textAlign:"center",minWidth:70}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:WHITE,marginBottom:4}}>{t}</div><div style={{width:56,height:56,margin:"0 auto 4px",borderRadius:"50%",border:`3px solid ${c.color}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 12px ${c.color}33`}}><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:c.color}}>{r.confidence}%</span></div><div style={fm(c.color,8)}>{r.verdict}</div></div>);})}</div></div>}
    </div>
  );
}

function Paywall({onClose,onSubscribe}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#0b0e14",border:`1px solid ${GOLD}44`,borderRadius:12,padding:36,maxWidth:460,width:"92%",textAlign:"center",boxShadow:`0 0 80px ${GOLD}14`}}>
        <div style={fm(GOLD,9,{letterSpacing:4,textTransform:"uppercase",marginBottom:8})}>Free Trial Complete</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:WHITE,lineHeight:1.1,marginBottom:10}}>Unlock Full<br/><span style={{color:GREEN,textShadow:`0 0 20px ${GREEN}66`}}>Market Intelligence</span></div>
        <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:8,padding:18,marginBottom:22,textAlign:"left"}}>
          {[["Unlimited Stock Analyses (live data)",GREEN],["Smart Money Tracker — Congress + Hedge Funds",PINK],["Options Trading — 3 AI Setups Per Stock",ORANGE],["Data-Backed WHY THIS RATING Explanations",GREEN],["Hidden Gems — Breakout Stocks",PURPLE],["IPO Watch with % Buy Confidence",CYAN],["Stock Screener & Portfolio Tracker",BLUE]].map(([f,col],i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"center"}}><span style={{color:col,fontSize:11}}>✓</span><span style={fm("#8899aa",10)}>{f}</span></div>
          ))}
          <div style={{borderTop:`1px solid ${BORDER}`,marginTop:14,paddingTop:14,display:"flex",justifyContent:"space-between"}}>
            <span style={fm(MUTED,9)}>MONTHLY</span>
            <div><span style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,color:WHITE}}>$19</span><span style={fm(MUTED,10)}>/mo</span></div>
          </div>
        </div>
        <button onClick={onSubscribe} style={{width:"100%",background:`linear-gradient(135deg,${GREEN},#00cc66)`,color:"#000",border:"none",borderRadius:6,padding:"14px 0",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,cursor:"pointer",marginBottom:10}}>START FOR $19/MO</button>
        <button onClick={onClose} style={{width:"100%",background:"none",border:"none",color:MUTED,fontFamily:"'Space Mono',monospace",fontSize:9,cursor:"pointer",padding:8}}>Maybe later</button>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("watchlist");
  const [subscribed,setSubscribed]=useState(false);
  const [analysesUsed,setAnalysesUsed]=useState(0);
  const [showPaywall,setShowPaywall]=useState(false);
  const [showToast,setShowToast]=useState(false);
  const [marketStatus,setMarketStatus]=useState(getMarketStatus());
  const [clock,setClock]=useState(new Date());
  const [sectorFilter,setSectorFilter]=useState("All");
  const [tagFilter,setTagFilter]=useState("All");
  const [search,setSearch]=useState("");

  useEffect(()=>{const t=setInterval(()=>{setMarketStatus(getMarketStatus());setClock(new Date());},1000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get("subscribed")==="true"){
      setSubscribed(true);
      setShowToast(true);
      setTimeout(()=>setShowToast(false),4500);
    }
  },[]);

  const handleUseAnalysis=useCallback(()=>{
    if(!subscribed&&analysesUsed>=FREE_LIMIT){setShowPaywall(true);return false;}
    setAnalysesUsed(p=>p+1);return true;
  },[subscribed,analysesUsed]);

  const handleSubscribe=async()=>{
    try{
      const{loadStripe}=await import("https://js.stripe.com/v3/");
      const stripe=await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({
        lineItems:[{price:import.meta.env.VITE_STRIPE_PRICE_ID,quantity:1}],
        mode:"subscription",
        successUrl:window.location.origin+"?subscribed=true",
        cancelUrl:window.location.origin,
      });
    }catch(e){
      console.error("Stripe error:",e);
    }
  };

  const filteredStocks=ALL_STOCKS.filter(s=>{
    if(sectorFilter!=="All"&&s.sector!==sectorFilter)return false;
    if(tagFilter!=="All"&&s.tag!==tagFilter)return false;
    if(search&&!s.ticker.includes(search.toUpperCase())&&!s.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const TABS=[
    {id:"watchlist",  label:"Watchlist"},
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${BG};color:${WHITE};font-family:'Space Mono',monospace;}
        ::-webkit-scrollbar{width:4px;background:${BG};}
        ::-webkit-scrollbar-thumb{background:${DIM};border-radius:4px;}
        input,select,button{outline:none;}
        @keyframes tickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes barAnim{from{transform:scaleY(.2);opacity:.4}to{transform:scaleY(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{minHeight:"100vh",background:BG}}>
        <TickerTape marketStatus={marketStatus}/>
        <div style={{borderBottom:`1px solid ${BORDER}`,padding:"13px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:WHITE,letterSpacing:4}}>STOCK</span>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:GREEN,letterSpacing:4,textShadow:`0 0 16px ${GREEN}55`}}>SIGHT</span>
            <span style={fm(MUTED,8,{letterSpacing:2,marginLeft:6})}>AI RESEARCH TERMINAL v5</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={fm(MUTED,9)}>{etTime}</span>
            {!subscribed&&<span style={fm(MUTED,9)}>Free: <span style={{color:GOLD}}>{Math.max(0,FREE_LIMIT-analysesUsed)}</span> left</span>}
            {subscribed?<Tag label="PRO ACTIVE" color={GREEN}/>:<button onClick={()=>setShowPaywall(true)} style={{background:`${GOLD}14`,border:`1px solid ${GOLD}44`,color:GOLD,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:1,padding:"6px 12px",borderRadius:4,cursor:"pointer"}}>UPGRADE →</button>}
          </div>
        </div>

        <div style={{borderBottom:`1px solid ${BORDER}`,padding:"0 28px",display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none",border:"none",
              borderBottom:`2px solid ${tab===t.id?(t.id==="smartmoney"?PINK:t.id==="options"?ORANGE:GREEN):"transparent"}`,
              color:tab===t.id?(t.id==="smartmoney"?PINK:t.id==="options"?ORANGE:GREEN):MUTED,
              fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,
              padding:"12px 18px",cursor:"pointer",textTransform:"uppercase",transition:"color .2s",whiteSpace:"nowrap"
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{padding:"22px 28px",maxWidth:1400,margin:"0 auto"}}>
          {tab==="watchlist"&&(
            <div>
              <div style={{marginBottom:16}}><Legend/></div>
              <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
                <input placeholder="Search ticker or name…" value={search} onChange={e=>setSearch(e.target.value)} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:10,padding:"7px 12px",borderRadius:4,width:210}}/>
                {[{l:"Sector",v:sectorFilter,s:setSectorFilter,opts:SECTORS},{l:"Tag",v:tagFilter,s:setTagFilter,opts:TAGS}].map(({l,v,s,opts})=>(
                  <select key={l} value={v} onChange={e=>s(e.target.value)} style={{background:CARD,border:`1px solid ${BORDER}`,color:WHITE,fontFamily:"'Space Mono',monospace",fontSize:10,padding:"7px 10px",borderRadius:4,cursor:"pointer"}}>{opts.map(o=><option key={o} value={o}>{l}: {o}</option>)}</select>
                ))}
                <span style={fm(MUTED,8)}>{filteredStocks.length} stocks</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                {filteredStocks.map((stock,i)=>{
                  const locked=!subscribed&&i>=FREE_LIMIT;
                  return locked?(
                    <div key={stock.ticker} style={{position:"relative"}}>
                      <div style={{pointerEvents:"none",filter:"blur(4px) brightness(.35)",userSelect:"none"}}><StockCard stock={stock} subscribed={false} analysesUsed={FREE_LIMIT+1} onUseAnalysis={()=>false} onPaywall={()=>{}}/></div>
                      <div onClick={()=>setShowPaywall(true)} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#07090dcc",borderRadius:8}}>
                        <div style={{fontSize:24,marginBottom:6}}>🔒</div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:GOLD,letterSpacing:3}}>PRO ONLY</div>
                        <div style={fm(MUTED,8,{marginTop:3})}>Subscribe to unlock all 20 stocks</div>
                      </div>
                    </div>
                  ):(
                    <StockCard key={stock.ticker} stock={stock} subscribed={subscribed} analysesUsed={analysesUsed} onUseAnalysis={handleUseAnalysis} onPaywall={()=>setShowPaywall(true)}/>
                  );
                })}
              </div>
            </div>
          )}
          {tab==="smartmoney"&&<SmartMoneyTab subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>}
          {tab==="options"&&<OptionsTab subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>}
          {tab==="screener"&&<Screener subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>}
          {tab==="gems"&&(
            <div>
              <div style={{marginBottom:18}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:PURPLE,letterSpacing:3,textShadow:`0 0 20px ${PURPLE}44`,marginBottom:6}}>Hidden Gems 💎</div><p style={fm(MUTED,10,{lineHeight:1.7,maxWidth:600})}>Underfollowed small & mid-cap stocks with high breakout potential. Higher risk, higher upside.</p></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>{HIDDEN_GEMS.map(gem=><GemCard key={gem.ticker} gem={gem} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>)}</div>
            </div>
          )}
          {tab==="ipos"&&(
            <div>
              <div style={{marginBottom:18}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:CYAN,letterSpacing:3,textShadow:`0 0 20px ${CYAN}44`,marginBottom:6}}>IPO Watch 🚀</div><p style={fm(MUTED,10,{lineHeight:1.7,maxWidth:600})}>Upcoming IPOs rated by % buy confidence with valuation analysis and comparable multiples.</p><div style={{marginTop:12}}><Legend/></div></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>{UPCOMING_IPOS.map(ipo=><IPOCard key={ipo.name} ipo={ipo} subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>)}</div>
            </div>
          )}
          {tab==="portfolio"&&<Portfolio subscribed={subscribed} onPaywall={()=>setShowPaywall(true)}/>}
        </div>

        <div style={{borderTop:`1px solid ${BORDER}`,padding:"11px 28px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span style={fm("#1a2230",8)}>STOCKSIGHT © 2026 — FOR INFORMATIONAL PURPOSES ONLY. NOT FINANCIAL ADVICE. ALL CONGRESSIONAL & HEDGE FUND DATA IS FROM PUBLIC DISCLOSURES.</span>
          <span style={fm("#1a2230",8)}>POWERED BY CLAUDE AI + LIVE WEB SEARCH</span>
        </div>
      </div>
      {showPaywall&&<Paywall onClose={()=>setShowPaywall(false)} onSubscribe={handleSubscribe}/>}
      {showToast&&(
        <div style={{position:"fixed",bottom:24,right:24,background:GREEN,color:"#000",fontFamily:"'Space Mono',monospace",fontSize:11,padding:"12px 20px",borderRadius:6,zIndex:300,boxShadow:`0 0 30px ${GREEN}66`,animation:"fadeUp .3s ease"}}>
          ✓ PRO UNLOCKED — All 7 features active
        </div>
      )}
    </>
  );
}
