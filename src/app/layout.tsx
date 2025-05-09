import type { Metadata } from "next";
// import { inter, sourceCodePro } from "@/lib/fonts";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetSync - Smart Appointment Scheduling",
  description: "Streamline your meeting scheduling with Google Meet integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
