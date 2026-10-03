# Decision-operation source snippets

Research cut-off: 2026-10-03. Search evidence only (no complete fetch unless identified as such); excerpts are retained as returned by webSearch. A search snippet is not proof that the complete instrument contains no exception.

## Polymarket

**Title:** Geographic Restrictions  
**URL:** https://docs.polymarket.com/api-reference/geoblock.md  
**Date:** Retrieved 2026-10-03; live API documentation, no publication date shown.  
**Tier:** 1 — platform technical documentation.  
**Evidence (snippet):** “Check the geographic eligibility of the requesting IP address: GET https://polymarket.com/api/geoblock”; example returns `blocked`, `country`, and `region`.  
**Quality:** Snippet only. Confirms an IP-geoblock mechanism, not account/entity eligibility for BVI, SVG, or Panama.

**Title:** Polymarket Institutional  
**URL:** https://institutional.polymarket.com/  
**Date:** Retrieved 2026-10-03; no publication date shown.  
**Tier:** 3 — provider's institutional marketing page.  
**Evidence (snippet):** “Event-based derivatives with direct market access via Websockets and REST APIs. Trade event contracts ... on a regulated central limit order book...”  
**Quality:** Snippet only; establishes a marketed institutional desk/product, not BETTEX onboarding or permission for its specific strategy.

**Title:** Terms of Use | Polymarket  
**URL:** https://polymarket.com/tos  
**Date:** Retrieved 2026-10-03; page labels its text “August 11” without identifying a year.  
**Tier:** 1 — platform terms, but fetch did not expose the operative text.  
**Evidence (search snippet):** “By using Polymarket you agree to our Terms of Use.” The fetched page rendered a US geolocation overlay: “Trading is blocked in the United States on polymarket.com.”  
**Quality:** The operative terms were not retrieved; US overlay is direct page evidence for the fetch location only and cannot establish whether BVI, SVG, or Panama entities, corporate accounts, or bots are accepted.

## Betfair / Flutter

**Title:** What's required to open a corporate Betfair trading account? – Betfair Developer Program  
**URL:** https://support.developer.betfair.com/hc/en-us/articles/12763276187292-What-s-required-to-open-a-corporate-betfair-trading-account  
**Date:** Updated 2026-07-30 (web search result); fetched 2026-10-03.  
**Tier:** 1 — Betfair corporate support page.  
**Evidence (full fetch):** Applicants are directed to the corporate trading account form. Corporate accounts must satisfy Betfair/regulator compliance; a two-phase enhanced due diligence process applies. Phase 1 asks for certificate of incorporation, entity proof of address, intended first deposit/use, and ID/proof of address for directors and shareholder(s); Phase 2 depends on the company's circumstances. Access is said to be granted “once these requirements have been satisfied.”  
**Quality:** Full fetch; direct statement of application route and EDD; not a guarantee of acceptance and does not identify a country whitelist, fee, or specific authorization for BETTEX's use.

**Title:** Guide to the Betfair Exchange API  
**URL:** https://developer.betfair.com/exchange-api/  
**Date:** Retrieved 2026-10-03; no publication date shown.  
**Tier:** 1 — provider developer documentation.  
**Evidence (snippet):** API comprises betting operations (including retrieval and bet placement), account operations, and stream API.  
**Quality:** Snippet only; establishes technical API functions, not a corporate-account grant or permission for every automated strategy.

**Title:** SOFTWARE VENDOR’S API LICENCE  
**URL:** https://developer.betfair.com/assets/Uploads/Betfair-API-Commercial-Odds-Publisher-AFFILIATES.pdf  
**Date:** Retrieved 2026-10-03; date/version not shown in result.  
**Tier:** 1 — Betfair licence text.  
**Evidence (snippet):** “None of the exceptions or terms of this Agreement allow the User to use the Betfair API to operate a betting exchange ... unless given express prior written consent by Betfair.”  
**Quality:** Snippet only, apparently a software-vendor/API licence, not necessarily the corporate customer's betting terms. It restricts operating an exchange; do not misread it as a blanket prohibition on an account holder using a permitted strategy to place its own bets.

**Title:** B - Product requirements  
**URL:** https://developer.betfair.com/vendor-program/product-requirements  
**Date:** Retrieved 2026-10-03; no publication date shown.  
**Tier:** 1 — provider developer/vendor program.  
**Evidence (snippet):** If applications are unlicensed and/or non-compliant with requirements, Betfair may suspend the application and/or applicable accounts.  
**Quality:** Snippet only, directed at applications/vendor program; relevant where BETTEX builds or distributes software, not proof that a proprietary customer is an exchange operator.

