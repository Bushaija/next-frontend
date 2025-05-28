import { render, screen, fireEvent } from '@testing-library/react';
import BudgetActualRow from '../_components/BudgetActualRow';

// Mock data
const mockRowData = {
  id: 'row1',
  title: 'Marketing',
  originalBudget: 10000,
  revisedBudget: 12000,
  actualBudget: 11500,
  note: 'Some notes here'
};

describe('BudgetActualRow Component', () => {
  const mockOnValueChange = jest.fn();
  
  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders correctly in view mode', () => {
    render(
      <BudgetActualRow
        data={mockRowData}
        isEditing={false}
        onValueChange={mockOnValueChange}
        errors={null}
      />
    );

    // Title should be visible
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    
    // Values should be displayed but not editable
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText('$12,000.00')).toBeInTheDocument();
    expect(screen.getByText('$11,500.00')).toBeInTheDocument();
    
    // Calculated values should be displayed
    expect(screen.getByText('-$500.00')).toBeInTheDocument(); // Variance
    expect(screen.getByText('95.83%')).toBeInTheDocument(); // Performance
    
    // Note should be displayed
    expect(screen.getByText('Some notes here')).toBeInTheDocument();
    
    // No input fields should be present
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders correctly in edit mode', () => {
    render(
      <BudgetActualRow
        data={mockRowData}
        isEditing={true}
        onValueChange={mockOnValueChange}
        errors={null}
      />
    );

    // Title should be visible
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    
    // Input fields should be present
    const inputFields = screen.getAllByRole('textbox');
    expect(inputFields.length).toBe(4); // 3 budget fields + notes
    
    // Calculated values should still be displayed
    expect(screen.getByText('-$500.00')).toBeInTheDocument(); // Variance
    expect(screen.getByText('95.83%')).toBeInTheDocument(); // Performance
  });

  it('calls onValueChange when values are edited', () => {
    render(
      <BudgetActualRow
        data={mockRowData}
        isEditing={true}
        onValueChange={mockOnValueChange}
        errors={null}
      />
    );

    // Get input fields
    const inputFields = screen.getAllByRole('textbox');
    
    // Change revisedBudget value
    fireEvent.change(inputFields[1], { target: { value: '13000' } });
    
    // Check if onValueChange was called with the right params
    expect(mockOnValueChange).toHaveBeenCalledWith('row1', 'revisedBudget', '13000');
  });

  it('displays error messages when errors are provided', () => {
    const errors = {
      revisedBudget: 'Invalid budget value',
      actualBudget: null
    };
    
    render(
      <BudgetActualRow
        data={mockRowData}
        isEditing={true}
        onValueChange={mockOnValueChange}
        errors={errors}
      />
    );

    // Error message should be displayed
    expect(screen.getByText('Invalid budget value')).toBeInTheDocument();
  });

  it('calculates variance correctly', () => {
    // Test with positive variance
    const positiveData = {
      ...mockRowData,
      revisedBudget: 10000,
      actualBudget: 9000
    };
    
    const { rerender } = render(
      <BudgetActualRow
        data={positiveData}
        isEditing={false}
        onValueChange={mockOnValueChange}
        errors={null}
      />
    );
    
    // Positive variance (under budget) should show positive value
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    
    // Test with negative variance
    const negativeData = {
      ...mockRowData,
      revisedBudget: 10000,
      actualBudget: 11000
    };
    
    rerender(
      <BudgetActualRow
        data={negativeData}
        isEditing={false}
        onValueChange={mockOnValueChange}
        errors={null}
      />
    );
    
    // Negative variance (over budget) should show negative value
    expect(screen.getByText('-$1,000.00')).toBeInTheDocument();
  });

  it('calculates performance percentage correctly', () => {
    // Test with different budget values
    const testData = {
      ...mockRowData,
      revisedBudget: 20000,
      actualBudget: 15000
    };
    
    render(
      <BudgetActualRow
        data={testData}
        isEditing={false}
        onValueChange={mockOnValueChange}
        errors={null}
      />
    );
    
    // 15000/20000 = 75%
    expect(screen.getByText('75.00%')).toBeInTheDocument();
  });
}); 