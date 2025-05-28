import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Planning',
    template: '%s | Finna Reports'
  },
  description: 'Planning module for financial program reporting.',
  openGraph: {
    title: 'Planning | Finna Reports',
    description: 'View, edit, and manage planning data for health facilities.',
    type: 'website'
  }
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