import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Execution',
  description: 'Execution'
};

export default async function PlanningLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
        {children}
    </div>
  );
}