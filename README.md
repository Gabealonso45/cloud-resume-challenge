# Cloud Resume Challenge

A serverless personal resume site built on Microsoft Azure, completed as part of the
[Cloud Resume Challenge](https://cloudresumechallenge.dev/).

**Live site:** https://www.gabealonso-resume.com

## Architecture

```
Browser
   │
   ▼
Azure Front Door  ──────────►  Azure Storage (static website)
  (CDN, HTTPS,                     index.html / 404.html
   custom domain)
   │
   ▼  (JS fetch call)
Azure Functions (HTTP trigger, Node.js)
   │
   ▼
Azure Cosmos DB
  (visitor counter document)
```

- **Frontend** — a single static `index.html` (HTML/CSS/vanilla JS), hosted on an
  Azure Storage account's static website endpoint.
- **CDN / HTTPS / custom domain** — Azure Front Door sits in front of the storage
  endpoint, handling global edge caching, the custom domain
  (`www.gabealonso-resume.com`), and a Front Door–managed TLS certificate.
- **DNS** — `gabealonso-resume.com` is delegated to Azure DNS, which hosts the
  domain-validation TXT record and the `www` CNAME pointing at the Front Door
  endpoint.
- **API** — an Azure Function (HTTP trigger, Node.js, Consumption plan) exposes a
  single endpoint that increments and returns a visitor count. The frontend calls
  this over `fetch()` rather than talking to the database directly.
- **Database** — Azure Cosmos DB stores a single counter document, incremented on
  every page load.

## What this demonstrates

- Standing up static hosting behind a CDN with a custom domain and managed TLS
- Designing a small API layer instead of exposing a database directly to the browser
- Debugging a full request path across DNS, CDN, compute, and database layers when
  things didn't work on the first try (see below)

## Notable issues hit along the way

- **DNS delegation** — migrated the domain's DNS from the registrar to Azure DNS to
  support a clean apex/subdomain setup, including nameserver delegation and TXT-based
  domain validation for Front Door.
- **A CSS specificity bug** — a `display: grid` rule on a shared class was silently
  overriding the browser's default `[hidden]` styling, so a "hidden" panel was still
  rendering. Fixed with an explicit `.certs[hidden] { display: none }` override.
- **A missing Cosmos DB partition key** — the first API call (document creation)
  succeeded, but subsequent read/update calls failed with a 500, because the
  partition key value wasn't being passed alongside the document ID on reads and
  replaces.
- **A CORS header conflict** — the Function was returning `Access-Control-Allow-Origin`
  in code *and* the Function App's platform-level CORS settings were adding the same
  header, producing a duplicate value that browsers reject outright (`net::ERR_FAILED`
  despite an HTTP 200). Fixed by removing the header from application code and
  relying on the platform-level CORS configuration exclusively.

## Tech stack

Azure Storage (static website) · Azure Front Door · Azure DNS · Azure Functions
(Node.js, Consumption plan) · Azure Cosmos DB

## Author

Gabriel Alonso — [linkedin.com/in/gabriel-alonso](https://linkedin.com/in/gabriel-alonso)
