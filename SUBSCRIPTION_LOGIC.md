# Subscription Flow & Logic

## 1. Subscription Lifecycle
The subscription determines the Tenant's access to features and limits.
- **Statuses**: `active`, `trialing`, `past_due`, `canceled`.
- **Trial**: All new tenants start with a 14-day `trialing` status (Plan: 'Trial' or 'Basic').

## 2. Middleware Enforcement
The `middleware.ts` or a dedicated `SubscriptionGuard` component checks the tenant's status on every request (or cached via session).

**Logic**:
1. Check `Tenant.subscriptionStatus`.
2. If `active` or `trialing`: Allow access.
3. If `past_due`: Allow access but show "Payment Failed" banner (grace period 3-7 days).
4. If `canceled` or expired: Redirect to `/dashboard/settings/billing` with a "Renew Subscription" prompt. Block other routes.

## 3. Feature Limits (RBAC + Quotas)
Each Plan has `features` stored in the `Plan` schema.
- **MaxUsers**: Checked when Admin invites a new user.
- **MaxProducts**: Checked before `Product.create`.
- **Modules**: `hasAnalytics`, `hasExpiryPrediction`.

**Implementation**:
```typescript
// Example Helper
export async function checkLimit(tenantId: string, itemType: 'user' | 'product') {
   const tenant = await Tenant.findById(tenantId).populate('planId');
   const limit = tenant.planId.features[`max${itemType}s`];
   const currentCount = await Model.countDocuments({ tenantId });
   
   if (currentCount >= limit) throw new Error("Upgrade to add more!");
}
```

## 4. Upgrade/Downgrade Flow
1. User selects new Plan in `/dashboard/settings`.
2. App calls Payment Gateway (Razorpay/Stripe) to create a Subscription.
3. On Webhook success:
   - Update `Tenant.planId`.
   - Update `Tenant.subscriptionStatus` = `active`.
   - Update `Tenant.subscriptionExpiry` = next billing date.
4. If Downgrade:
   - Check if current usage > new limits. If yes, prevent downgrade or ask to archive data.

## 5. Expiry Handling
- **Cron Job** (Daily): Checks `subscriptionExpiry`.
- If `today > expiry + grace_period`: Mark status as `canceled`.
- Send Email Alerts: 7 days before, 3 days before, and On Expiry.
