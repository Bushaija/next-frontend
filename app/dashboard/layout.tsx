import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { AuthLayout } from '@/components/layout/auth-layout';


// export const metadata: Metadata = {
//   title: 'HIV-NSP-BUDGET-TRACKER',
//   description: 'HIV-NSP-BUDGET-TRACKER'
// };

// export default async function DashboardLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   // Persisting the sidebar state in the cookie.
//   const cookieStore = await cookies();
//   const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
//   return (
//     <KBar>
//       <SidebarProvider defaultOpen={defaultOpen}>
//         <AppSidebar />
//         <SidebarInset>
//           <Header />
//           {/* page main content */}
//           {children}
//           {/* page main content ends */}
//         </SidebarInset>
//       </SidebarProvider>
//     </KBar>
//   );
// }

interface DashboardClientLayoutProps {
  children: ReactNode;
  defaultOpen: boolean | undefined;
}

function DashboardClientLayout({
  children,
  defaultOpen,
}: DashboardClientLayoutProps) {
  return (
    <AuthLayout allowedRoles={["admin", "manager"]}> {/* adjust roles as needed */}
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthLayout>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';


  return (
    <DashboardClientLayout defaultOpen={defaultOpen}>
      {children}
    </DashboardClientLayout>
  );
}