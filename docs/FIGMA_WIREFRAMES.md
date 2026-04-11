# Figma-Ready Wireframes

## Overview
This document describes the key screens and layout details needed to create Figma wireframes for HabitaPlot™ Uganda launch.

## Design System Guidelines
- Layout: responsive, mobile-first, 12-column grid
- Typography: clear hierarchy, readable on mobile
- Buttons: strong call-to-action colors for payment and inquiry actions
- Forms: labeled fields, helper text, and error guidance
- Spacing: comfortable touch targets for mobile users

## Screen 1: Search / Listings

### Layout
- Header with brand and search bar
- Primary filter row:
  - `Location` input
  - `District` input
  - `Type` dropdown
  - `Price Min` / `Price Max`
  - `Search` button
- Sidebar filters (desktop)
- Listings cards in grid/list layout

### Listing Card Contents
- Image preview or placeholder
- Title
- Price
- District
- Location address
- Bedrooms / Bathrooms icons
- Badge for featured or premium listings

### Notes for Figma
- Create components for input field, dropdown, card, badge, pagination
- Add interaction notes for filter expansion and mobile drawer

## Screen 2: Listing Detail

### Layout
- Top section: large image / gallery placeholder
- Title and headline pricing
- Location meta row: address + district + city
- Property details panel:
  - Bedrooms
  - Bathrooms
  - Size
  - Type
- Amenities chips
- Contact agent card with Call / Email buttons
- Save to favorites action

### Notes for Figma
- Use a sticky sidebar card on desktop
- Add grid sections for responsive resizing
- Include a small map placeholder if desired

## Screen 3: Mobile Money Checkout

### Layout
- Selected plan or listing summary
- Payment method selector:
  - MTN MoMo
  - Airtel Money
  - Card (optional)
- Phone number input field
- Amount summary
- Confirm payment button
- Payment instructions panel after submission
- Verify payment button / status feedback

### Notes for Figma
- Show both pre-submit and post-submit states
- Annotate provider-specific instructions for MTN and Airtel
- Use progress indicators for payment state

## Screen 4: Create Listing / Admin Form

### Layout
- Standard form fields:
  - Title
  - Type dropdown
  - Price
  - Location address
  - District
  - City
  - Region / State
  - Country
  - Latitude / Longitude
  - Bedrooms / Bathrooms
  - Size
  - Amenities tags
  - Legal status
- Save and submit buttons
- Validation helper text

### Notes for Figma
- Create reusable form field components with labels and help text
- Add a section for optional `district` autocomplete or dropdown
- Keep the form mobile-friendly with stacked fields

## Screen 5: Admin Dashboard Snapshot

### Layout
- Metrics cards: active listings, district coverage, payments completed
- Quick actions: review pending listings, approve premium upgrades, manage subscriptions
- Regional map or district summary table

### Notes for Figma
- Prioritize data clarity over decoration
- Use cards and tables for dashboard insights

## Figma Preparation
- Create artboards for each screen at 360px width (mobile) and 1440px width (desktop)
- Label components clearly for reuse
- Provide notes for interactions and responsive behavior
- Use placeholder text for Uganda districts and currency (UGX)
