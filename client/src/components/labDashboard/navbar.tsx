"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

const AppNavbar: React.FC = () => {
  return (
    <nav className="p-4 flex items-center justify-between z-10">
      {/* LEFT */}
      <SidebarTrigger />

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* USER MENU */}
        <UserButton />
      </div>
    </nav>
  );
};

export default AppNavbar;
