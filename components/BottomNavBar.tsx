"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "./MaterialIcon";
import { useLang } from "@/lib/i18n";

// 底部固定 3-Tab（80px / h-20）：/result 时 Style 仍高亮。1:1 还原原型。
interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  isActive: boolean;
  testId: string;
}

function NavItem({ to, icon, label, isActive, testId }: NavItemProps) {
  return (
    <Link
      href={to}
      data-testid={testId}
      data-active={isActive}
      className={`flex flex-col items-center justify-center px-4 py-1 transition-all w-24 ${
        isActive
          ? "bg-brand-mint text-brand-black retro-border hard-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          : "text-outline hover:text-brand-black"
      }`}
    >
      <MaterialIcon
        name={icon}
        filled={isActive}
        className={`text-[24px] ${isActive ? "fill-1" : ""}`}
      />
      <span
        className={`font-label-sm text-label-sm mt-1 uppercase ${
          isActive ? "font-bold" : ""
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function BottomNavBar() {
  const path = usePathname();
  const { t } = useLang();

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 h-20 bg-surface-container-low border-t-2 border-brand-black shrink-0"
    >
      <NavItem
        to="/closet"
        icon="checkroom"
        label={t("nav.closet")}
        isActive={path === "/closet"}
        testId="nav-closet"
      />
      <NavItem
        to="/style"
        icon="auto_fix_high"
        label={t("nav.style")}
        isActive={path === "/style" || path === "/result"}
        testId="nav-style"
      />
      <NavItem
        to="/looks"
        icon="style"
        label={t("nav.looks")}
        isActive={path === "/looks"}
        testId="nav-looks"
      />
    </nav>
  );
}
