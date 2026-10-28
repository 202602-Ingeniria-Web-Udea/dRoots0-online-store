"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  home: "Dashboard",
  masters: "Masters",
  transactions: "Transactions",
  users: "Users",
};

function labelFor(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "home";
  return (
    SEGMENT_LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

export function AppBreadcrumbs() {
  const pathname = usePathname();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className='hidden md:block'>
          <BreadcrumbLink render={<Link href='/home' />}>dRoots0</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className='hidden md:block' />
        <BreadcrumbItem>
          <BreadcrumbPage>{labelFor(pathname)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
