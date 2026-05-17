// JapanOffer AI - Step 33 Search Data
// MVP search index: jobs, companies, people/network, pages.
// Later this can be replaced by Supabase tables or a live job API.

window.JAPANOFFER_SEARCH_INDEX = [
  {
    type: "job",
    title: "Legal Compliance Analyst",
    subtitle: "Japan FinTech / Payments Company · Tokyo · Entry-level possible",
    market: "Japan",
    tags: ["legal", "compliance", "japan", "tokyo", "english", "japanese", "kyc", "policy"],
    href: "jobs.html?q=Legal%20Compliance%20Analyst",
    score: 72,
    description: "适合有法律背景、英语能力，并希望进入日本金融科技、支付或平台型公司的合规岗位。"
  },
  {
    type: "job",
    title: "Web3 Compliance Operations Associate",
    subtitle: "Japan Crypto Exchange / Web3 Platform · Tokyo / Remote hybrid",
    market: "Japan",
    tags: ["web3", "crypto", "compliance", "japan", "kyc", "aml", "risk"],
    href: "jobs.html?q=Web3%20Compliance",
    score: 74,
    description: "适合想把法律背景、Crypto 兴趣和合规运营结合起来的候选人。"
  },
  {
    type: "job",
    title: "AML / KYC Analyst",
    subtitle: "Hong Kong Financial Services Group · Hong Kong",
    market: "Hong Kong",
    tags: ["aml", "kyc", "hong kong", "finance", "mandarin", "english", "risk"],
    href: "jobs.html?q=AML%20KYC",
    score: 76,
    description: "适合中文和英文能力较强、想进入香港金融合规或虚拟资产合规方向的人。"
  },
  {
    type: "job",
    title: "Virtual Assets Risk Associate",
    subtitle: "Hong Kong Virtual Assets Firm · Hong Kong",
    market: "Hong Kong",
    tags: ["virtual assets", "crypto", "risk", "hong kong", "web3", "compliance"],
    href: "jobs.html?q=Virtual%20Assets%20Risk",
    score: 73,
    description: "适合对虚拟资产、交易所、合规和风控有强兴趣的候选人。"
  },
  {
    type: "job",
    title: "Cross-border Business Associate",
    subtitle: "Singapore International Business Team · Singapore",
    market: "Singapore",
    tags: ["business", "strategy", "singapore", "mandarin", "english", "cross-border"],
    href: "jobs.html?q=Cross-border%20Business",
    score: 66,
    description: "适合语言能力强、想进入国际业务、客户拓展或企业合作方向的人。"
  },
  {
    type: "job",
    title: "FinTech Risk Operations Analyst",
    subtitle: "Singapore Payments / FinTech Company · Singapore",
    market: "Singapore",
    tags: ["fintech", "risk", "operations", "payments", "singapore", "compliance"],
    href: "jobs.html?q=FinTech%20Risk",
    score: 69,
    description: "适合希望从运营、风险审核、支付合规切入新加坡 FinTech 的候选人。"
  },
  {
    type: "job",
    title: "Legal Operations Assistant",
    subtitle: "UK Legal / Professional Services Team · London / Birmingham",
    market: "UK",
    tags: ["legal operations", "uk", "london", "birmingham", "english", "legal admin"],
    href: "jobs.html?q=Legal%20Operations",
    score: 58,
    description: "适合法律学生积累英国本地 legal operations、文档管理和客户支持经验。"
  },
  {
    type: "job",
    title: "International Talent Matching Associate",
    subtitle: "Japan HR Tech / Talent Platform · Tokyo",
    market: "Japan",
    tags: ["hr tech", "talent", "matching", "japan", "recruiting", "mandarin", "japanese"],
    href: "jobs.html?q=International%20Talent",
    score: 68,
    description: "适合对跨境招聘、人才匹配、HR Tech 和国际业务有兴趣的人。"
  },

  {
    type: "company",
    title: "Japan FinTech / Payments Company",
    subtitle: "Tokyo · Legal / Compliance · Payments",
    market: "Japan",
    tags: ["company", "fintech", "payments", "japan", "compliance"],
    href: "companies.html?q=Japan%20FinTech",
    score: 70,
    description: "适合想从法律合规、支付风控或运营切入日本金融科技行业的候选人。"
  },
  {
    type: "company",
    title: "Japan Crypto Exchange / Web3 Platform",
    subtitle: "Tokyo · Web3 Compliance · Risk Operations",
    market: "Japan",
    tags: ["company", "crypto", "exchange", "web3", "japan", "risk"],
    href: "companies.html?q=Crypto%20Exchange",
    score: 74,
    description: "适合对交易所合规、KYC/AML、虚拟资产监管有兴趣的人。"
  },
  {
    type: "company",
    title: "Hong Kong Financial Services Group",
    subtitle: "Hong Kong · AML / KYC · Financial compliance",
    market: "Hong Kong",
    tags: ["company", "hong kong", "finance", "aml", "kyc"],
    href: "companies.html?q=Hong%20Kong%20Financial",
    score: 72,
    description: "适合中文英语双语候选人探索香港金融合规岗位。"
  },
  {
    type: "company",
    title: "Singapore Payments / FinTech Company",
    subtitle: "Singapore · Risk Operations · Payments",
    market: "Singapore",
    tags: ["company", "singapore", "fintech", "payments", "risk operations"],
    href: "companies.html?q=Singapore%20FinTech",
    score: 69,
    description: "适合希望进入新加坡支付、风控和合规运营方向的人。"
  },

  {
    type: "network",
    title: "LLB + Japanese + Compliance route",
    subtitle: "Candidate route · Japan / Hong Kong",
    market: "Japan",
    tags: ["network", "llb", "japanese", "compliance", "legal", "candidate"],
    href: "network.html?q=LLB%20Japanese%20Compliance",
    score: 80,
    description: "适合法律背景、日语能力和合规方向的跨境求职路径。"
  },
  {
    type: "network",
    title: "Crypto compliance beginner route",
    subtitle: "Candidate route · Web3 / AML / KYC",
    market: "Hong Kong",
    tags: ["network", "crypto", "web3", "aml", "kyc", "risk", "beginner"],
    href: "network.html?q=Crypto%20Compliance",
    score: 78,
    description: "适合希望从 Web3 兴趣转向虚拟资产合规和风控岗位的人。"
  },
  {
    type: "network",
    title: "Singapore cross-border business route",
    subtitle: "Candidate route · Business / Strategy",
    market: "Singapore",
    tags: ["network", "singapore", "business", "strategy", "mandarin", "english"],
    href: "network.html?q=Singapore%20Business",
    score: 66,
    description: "适合语言能力强、希望做跨境业务或客户拓展的人。"
  },

  {
    type: "page",
    title: "中文 AI 岗位匹配",
    subtitle: "输入背景或调用 Profile / CV，生成岗位方向和目标公司",
    market: "Global",
    tags: ["ai match", "report", "matching", "岗位匹配", "报告"],
    href: "match.html",
    score: 90,
    description: "用中文描述背景，系统自动输出岗位推荐和方向判断。"
  },
  {
    type: "page",
    title: "职位推荐",
    subtitle: "根据 Profile / CV 排序岗位，并保存岗位",
    market: "Global",
    tags: ["jobs", "职位", "岗位", "saved jobs", "recommendation"],
    href: "jobs.html",
    score: 88,
    description: "查看岗位库、筛选市场、保存岗位，并进入申请中心。"
  },
  {
    type: "page",
    title: "申请中心",
    subtitle: "生成 Cover Letter、CV 修改方向和申请状态追踪",
    market: "Global",
    tags: ["application", "cover letter", "cv", "申请", "草稿"],
    href: "applications.html",
    score: 86,
    description: "把保存的岗位变成申请材料和申请进度。"
  },
  {
    type: "page",
    title: "我的主页 / CV",
    subtitle: "上传和保存个人履历，用于 AI 匹配和申请",
    market: "Global",
    tags: ["profile", "cv", "resume", "主页", "履历"],
    href: "profile.html",
    score: 84,
    description: "保存个人资料和 CV，之后匹配和申请时自动调用。"
  }
];