## SBOBET

**Title:** General Terms and Conditions - SBOBET Information Center  
**URL:** https://help.sbobet.com/article/general-terms-and-conditions-13371.html  
**Date:** Retrieved 2026-10-03; date not shown in result.  
**Tier:** 1 — operator's help center/terms.  
**Evidence (snippet):** Result identifies this as SBOBET's general terms; it did not surface full language on corporate customers or automation.  
**Quality:** Snippet only; insufficient to infer corporate account eligibility.

**Title:** General Promotion Terms & Conditions - SBOBET Information Center  
**URL:** https://help.sbobet.com/article/381.html  
**Date:** Retrieved 2026-10-03; date not shown in result.  
**Tier:** 1 — operator's bonus terms.  
**Evidence (snippet):** Use of “technology or bots to trick the system” or other wrongful means to obtain a bonus may lead to forfeiture of bonuses and winnings derived from them; result also references related outcomes in an event.  
**Quality:** Snippet only; directly cautions against bonus exploitation. It does not show that all algorithmic betting is prohibited or that legitimate surebet activity is allowed.

**Title:** Can I have more than one account? - SBOBET Information Center  
**URL:** https://help.sbobet.com/article/can-i-have-more-than-one-sbobet-account-138.html  
**Date:** Search result says 31 Aug 2015.  
**Tier:** 1 — operator help center.  
**Evidence (snippet):** Same email/personal information cannot be reused to create duplicate/multiple accounts; holding multiple accounts is “against our Terms & Conditions.”  
**Quality:** Snippet only, dated and specific to duplicate accounts; not authority for an account held by a single company, but excludes designing bonus/arbitrage around duplicate user accounts.

## Interactive Brokers (IBKR)

**Title:** Available Countries and Territories | Interactive Brokers LLC  
**URL:** https://www.interactivebrokers.com/en/accounts/open-account-country-list.php  
**Date:** Retrieved 2026-10-03; current list, no last-update date surfaced.  
**Tier:** 1 — broker eligibility page.  
**Evidence (snippets):** “Clients can open Interactive Brokers accounts in the following countries”; returned list excerpt includes British Virgin Islands. Separate snippets include Panama and Saint Vincent and the Grenadines among available-country lists.  
**Quality:** Snippet evidence for retail/account-country availability only. It is not entity-specific account acceptance, jurisdictional advice, or proof every IBKR subsidiary accepts a company incorporated in each listed place.

**Title:** IBKR Trading API Solutions  
**URL:** https://www.interactivebrokers.com/api  
**Date:** Retrieved 2026-10-03; no publication date shown.  
**Tier:** 1 — broker developer documentation/marketing.  
**Evidence (snippet):** API supports “Automate algorithmic trading strategies, advanced programmatic investing or trading systems.” IBKR institutional pages also market proprietary trading-group accounts.  
**Quality:** Snippet only; confirms advertised automation capability, not approval of this company or portfolio.

**Title:** Interactive Brokers Enables 24/7 Account Funding with Stablecoin  
**URL:** https://www.interactivebrokers.com/en/general/about/mediaRelations/1-15-26.php  
**Date:** 2026-01-15.  
**Tier:** 1 — broker press release (promotional, but primary for its service).  
**Evidence (full fetch):** Eligible clients of Interactive Brokers LLC (IB LLC) may fund accounts with USDC from a crypto wallet to a wallet provided through Zerohash; receipt auto-converts to USD. IBKR says it charges no stablecoin deposit fee; Zerohash charges 0.30% per deposit, minimum $1, and network fees remain the client's responsibility. Eligibility is limited to eligible IB LLC clients; international clients are directed to check eligibility.  
**Quality:** Full fetch; confirms a real USDC-to-broker-funding rail and disclosed vendor fee, not BETTEX-specific eligibility, deposit acceptance for corporate accounts, or a USDC rail into other IBKR entities. USDC does not remain USDC at the brokerage.

**Title:** Interactive Brokers Builds Out One of the Most Comprehensive and Low-Cost Solutions for Accessing Cryptocurrency Available  
**URL:** https://www.interactivebrokers.com/en/general/about/mediaRelations/7-15-26.php  
**Date:** 2026-07-15 (search result date).  
**Tier:** 1 — broker press release.  
**Evidence (snippet):** IBKR clients can withdraw USD via automatic conversion to USDC, PYUSD, or RLUSD.  
**Quality:** Snippet only; withdrawal capability is not a promise that a corporate account or a specific jurisdiction is eligible.

## Constitutions and compliance

