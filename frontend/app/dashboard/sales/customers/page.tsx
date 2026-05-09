"use client";

import * as React from "react";
import { Search, Users, UserCheck, ShieldAlert, TrendingUp, SlidersHorizontal, UserPlus } from "lucide-react";

import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerTable } from "@/components/sales/customer-table";
import { CustomerModal } from "@/components/sales/customer-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function CustomersPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const { data: customers, isLoading, isError, refetch } = useCustomers({
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteCustomer();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setDeleteId(customer.id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const activeCount = customers?.data?.filter(c => c.is_active).length ?? 0;
  const inactiveCount = (customers?.total ?? 0) - activeCount;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Client Intelligence</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Customers</h1>
          <p className="text-base text-muted-foreground font-medium">
            Manage your client accounts, contact protocols, and relationship health.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 rounded-xl h-12 gap-2"
        >
          <UserPlus className="h-5 w-5" /> New Client Profile
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Total Directory</p>
            <h3 className="text-3xl font-semibold tabular-nums">{customers?.total ?? 0}</h3>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full w-fit">
              <TrendingUp className="h-3 w-3" />
              <span>Retention Positive</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Active Operatives</p>
            <h3 className="text-3xl font-semibold tabular-nums text-blue-600">{activeCount}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold italic">Authenticated Access</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform border border-blue-500/10">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-default">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Restricted Profiles</p>
            <h3 className="text-3xl font-semibold tabular-nums text-amber-600">{inactiveCount}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">Limited Interaction</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform border border-amber-500/10">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by client name, email protocol, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-background border-none shadow-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium placeholder:text-muted-foreground/40"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-none bg-background font-semibold text-[10px] uppercase tracking-[0.2em] gap-2 hover:bg-secondary/40 transition-all shrink-0">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Table Section */}
      <div className="relative">
        {isLoading ? (
          <div className="space-y-4">
            <DataTableSkeleton columnCount={5} rowCount={10} />
          </div>
        ) : !customers?.data?.length ? (
          <EmptyState
            title="Registry Empty"
            description="No client profiles match the specified filter criteria in the system directory."
            icon={<Users className="h-12 w-12 text-muted-foreground/30" />}
            action={{ label: "Register New Client", onClick: handleAdd }}
            className="min-h-[400px]"
          />
        ) : (
          <CustomerTable
            data={customers.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CustomerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={selectedCustomer}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Termination Request"
        description="Are you sure you want to terminate this client profile? This action is logged and restricts all future transactions with this entity."
        confirmText="Confirm Termination"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
