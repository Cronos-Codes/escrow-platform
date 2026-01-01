import {
  IconLayoutDashboard,
  IconUsers,
  IconShield,
  IconGavel,
  IconCreditCard,
  IconAlertTriangle,
  IconFileText,
  IconSettings,
  IconChartBar,
  IconBuildingBank,
  IconUser,
  IconWallet,
  IconReceipt,
  IconHelp,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "ADMIN DASHBOARD",
  },

  {
    id: uniqueId(),
    title: "Admin Overview",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "USER MANAGEMENT",
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: IconUsers,
    href: "/users",
  },
  {
    navlabel: true,
    subheader: "ESCROW OPERATIONS",
  },
  {
    id: uniqueId(),
    title: "Escrows",
    icon: IconShield,
    href: "/escrows",
  },
  {
    id: uniqueId(),
    title: "Disputes",
    icon: IconGavel,
    href: "/disputes",
  },
  {
    navlabel: true,
    subheader: "FINANCIAL",
  },
  {
    id: uniqueId(),
    title: "Paymaster",
    icon: IconCreditCard,
    href: "/paymaster",
  },
  {
    id: uniqueId(),
    title: "Risk Center",
    icon: IconAlertTriangle,
    href: "/risk-center",
  },
  {
    navlabel: true,
    subheader: "SYSTEM",
  },
  {
    id: uniqueId(),
    title: "Audit Logs",
    icon: IconFileText,
    href: "/audit-logs",
  },
  {
    id: uniqueId(),
    title: "Analytics",
    icon: IconChartBar,
    href: "/analytics",
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: IconSettings,
    href: "/settings",
  },
];

export default Menuitems;


