"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { isAxiosError } from "axios";

import { Product } from "@/types/inventory";
import { adjustStock } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { ApiError } from "@/types";

const schema = z.object({
  warehouse_id: z.coerce.number().min(1, "Please select a warehouse"),
  quantity: z.coerce.number().refine((n) => n !== 0, "Quantity cannot be zero"),
  type: z.string().min(1, "Adjustment type is required"),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface StockAdjustModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockAdjustModal({ product, isOpen, onClose }: StockAdjustModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      warehouse_id: 1, // Defaulting to 1 for now
      quantity: 0,
      type: "adjustment",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (values: Values) => adjustStock(product!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product?.id] });
      toast.success("Stock level updated");
      onClose();
    },
    onError: (err) => {
      if (isAxiosError<ApiError>(err)) {
        toast.error(err.response?.data?.message || "Adjustment failed");
      } else {
        toast.error("Unexpected error");
      }
    },
  });

  const onSubmit = (values: Values) => mutation.mutate(values);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Record a stock change for <strong>{product.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select 
                defaultValue="adjustment" 
                onValueChange={(v) => setValue("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Reason for change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                  <SelectItem value="receipt">Stock Receipt</SelectItem>
                  <SelectItem value="sale">Sale / Removal</SelectItem>
                  <SelectItem value="damage">Damage / Loss</SelectItem>
                  <SelectItem value="return">Customer Return</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.type]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="quantity">Quantity Change</FieldLabel>
              <Input 
                id="quantity" 
                type="number" 
                {...register("quantity")} 
                placeholder="e.g. +10 or -5"
              />
              <FieldError errors={[errors.quantity]} />
              <p className="text-[0.8rem] text-muted-foreground">
                Positive to add stock, negative to remove.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea 
                id="notes" 
                {...register("notes")} 
                placeholder="Why is this adjustment being made?"
              />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit as any)} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
