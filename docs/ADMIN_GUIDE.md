# HabitaPlot™ Admin User Guide

**Version**: 1.0  
**Last Updated**: 2024  
**Audience**: System Administrators, Marketplace Moderators

---

## Table of Contents

1. [Admin Dashboard Overview](#dashboard-overview)
2. [User Management](#user-management)
3. [Listing Moderation](#listing-moderation)
4. [Subscription Management](#subscription-management)
5. [Analytics & Reports](#analytics)
6. [Content Moderation](#content-moderation)
7. [System Administration](#system-admin)
8. [Audit & Compliance](#audit-compliance)
9. [Support & Escalation](#support-escalation)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

---

## Admin Dashboard Overview {#dashboard-overview}

### Accessing the Admin Panel

1. **Login**: Navigate to login.habitaplot.com and login with admin credentials
2. **Navigate to Admin**: Click on your profile icon (top-right) → **"Admin Panel"** or go directly to **/admin**
3. You should now see the **Admin Dashboard**

### Understanding Your Permissions

Admin access includes:
- ✓ View all users and their activities
- ✓ Manage user accounts (approve, suspend, ban)
- ✓ Review and moderate listings
- ✓ Feature or demote listings
- ✓ Manage subscriptions and billing
- ✓ View analytics and reports
- ✓ Access audit logs
- ✓ Generate compliance reports

❌ Admins **cannot**:
- Delete user accounts (only deactivate)
- Access user passwords
- Modify payment information
- Change other admin's permissions

### Dashboard Tabs

The admin dashboard contains 4 main tabs:

#### 1. **Overview Tab** (Default)

Shows key metrics at a glance:

**Analytics Cards:**
- **Total Users**: Number of active, registered users
- **Total Listings**: Number of active property listings
- **Active Subscriptions**: Count of paid subscriptions
- **Quick Actions**: Fast links to common administrative tasks

**Trends Section:**
- **Top Cities**: Bar chart showing cities with most listings
- **Listings by Type**: Breakdown of listing types (House, Apartment, Commercial, etc.)

**Quick Stats:**
- **This Month**: New users, new listings, subscription revenue
- **This Week**: User activity, platform growth metrics

#### 2. **Users Tab**

Jump directly to **User Management** page (see [User Management](#user-management) section).

#### 3. **Listings Tab**

Jump directly to **Listing Moderation** page (see [Listing Moderation](#listing-moderation) section).

#### 4. **Subscriptions Tab**

Jump directly to **Subscription Management** page (see [Subscription Management](#subscription-management) section).

### Dashboard Controls

**Date Range Selector:**
- Located at top of dashboard
- Filter analytics by: Last 7 days, Last 30 days, Last 90 days, Custom range
- Date changes update all cards and charts automatically

**Export Options:**
- **Export Chart**: Click chart → "Download" to save as PNG or CSV
- **Export Reports**: Selected reports can be exported as PDF or Excel

**Refresh Data:**
- Click the **refresh icon** to manually reload all dashboard data
- Data auto-refreshes every 5 minutes

---

## User Management {#user-management}

### User Management Interface

1. From Admin Dashboard, click the **"Users"** tab
2. You'll see the **User Management page** with a list of all registered users

### User List Features

**Columns Displayed:**
- User Avatar & Name
- User Email
- User Type (Buyer, Seller, Landlord, Renter, Agent)
- KYC Status (Pending, Verified, Rejected)
- Account Status (Active, Inactive, Suspended, Banned)
- Joined Date
- Action Buttons

**Search & Filter:**

Search by Name/Email:
1. Enter search term in the search bar
2. Filter immediately shows matching results

Filter by User Type:
1. Click the **"Role"** dropdown
2. Select: All, Buyer, Seller, Landlord, Renter, Real Estate Agent
3. Results filter to selected user type

Filter by Account Status:
1. Click the **"Status"** dropdown
2. Select: All, Active, Inactive, Suspended, Banned
3. Results filter accordingly

**Sort & Pagination:**
- Click column headers to sort (Name, Email, Type, Status, Joined Date)
- Use Previous/Next buttons at bottom to navigate pages
- Shows page number (e.g., "Page 1 of 45")

### User Details

To view a user's full profile:

1. Click on any user's name or **"View"** button
2. A side panel or new page opens showing:
   - Full Name & Avatar
   - Email & Phone Number
   - User Type & Role
   - KYC Verification Status & Documents (if provided)
   - Account Status
   - Account Activity Timeline
   - Number of Listings
   - Current Subscription
   - Last Login
   - Registration Date
   - Payment History

**Related Sections:**
- **Listings**: All listings posted by this user (click to view)
- **Activity**: Messages sent/received, searches, favorites
- **Subscriptions**: Current plan and billing history
- **Audit Trail**: Admin actions taken on this account

### Managing KYC Verification

KYC (Know Your Customer) verification is required for users posting listings.

**Viewing KYC Status:**

From User Details page:
1. Scroll to **"KYC Verification"** section
2. See current status:
   - **Pending**: Awaiting admin review
   - **Verified**: Approved, user can post listings
   - **Rejected**: Needs resubmission
3. View uploaded document images (front/back of ID)
4. See submission date and expiration date

**Approving KYC:**

1. Review the submitted documents:
   - Check document legibility
   - Verify name matches account
   - Ensure document is not expired
   - Confirm document is authentic format

2. If documents are valid, click **"Approve KYC Verification"**
3. Provide optional approval notes
4. Click **"Confirm"**
5. User receives email notification: "Your identity has been verified"
6. User can now post listings immediately

**Rejecting KYC:**

1. If documents are invalid or unclear:
   - Click **"Reject KYC Verification"**
   - Select reason:
     - Document unclear/unreadable
     - Name doesn't match account
     - Document expired
     - Document not authentic
     - Other (specify)
2. Add detailed feedback (e.g., "Please resubmit front and back clearly")
3. Click **"Confirm Rejection"**
4. User receives email with rejection reason and resubmission instructions
5. User can resubmit documents after correcting the issue

**Re-Verification:**

Users can request re-verification after rejection:
1. User uploads new documents
2. Status becomes "Pending" again
3. You'll see it in the KYC queue for review

### Managing User Accounts

**Activating/Reactivating a User:**

If a user account is inactive:
1. Click the user to open details
2. Click **"Activate Account"**
3. Provide optional activation notes
4. User receives email: "Your account has been reactivated"

**Suspending a User:**

Temporary suspension (user can appeal):
1. Open user details
2. Click **"Suspend Account"**
3. Select reason:
   - Suspicious activity
   - Violation of terms
   - Payment issues
   - Other (specify)
4. Set suspension duration:
   - 7 days
   - 30 days
   - 90 days
   - Indefinite
5. Add suspension notice (visible to user)
6. User receives email about suspension and appeal process
7. User cannot post listings or contact during suspension

**Banning a User:**

Permanent ban (more serious):
1. Open user details
2. Click **"Ban Account"**
3. Select reason:
   - Fraud/Scam
   - Harassment/Abuse
   - Multiple violations
   - Other serious violation
4. Add detailed ban reason
5. Choose what to do with their listings:
   - Remove all listings
   - Keep listings (deactivated)
6. User receives email explaining the ban
7. User cannot login or access account
8. **Note**: Ban is permanent and cannot be reversed

**Lifting Suspensions:**

For temporarily suspended accounts:
1. Open user details
2. See suspension expiration date
3. If user appeals or situation is resolved, click **"Lift Suspension"**
4. Add notes (optional)
5. User receives email: "Your suspension has been lifted"
6. User can now login and post again

### Viewing User Activity

**Activity Log:**

1. Open user details
2. Scroll to **"User Activity"** section
3. See timeline of user actions:
   - Logins (date, time, device/browser)
   - Listings created/edited/deleted
   - Messages sent
   - Subscriptions upgraded/downgraded
   - Payments made
   - Profile updates

**Last Login Information:**
- Shows exact date and time
- Shows device type (Mobile, Desktop)
- Shows browser used
- Helps identify suspicious activity

**Contact History:**
- Messages sent/received (count)
- Properties contacted about
- Response time average

### Messaging Users

**Send Direct Message:**

1. Open user details
2. Click **"Send Message"**
3. Compose message (system alerts, notices, notifications)
4. Click **"Send"**
5. Message is sent through HabitaPlot™ inbox
6. User receives notification

---

## Listing Moderation {#listing-moderation}

### Listing Moderation Interface

1. From Admin Dashboard, click the **"Listings"** tab
2. You'll see the **Listing Moderation page**

### Listing Moderation Workflow

**Three Tabs:**

- **Pending Review** (red badge shows count)
  - New listings awaiting admin approval
  - Must be reviewed before appearing in search
  - Oldest listings show first

- **Active**
  - Currently published and visible to users
  - Make feature or perform quality checks

- **All Listings**
  - Complete history of all listings
  - Can filter by status: Active, Pending, Rejected, Featured, Deactivated

### Reviewing Pending Listings

**Priority Queue System:**

Pending listings show in order:
1. **Newest first** (default)
2. Older listings auto-escalate for priority review if pending 48+ hours

**Reviewing Each Listing:**

1. Click on a pending listing to open **details view**
2. Review the following:

   **Property Information:**
   - Address and location (verify it's real)
   - Property type and size
   - Bedroom/bathroom count
   - Price (check if reasonable)
   - Description (check for spam, keywords stuffing)

   **Photo Quality:**
   - Are there at least 10 photos?
   - Are photos clearly visible and appropriate?
   - Do photos match the description?
   - Look for suspicious content (watermarks, other listings, etc.)

   **Seller Information:**
   - Is seller verified/KYC approved?
   - Check seller's history
   - Any previous violations?

   **Policy Compliance:**
   - Does listing comply with HabitaPlot™ policies?
   - Any prohibited content?
   - Accurate pricing?
   - No illegal activity advertised?

**Approving a Listing:**

1. After reviewing, click **"Approve Listing"**
2. Provide optional approval notes (internal, not shown to user)
3. Click **"Confirm Approval"**
4. Listing immediately becomes visible to all users
5. Seller receives email: "Your listing has been approved"

**Rejecting a Listing:**

1. If listing violates policies, click **"Reject Listing"**
2. Select the reason:
   - Inappropriate photos
   - Misleading description
   - Prices unreasonable
   - Prohibited content
   - Insufficient information
   - Duplicate listing
   - Other (specify)
3. Add detailed feedback (e.g., "Please remove photos containing watermarks")
4. Click **"Send Rejection"**
5. Seller receives email with reason and can resubmit after fixing
6. Listing remains hidden until resubmitted

**Key Metrics:**
- **Pending Count**: Shows how many need review
- **Average Review Time**: System tracks admin speed
- **Escalation Alerts**: Lists pending 24+ hours automatically escalate

### Managing Active Listings

**Search & Filter Active Listings:**

From the **"Active" tab**:
1. Search by address, property type, seller name
2. Filter by price range, bedrooms, listing age
3. Sort by date added, price, views, favorites

**Listing Performance:**
- **Views**: How many users have viewed it
- **Favorites**: How many users saved it
- **Inquiries**: How many contact requests received
- **Age**: How long it's been listed

**Feature a Listing:**

To promote a listing to top of search results:
1. Click listing to open details
2. Click **"Feature Listing"**
3. Select duration:
   - 7 days ($9.99)
   - 30 days ($29.99)
   - Apply discount: 10%, 20%, Complimentary
4. Click **"Feature"**
5. Listing moves to top of search results
6. Seller receives notification about featured status
7. Track featured expiration date

**Deactivating Listings:**

For listings that should be hidden:
1. Open listing details
2. Click **"Deactivate Listing"**
3. Select reason (optional):
   - Sold/Rented/Leased
   - Seller request
   - violates terms
   - Under investigation
4. Click **"Deactivate"**
5. Listing becomes hidden (seller can reactivate later)

**Deleting Listings:**

For permanently removing listings:
1. Open listing details
2. Click **"Delete Listing"**
3. Select reason:
   - Confirmed fraud
   - Repeated violations
   - Seller request (permanent)
4. **Confirm** (cannot be undone)
5. Listing is permanently removed from all searches

**Audit History:**
- See all admin actions on each listing
- View approval/rejection dates
- Track feature history

### Addressing Reported Listings

**User Reports Queue:**

1. When users report listings (via "Report Listing" button), they appear in a **Reports Queue**
2. Navigate to **"Reports"** section
3. See listings reported for:
   - Scam/Fraud
   - Inappropriate photos
   - Harassment/Offensive content
   - Fake listing
   - Spam/Bot content
   - Other

**Investigating Reports:**

1. Click on reported listing
2. See:
   - Actual report (reason, user feedback)
   - Number of similar reports
   - Listing content
   - Seller history
3. Decide: **Approve** (legitimate report, take action) or **Dismiss** (false report)

**Actions on Confirmed Reports:**
- If fraud confirmed: Flag seller, deactivate listing, notify authorities if needed
- If photos inappropriate: Request seller to replace photos or delete listing
- If spam: Delete listing, issue warning to seller

---

## Subscription Management {#subscription-management}

### Subscription Management Interface

1. From Admin Dashboard, click the **"Subscriptions"** tab
2. View all active subscriptions in a table

### Subscription Overview

**Columns in Subscription List:**
- User Name
- Email
- Subscription Plan (Free, Premium, Featured, Enterprise)
- Status (Active, Expired, Cancelled, Pending)
- Billing Cycle (Monthly, Yearly)
- Billing Amount
- Next Renewal Date
- Stripe Status
- Actions

**Filters:**
- Filter by plan type
- Filter by status
- Filter by billing cycle
- Search by user name/email

### Managing User Subscriptions

**View Subscription Details:**

1. Click on any subscription row
2. See complete subscription info:
   - User information
   - Plan details (listings allowed, features included)
   - Billing cycle and amount
   - Payment method on file
   - Renewal date
   - Auto-renewal status
   - Stripe subscription ID

**Extending a Subscription:**

To extend a user's subscription without charging:
1. Open subscription details
2. Click **"Extend Subscription"**
3. Select new expiration date
4. Add reason (optional): "Customer support", "Promotion", etc.
5. Click **"Extend"**
6. User receives email: "Your subscription has been extended"

**Cancelling a Subscription:**

1. Open subscription details
2. Click **"Cancel Subscription"**
3. Select cancellation reason:
   - User requested
   - Non-payment
   - Service issue
   - Promotional cancellation
4. Choose refund option:
   - No refund (used service)
   - Prorated refund (partial used time)
   - Full refund (customer service)
5. Click **"Process Cancellation"**
6. Subscription becomes inactive
7. If refund selected, refund processes to original payment method
8. User receives cancellation email with refund info

**Resolving Billing Issues:**

If user reports payment problems:
1. Open their subscription
2. Check Stripe status and error messages
3. If payment method declined: User may need to update it
4. If system error: You can manually alter next billing date
5. Offer prorated credit or discount on next billing

**Downgrading Subscriptions:**

To move user to lower-tier plan:
1. Open subscription
2. Click **"Downgrade Plan"**
3. Select target plan (Premium, Featured, Free, etc.)
4. Prorated credit calculated and applies to next billing
5. Click **"Confirm Downgrade"**
6. Feature limits adjust immediately (e.g., max listings reduces)
7. User receives email about downgrade

### Promotional Subscriptions

**Creating Promo Codes:**

1. Go to **Admin Settings** → **Promo Codes**
2. Click **"Create New Promo Code"**
3. Enter code details:
   - Code (e.g., "SUMMER20")
   - Discount type (Percentage or Fixed amount)
   - Discount value (20% or $5 off)
   - Applicable plans (Free, Premium, Featured, All)
   - Valid time range
   - Usage limit (e.g., 100 uses)
4. Click **"Create Code"**
5. Share code with users via email campaign or promotions

**Monitoring Promo Code Usage:**

1. Go to **Promo Codes**
2. See usage stats:
   - Code name
   - Total uses
   - Total discount issued
   - Successful conversions
   - Revenue impact

---

## Analytics & Reports {#analytics}

### Dashboard Analytics

The Overview tab displays key metrics and trends:

**Key Metrics Cards:**

- **Total Users**: Cumulative registered users
- **Total Listings**: Active property listings
- **Active Subscriptions**: Paid subscription count
- **Revenue**: Total subscription revenue (clickable for details)

**Trends Charts:**

1. **Top Cities**: Bar chart showing
   - Cities with most listings
   - Helps identify geographic market
   
2. **Listings by Type**: Pie/bar chart showing
   - Distribution of property types
   - Market composition

3. **User Growth**: Line chart showing
   - New user registrations over time
   - Platform adoption rate

4. **Subscription Revenue**: Trend line showing
   - Monthly revenue from subscriptions
   - Growth/decline trends

### Detailed Reports

**Generating Reports:**

1. Click **"Reports"** in main menu
2. Select report type:
   - **User Activity Report**
   - **Listing Performance Report**
   - **Revenue Report**
   - **Compliance Report**
   - **Custom Report**

**User Activity Report:**

Shows:
- New user registrations (daily/weekly/monthly)
- User logins and session activity
- Geographic distribution
- Device type breakdown
- Most active user segments

Download as: CSV, Excel, PDF

**Listing Performance Report:**

Shows:
- Listings by status (Active, Pending, Rejected)
- Average listing age
- Listings per category
- Featured listing ROI
- Most viewed listings

**Revenue Report:**

Shows:
- Subscription revenue trends
- Featured listing revenue
- Plan distribution (% Premium, Featured, Enterprise)
- Refunds and chargebacks
- Revenue by geographic region

**Compliance Report:**

Shows:
- KYC verifications approved/rejected
- Suspended/banned users
- Reported listings and outcomes
- Policy violations
- Safety incidents

**Custom Report:**

Create your own report:
1. Select date range
2. Select metrics to include
3. Select grouping (user type, plan, region, etc.)
4. Click **"Generate"**

### Exporting Data

**Export Formats:**
- **PDF**: Formatted report suitable for printing
- **Excel**: Editable spreadsheet with charts
- **CSV**: Raw data for analysis
- **JSON**: Developer-friendly format

**Scheduled Reports:**

1. Go to **Reports** → **Scheduled Reports**
2. Click **"Schedule New Report"**
3. Select report type and frequency (Daily, Weekly, Monthly)
4. Select recipients (email addresses)
5. Choose format and metrics
6. Click **"Schedule"**
7. Report automatically generates and emails on schedule

---

## Content Moderation {#content-moderation}

### Reported Content

**Accessing Reported Content Queue:**

1. Navigate to **Moderation** → **Reported Content**
2. See all user reports organized by type:
   - Listings
   - Users
   - Messages
   - Reviews

**Report Categories:**

- **Scam/Fraud**: Suspicious or deceptive listings
- **Inappropriate Content**: Offensive photos or descriptions
- **Harassment**: Users being harassed or abused
- **Spam**: Repetitive or bot-generated content
- **Safety Concern**: Unsafe practices advertised
- **Copyright Violation**: Stolen photos or content
- **Other**: User-specified reason

### Reviewing Reports

**Triaging Reports:**

1. Click on any report
2. See:
   - Original content (listing, message, etc.)
   - Reporter identity and reason
   - Number of similar reports on this content
   - Reported user/seller history
   - Timeline of reports

**Decision Options:**

1. **Investigate**: 
   - Review content thoroughly
   - Check user history for patterns
   - Verify if legitimate report
   - Take time for complex cases

2. **Approve Report** (take action):
   - If confirmed: Send warning to user
   - If severe: Suspend or ban user
   - If fraudulent: Deactivate listing
   - Close report with resolution notes

3. **Dismiss Report**:
   - If false report
   - If content doesn't violate policies
   - Document reason for dismissal

### User Warnings

**Issuing Warnings:**

1. From report decision, click **"Issue Warning"**
2. Select warning severity:
   - **Level 1** (Minor): First-time violation
   - **Level 2** (Moderate): Repeated violation
   - **Level 3** (Severe): Major violation or pattern
3. Select issue category
4. Add detailed message to user
5. Click **"Send Warning"**
6. User receives email explaining the issue
7. 3 warnings at Level 2+ = Automatic 7-day suspension

**Tracking User Warnings:**

- Go to user details
- See **"Warnings History"**
- See all warnings issued
- See dates and reasons

### Escalation & Authorities

**Flagging for Law Enforcement:**

For serious crimes (fraud, trafficking, etc.):
1. Go to reported content
2. Click **"Flag for Authorities"**
3. Select crime category
4. Add detailed evidence
5. Click **"Report to Law Enforcement"**
6. Create incident ticket with law enforcement agency if necessary
7. Document case number for records

---

## System Administration {#system-admin}

### Admin Settings

**Accessing Admin Settings:**

1. Click your profile icon → **"Admin Settings"**
2. Or go to **Dashboard** → **"Settings"**

### Configurable Settings

**Email Settings:**
- Notification email address for system alerts
- Email sender configuration
- Email template customization
- Test email can be sent

**Commission & Fees:**
- Platform commission percentage (%)
- Subscription pricing for each tier
- Featured listing pricing
- Payment processing fees

**Feature Flags:**
- Enable/disable new features
- Beta features for testing
- Feature rollout schedule

**Localization:**
- Default language
- Supported currencies
- Timezone for reports
- Regional compliance settings

**API Configuration:**
- Generate API keys for integrations
- Manage Stripe API credentials
- Configure webhooks
- Rate limiting settings

### Admin Team Management

**Adding Admin Users:**

1. Go to **Settings** → **Admin Team**
2. Click **"Add Admin User"**
3. Enter new admin details:
   - Email address
   - Full name
   - Phone number
   - Role/permissions level
4. Send invite
5. New admin receives email to set up account

**Admin Roles:**

- **Super Admin**: Full system access
- **Moderator**: User/listing moderation only
- **Finance Admin**: Subscription/payment management
- **Support Admin**: Can view reports and communicate
- **Content Admin**: Listing and content review only

**Managing Admin Permissions:**

1. Go to **Admin Team**
2. Click on admin user
3. Adjust permissions:
   - ☐ View users
   - ☐ Suspend/ban users
   - ☐ Moderate listings
   - ☐ Manage subscriptions
   - ☐ Access reports
   - ☐ View audit logs
   - ☐ Manage admins
4. Save changes

**Removing Admins:**

1. Click admin in team list
2. Click **"Remove Admin"**
3. Confirm removal
4. Admin account loses all admin privileges

### Backup & Data Management

**Automated Backups:**

The system automatically backs up data:
- **Hourly**: Last 7 days
- **Daily**: Last 30 days
- **Weekly**: Last 1 year

**Manual Backup:**

1. Go to **Settings** → **Backup & Recovery**
2. Click **"Create Manual Backup"**
3. Select data to include (Users, Listings, Subscriptions, etc.)
4. Backup is created (may take time for large datasets)
5. Receive notification when complete
6. Can download backup file

**Restoring from Backup:**

1. Go to **Backup & Recovery**
2. Select backup date from list
3. Click **"Restore"**
4. **Warning**: This will overwrite current data
5. Confirm restoration
6. Monitor restoration progress
7. System taken offline during restoration (~5-30 minutes depending on size)

---

## Audit & Compliance {#audit-compliance}

### Audit Log

**Accessing Audit Trail:**

1. Navigate to **Compliance** → **Audit Trail**
2. See all system and admin actions logged

**Audit Log Details:**

Each entry shows:
- **Timestamp**: Date and time of action
- **Admin**: Which admin performed action
- **Action**: What was done (Approved listing, Banned user, etc.)
- **Entity**: What was affected (User ID, Listing ID)
- **Details**: Specific data changed
- **IP Address**: Where action came from
- **Status**: Success or error

**Filtering Audit Trail:**

1. By admin user
2. By action type (Approvals, Suspensions, Deletions, etc.)
3. By entity type (User, Listing, Subscription)
4. By date range
5. By status (Success, Error, Pending)

**Search Audit Trails:**

- Search for specific user or listing affected
- Track all actions on a particular entity
- Identify patterns or suspicious activity

**Exporting Audit Trail:**

1. Apply filters/date range
2. Click **"Export"**
3. Choose format: CSV, Excel, PDF
4. Audit trail downloads with all matching entries

### Compliance Reports

**KYC Compliance:**

1. Go to **Compliance** → **KYC Report**
2. See statistics:
   - % of users KYC verified
   - Pending verifications
   - Rejected verifications with reasons
   - Compliance timeline

3. Export for regulatory requirements

**User Regulations:**

1. **GDPR Compliance** (EU):
   - View user right-to-be-forgotten requests
   - Process data deletion requests
   - Export user data on request
   - Manage consent preferences

2. **Regional Regulations** (per jurisdiction):
   - View jurisdiction-specific compliance checks
   - Generate compliance certificates

### Incident Reporting

**Creating Incident Report:**

For security or compliance incidents:

1. Go to **Incidents** → **New Incident**
2. Fill in:
   - Incident type (Data breach, Fraud, Security, etc.)
   - Severity (Low, Medium, High, Critical)
   - Description
   - Affected users (if any)
   - Date/time of incident
   - Immediate actions taken
3. Upload evidence/screenshots
4. Submit report

**Resolution Tracking:**

- Incident gets assigned to responsible admin
- Timeline for resolution
- Status updates
- Resolution documentation
- Root cause analysis

---

## Support & Escalation {#support-escalation}

### Customer Support Queue

**Accessing Support Requests:**

1. Navigate to **Support** → **Support Tickets**
2. See all customer support requests

**Ticket Queue:**

- **Active**: Unresolved tickets
- **Open**: Awaiting customer response
- **Closed**: Resolved tickets
- **Escalated**: Serious issues needing immediate attention

**Responding to Tickets:**

1. Click ticket to open
2. Review customer issue
3. You may need to:
   - Check user account
   - Review relevant listings
   - Review communication
4. Compose response:
   - Provide solution or explanation
   - Ask for clarification if needed
   - Offer refund or compensation if appropriate
5. Click **"Send Response"**
6. Customer receives email with response
7. Mark as **"Resolved"** when issue is closed

### Escalation Procedures

**When to Escalate:**

- Legal issues or threats
- Severe policy violations
- High-value customer disputes
- Potential P blic safety issues
- Regulatory compliance concerns

**Escalating to Management:**

1. From ticket or incident, click **"Escalate"**
2. Select management level (depends on your role)
3. Add escalation notes (why escalation needed, context)
4. Click **"Escalate Ticket"**
5. Senior admin/manager notified and takes over

**Escalation SLA:**

- Escalated tickets reviewed within 2 hours
- Management provides resolution within 24 hours
- Customer kept informed of escalation status

---

## Troubleshooting {#troubleshooting}

### Common Admin Issues

#### Dashboard Not Loading

**Problem**: Admin dashboard shows blank page or loading indefinitely.

**Solutions**:
1. Refresh the page (Ctrl+Shift+R for hard refresh)
2. Clear browser cache
3. Try different browser
4. Check internet connection
5. Try in private/incognito mode
6. Contact IT if still not working

#### Unable to Suspend User

**Problem**: Suspend button disabled or not responding.

**Solutions**:
1. Verify you have correct admin permissions
2. User may already be suspended (check status)
3. Try loading user details again
4. Try again in 5 minutes (system may be processing)
5. Contact Super Admin if permission issue

#### Listing Not Appearing After Approval

**Problem**: You approved a listing but it doesn't show in search results.

**Solutions**:
1. Manually refresh your browser
2. Clear browser cache
3. Check listing status in "All Listings" tab (should show "Active")
4. May take a few minutes for search index to update
5. Search for property address directly to verify it exists

#### Email Notifications Not Sending

**Problem**: Admins not receiving email notifications about reports/escalations.

**Solutions**:
1. Go to **Settings** → **Notification Email**
2. Verify email address is correct
3. Check spam/junk folder
4. Send test email to verify
5. Check email settings don't have notifications disabled
6. Contact IT if email system is down

#### Payment Processing Errors

**Problem**: Subscription payments failing or errors in Stripe integration.

**Solutions**:
1. Check Stripe API credentials in settings
2. Verify Stripe account is active and has no issues
3. Check payment method being used
4. Retry payment manually or ask customer to update payment method
5. Contact Stripe support if API integration issue

#### High Database Load

**Problem**: System responding slowly, queries taking long time.

**Solutions**:
1. Check current active users (may be peak time)
2. Run system diagnostics
3. Check if a specific report is running (may be resource-intensive)
4. Contact DevOps if performance critical
5. Consider archiving old data to free space

---

## Best Practices {#best-practices}

### User Management

✓ **Regular KYC Verification Reviews**
- Review pending KYC submissions at least daily
- Set a target of < 24 hour review time
- Document rejection reasons clearly

✓ **Pattern Detection**
- Monitor for suspicious user behavior patterns
- Watch for multiple accounts from same IP
- Flag repetitive policy violations

✓ **Fair & Consistent Enforcement**
- Apply policies consistently across all users
- Document decision for each action
- Be transparent about reasons for suspensions/bans

### Listing Moderation

✓ **Timely Review**
- Review pending listings within 24 hours
- Flag oldest pending listings for priority
- Communicate expectations to sellers

✓ **Photo Verification**
- Check photos for authenticity (reverse image search for suspected stolen photos)
- Verify photos match description
- Reject poor quality images

✓ **Prevent Fraud**
- Look for unrealistic pricing
- Verify seller reputation
- Watch for spam/duplicate listings

### Compliance

✓ **Audit Trail Maintenance**
- Regularly review audit logs for suspicious patterns
- Document all significant actions
- Export compliance reports monthly

✓ **KYC Verification Standards**
- Maintain > 95% verification rate
- Regularly audit verification process
- Update documentation standards as needed

✓ **Incident Management**
- Document all incidents immediately
- Escalate serious issues promptly
- Follow up on incidents to prevent recurrence

### Performance Monitoring

✓ **Track Key Metrics**
- Monitor average review times for listings
- Track complaint/report ratios
- Monitor subscription churn rate

✓ **Regular Review Meetings**
- Weekly: Review metrics and pending items
- Monthly: Analyze trends and issues
- Quarterly: Compliance and performance review

### Security

✓ **Account Security**
- Change admin passwords regularly (90 days)
- Enable 2FA on your admin account
- Log out of admin when not in use

✓ **Access Control**
- Regularly audit admin permissions
- Remove access for inactive admins
- Separate duties among admin team

✓ **Data Protection**
- Regular backups verification
- Disaster recovery testing
- Sensitive data encryption

---

## Contact & Support

**Admin Support Team:**
- **Email**: admin-support@habitaplot.com
- **Slack**: #admin-support (internal)
- **Phone**: 1-800-HABITAT x9000
- **Hours**: 24/7 for critical issues

**Documentation:**
- Internal Wiki: wiki.habitaplot.com
- API Documentation: api-docs.habitaplot.com
- Training Videos: training.habitaplot.com

**Escalation:**
- Critical Issues: Escalate to on-call manager immediately
- System Outages: Contact DevOps directly
- Legal Issues: Contact General Counsel

---

**Last Updated**: 2024 | **Version**: 1.0

*For Questions or Updates to This Guide, Contact: admin-support@habitaplot.com*
