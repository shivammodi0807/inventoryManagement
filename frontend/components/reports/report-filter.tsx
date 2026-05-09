"use client";

import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportFilterProps {
  period: string;
  setPeriod: (value: string) => void;
  onDownload: () => void;
  isLoading?: boolean;
  dateRange?: { from: string; to: string };
  setDateRange?: (range: { from: string; to: string }) => void;
  className?: string;
}

export function ReportFilter({ 
  period, 
  setPeriod, 
  onDownload, 
  isLoading, 
  dateRange, 
  setDateRange,
  className 
}: ReportFilterProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 bg-muted/30 rounded-lg", className)}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Reporting Period:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {period === "custom" && dateRange && setDateRange && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md border border-input shadow-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input 
                type="date" 
                value={dateRange.from} 
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="text-sm bg-transparent outline-none border-none focus:ring-0"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <input 
                type="date" 
                value={dateRange.to} 
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="text-sm bg-transparent outline-none border-none focus:ring-0"
              />
            </div>
          </div>
        )}
      </div>
      <Button variant="outline" onClick={onDownload} disabled={isLoading}>
        <Download className="mr-2 h-4 w-4" />
        Export to PDF
      </Button>
    </div>
  );
}
