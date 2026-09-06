# Harf Banaras — Frontend (React + TypeScript + Redux Toolkit)

## What's done (MVP + this pass)
- Redux Toolkit store: `auth`, `products`, `cart`, **`wishlist` (new)** slices, typed hooks
- API service layer (axios) for auth/products/cart/orders/**wishlist/user (new)**, JWT auto-attached
- `ProductCard` with the exact cart behaviour you specified: Add to Cart →
  "− qty +" stepper → back to Add to Cart at 0, capped at `availableQuantity`,
  "Only N left" messaging, Sold Out state — **now also has a wishlist heart toggle**
- Pages wired end-to-end:
  - **Home page (new)**: hero, shop-by-saree-type cards, shop-by-occasion cards,
    best-seller grid pulled from the products API
  - Shop (filter/sort via query params)
  - **Product Detail page (new)**: image gallery with thumbnails, cart stepper,
    wishlist toggle, spec table, placeholder pincode delivery-estimate checker
  - Cart, Checkout (COD only, address form, order placement)
  - **Cart coupon apply/remove (new)**, wired to the backend coupons module
  - Login, **Register (new)**, **Forgot/Reset Password (new — shows the dev
    token inline since no email/SMS provider is wired in yet)**
  - **Wishlist page (new)**: grid view, add-to-cart, remove
  - **Profile page (new)**: Orders tab (history + cancel), Addresses tab
    (add/remove, uses the existing `/users/me/addresses` endpoints)
- Sticky Header with cart/wishlist counts

## Setup
```
npm install
npm start
```
Set `REACT_APP_API_URL` (defaults to `http://localhost:5000/api/v1`, matching the backend `.env`).
Run the backend's `npm run seed` first so Home/Shop have products to show.

## What's done (this pass — Admin & Inventory console)
- **`/admin` section (new)**, gated client-side by `user.role` (server still
  enforces via `JwtAuthGuard`/`RolesGuard` on every call — this is just UI
  routing, not the security boundary):
  - **Admin Dashboard** (`/admin/dashboard`, admin only) — summary cards for
    sales, orders, AOV, new customers, pending orders/returns, low/out-of-stock,
    from `GET /dashboard/admin`
  - **Orders** (`/admin/orders`, admin only) — table of all orders, filter by
    status, inline status-update dropdown wired to `PATCH /orders/:id/status`
  - **Inventory** (`/admin/inventory`, admin + inventory_manager) — summary
    cards from `GET /dashboard/inventory`, a searchable product table with an
    inline "±qty + reason" stock adjustment form wired to
    `PATCH /products/:id/stock`, and a recent stock-movements log
  - **Coupons** (`/admin/coupons`, admin only) — full CRUD against the
    `/coupons` module: create, edit (value/min order/cap/expiry/limit/
    description), activate/deactivate, delete
  - **Settings** (`/admin/settings`, admin only) — edit flat shipping fee,
    free-shipping threshold, and tax % via `GET`/`PATCH /settings`
  - Header shows an "Admin" or "Inventory" link for logged-in users with
    those roles; inventory managers only see the Inventory tab, matching the
    backend's `@Roles()` restrictions on each endpoint

## NOT yet built (next steps)
1. **Home page polish** — hero is a static banner, not a slider; no
   testimonials or lookbook section yet (best-seller grid and category links
   are wired to live data).
2. **Product Detail — related products & reviews** — not built; would need
   a "similar products" query param on `/products` and a
   `GET /reviews?product=` list endpoint that don't exist on the backend yet.
3. **Order tracking/detail view** — Profile currently shows order history
   inline with status + cancel; a dedicated order-detail/tracking page is
   not built. The new admin Orders table also links out to nothing beyond
   its own row — no shared detail view yet.
4. **Password change from Profile** — not built (backend has no endpoint yet).
5. **Virtual Try-On, WhatsApp assistant, language toggle, product
   comparison** — out of scope for this MVP pass.
6. **Styling** — only a minimal CSS pass done (`index.css`); the maroon/gold/
   ivory heritage design system from the brief still needs a proper pass,
   ideally with the `frontend-design` skill for typography/spacing decisions.
   Existing components (Home sections, Product Detail, Wishlist, Profile,
   Register/Forgot forms, and the new Admin console) currently reuse plain
   utility classes (`.btn`, `.admin-table`, etc.) and will need a matching
   design pass.
7. **Payment gateway** — intentionally skipped this pass; checkout stays
   COD-only, matching the backend.
8. **Admin role gating is UI-only** — the `/admin` routes just check
   `user.role` in React; that's a convenience, not security. It's safe
   because every underlying endpoint is already protected server-side by
   `JwtAuthGuard`/`RolesGuard`, but a dedicated 403/redirect page (rather
   than bouncing to `/login`) would be a nicer UX for a logged-in customer
   who lands on `/admin` by mistake.
9. **CSV export** on the Inventory page — the table is browse + restock
   only; bulk export/import still needs the backend CSV module (see backend
   README item 2) before a frontend button makes sense.

## Suggested prompt to continue
> "Continue the Harf Banaras React frontend. Add an order-detail/tracking
> page shared between customer Profile and Admin Orders, build the CSV
> import/export UI once the backend supports it, and do a full
> maroon/gold/ivory styling pass across every page — including the new
> Admin console — using the frontend-design skill."
