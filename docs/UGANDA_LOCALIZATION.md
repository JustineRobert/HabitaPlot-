# Uganda District Localization

## Overview
HabitaPlot™ supports localized Uganda property search, listing creation, and regional discovery by capturing district-level location data alongside standard address and city fields.

## Why District Localization Matters
- Uganda administrative geography is organized by districts, which are critical for property buyers and agents.
- Many users search by district or county rather than by broad city names.
- Local listings often reference areas like Kampala Central, Wakiso, Mukono, Jinja, and Mbale.

## Supported Location Fields
The platform now includes district-level support for listings.

Primary listing location fields:
- `location_address`: Full text address or neighborhood
- `district`: Administrative district or local council area
- `city`: City or town name
- `state`: Region or sub-region
- `country`: Country name
- `location_latitude` / `location_longitude`: Geo coordinates for mapping and proximity search

## Uganda Address Patterns
Typical Uganda property location data may include:
- `Location Address`: "Plot 23, Nakulabye Road, Kampala"
- `District`: "Kampala Central"
- `City`: "Kampala"
- `State`: "Central Region"
- `Country`: "Uganda"

## Common Uganda Districts
A few reference districts are:
- Kampala
- Wakiso
- Mukono
- Jinja
- Mbarara
- Gulu
- Lira
- Mbale
- Hoima
- Masaka

## Search and Filter Experience
Users can search using:
- `location` text terms, including district names
- `district` parameter for explicit district filtering
- map-based search with coordinates and radius

Example query:
```http
GET /api/v1/listings?district=Kampala&price_min=50000&price_max=300000
```

## Data Normalization
When storing and indexing Uganda listings, the system should:
- normalize district names to a standard case
- accept both English and commonly used local area names
- map neighborhood entries into district-level search results

## Implementation Notes
- The backend listing model supports a `district` field.
- Search logic uses district as a first-class filter beside city and location address.
- The user interface includes district filtering in the search sidebar.
- The listing detail page displays district information when available.

## Regional Growth Strategy
- Enable district-specific discovery for key Ugandan markets.
- Collect local listings with clear district metadata.
- Promote district-based search to increase discoverability and relevance.
