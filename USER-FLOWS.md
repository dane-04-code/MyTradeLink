# Mytradelink — User Flows

---

## 1. Tradesman — First Time Signup

```
Landing page (/)
    ↓
Click "Create your free page"
    ↓
Sign up — email or phone (/sign-up)
    ↓
Clerk webhook fires
→ Creates user row in DB
→ Seeds default sections
→ Sends welcome email
    ↓
/onboarding — Step 1
Name + Trade (required)
    ↓
/onboarding — Step 2
Phone + WhatsApp + Location (required)
    ↓
/onboarding — Step 3
Profile photo upload (optional)
    ↓
/onboarding — Step 4
About me text (optional)
    ↓
/onboarding — Step 5
"You're live!" — show public link
Share to WhatsApp / Facebook buttons
    ↓
/dashboard
```

---

## 2. Tradesman — Daily Dashboard Use

```
Sign in (/sign-in)
    ↓
/dashboard
    ↓
Toggle sections on/off → auto saves → live preview updates
    ↓
Drag sections to reorder → auto saves → live preview updates
    ↓
Click section edit → update content → auto saves
    ↓
Copy public link → share anywhere
```

---

## 3. Tradesman — Upgrading to Pro

```
/dashboard
    ↓
Click locked Pro section OR upgrade banner
    ↓
/pricing or upgrade modal
    ↓
Click "Upgrade to Pro"
    ↓
/api/stripe/checkout
    ↓
Stripe checkout page (£9/month or £89/year)
    ↓
Payment complete
    ↓
Stripe webhook fires → plan updated to paid in DB
    ↓
Redirect to /dashboard
Pro sections now unlocked
Watermark removed from public page
```

---

## 4. Tradesman — Receiving a Quote Request

```
Customer fills quote form on public profile page
    ↓
/api/quote/[slug] validates and stores request
    ↓
Email notification sent to tradesman
Subject: "New quote request from [Customer Name]"
    ↓
Tradesman opens /dashboard/quotes
    ↓
Views request details — name, phone, description, postcode, photos
    ↓
Marks as Contacted
    ↓
Calls or WhatsApps customer directly
    ↓
Marks as Closed when job complete
```

---

## 5. Homeowner — Viewing a Tradesman Profile

```
Gets link from tradesman (WhatsApp, Facebook, business card, van)
    ↓
Opens /t/[slug] on phone
    ↓
Sees profile — name, trade, location, certifications
    ↓
Taps Call button or WhatsApp button
OR
Fills in quote request form
    ↓
Job booked
```

---

## 6. Tradesman — Managing Billing

```
/dashboard
    ↓
Click billing or account settings
    ↓
/dashboard/billing
    ↓
See current plan and next billing date
    ↓
Click "Manage subscription"
    ↓
/api/stripe/portal
    ↓
Stripe customer portal
→ Update card
→ Cancel subscription
→ Switch monthly/annual
    ↓
Returns to /dashboard/billing
```

---

## 7. Section Toggle Flow (Dashboard)

```
User sees section card in dashboard
    ↓
Clicks toggle
    ↓
Optimistic UI update — toggle flips immediately
Live preview updates instantly
    ↓
API call to update section in DB
    ↓
Success — no visible change (already updated)
Error — toggle reverts, toast error shown
```

---

## 8. Photo Upload Flow

```
User clicks "Add photos" in gallery section
    ↓
File picker opens (Uploadthing)
    ↓
Photo uploads to Uploadthing
    ↓
URL saved to photos table in DB
    ↓
Photo appears in dashboard gallery
    ↓
Photo appears on public profile
```
