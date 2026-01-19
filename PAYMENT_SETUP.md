# Glaze Store - Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Stripe Configuration
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
```

### Email Configuration (Resend)
```bash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender_email
```

## Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Get your project URL and service role key from Project Settings > API
3. Add the credentials to `.env.local`

### 2. Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your publishable and secret keys from the Stripe Dashboard
3. Add the keys to `.env.local`

#### Stripe Webhook Setup
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI: `stripe login`
3. Forward webhooks to local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret from the CLI output
5. Add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**For Production:**
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add a new endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select event: `payment_intent.succeeded`
4. Copy the webhook signing secret
5. Add it to your production environment variables

### 3. Resend Setup
1. Create a Resend account at https://resend.com
2. Get your API key from the Resend dashboard
3. Verify a domain or use the default sender (onboarding@resend.dev for testing)
4. Add the API key and sender email to `.env.local`

**Recommended sender format:**
```bash
RESEND_FROM_EMAIL=Glaze Store <noreply@yourdomain.com>
```

## Testing the Payment Flow

### Local Development
1. Start the development server: `npm run dev`
2. In a separate terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Use Stripe test cards for payment testing:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`

### What Happens After Successful Payment

1. **Payment Processing**: Stripe processes the payment and creates a `payment_intent.succeeded` event
2. **Webhook Trigger**: Stripe sends the event to your webhook endpoint
3. **Order Creation**: The webhook handler:
   - Extracts payment and customer information
   - Creates an order record in Supabase
   - Creates order items linked to the order
   - Updates product stock quantities
4. **Email Notification**: Sends a confirmation email to the customer via Resend
5. **Success Page**: Customer is redirected to `/checkout/success` with order details

## Troubleshooting

### Webhook not receiving events
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check that `STRIPE_WEBHOOK_SECRET` matches the one from Stripe CLI
- Check server logs for webhook errors

### Email not sending
- Verify `RESEND_API_KEY` is correct
- Ensure sender email is verified in Resend dashboard
- Check Resend dashboard logs for delivery status

### Order not created
- Check webhook endpoint logs in your terminal
- Verify Supabase credentials are correct
- Ensure product IDs in cart match products in database
- Check that products have sufficient stock

## Security Notes

- Never commit `.env.local` to version control
- Keep your `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` private
- Use different keys for development and production
- Regularly rotate your API keys
- In production, enable rate limiting on webhook endpoints
