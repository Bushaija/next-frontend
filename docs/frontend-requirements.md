# HIV Planning Feature - Backend API Requirements

## Overview
This document outlines the backend API requirements for the HIV Planning feature, which allows health centers and hospitals to create and manage their activity plans. The backend should be implemented using FastAPI, SQLModel, Pydantic, and PostgreSQL.

## Data Models

### Plan Model
```python
class PlanBase(SQLModel):
    plan_id: Optional[str] = Field(default=None, primary_key=True)
    is_hospital: bool = Field(default=False)
    general_total_budget: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

class PlanMetadata(SQLModel):
    facility_name: str
    facility_type: str
    district: str
    province: str
    period: str
    program: str = "HIV Program"
    submitted_by: str
    status: Literal["draft", "pending", "approved", "rejected"] = "draft"
    submitted_at: Optional[datetime] = None

class Plan(PlanBase, table=True):
    metadata: PlanMetadata
    activities: List["Activity"] = Relationship(back_populates="plan")
```

### Activity Model
```python
class Activity(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    plan_id: str = Field(foreign_key="plan.plan_id")
    activity_category: str
    type_of_activity: str
    activity: Optional[str] = None
    frequency: int
    unit_cost: float
    count_q1: int = 0
    count_q2: int = 0
    count_q3: int = 0
    count_q4: int = 0
    amount_q1: float
    amount_q2: float
    amount_q3: float
    amount_q4: float
    total_budget: float
    comment: Optional[str] = None
    plan: Plan = Relationship(back_populates="activities")
```

## API Endpoints

### 1. Create Plan
```http
POST /api/plan
Content-Type: application/json

Request Body:
{
    "activities": [
        {
            "activityCategory": string,
            "typeOfActivity": string,
            "activity": string,
            "frequency": number,
            "unitCost": number,
            "countQ1": number,
            "countQ2": number,
            "countQ3": number,
            "countQ4": number,
            "amountQ1": number,
            "amountQ2": number,
            "amountQ3": number,
            "amountQ4": number,
            "totalBudget": number,
            "comment": string
        }
    ],
    "isHospital": boolean,
    "metadata": {
        "facilityName": string,
        "facilityType": string,
        "district": string,
        "province": string,
        "period": string,
        "program": string,
        "submittedBy": string,
        "status": "draft" | "pending" | "approved" | "rejected",
        "submittedAt": string (ISO datetime)
    }
}

Response: 201 Created
{
    "plan_id": string,
    "message": "Plan created successfully",
    "data": {
        // Created plan data
    }
}
```

### 2. Update Plan
```http
PUT /api/plan/{plan_id}
Content-Type: application/json

Request Body: Same as Create Plan

Response: 200 OK
{
    "plan_id": string,
    "message": "Plan updated successfully",
    "data": {
        // Updated plan data
    }
}
```

### 3. Get Plan
```http
GET /api/plan/{plan_id}

Response: 200 OK
{
    "plan_id": string,
    "is_hospital": boolean,
    "general_total_budget": number,
    "metadata": {
        // Plan metadata
    },
    "activities": [
        // List of activities
    ],
    "created_at": string (ISO datetime),
    "updated_at": string (ISO datetime)
}
```

### 4. List Plans
```http
GET /api/plans
Query Parameters:
- facility_type: string (optional)
- district: string (optional)
- province: string (optional)
- period: string (optional)
- status: string (optional)
- page: number (default: 1)
- limit: number (default: 10)

Response: 200 OK
{
    "total": number,
    "page": number,
    "limit": number,
    "data": [
        {
            "plan_id": string,
            "is_hospital": boolean,
            "general_total_budget": number,
            "metadata": {
                // Plan metadata
            },
            "created_at": string (ISO datetime),
            "updated_at": string (ISO datetime)
        }
    ]
}
```

### 5. Delete Plan
```http
DELETE /api/plan/{plan_id}

Response: 200 OK
{
    "message": "Plan deleted successfully"
}
```

### 6. Update Plan Status
```http
PATCH /api/plan/{plan_id}/status
Content-Type: application/json

Request Body:
{
    "status": "draft" | "pending" | "approved" | "rejected",
    "comment": string (optional)
}

Response: 200 OK
{
    "plan_id": string,
    "status": string,
    "message": "Plan status updated successfully"
}
```

## Validation Requirements

1. **Plan Validation**
   - General total budget must match sum of all activity total budgets
   - At least one activity must be present
   - All required metadata fields must be provided
   - Status transitions must be valid (e.g., can't go from approved to draft)

2. **Activity Validation**
   - Frequency must be at least 1
   - Unit cost must be at least 1
   - Count values cannot be negative
   - Amount values must be calculated correctly (frequency * unit_cost * count)
   - Total budget must match sum of quarterly amounts

## Error Handling

All endpoints should return appropriate HTTP status codes and error messages:

```json
{
    "error": {
        "code": string,
        "message": string,
        "details": object (optional)
    }
}
```

Common error codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., invalid status transition)
- 500: Internal Server Error

## Security Requirements

1. Authentication required for all endpoints
2. Role-based access control:
   - Health center users can only manage their own plans
   - Hospital users can only manage their own plans
   - Admin users can manage all plans
3. Input validation and sanitization
4. Rate limiting for API endpoints

## Database Indexes

Recommended indexes for optimal performance:
1. `plan.plan_id` (primary key)
2. `plan.facility_name`
3. `plan.district`
4. `plan.province`
5. `plan.period`
6. `plan.status`
7. `activity.plan_id` (foreign key)
8. `activity.activity_category`

## Additional Considerations

1. **Audit Logging**
   - Log all plan status changes
   - Log all plan modifications
   - Track who made changes and when

2. **Data Export**
   - Support exporting plans to Excel/CSV
   - Include all activities and totals
   - Format according to ministry requirements

3. **Notifications**
   - Notify relevant stakeholders when plan status changes
   - Send reminders for pending approvals
   - Alert on budget threshold violations

4. **Performance**
   - Implement pagination for large datasets
   - Cache frequently accessed data
   - Optimize database queries for common operations

5. **Monitoring**
   - Track API response times
   - Monitor error rates
   - Log database performance metrics

## Testing Requirements

1. Unit tests for all models and validations
2. Integration tests for all API endpoints
3. Performance tests for list operations
4. Security tests for authentication and authorization
5. Data validation tests for all input scenarios
