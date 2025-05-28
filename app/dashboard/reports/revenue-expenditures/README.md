# Revenue and Expenditure Report

## Overview

The Revenue and Expenditure report displays financial data comparing revenues and expenses for the current and previous fiscal years. It presents:

- Revenue from various sources (non-exchange, exchange transactions, borrowings)
- Expenses by category (compensation, goods, grants, etc.)
- Calculated surplus or deficit for the period

## Component Structure

```
revenue-expenditures/
├── page.tsx                      # Main page component
└── README.md                     # This file
```

## Implementation

This report uses the following shared components and hooks:

- **Financial Components**: Standard financial components from `/components/financial`
- **useReportData**: Fetches revenue and expenditure data with the 'revenue-expenditure' parameter
- **useRevenueSurplusCalculations**: Calculates the surplus/deficit based on revenue and expense data

## Report Structure

The report is organized into two main sections:

### 1. Revenues

Divided into three subsections:
- **Revenue from Non-exchange**: Tax revenue, grants, transfers, fines, etc.
- **Revenue from Exchange transactions**: Property income, sales, proceeds from asset sales
- **Borrowings**: Domestic and external borrowings

### 2. Expenses

A single section listing all expense categories:
- Compensation of employees
- Goods and services
- Grants and transfers
- Subsidies
- Social assistance
- Finance costs
- Acquisition of fixed assets
- Repayment of borrowings
- Other expenses

## Features

- Responsive design that works on all device sizes
- Print-friendly styling with dedicated Print/PDF button
- Proper semantic HTML with advanced accessibility support
- Automatic calculation of surplus/deficit for current and previous fiscal years
- Loading state with skeleton UI
- Enhanced error handling with multiple retry options
- Empty section filtering
- Consistent section rendering order with stable sorting
- Robust fallback values for missing data
- Named event handlers for improved code organization

## Enhanced Robustness & Performance

The component incorporates several improvements for robustness and performance:

1. **Stable Section Sorting** - Sections are displayed in a consistent order with primary sort by expected position and secondary alphabetical sort for stability
2. **Empty Section Filtering** - Completely skips rendering of empty sections and subsections
3. **Error Resilience** - Improved error handling with soft and hard refresh options
4. **Failsafe Data Access** - Uses optional chaining and nullish coalescing operators (`?.`, `??`) throughout for maximum robustness
5. **Default Fallbacks** - Provides sensible defaults for missing title information
6. **Print/Export** - Added print/PDF export functionality with print-specific styling
7. **Safe Number Parsing** - Enhanced number parsing for resilience against malformed data
8. **Memoization** - All configuration objects and calculations are memoized for optimal performance
9. **Named Fragments** - Uses named React.Fragment components with explicit keys
10. **Semantic Classes** - Added specific class names for styling first-row, total-row, and summary-row elements
11. **FlatMap Rendering** - Uses flatMap for cleaner conditional rendering of section content

## Code Organization

The component follows best practices for code organization:

1. **Named Handler Functions** - All event handlers are extracted to named functions
   ```jsx
   const handlePrint = () => window.print();
   // Later in JSX:
   <button onClick={handlePrint}>Print / Save as PDF</button>
   ```

2. **Helper Functions** - Complex conditional logic is extracted to helper functions
   ```jsx
   const isValidSummarySection = (section) => 
     section.isSummarySection && 
     surplus !== undefined && 
     surplusPreviousYear !== undefined;
   ```

3. **Memoized Configuration** - Configuration objects are memoized to prevent unnecessary re-renders
   ```jsx
   const revenueColumns = useMemo(() => [
     { key: 'description', label: 'Description' },
     // ...
   ], []);
   ```

4. **Named Constants** - Constants are named in UPPER_CASE for clarity
   ```jsx
   const FALLBACK_POSITION = 999;
   const EXPECTED_SECTION_ORDER = ['revenues', 'expenses'];
   ```

5. **Cleaner Rendering Logic** - FlatMap is used for cleaner conditional rendering
   ```jsx
   {section.subsections?.flatMap((subsection) =>
     subsection.rows?.length > 0 ? [
       <Component key={subsection.key} />,
       <Separator key={`${subsection.key}-sep`} />
     ] : []
   )}
   ```

## Accessibility

The component includes several accessibility enhancements:

1. **ARIA Live Regions** - Uses `aria-live="polite"` for loading states and `aria-live="assertive"` for errors
2. **Roles** - Appropriate `role="status"` and `role="alert"` attributes for dynamic content
3. **Button Labels** - Clear, descriptive labels with `aria-label` attributes when needed
4. **Semantic Structure** - Logical document structure with proper heading hierarchy
5. **Print Adaptation** - Print-specific styles that ensure readability when printed
6. **Error Messages** - Clear error messages with multiple recovery options
7. **Keyboard Navigation** - All interactive elements are keyboard accessible
8. **Unique Keys** - Proper React key handling for optimal rendering and component identity

## Handling Edge Cases

The component is designed to handle various edge cases gracefully:

1. **Missing Data** - Provides default values for all title properties
2. **Empty Sections** - Skips rendering sections with no data
3. **Unknown Section Keys** - Handles unknown section keys with stable sort order
4. **Initial Loading** - Shows appropriate loading state with accessibility support
5. **HTTP Errors** - Provides clear error feedback with multiple recovery paths
6. **Missing IDs** - Fallback to generated IDs when row.id is not available
7. **Print View** - Hides UI elements not relevant for printing
8. **Missing Values** - Validates values before attempting to display summary sections

## Development Guidelines

1. **Data Structure**: Follow the established pattern in `useReportData.ts` for adding new data
2. **Calculations**: Add any new calculations to the `useRevenueSurplusCalculations.ts` hook
3. **Styling**: Use the existing financial components for consistent styling
4. **Accessibility**: Maintain ARIA labels, roles, and live regions for better screen reader support
5. **Type Safety**: Use the provided interfaces when extending functionality
6. **Performance**: Consider memoizing expensive operations when appropriate
7. **Error Handling**: Provide multiple recovery paths for error states
8. **Defensive Coding**: Use optional chaining and nullish coalescing for robust data access
9. **Proper Key Usage**: Use stable, unique keys (preferring IDs over indices)
10. **Event Handlers**: Extract event handlers to named functions for clarity and testability 