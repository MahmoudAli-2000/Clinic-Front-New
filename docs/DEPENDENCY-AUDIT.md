# Dependency audit snapshot

`npm audit --omit=dev` after removing unused legacy packages:

info: 0, low: 0, moderate: 5, high: 11, critical: 2, total: 18

These are dependency advisories, not proof of an exploited vulnerability in this application. They remain a production deployment blocker pending a framework/dependency upgrade and security review. Angular 17 was preserved for the requested base; no unsupported automatic major migration was forced.

Affected packages:
- @angular/animations: moderate
- @angular/common: high
  - Angular is Vulnerable to XSRF Token Leakage via Protocol-Relative URLs in Angular HTTP Client: https://github.com/advisories/GHSA-58c5-g7wp-6w37
  - @angular/common: Denial of Service (DoS) via OOM in Date Formatting (formatDate): https://github.com/advisories/GHSA-48r7-hpm6-gfxm
  - @angular/common: Weak 32-Bit Cache Key Hashing in `HttpTransferCache` Leading to Cross-Request Data Leakage and State Poisoning: https://github.com/advisories/GHSA-39pv-4j6c-2g6v
  - @angular/common: Denial of Service (DoS) via OOM in Number Formatting (digitsInfo): https://github.com/advisories/GHSA-p3vc-36g9-x9gr
  - @angular/common: Information Leak via Default Caching of Credentialed Requests in HttpTransferCache: https://github.com/advisories/GHSA-q6f4-qqrg-jv6x
  - Angular: Cache-Key Ambiguity in HttpTransferCache Leading to Cross-Request Response Reuse and State Poisoning: https://github.com/advisories/GHSA-jhpw-976m-542j
  - Angular: Information Leak via `HttpTransferCache` Bypass When Using `withRequestsMadeViaParent`: https://github.com/advisories/GHSA-p297-fm68-3q8c
  - @angular/common: XSRF Token Leakage via URL Parsing Discrepancy in Angular HTTP Client (Incomplete fix for CVE-2025-66035): https://github.com/advisories/GHSA-jfgx-762w-99vr
- @angular/compiler: high
  - Angular vulnerable to XSS in i18n attribute bindings: https://github.com/advisories/GHSA-g93w-mfhg-p222
  - Angular has XSS Vulnerability via Unsanitized SVG Script Attributes: https://github.com/advisories/GHSA-jrmj-c5cx-3cw6
  - Angular Stored XSS Vulnerability via SVG Animation, SVG URL and MathML Attributes: https://github.com/advisories/GHSA-v4hv-rgfq-gp49
  - @angular/compiler: Two-Way Property Binding Sanitization Bypass (XSS): https://github.com/advisories/GHSA-58w9-8g37-x9v5
  - Angular: Template and Attribute Namespace Sanitization Bypass (XSS): https://github.com/advisories/GHSA-f3m7-gqxr-g87x
  - Angular i18n: Cross-Site Scripting (XSS) via event-handler attributes: https://github.com/advisories/GHSA-jj27-h5hq-8x99
  - Angular: Sanitization bypass via directive host bindings on concrete host elements in @angular/core and @angular/compiler: https://github.com/advisories/GHSA-hh8m-fm6v-7cvg
- @angular/core: high
  - Angular i18n vulnerable to Cross-Site Scripting: https://github.com/advisories/GHSA-prjf-86w9-mfqv
  - Angular vulnerable to XSS in i18n attribute bindings: https://github.com/advisories/GHSA-g93w-mfhg-p222
  - Angular has XSS Vulnerability via Unsanitized SVG Script Attributes: https://github.com/advisories/GHSA-jrmj-c5cx-3cw6
  - Angular: Template and Attribute Namespace Sanitization Bypass (XSS): https://github.com/advisories/GHSA-f3m7-gqxr-g87x
  - @angular/core: Angular Template and Dynamic Component Namespace Bypass leading to Cross-Site Scripting (XSS): https://github.com/advisories/GHSA-692r-grfm-v8x7
  - Angular Client Hydration DOM Clobbering & Response-Cache Poisoning: https://github.com/advisories/GHSA-rgjc-h3x7-9mwg
  - Angular i18n: Cross-Site Scripting (XSS) via event-handler attributes: https://github.com/advisories/GHSA-jj27-h5hq-8x99
  - Angular: Sanitization bypass via directive host bindings on concrete host elements in @angular/core and @angular/compiler: https://github.com/advisories/GHSA-hh8m-fm6v-7cvg
