<!-- notes  -->

What Are Facets?
Facets are categorizations of information that allow users to narrow down search results by applying multiple filters. They appear as interactive filters typically shown on the left or top side of search results.

Real-World Example
Imagine you're shopping on Amazon for a smartphone. You'll see filters like:

Brand: Apple (1,234), Samsung (987), etc.

Price Range: Under 
100
(
56
)
,
100(56),100-$200 (210), etc.

Customer Ratings: 4 Stars & Up (450)

Features: 5G (320), Dual SIM (180)

These are all facets - they show available options and how many products match each one.

How Facets Work in Your Code
Your getSearchFacets() service method uses MongoDB's aggregation framework with the $facet stage to calculate multiple sets of facet data in a single query:




//Product facest Listing Page
// ───────────────────────────────────────
// │   [Search Box]                      │
// ├──────────────────────┬──────────────┤
// │                      │  Product     │
// │  Filters:            │  List        │
// │                      │              │
// │  ● Categories        │  - Product 1 │
// │    - Electronics (42)│  - Product 2 │
// │    - Clothing (35)   │  - ...       │
// │                      │              │
// │  ● Price Range       │              │
// │    - $0-100 (10)     │              │
// │    - $100-200 (15)   │              │
// │                      │              │
// │  ● Brands            │              │
// │    - Apple (12)      │              │
// │    - Samsung (8)     │              │
// └──────────────────────┴──────────────┘//

