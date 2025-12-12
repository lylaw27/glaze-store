# Stripe Checkout Setup Guide

## Overview
This project now includes a complete Stripe checkout integration with support for:
- **Express Checkout**: Apple Pay, Google Pay
- **Payment Methods**: Credit/Debit Cards, Alipay, WeChat Pay
- **One-step checkout** with address collection

## Installation

### 1. Install Dependencies
Run the following command to install Stripe packages:
```bash
npm install @stripe/stripe-js stripe
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (use `.env.local.example` as reference):

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

Get your API keys from: https://dashboard.stripe.com/apikeys

⚠️ **Important**: 
- Use **test keys** (pk_test_... and sk_test_...) for development
- Use **live keys** (pk_live_... and sk_live_...) for production
- Never commit `.env.local` to version control

### 3. Configure Stripe Dashboard

#### Enable Payment Methods
1. Go to [Stripe Dashboard > Settings > Payment Methods](https://dashboard.stripe.com/settings/payment_methods)
2. Enable the following:
   - **Cards** (Visa, Mastercard, etc.)
   - **Alipay**
   - **WeChat Pay**
   - **Apple Pay** (automatically available)
   - **Google Pay** (automatically available)

#### Configure Business Details
For Apple Pay and Google Pay to work:
1. Go to [Settings > Business Details](https://dashboard.stripe.com/settings/public)
2. Fill in your business name and website

## File Structure

```
app/
├── checkout/
│   ├── page.tsx              # Main checkout page
│   ├── CheckoutForm.tsx      # Payment form component
│   └── success/
│       └── page.tsx          # Success page after payment
├── api/
│   └── create-payment-intent/
│       └── route.ts          # API endpoint to create payment intent
└── components/
    └── cartDrawer.tsx        # Updated with checkout link
```

## Features

### 1. Payment Methods
- **Credit/Debit Cards**: Full card form with validation
- **Apple Pay**: One-tap payment on Safari/iOS
- **Google Pay**: One-tap payment on Chrome/Android
- **Alipay**: Redirect-based payment for Alipay users
- **WeChat Pay**: Redirect-based payment for WeChat users

### 2. Customer Information Collection
- Email address (with autocomplete via Link Authentication)
- Shipping address (with country validation)

### 3. Security
- PCI compliant (Stripe handles card data)
- 3D Secure authentication when required
- Client-side validation

### 4. User Experience
- Order summary displayed during checkout
- Loading states for all async operations
- Error handling with user-friendly messages
- Responsive design for mobile and desktop
- Success page with order confirmation

## Testing

### Test Card Numbers
Use these test cards in development mode:

| Card Number         | Description                |
|--------------------|----------------------------|
| 4242 4242 4242 4242 | Successful payment        |
| 4000 0025 0000 3155 | Requires authentication   |
| 4000 0000 0000 9995 | Card declined             |

- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any postal code

### Test Alipay & WeChat Pay
In test mode, Stripe provides a simulated payment flow for these methods.

### Test Apple Pay & Google Pay
- **Apple Pay**: Use Safari on macOS or iOS with a test card added to Wallet
- **Google Pay**: Use Chrome on Android or desktop with a test card

Full testing guide: https://stripe.com/docs/testing

## Workflow

1. Customer adds items to cart
2. Customer clicks "前往結帳" (Go to Checkout) in cart drawer
3. Checkout page loads and creates a PaymentIntent
4. Customer fills in email and shipping address
5. Customer selects payment method:
   - For cards: fills in card details
   - For Apple/Google Pay: clicks express button
   - For Alipay/WeChat: redirected to payment page
6. Customer confirms payment
7. Stripe processes payment and returns to success page
8. Cart is cleared and order is confirmed

## API Reference

### POST /api/create-payment-intent
Creates a Stripe PaymentIntent for the cart.

**Request Body:**
```json
{
  "items": [...],
  "amount": 1000
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

## Currency Configuration

Currently configured for **HKD (Hong Kong Dollar)**. To change:

1. Update currency in `app/api/create-payment-intent/route.ts`:
```typescript
currency: "usd", // or "eur", "gbp", etc.
```

2. Update formatting in components:
```typescript
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
```

## Production Checklist

Before going live:

- [ ] Replace test API keys with live keys
- [ ] Enable live mode in Stripe Dashboard
- [ ] Configure webhook endpoints (if needed)
- [ ] Test all payment methods in production
- [ ] Set up proper error logging
- [ ] Configure business details in Stripe
- [ ] Review and accept Stripe's Terms of Service

## Troubleshooting

### Apple Pay not showing
- Ensure you're using Safari or iOS
- Verify domain in Stripe Dashboard
- Check that business details are configured

### WeChat Pay / Alipay not showing
- Enable these payment methods in Stripe Dashboard
- Verify your account supports these methods
- Check currency compatibility

### "Invalid API Key" error
- Verify `.env.local` file exists and contains valid keys
- Ensure `NEXT_PUBLIC_` prefix for publishable key
- Restart development server after adding env variables

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Support: https://support.stripe.com

## Security Notes

- Never expose your secret key (`STRIPE_SECRET_KEY`) to the client
- Always validate amounts server-side
- Use HTTPS in production
- Keep Stripe libraries up to date
