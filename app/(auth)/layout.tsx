import type { Metadata } from "next";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <main>
          {children}
          <Toaster />
      </main>
  );
}