**Title:** BVI Business Companies and Limited Partnerships Beneficial Ownership Guidelines (Revised as of 2nd January 2026)  
**URL:** https://www.bvifsc.vg/sites/default/files/revised_bo_guidelines_final_version_for_publication_02.01.26_0.pdf  
**Date:** Revised 2026-01-02; fetched 2026-10-03.  
**Tier:** 1 — BVI Registrar/FSC-issued guidance implementing regulations.  
**Evidence (full fetch):** An individual holding 10% or more shares or voting rights in a BVI company is a beneficial owner. Indirect ownership requires tracing through corporate layers to natural persons; persons with board appointment/removal rights or other actual management control may also be BOs. The legal entity must take necessary steps to identify BOs; within 30 days of incorporation/registration, filing each BO's required details avoids the separate notice procedure described in the guidance.  
**Quality:** Full fetch; authoritative current administrative guidance. Not a filing-fee schedule and not a complete substitute for the regulations/AML code.

**Title:** Virgin Islands Gaming and Betting Control Act, 2020  
**URL:** https://bvi.gov.vg/media-centre/public-notice-casino-and-gaming-operators  
**Date:** Government notice retrieved 2026-10-03; notice's date not surfaced in search excerpt.  
**Tier:** 1 — BVI Government notice summarizing the statute.  
**Evidence (snippet):** Under the Gaming Act, a person undertaking gaming/betting operations or providing facilities for betting or gaming without a licence commits an offence.  
**Quality:** Snippet only and framed for operators. Supports separating a bettor from an operator; does not establish that every own-account customer is exempt, or settle extraterritorial reach to a BVI company.

**Title:** FAQs Re Revised Requirements for Business Companies (BCs) and Limited Liability Companies (LLCs) Seeking to Engage/Engaged in FOREX Activity  
**URL:** https://svgfsa.com/faqs-re-revised-requirements-for-business-companies-bcs-and-limited-liability-companies-llcs-seeking-to-engage-engaged-in-forex-activity  
**Date:** Retrieved 2026-10-03; current FAQ date not surfaced.  
**Tier:** 1 — SVG Financial Services Authority.  
**Evidence (snippet):** FSA has specific “Revised Requirements” for SVG companies/LLCs seeking to engage in forex activity. FSA search result also says it administers company registration and that incorporation can be completed within one business day.  
**Quality:** Snippet only; forex-specific requirements must not be generalized to company treasury investing, event contracts, sports betting, or casino bonuses. One-business-day incorporation claim is not an approval or total-cost estimate.

**Title:** Panama technical note (World Bank documents / Panama AML-CFT assessment materials)  
**URL:** https://www.superbancos.gob.pa/documents/imf_assessments/TN-AML-CFT-Panama-FSAP-final.pdf  
**Date:** Retrieved 2026-10-03; report date not shown in result.  
**Tier:** 2 — institutional AML/CFT assessment hosted by Panama's Superintendence of Banks, not the primary law text.  
**Evidence (snippet):** Law 129 of 2020 requires the legal representative to provide the resident agent information to identify the beneficial owner and notify the registration authority; RUBF access is limited to resident agents and designated officials.  
**Quality:** Snippet only; supports private-register/agent KYC, not current incorporation costs, client trading eligibility, or an exact current filing deadline.

**Title:** Law 129 of 2020 - single system of beneficial ownership in Panama  
**URL:** https://kraemerlaw.com/en/articles/law-129-of-2020-single-system-of-beneficial-ownership-in-panama  
**Date:** Retrieved 2026-10-03; publication date not surfaced.  
**Tier:** 2 — Panamanian legal-practice explainer.  
**Evidence (snippet):** Describes a private, unique beneficial-ownership system under Law 129 of 17 March 2020.  
**Quality:** Snippet only; secondary corroboration, not the Act.

**Title:** Panama Company Formation + Registered Agent + Bank Account  
**URL:** https://www.vepapu.com/panama/company-formation  
**Date:** Retrieved 2026-10-03; page date not surfaced.  
**Tier:** 3 — formation-provider page.  
**Evidence (snippet):** Says resident agent registers UBOs with the Superintendency within 30 days of incorporation under Law 129/2020.  
**Quality:** Snippet only and commercially interested; do not rely on it for fees or as primary proof of the exact deadline.

**Title:** BVI economic substance legislation  
**URL:** https://www.bvi.gov.vg/economic-substance-legislation  
**Date:** Retrieved 2026-10-03; current page.  
**Tier:** 1 — BVI Government legislation portal.  
**Evidence (snippet):** Lists Economic Substance legislation.  
**Quality:** Snippet only; the detailed classification of a BETTEX company as a relevant activity / investment fund was not resolved in this workstream.