"use client";

import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MasterOption } from "@/lib/inventory/queries";

export function MasterSelect({
  masters,
  selectedId,
}: {
  masters: MasterOption[];
  selectedId?: string;
}) {
  const router = useRouter();
  const items = masters.map((master) => ({ label: master.name, value: master.id }));

  return (
    <div className="flex flex-col gap-2 sm:max-w-sm">
      <Label htmlFor="master-select">Inventory master</Label>
      <Select
        items={items}
        value={selectedId ?? null}
        onValueChange={(value) => {
          router.push(
            value ? `/transactions?master=${encodeURIComponent(value)}` : "/transactions",
          );
        }}
      >
        <SelectTrigger id="master-select" className="w-full">
          <SelectValue placeholder="Select a master…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}