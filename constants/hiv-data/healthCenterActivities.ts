import { ActivityCategoryType } from '../../features/planning/schema/hiv/schemas';

// Categories and their activities for Health Centers
export const HEALTH_CENTER_ACTIVITIES: ActivityCategoryType = {
  "Human Resources (HR)": [
    {
      activity: "Provide salaries for health facilities staff (DHs, HCs)",
      typeOfActivity: "HC Nurses (A1) Salary"
    },
    {
      activity: "Provide salaries for health facilities staff (DHs, HCs)",
      typeOfActivity: "HC Lab Technician (A1) Salary"
    },
    {
      activity: "Provide salaries for health facilities staff (DHs, HCs)",
      typeOfActivity: "Bonus (All staff paid on GF)"
    }
  ],
  "Travel Related Costs (TRC)": [
    {
      activity: "Conduct support group meeting at Health Facilities especially for adolescents and children",
      typeOfActivity: "Workshop"
    },
    {
      activity: "Conduct supervision from Health centers to CHWs",
      typeOfActivity: "Supervision"
    },
    {
      activity: "Conduct home visit for lost to follow up",
      typeOfActivity: "Supervision"
    },
    {
      activity: "Conduct sample transportation from Health centers to District Hospitals",
      typeOfActivity: "Transport"
    }
  ],
  "Health Products & Equipment (HPE)": [
    {
      activity: "Support to DHs and HCs to improve and maintain infrastructure standards",
      typeOfActivity: "Maintenance and Repair"
    }
  ],
  "Program Administration Costs (PA)": [
    {
      activity: "Provide running costs for DHs & HCs",
      typeOfActivity: "Communication"
    },
    {
      activity: "Provide running costs for DHs & HCs",
      typeOfActivity: "Office Supplies"
    },
    {
      activity: "Provide running costs for DHs & HCs",
      typeOfActivity: "Transport (Mission & Reporting Fee)"
    },
    {
      activity: "Provide running costs for DHs & HCs",
      typeOfActivity: "Bank charges"
    }
  ]
}; 