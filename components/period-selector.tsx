"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  isMobile: boolean;
}

export function PeriodSelector({ value, onChange, isMobile }: PeriodSelectorProps) {
  const periods = [
    { value: "7d", label: "Last 7 days", short: "7D" },
    { value: "30d", label: "Last 30 days", short: "30D" },
    { value: "90d", label: "Last 3 months", short: "3M" },
    { value: "6m", label: "Last 6 months", short: "6M" },
    { value: "1y", label: "Last year", short: "1Y" },
  ];

  return (
    <div className="flex items-center gap-4">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      {isMobile ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <ToggleGroup type="single" value={value} onValueChange={onChange} variant="outline">
          {periods.map((period) => (
            <ToggleGroupItem key={period.value} value={period.value}>
              {period.short}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}