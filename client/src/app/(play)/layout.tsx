import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div className="min-h-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
        <main className="w-full">
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
