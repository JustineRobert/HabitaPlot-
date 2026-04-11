# UI Wireframes

## Search & Filter Page

```
+-------------------------------------------------------------+
| HabitaPlot™ Search                                           |
+-------------------------------------------------------------+
| [Location] [District] [Type] [Price Min] [Price Max] [Search]|
+-------------------------------------------------------------+
| Filters:                                                     |
|  - District / Administrative Area                            |
|  - Property Type                                             |
|  - Price Range                                               |
|  - Bedrooms / Bathrooms                                      |
|  - Amenities                                                 |
+-------------------------------------------------------------+
| Results                                                      |
| ----------------------------------------------------------- |
| [Listing Card]  [Listing Card]  [Listing Card]               |
|  Title, Price, District, Location, Bedrooms, Highlights      |
| ----------------------------------------------------------- |
| Pagination                                                  |
+-------------------------------------------------------------+
```

### Notes
- The district field is visible in the search bar and filter panel.
- Each listing card includes district and location details.

## Listing Detail Page

```
+-------------------------------------------------------------+
| Listing Title                                               |
+-------------------------------------------------------------+
| [Image Gallery]                                              |
| ----------------------------------------------------------- |
| Location: Kampala, Nabweru                                   |
| District: Wakiso District                                    |
| Price: UGX 250,000                                           |
| Type: House                                                  |
+-------------------------------------------------------------+
| Description                                                  |
+-------------------------------------------------------------+
| Property Details                                             |
|  - Bedrooms                                                  |
|  - Bathrooms                                                 |
|  - Size                                                      |
|  - Amenities                                                 |
+-------------------------------------------------------------+
| Contact Agent / Inquiry buttons                              |
+-------------------------------------------------------------+
```

## Mobile Money Checkout Flow

```
+-------------------------------------------------------------+
| Checkout                                                     |
+-------------------------------------------------------------+
| Selected Plan / Listing                                       |
| Payment method: [MTN MoMo] [Airtel Money] [Card]              |
| Phone number: +256 7XX XXX XXX                                |
| Amount: UGX                                                 |
| Confirm button                                               |
+-------------------------------------------------------------+
| After confirm: show transaction status and instructions      |
|  - "Dial *165# to approve" or "Confirm via MoMo app"       |
|  - Button to verify payment status                          |
+-------------------------------------------------------------+
```

## Admin / Listing Creation Layout

```
+-------------------------------------------------------------+
| Create New Listing                                           |
+-------------------------------------------------------------+
| Title: [__________]                                          |
| Type: [dropdown]                                             |
| Price: [__________]                                          |
| Location Address: [__________]                               |
| District: [__________]                                       |
| City: [__________]                                           |
| Region: [__________]                                         |
| Country: [__________]                                        |
| Latitude / Longitude                                         |
| Bedrooms / Bathrooms                                         |
| Amenities                                                   |
| Submit                                                      |
+-------------------------------------------------------------+
```

### Notes
- District input is integrated with Uganda localization support.
- The UI supports mobile-first usage and clear checkout steps.
