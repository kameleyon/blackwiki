"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUsers, FiFileText, FiSettings, FiActivity, FiFlag, FiLogOut, FiBarChart2 } from "react-icons/fi";
import { signOut } from "next-auth/react";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: FiActivity,
      active: pathname === "/admin",
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: FiBarChart2,
      active: pathname === "/admin/analytics",
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: FiUsers,
      active: pathname === "/admin/users",
    },
    {
      label: "Articles",
      href: "/admin/articles",
      icon: FiFileText,
      active: pathname === "/admin/articles",
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: FiFlag,
      active: pathname === "/admin/reports",
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: FiSettings,
      active: pathname === "/admin/settings",
    }
  ];

  return (
    <nav className="mb-8">
      <div className="flex items-center justify-end gap-4 overflow-x-auto pb-4 scrollbar-none">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${
                item.active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-white/60 hover:text-white/80 hover:bg-white/5"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="hidden md:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default AdminNav;
