"use client";
// Lab toolbar: just the sidebar toggle (the site header already has the user menu).

import { SidebarTrigger } from "@/components/ui/sidebar";

const AppNavbar: React.FC = () => (
  <nav className="z-10 flex items-center p-4">
    <SidebarTrigger />
  </nav>
);

export default AppNavbar;
