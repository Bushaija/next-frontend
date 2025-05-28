# Changes in Net Assets Report

## Overview

The Changes in Net Assets report displays financial data showing the accumulated surplus/loss, adjustments, and total net assets. It provides a comprehensive view of how net assets have changed over the reporting period.

## Component Structure

```
changes-assets/
├── components/                   # Modular components
│   ├── EditableCell.tsx          # Reusable editable cell component
│   ├── NetAssetsRow.tsx          # Row component for net assets data
│   ├── NetAssetsSummaryRow.tsx   # Summary row component
│   ├── DynamicFinancialTable.tsx # Generic table component
│   ├── ChangesInNetAssetsActions.tsx # Action buttons component
│   ├── Toast.tsx                 # Toast notification component
│   └── index.ts                  # Exports all components
├── hooks/                        # Custom hooks
│   ├── useChangesInNetAssetsPage.ts # Page-specific logic
│   └── index.ts                  # Exports all hooks
├── page.tsx                      # Main page component
└── README.md                     # This file
```

## Implementation

This report uses the following shared components and hooks:

- **Financial Components**: Standard financial components from `/components/financial`
- **useReportData**: Fetches changes in net assets data with the 'changes-assets' parameter
- **useChangesInNetAssetsCalculations**: Calculates the net assets based on surplus and adjustments

## Features

### 1. Modular Component Architecture
- Separation of concerns with dedicated components for rows, cells, and actions
- Custom hooks for business logic and state management
- Memoized components to prevent unnecessary re-renders

### 2. Advanced Editing Capabilities
- Inline cell editing with immediate visual feedback
- Debounced updates to reduce API calls
- Field-level validation with error messages
- Undo changes capability through cancel button

### 3. Enhanced User Experience
- Toast notifications for success/error feedback
- Disabled save button when no changes or validation errors exist
- Print-friendly styling with dedicated Print/PDF button
- Loading skeleton during data fetching

### 4. Responsive and Accessible Design
- Mobile-friendly table layout
- ARIA attributes for screen readers
- Keyboard navigation support
- Clear visual indicators for editable fields

### 5. Performance Optimizations
- Memoized components and calculations
- Efficient rendering using flatMap for subsections
- Debounced value changes to reduce unnecessary re-renders
- Dynamic row ID generation for stable keys

## Code Organization

The component follows best practices for code organization:

1. **Custom Hooks**: All state and business logic extracted to custom hooks
   ```tsx
   const {
     isEditMode,
     handleValueChange,
     // ...other state and functions
   } = useChangesInNetAssetsPage(sections);
   ```

2. **Memoized Configuration**: Configuration objects are memoized
   ```tsx
   const columns = useMemo(() => [
     { key: 'description', label: 'Description' },
     // ...more columns
   ], []);
   ```

3. **Component Composition**: Using smaller, focused components
   ```tsx
   <DynamicFinancialTable>
     <DynamicSectionGroup>
       <NetAssetsRow />
     </DynamicSectionGroup>
   </DynamicFinancialTable>
   ```

4. **Cleaner Rendering Logic**: Using flatMap for conditional rendering
   ```tsx
   {section.subsections?.flatMap((subsection) => [
     <Component key={subsection.key} />,
     <Separator key={`${subsection.key}-sep`} />
   ])}
   ```

5. **Toast Notifications**: Using render props pattern for toast management
   ```tsx
   <ToastManager>
     {(showToast) => (
       // Component content with access to showToast function
     )}
   </ToastManager>
   ```

## Accessibility

The component includes several accessibility enhancements:

1. **ARIA Attributes**: Proper roles and labels for interactive elements
2. **Keyboard Navigation**: Full keyboard support for editing and navigation
3. **Error Messages**: Clear error indicators with proper ARIA connections
4. **Focus Management**: Proper focus handling during editing
5. **Screen Reader Support**: Descriptive labels and announcements

## Development Guidelines

1. **Component Extensions**: When adding new components, follow the established pattern of small, focused components
2. **State Management**: Keep business logic in custom hooks
3. **Styling**: Use the existing Tailwind classes with the `cn` utility for composition
4. **Validation**: Add validation rules to the `validateValue` function in the hook
5. **Performance**: Consider memoizing components and values that don't change frequently
6. **Error Handling**: Provide clear error feedback and recovery paths
7. **Testing**: Components are designed for testability with clear props and callbacks 