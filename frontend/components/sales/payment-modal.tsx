"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRecordPayment } from "@/hooks/use-sales-orders";
import { Invoice } from "@/types/sales";

const paymentSchema = z.object({
  payment_method: z.string().min(1, "Payment method is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  payment_date: z.string().min(1, "Date is required"),
  transaction_id: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  invoice: Invoice | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentModal({ invoice, open, onOpenChange }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {open && invoice && (
          <PaymentForm 
            invoice={invoice} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PaymentFormProps {
  invoice: Invoice;
  onClose: () => void;
}

function PaymentForm({ invoice, onClose }: PaymentFormProps) {
  const recordMutation = useRecordPayment();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: "bank_transfer",
      amount: invoice.balance_due,
      payment_date: new Date().toISOString().split("T")[0],
      transaction_id: "",
      notes: "",
    },
  });

  const paymentMethod = useWatch({ control, name: "payment_method" });

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await recordMutation.mutateAsync({ invoiceId: invoice.id, data: values });
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle>Record Payment for {invoice.invoice_number}</DialogTitle>
      </DialogHeader>
      <FieldGroup>
        <Field data-invalid={!!errors.amount}>
          <FieldLabel htmlFor="amount">Payment Amount</FieldLabel>
          <Input id="amount" type="number" step="0.01" {...register("amount")} />
          <FieldError errors={[errors.amount]} />
        </Field>

        <Field data-invalid={!!errors.payment_method}>
          <FieldLabel htmlFor="payment_method">Payment Method</FieldLabel>
          <Select 
            onValueChange={(value) => setValue("payment_method", value)} 
            value={paymentMethod}
          >
            <SelectTrigger id="payment_method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.payment_method]} />
        </Field>

        <Field data-invalid={!!errors.payment_date}>
          <FieldLabel htmlFor="payment_date">Payment Date</FieldLabel>
          <Input id="payment_date" type="date" {...register("payment_date")} />
          <FieldError errors={[errors.payment_date]} />
        </Field>

        <Field data-invalid={!!errors.transaction_id}>
          <FieldLabel htmlFor="transaction_id">Transaction ID / Reference</FieldLabel>
          <Input id="transaction_id" placeholder="Optional" {...register("transaction_id")} />
          <FieldError errors={[errors.transaction_id]} />
        </Field>

        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" placeholder="Any internal notes" {...register("notes")} />
          <FieldError errors={[errors.notes]} />
        </Field>
      </FieldGroup>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={recordMutation.isPending}>
          {recordMutation.isPending ? "Recording..." : "Record Payment"}
        </Button>
      </DialogFooter>
    </form>
  );
}