- @angular/forms: moderate
- @angular/platform-browser: moderate
- @angular/platform-browser-dynamic: moderate
- @angular/platform-server: high
  - Angular SSR: Global Platform Injector Race Condition Leads to Cross-Request Data Leakage: https://github.com/advisories/GHSA-68x2-mx4q-78m7
  - Angular: SSRF via protocol-relative and backslash URLs in Angular Platform-Server: https://github.com/advisories/GHSA-45q2-gjvg-7973
  - @angular/platform-server: Missing `<noscript>` Raw-Text Serialization Escaping leads to Cross-Site Scripting (XSS) in Angular SSR: https://github.com/advisories/GHSA-gxx4-3xcv-f8qx
  - @angular/platform-server: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'): https://github.com/advisories/GHSA-hqr9-c56f-3x7f
  - @angular/platform-server: URL Parser Differential leading to SSRF Allowlist Bypass: https://github.com/advisories/GHSA-xrxm-cp7j-8xf6
  - @angular/platform-server: SSRF via Hostname Hijacking: https://github.com/advisories/GHSA-rfh7-fxqc-q52v
  - Angular SSR: Missing Fallback Raw-Content Serialization Escaping leads to Cross-Site Scripting (XSS): https://github.com/advisories/GHSA-vpx6-8pjr-4g3v
  - Angular: SSR XSS via Unescaped <template> Content Across DocumentFragment Boundaries in Fallback Raw-Content Elements: https://github.com/advisories/GHSA-v3p8-whq6-r5jg
  - Angular: SSRF and Cross-Origin Credential Disclosure via URL Resolution Discrepancy in SSR: https://github.com/advisories/GHSA-f6mr-pjwc-34m4
  - Angular SSR: Denial of Service (DoS) via Infinite Loop on Malformed DOCTYPE: https://github.com/advisories/GHSA-f67j-2jqw-jpq7
  - Angular SSR: XSS via Unescaped Processing Instruction (<?...?>) Nodes in Fallback Raw-Content Elements: https://github.com/advisories/GHSA-j3r3-mxqp-r2p4
  - @angular/platform-server: Open Redirect via Protocol-Relative URLs in Server-Side Rendering (SSR): https://github.com/advisories/GHSA-w739-gvwx-grc3
- @angular/router: high
  - Angular Server-Side Rendering (SSR): Denial of Service via Numeric URL Matrix Parameters: https://github.com/advisories/GHSA-ff3f-86qr-9cv3
  - @angular/router: Denial of Service via Unmatched Empty-Path Outlet Route Matching in Server-Side Rendering (SSR): https://github.com/advisories/GHSA-62vg-58rm-qff7
- @angular/ssr: critical
  - Angular SSR: Global Platform Injector Race Condition Leads to Cross-Request Data Leakage: https://github.com/advisories/GHSA-68x2-mx4q-78m7
  - Angular SSR is vulnerable to SSRF and Header Injection via request handling pipeline: https://github.com/advisories/GHSA-x288-3778-4hhx
  - Angular SSR: Path Traversal to Sibling Directories in CommonEngine on Windows: https://github.com/advisories/GHSA-7g7c-h8rr-7p6q
- body-parser: high
  - body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement: https://github.com/advisories/GHSA-v422-hmwv-36x6
  - body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body: https://github.com/advisories/GHSA-27r3-jxmh-p828
- express: high
- nanoid: high
  - nanoid: non-secure generators can loop indefinitely with negative size: https://github.com/advisories/GHSA-28wg-ghj8-5hjv
  - nanoid: custom generators can loop indefinitely when size is zero: https://github.com/advisories/GHSA-2v37-7h3g-55p8
  - nanoid: Integer Overflow or Wraparound: https://github.com/advisories/GHSA-xwg4-73v4-xw9w
- path-to-regexp: high
  - path-to-regexp vulnerable to Regular Expression Denial of Service via multiple route parameters: https://github.com/advisories/GHSA-37ch-88jc-xwx2
- postcss: high
  - PostCSS has XSS via Unescaped </style> in its CSS Stringify Output: https://github.com/advisories/GHSA-qx2v-qp2m-jg93
  - PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments: https://github.com/advisories/GHSA-6g55-p6wh-862q
  - PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset: https://github.com/advisories/GHSA-fxqj-rqcc-2cmp
  - PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure: https://github.com/advisories/GHSA-r28c-9q8g-f849
- proxy-addr: critical
  - proxy-addr vulnerable to IP spoofing via IPv4-mapped IPv6 trust subnet: https://github.com/advisories/GHSA-jqcg-44mw-7w3h
- qs: moderate
  - qs's arrayLimit bypass in comma parsing allows denial of service: https://github.com/advisories/GHSA-w7fw-mjwx-w883
  - qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion: https://github.com/advisories/GHSA-6rw7-vpxm-498p
  - qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set: https://github.com/advisories/GHSA-q8mj-m7cp-5q26
  - qs: Denial of Service via Attacker Controlled isBuffer: https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
  - qs : qs.stringify with arrayFormat 'comma' throws an uncaught TypeError on array elements carrying a non-callable own toString (DoS): https://github.com/advisories/GHSA-6pq8-jhm2-2vcw
- source-map-js: high
  - source-map-js allows event-loop denial of service through indexed source-map section offsets: https://github.com/advisories/GHSA-68fv-2mgg-jv7q
