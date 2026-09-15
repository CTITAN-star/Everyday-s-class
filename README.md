# Everyday's Class

A responsive HTML/CSS/JavaScript school-demo storefront for Everyday's Class, owned by Vickie & Mira in Ibadan.

## What is included

- Customer storefront with only 3 catalogue products: Feminelle wash, black bodycon maxi dress, and black strappy stiletto sandals.
- Product/category pages, cart, checkout, Opay payment instructions, receipt upload, and pending-verification confirmation.
- Separate admin application under `/admin/` with its own layout and no admin navigation on the storefront.
- Responsive customer and admin interfaces for desktop and mobile.
- Product/order persistence through a dedicated storage service. For this no-backend school demo, the storage adapter uses localStorage. The customer and admin interfaces are separated at the application level so admin UI is not exposed on the public storefront.

## Open the site

Open `index.html` directly, or run a simple local server from this folder, for example:

`python -m http.server 8000`

Then visit the local address shown by the server.

## Admin

Open `admin/index.html` directly or visit `/admin/` on a local server.

Demo admin:
- Email: `afolyvickie08@gmail.com`
- Password: `admin123`

## Customer test path

1. Open the storefront.
2. Add a product to the cart.
3. Open Your Order.
4. Choose Pickup or Delivery.
5. Continue to checkout and enter customer details.
6. View the Opay payment instructions.
7. Confirm payment and upload a receipt image.
8. The customer sees the pending-verification message; payment is never declared successful automatically.
9. Open the separate admin app and review the order/receipt.
10. Change the order status from the admin order detail screen.

## Product names used

- Feminelle Comforting Intimate Wash — ₦35,000
- Black Bodycon Maxi Dress — ₦8,500
- Black Strappy Stiletto Sandals — ₦9,500

The fashion naming follows common retail naming conventions for fitted maxi/bodycon dresses and strappy stiletto sandals; the uploaded images remain the source visuals.

## Database

This project is connected to a live Supabase project.

- Project name: `everydays-class`
- Project ref: `ridzsxntmtpbbcbqbrlz`
- Project URL: `https://ridzsxntmtpbbcbqbrlz.supabase.co`
- Anon (public) API key: hardcoded in `js/store.js`. This key is meant to be exposed in frontend code — it is not the secret service role key — but it does mean anyone who can see the source can see it.

Tables (`public` schema):
- `products` — id, name, category, price, description, image_url, created_at
- `orders` — id, created_at, customer (jsonb), fulfilment, items (jsonb), subtotal, charges, delivery, total, status, receipt_url

Storage buckets:
- `product-images` — public, holds product photos uploaded from Admin → Products → Edit
- `receipts` — public, holds customer payment receipt uploads

All reads/writes go through `js/store.js`, which wraps the Supabase JS client. There is no other backend — the browser talks to Supabase directly.

### Security note (demo-only setup)

Row Level Security is enabled on both tables, but the current policies are intentionally open for this school demo: anyone can read and write products, and anyone can read orders and update their status. There is no real admin authentication — the admin login is a hardcoded email/password check in `js/admin.js`, not Supabase Auth.

Before using this for a real store, you would want to:
- Restrict product writes and order status updates to authenticated admin users (e.g. via Supabase Auth)
- Scope RLS policies so customers can only see their own order, not all orders
- Move to a proper login flow for `/admin/` instead of the demo check

## Important production note

This is intentionally a static school-demo build. A genuinely separate remote database requires a backend/database provider and credentials — that is now in place via Supabase (see the Database section above). To harden this for real production use, tighten the RLS policies and add real admin authentication as described above.
