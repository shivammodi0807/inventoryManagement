import { ProductForm } from "@/components/inventory/product-form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
        <p className="text-muted-foreground">
          Add a new item to your inventory catalog.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Fill in the details below to create a new product SKU.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
