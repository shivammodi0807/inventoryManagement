import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  className,
}: DataTablePaginationProps) {
  const getPaginationRange = () => {
    const delta = 1; // Number of pages to show around current page
    const range: (number | string)[] = [];
    
    // Always include first page
    range.push(1);

    if (currentPage > delta + 2) {
      range.push("ellipsis-start");
    }

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (currentPage < totalPages - (delta + 1)) {
      range.push("ellipsis-end");
    }

    // Always include last page if it's not the first page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPaginationRange();

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mt-8", className)}>
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Rows per page</p>
          <Select
            value={pageSize?.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-10 w-[70px] rounded-xl bg-secondary/20 border-border/40 font-bold text-[11px] focus:ring-primary/20">
              <SelectValue placeholder={pageSize?.toString()} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()} className="font-bold text-[11px]">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="w-auto mx-0">
          <PaginationContent className="bg-secondary/20 p-1.5 rounded-2xl border border-border/40 gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={cn(
                  "rounded-xl h-10 px-4 font-semibold text-[10px] uppercase tracking-widest transition-all",
                  currentPage <= 1 
                    ? "pointer-events-none opacity-40 grayscale" 
                    : "hover:bg-background hover:text-primary shadow-sm"
                )}
              />
            </PaginationItem>

            <div className="flex items-center gap-1 mx-1">
              {pages.map((page) => {
                if (typeof page === "string") {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis className="text-muted-foreground/40" />
                    </PaginationItem>
                  );
                }

                const isActive = page === currentPage;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(page);
                      }}
                      isActive={isActive}
                      className={cn(
                        "h-10 w-10 rounded-xl font-bold text-[11px] transition-all duration-300",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 border-none" 
                          : "hover:bg-background hover:text-primary text-muted-foreground border-transparent"
                      )}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            </div>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={cn(
                  "rounded-xl h-10 px-4 font-semibold text-[10px] uppercase tracking-widest transition-all",
                  currentPage >= totalPages 
                    ? "pointer-events-none opacity-40 grayscale" 
                    : "hover:bg-background hover:text-primary shadow-sm"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
