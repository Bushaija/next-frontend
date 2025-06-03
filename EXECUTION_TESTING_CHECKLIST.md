# 🧪 Execution Module Testing Checklist

## Overview
This checklist covers essential tests to ensure the tabbed execution interface is working correctly.

---

## 🎯 **1. UI & Navigation Tests**

### ✅ Tab Switching
- [ ] **Tab Navigation Works**
  - Click "Planned Activities" tab → Content shows planned activities
  - Click "Executed Activities" tab → Content shows executed activities  
  - Active tab is visually highlighted
  - Tab content changes immediately without page refresh

- [ ] **Tab Icons Display**
  - "Planned Activities" tab shows PlayCircle icon
  - "Executed Activities" tab shows CheckCircle2 icon
  - Icons are properly aligned with text

- [ ] **Default Tab State**
  - Page loads with "Planned Activities" tab active by default
  - Planned activities data loads immediately

### ✅ Page Title & Header
- [ ] **Header Updates**
  - Page title shows "Execution Management"
  - Subtitle shows "Manage planned activities and track executed activities"

---

## 🔄 **2. Data Loading & API Tests**

### ✅ Planned Activities Tab
- [ ] **Initial Data Load**
  - Navigate to `/dashboard/execution`
  - Planned activities table loads with data
  - Loading skeleton shows while data is fetching
  - Data displays in table format with correct columns

- [ ] **API Endpoint Check**
  - Open browser dev tools → Network tab
  - Should see GET request to `/api/execution?page=1&limit=10`
  - Response should be successful (200 status)
  - Response contains `success: true` and `data` array

### ✅ Executed Activities Tab  
- [ ] **Tab-Based Data Loading**
  - Click "Executed Activities" tab
  - Should see GET request to `/api/execution/executed?page=1&limit=10`
  - Loading skeleton displays while fetching
  - Data populates in table with executed activities

- [ ] **API Response Validation**
  - Response contains executed activities with:
    - `executionId`, `planId`, `facilityName`
    - `plannedBudget`, `executedBudget`, `variancePercentage`
    - `status`, `activitiesCount`, `completedActivities`

---

## 🎛️ **3. Filtering & Search Tests**

### ✅ Planned Activities Filters
- [ ] **Filter Controls Present**
  - Program dropdown (HIV, TB, Malaria, Maternal Health)
  - Facility Type dropdown (Hospitals, Health Centers)
  - Period dropdown (FY 2027, FY 2026, FY 2025)
  - District dropdown (Kigali, Kayonza, Burera)
  - Search input field

- [ ] **Filter Functionality**
  - Select "HIV" program → table updates to show only HIV plans
  - Select "hospital" facility type → shows only hospital plans
  - Clear filters → all plans return
  - Search by facility name → results filter correctly

### ✅ Executed Activities Filters
- [ ] **Additional Status Filter**
  - Executed activities tab has all same filters as planned
  - Plus additional "Status" filter with options:
    - Completed, In Progress, Pending Review
  - Status filter works correctly

- [ ] **Independent Filter States**
  - Set filters on planned activities tab
  - Switch to executed activities tab
  - Executed tab has its own independent filter state
  - Switch back → planned tab filters are preserved

---

## 🔍 **4. Table Content & Display Tests**

### ✅ Planned Activities Table
- [ ] **Column Headers**
  - Plan Details | Facility | Program & Period | Budget | Status | Actions

- [ ] **Data Display**
  - Plan ID and submission date shown
  - Facility name with hospital/health center icons
  - Program badges and period information
  - Budget formatted as currency (RWF)
  - "Approved" status badges
  - "Select" button visible and enabled

### ✅ Executed Activities Table  
- [ ] **Column Headers**
  - Execution Details | Facility | Program & Period | Budget Performance | Progress | Status | Actions

- [ ] **Data Display**
  - Execution ID and plan reference
  - Facility info with appropriate icons
  - Budget comparison (planned vs executed)
  - Variance percentage with color coding:
    - Green: ≤5% variance
    - Amber: 5-10% variance  
    - Red: >10% variance
  - Progress as "X/Y activities" and percentage
  - Status badges (Completed, In Progress, Pending Review)

---

## ⚡ **5. Action Button Tests**

### ✅ Planned Activities Actions
- [ ] **Select Button Visibility**
  - "Select" button appears only in planned activities tab
  - Button is enabled for plans that `canExecute: true`
  - Button is disabled for plans with active executions

