# Budget vs Actual Report

## Overview

The Budget vs Actual report displays financial data comparing original budgets, revised budgets, and actual spending. It allows users to:

- View budget and actual spending data by category
- Edit values when in edit mode
- Calculate variance and performance metrics
- Save or cancel changes with confirmation dialogs
- Get visual feedback for errors and loading states

## Component Structure

```
budget-actual/
├── _components/
│   ├── BudgetActualActions.tsx    # Action buttons component
│   ├── BudgetActualRow.tsx        # Row rendering component 
│   ├── BudgetActualValidator.tsx  # Data validation component
│   └── ConfirmDialog.tsx          # Confirmation dialog component
├── __tests__/
│   └── BudgetActualRow.test.tsx   # Test file for row component
├── page.tsx                       # Main page component
├── IMPROVEMENTS.md                # Documentation of improvements
└── README.md                      # This file
```

## Components

### BudgetActualRow

Renders an individual row in the budget report and handles calculations.

```tsx
// Example usage
<BudgetActualRow
  row={rowData}
  rowId="revenue-tax-1"
  isEditMode={isEditMode}
  errors={errors[rowId]}
  getValue={getValue}
  onValueChange={handleValueChange}
/>
```

**Props:**
- `row`: The row data (includes label, original/revised/actual budgets, note)
- `rowId`: Unique identifier for the row
- `isEditMode`: Boolean flag to enable/disable editing
- `errors`: Validation errors for this row
- `getValue`: Function to get current value (edited or original)
- `onValueChange`: Callback for handling value changes

### BudgetActualValidator

Handles validation of budget data using Zod.

```tsx
// Example usage
const error = validateBudgetValue('revisedBudget', value);
```

**Methods:**
- `validateBudgetValue(field, value)`: Validates a specific value and returns error string or null

### BudgetActualActions

Renders action buttons for editing, saving, and canceling.

```tsx
// Example usage
<BudgetActualActions
  isEditMode={isEditMode}
  isSaving={isSaving}
  hasErrors={hasErrors}
  onEdit={handleEdit}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

**Props:**
- `isEditMode`: Boolean flag indicating if the report is in edit mode
- `isSaving`: Boolean flag indicating if save is in progress
- `hasErrors`: Boolean flag indicating if there are validation errors
- `onEdit`: Function to handle edit button click
- `onSave`: Function to handle save button click
- `onCancel`: Function to handle cancel button click

### ConfirmDialog

Provides custom modal dialogs for confirmations.

```tsx
// Example usage
<ConfirmDialog
  isOpen={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onConfirm={handleConfirm}
  title="Save Changes"
  description="Are you sure you want to save these changes?"
  confirmLabel="Save"
  cancelLabel="Cancel"
  isLoading={isSaving}
/>
```

**Props:**
- `isOpen`: Boolean flag to control dialog visibility
- `onClose`: Function to handle dialog close
- `onConfirm`: Function to handle confirm button click
- `title`: Dialog title
- `description`: Dialog description
- `confirmLabel`: Label for confirm button (default: "Confirm")
- `cancelLabel`: Label for cancel button (default: "Cancel")
- `isLoading`: Boolean flag to show loading state

## Usage

The main page component handles:
- Data fetching and state management
- Edit mode toggling
- Validation and error handling
- Saving changes
- Confirmation dialogs

## Development Guidelines

1. **Performance**: Use memoization for expensive calculations and callbacks
2. **Validation**: Use the BudgetActualValidator for all value validations
3. **State Management**: Keep state in the page component, pass data down as props
4. **Error Handling**: Display validation errors inline with inputs
5. **Confirmations**: Use ConfirmDialog for all user confirmations
6. **Loading States**: Show visual feedback during async operations

## Testing

When running tests, focus on:
- Correct calculation of variance and performance
- Validation logic for all input types
- Proper error display
- Edit/Save/Cancel functionality
- Modal dialog behavior 