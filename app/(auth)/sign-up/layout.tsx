// import { Ubuntu } from "@next/font/google";

// import "../styles/globals.css";

// const ubuntu = Ubuntu({
//   variable: "--font-ubuntu",
//   weight: ["400", "500", "700"],
//   subsets: ["latin"],
//   display: "swap",
// });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex justify-center items-center h-screen w-full bg-zinc-50">
        {children}
      </div>
  );
}