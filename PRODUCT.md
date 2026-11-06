# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Construct is an internal tool for one interior design / fit-out firm's own team in India. It is not sold to other firms, and clients do not log in.

Roles, as the code enforces them in `topbar.js`:

- **ADMIN**: runs projects end to end. Edits BOQ rates and quantities directly, manages users and project access, and approves finance requests.
- **FINANCE**: sees all costs. Changes to BOQ rates or quantities go through the approval workflow and need ADMIN sign-off.
- **VISUALIZER**: works on rooms, products and design selections. Cannot see costs.
- **UNASSIGNED**: a logged-in account that has no role yet.

## Product Purpose

Construct takes a project from site measurement to an approved, costed Bill of Quantities (BOQ). It covers room areas and openings, product and vendor selection per room, and BOQ assembly, with changes controlled through approvals. Its job is to replace the spreadsheets and back-and-forth the firm used before.

Success means a BOQ the team trusts: quantities come from real measurements, products come from the firm's own catalog and suppliers, every rate or quantity change can be traced to the person who approved it, and the export matches the firm's Excel template.

## Positioning

The value is the whole connected flow, and no single step comes first. Measurement, sourcing, costing and approval live in one place and are tied to each other. A change to a room's area or a chosen product carries through to the BOQ, and cost changes go through the firm's own approval chain. The product is built around this firm's process and roles, not a generic project-management model.

## Operating Context

- Mostly used on desktop in the office, in long working sessions on BOQs, catalogs and approvals.
- Phones and tablets matter on site visits for measurements and checks, so room and area flows have to work on small screens.
- Currency is ₹ (INR); areas are in sqft.
- The output that matters is the Excel BOQ export, which follows the firm's template and includes BOQ notes.
- Domain work covers flooring, tiles, paint, ceilings, wallpaper, furniture, lighting, kitchens and similar fit-out categories.

## Capabilities and Constraints

Current surfaces (one static HTML page each):

- **Projects** (`index.html`): project list with client, site location, budget and area; per-project access management.
- **Project detail** (`project-detail.html`): rooms, area calculators with door and window openings, room shortlists and quantities, drawings and files.
- **BOQ** (`boq-detail.html`): categories and subcategories (drag to reorder), import from file with column mapping, vendor shortlist, assignment to rooms, version history, notes, Excel export.
- **Catalog, Products, All products** (`catalog.html`, `products.html`, `all-products.html`): product categories, product entry, PDF catalog upload with column mapping, product comparison, pinning products to projects.
- **Suppliers** (`suppliers.html`): supplier records and supplier subcategories.
- **Approvals** (`approvals.html`): batch approval of FINANCE-requested BOQ changes.
- **Tasks** (`tasks.html`): to-do flow.
- **Dashboard** (`dashboard.html`) and **Users** (`users.html`): overview, account creation, password reset, access.
- **Cart** (`cart.js`): selection basket used during product sourcing.

Technical constraints:

- Vanilla HTML/CSS/JS with no build step or framework. The shared sidebar is injected by `topbar.js`, and shared styles live in `styles.css`.
- Deployed on Vercel (`construct-front`). The backend is a separate service at `construct-backend-production.up.railway.app/api`.
- Auth is a bearer token in `sessionStorage` (`authFetch` in `api.js`). A 401 sends the user back to login; a 403 shows a toast and keeps the session.
- Cost visibility and edit rights are enforced per role. UI work must never show costs to VISUALIZER or offer direct BOQ edits to FINANCE.

## Brand Commitments

- Product name: **Construct**.
- The firm's own name, logo and voice have not been recorded. Do not invent them.

## Evidence on Hand

- No client-facing content, testimonials or case studies exist. This is an internal tool and needs none.
- Real data lives in the backend. Mock data used for design work must look plausible for Indian interior fit-out projects (₹, sqft, real product categories), and must not be presented as real projects or clients.

## Product Principles

1. **Numbers are the product.** Quantities, rates and totals must be correct, legible and traceable. Never trade accuracy or clarity of figures for looks.
2. **Respect the approval chain.** Every surface reflects who is allowed to see and change what. Role limits are product behaviour, not decoration.
3. **One connected flow.** Measurement, sourcing, BOQ and approval should feel like steps in one job, with context carried between them, not separate apps.
4. **Built for long sessions, usable on site.** Desktop is optimised for dense, repeated work. Measurement and check flows stay usable on a phone.
5. **Fit the firm's process.** Follow how this team actually works, including its Excel template, its categories and its roles, over generic conventions.
