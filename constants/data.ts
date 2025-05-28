import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Home',
    url: '/dashboard/home',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Planning',
    url: '/dashboard/planning',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Execution',
    url: '/dashboard/execution',
    icon: 'billing',
    shortcut: ['e', 'e'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: 'page',
    shortcut: ['r', 'r'],
    isActive: true,
    items: [
      {
        title: 'Revenue & Expenditure',
        url: '/dashboard/reports/revenue-expenditures',
        icon: 'post',
        shortcut: ['r', 'e']
      },
      {
        title: 'Balance Sheet',
        url: '/dashboard/reports/balance-sheet',
        icon: 'media',
        shortcut: ['a', 'l']
      },
      {
        title: 'Cash Flow',
        url: '/dashboard/reports/cash-flow',
        icon: 'dashboard',
        shortcut: ['c', 'f']
      },
      {
        title: 'Changes in Net Assets',
        url: '/dashboard/reports/changes-assets',
        icon: 'page',
        shortcut: ['n', 'a']
      },
      {
        title: 'Budget vs Actual',
        url: '/dashboard/reports/budget-actual',
        icon: 'kanban',
        shortcut: ['b', 'a']
      },
    ]
  },
//   {
//     title: 'Implementations',
//     url: '/implementations', // Placeholder as there is no direct link for the parent
//     icon: 'billing',
//     isActive: true,

//     items: [
//       {
//         title: 'Profile',
//         url: '/dashboard/profile',
//         icon: 'userPen',
//         shortcut: ['m', 'm']
//       },
//       {
//         title: 'Login',
//         shortcut: ['l', 'l'],
//         url: '/',
//         icon: 'login'
//       }
//     ]
//   },
//   {
//     title: 'Kanban',
//     url: '/dashboard/kanban',
//     icon: 'kanban',
//     shortcut: ['k', 'k'],
//     isActive: false,
//     items: [] // No child items
//   }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];