- [ ] **Select Button Functionality**
  - Click "Select" → navigates to `/dashboard/execution/new/[planId]`
  - Disabled buttons show appropriate tooltip/message

### ✅ Executed Activities Actions
- [ ] **Action Button Icons**
  - View button (Eye icon)
  - Edit button (Edit icon) 
  - Export button (Download icon)

- [ ] **Action Button States**
  - Edit button disabled for completed executions
  - View and Export buttons always enabled
  - Buttons arranged horizontally

---

## 🔄 **6. State Management Tests**

### ✅ Tab State Persistence
- [ ] **Tab Memory**
  - Switch to "Executed Activities" tab
  - Navigate away from page and return
  - Should remember last active tab (note: this may reset depending on implementation)

### ✅ Filter State Independence
- [ ] **Separate Filter States**
  - Set program filter to "HIV" on planned tab
  - Switch to executed tab → filters are at default
  - Set status filter to "Completed" on executed tab
  - Switch back to planned → HIV filter still applied

---

## 🐛 **7. Error Handling Tests**

### ✅ API Error Scenarios
- [ ] **Network Error Simulation**
  - Disconnect internet → error message displays
  - Error message is user-friendly
  - Retry mechanism available

- [ ] **Empty Data States**
  - When no planned activities → shows "No approved plans found"
  - When no executed activities → shows "No executed activities found"
  - Empty state has appropriate icon and message

---

## 📱 **8. Responsive Design Tests**

### ✅ Mobile/Tablet View
- [ ] **Tab Layout**
  - Tabs stack properly on smaller screens
  - Tab content remains readable
  - Tables scroll horizontally if needed

- [ ] **Filter Layout** 
  - Filter dropdowns stack vertically on mobile
  - Search input remains full-width
  - Buttons stack properly

---

## 🚀 **9. Performance Tests**

### ✅ Loading Performance
- [ ] **Initial Load Time**
  - Page loads within 2-3 seconds
  - Skeleton shows during loading
  - No layout shift when data loads

- [ ] **Tab Switching Speed**
  - Switching between tabs is instant
  - No visible delay in content updates
  - Smooth transitions

---

## 📊 **10. Data Validation Tests**

### ✅ Data Accuracy
- [ ] **Currency Formatting**
  - Amounts display with proper RWF formatting
  - Large numbers have proper separators
  - Decimal places consistent

- [ ] **Date Formatting**
  - Dates show in readable format (Month Day, Year)
  - Consistent date formatting across tables

- [ ] **Percentage Calculations**
  - Variance percentages calculated correctly
  - Progress percentages match activity completion
  - Color coding applied correctly

---

## 🎯 **Quick Test Commands**

### Browser Console Tests
```javascript
// Test tab state
console.log('Active tab:', document.querySelector('[data-state="active"]')?.textContent);

// Test API calls
fetch('/api/execution?page=1&limit=5')
  .then(r => r.json())
  .then(d => console.log('Planned:', d));

fetch('/api/execution/executed?page=1&limit=5')
  .then(r => r.json()) 
  .then(d => console.log('Executed:', d));

// Test filter functionality
const programFilter = document.querySelector('select[placeholder*="program"]');
if (programFilter) programFilter.value = 'HIV';
```

### Manual URL Tests
- `/dashboard/execution` → Should load with planned tab active
- `/dashboard/execution#executed` → Could be used to deep-link to executed tab (if implemented)

---

## ✅ **Test Results Tracking**

| Test Category | Status | Notes |
|---------------|--------|-------|
| Tab Navigation | ⏳ | |
| Data Loading | ⏳ | |
| Filtering | ⏳ | |
| Table Display | ⏳ | |
| Action Buttons | ⏳ | |
| Error Handling | ⏳ | |
| Responsive Design | ⏳ | |

**Legend:** ✅ Pass | ❌ Fail | ⏳ Pending | ⚠️ Issues Found

---

## 🔧 **If Issues Are Found**

### Common Troubleshooting Steps:
1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API requests  
3. **Verify imports** - ensure Tabs component is properly imported
4. **Check state management** - verify tab state updates correctly
5. **Validate API responses** - ensure data structure matches interface

### Quick Fixes:
- **Tabs not switching**: Check if `activeTab` state is updating
- **Data not loading**: Verify API endpoints are accessible
- **Filters not working**: Check if filter state is updating in `useQuery` dependency array
- **Buttons not working**: Verify click handlers are properly bound

This checklist ensures comprehensive testing of the execution module's tabbed interface functionality! 