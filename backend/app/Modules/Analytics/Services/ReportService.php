<?php

namespace App\Modules\Analytics\Services;

use App\Models\Inventory\Product;
use App\Models\Sales\SalesOrder;
use App\Models\Supplier\Supplier;
use App\Modules\PurchaseOrder\Enums\PurchaseOrderStatus;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Get inventory valuation data broken down by category.
     */
    public function getInventoryValuationData(): array
    {
        $valuation = DB::table('products')
            ->leftJoin('stock_levels', 'products.id', '=', 'stock_levels.product_id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'categories.name as category_name',
                DB::raw('COALESCE(SUM(stock_levels.current_stock), 0) as total_stock'),
                DB::raw('COALESCE(SUM(products.cost_price * stock_levels.current_stock), 0) as total_cost_value'),
                DB::raw('COALESCE(SUM(products.unit_price * stock_levels.current_stock), 0) as total_retail_value')
            )
            ->whereNull('products.deleted_at')
            ->groupBy('categories.id', 'categories.name')
            ->get();

        $totals = [
            'stock' => $valuation->sum('total_stock'),
            'cost_value' => $valuation->sum('total_cost_value'),
            'retail_value' => $valuation->sum('total_retail_value'),
            'potential_profit' => $valuation->sum('total_retail_value') - $valuation->sum('total_cost_value'),
        ];

        return [
            'breakdown' => $valuation,
            'totals' => $totals,
            'generated_at' => now()->toDateTimeString()
        ];
    }

    /**
     * Get sales performance summary for a given period or custom range.
     */
    public function getSalesPerformanceData(?string $from = null, ?string $to = null, string $period = 'month'): array
    {
        if ($from && $to) {
            $startDate = Carbon::parse($from)->startOfDay();
            $endDate = Carbon::parse($to)->endOfDay();
            $period = 'custom';
        } else {
            $startDate = match($period) {
                'week' => now()->startOfWeek(),
                'year' => now()->startOfYear(),
                default => now()->startOfMonth(),
            };
            $endDate = now();
        }

        $sales = SalesOrder::where('status', '!=', 'cancelled')
            ->whereBetween('order_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(order_date) as date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(grand_total) as revenue'),
                DB::raw('SUM(total_amount - discount_amount) as net_sales')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = DB::table('sales_order_items')
            ->join('sales_orders', 'sales_order_items.sales_order_id', '=', 'sales_orders.id')
            ->join('products', 'sales_order_items.product_id', '=', 'products.id')
            ->where('sales_orders.status', '!=', 'cancelled')
            ->whereBetween('sales_orders.order_date', [$startDate, $endDate])
            ->select(
                'products.name',
                'products.sku',
                DB::raw('SUM(sales_order_items.quantity) as units_sold'),
                DB::raw('SUM(sales_order_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return [
            'period' => $period,
            'range' => ['from' => $startDate->toDateString(), 'to' => $endDate->toDateString()],
            'daily_sales' => $sales,
            'top_products' => $topProducts,
            'summary' => [
                'total_revenue' => $sales->sum('revenue'),
                'total_orders' => $sales->sum('order_count'),
                'avg_order_value' => $sales->sum('order_count') > 0 ? $sales->sum('revenue') / $sales->sum('order_count') : 0,
            ]
        ];
    }

    /**
     * Get low stock items with detailed supplier information.
     */
    public function getLowStockData(): array
    {
        return DB::table('products')
            ->leftJoin('stock_levels', 'products.id', '=', 'stock_levels.product_id')
            ->leftJoin('product_supplier', 'products.id', '=', 'product_supplier.product_id')
            ->leftJoin('suppliers', 'product_supplier.supplier_id', '=', 'suppliers.id')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.reorder_point',
                'products.reorder_quantity',
                DB::raw('COALESCE(SUM(stock_levels.current_stock), 0) as total_stock'),
                'suppliers.name as preferred_supplier',
                'suppliers.email as supplier_email'
            )
            ->where('products.is_active', true)
            ->whereNull('products.deleted_at')
            ->where('product_supplier.is_preferred', true)
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.reorder_point', 'products.reorder_quantity', 'suppliers.name', 'suppliers.email')
            ->havingRaw('total_stock <= products.reorder_point')
            ->orderBy('total_stock')
            ->get()
            ->toArray();
    }

    /**
     * Get inventory logs with optional date filtering.
     */
    public function getInventoryLogs(?string $from = null, ?string $to = null, int $limit = 500): array
    {
        $query = DB::table('inventory_logs')
            ->join('products', 'inventory_logs.product_id', '=', 'products.id')
            ->leftJoin('users', 'inventory_logs.user_id', '=', 'users.id');

        if ($from && $to) {
            $query->whereBetween('inventory_logs.created_at', [
                Carbon::parse($from)->startOfDay(),
                Carbon::parse($to)->endOfDay()
            ]);
        }

        return $query->select(
                'inventory_logs.id',
                'products.name as product_name',
                'users.full_name as user_name',
                'inventory_logs.type as change_type',
                'inventory_logs.quantity_change',
                'inventory_logs.quantity_after as new_stock',
                'inventory_logs.notes as reason',
                'inventory_logs.created_at'
            )
            ->orderByDesc('inventory_logs.created_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }


    /**
     * Get inventory forecast based on sales velocity.
     */
    public function getInventoryForecast(): array
    {
        $lookbackDays = 30;
        $startDate = now()->subDays($lookbackDays);

        // 1. Calculate Daily Sales Velocity per product
        $velocity = DB::table('sales_order_items')
            ->join('sales_orders', 'sales_order_items.sales_order_id', '=', 'sales_orders.id')
            ->where('sales_orders.status', '!=', 'cancelled')
            ->where('sales_orders.order_date', '>=', $startDate)
            ->select(
                'sales_order_items.product_id',
                DB::raw("SUM(sales_order_items.quantity) / {$lookbackDays} as daily_velocity"),
                DB::raw("SUM(sales_order_items.quantity) as total_sold")
            )
            ->groupBy('sales_order_items.product_id')
            ->get()
            ->keyBy('product_id');

        // 2. Get current stock levels
        $products = DB::table('products')
            ->leftJoin('stock_levels', 'products.id', '=', 'stock_levels.product_id')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                DB::raw('COALESCE(SUM(stock_levels.current_stock), 0) as total_stock')
            )
            ->whereNull('products.deleted_at')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->get();

        // 3. Map forecasting data
        $forecast = $products->map(function ($product) use ($velocity) {
            $productVelocity = $velocity->get($product->id);
            $dailyVelocity = $productVelocity ? (float)$productVelocity->daily_velocity : 0;
            
            // If stock is 0 and velocity is 0, it's not "healthy", it's just out. 
            // But we focus on when it *will* run out.
            $daysRemaining = $dailyVelocity > 0 ? (int)floor($product->total_stock / $dailyVelocity) : 999;
            
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'current_stock' => (int)$product->total_stock,
                'daily_velocity' => round($dailyVelocity, 2),
                'total_sold_30d' => $productVelocity ? (int)$productVelocity->total_sold : 0,
                'days_remaining' => $daysRemaining,
                'estimated_stock_out' => $daysRemaining < 999 ? now()->addDays($daysRemaining)->toDateString() : 'N/A',
                'status' => $this->getForecastStatus($daysRemaining, (int)$product->total_stock),
            ];
        })->sortBy('days_remaining')->values()->toArray();

        return $forecast;
    }

    /**
     * Determine forecast status based on days remaining.
     */
    private function getForecastStatus(int $days, int $stock): string
    {
        if ($stock <= 0) return 'out_of_stock';
        if ($days <= 7) return 'critical';
        if ($days <= 14) return 'warning';
        if ($days <= 30) return 'low';
        return 'healthy';
    }

    public function getSupplierPerformance(): array
    {
        $suppliers = Supplier::with(['purchaseOrders' => function($query) {
            $query->where('status', PurchaseOrderStatus::Received->value)
                  ->with('items');
        }])->get();

        $suppliersData = $suppliers->map(function ($supplier) {
            $receivedOrders = $supplier->purchaseOrders;
            $totalOrders = $receivedOrders->count();

            if ($totalOrders === 0) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                    'on_time_rate' => 100,
                    'fulfillment_rate' => 100,
                    'avg_lead_time' => 0,
                    'total_orders' => 0,
                    'total_spend' => 0,
                    'rating' => (float)$supplier->rating ?: 5.0,
                    'status' => 'excellent'
                ];
            }

            $onTimeOrders = $receivedOrders->filter(function ($order) {
                if (!$order->exp_delivery) return true;
                return $order->updated_at->lte($order->exp_delivery);
            })->count();

            $totalOrdered = 0;
            $totalReceived = 0;
            $totalLeadTime = 0;
            $totalSpend = 0;

            foreach ($receivedOrders as $order) {
                $totalOrdered += $order->items->sum('qty_ordered');
                $totalReceived += $order->items->sum('qty_received');
                $totalLeadTime += $order->created_at->diffInDays($order->updated_at);
                $totalSpend += (float)$order->total_amount;
            }

            $onTimeRate = ($onTimeOrders / $totalOrders) * 100;
            $fulfillmentRate = ($totalOrdered > 0) ? ($totalReceived / $totalOrdered) * 100 : 100;
            $avgLeadTime = $totalLeadTime / $totalOrders;

            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'on_time_rate' => round($onTimeRate, 1),
                'fulfillment_rate' => round($fulfillmentRate, 1),
                'avg_lead_time' => round($avgLeadTime, 1),
                'total_orders' => $totalOrders,
                'total_spend' => round($totalSpend, 2),
                'rating' => round(($onTimeRate + $fulfillmentRate) / 20, 1), // 0-10 scale
                'status' => $this->getSupplierPerformanceStatus($onTimeRate, $fulfillmentRate)
            ];
        });

        $topPerformers = $suppliersData->sortByDesc('rating')->take(5)->values();

        return [
            'suppliers' => $suppliersData->values()->toArray(),
            'top_performers' => $topPerformers->toArray(),
            'summary' => [
                'avg_reliability' => $suppliersData->avg('on_time_rate') ?? 0,
                'avg_lead_time' => $suppliersData->avg('avg_lead_time') ?? 0,
                'total_vendors' => $suppliersData->count(),
                'top_vendor' => $topPerformers->first()
            ]
        ];
    }

    private function getSupplierPerformanceStatus($onTime, $fulfillment): string
    {
        $avg = ($onTime + $fulfillment) / 2;
        if ($avg >= 90) return 'excellent';
        if ($avg >= 75) return 'good';
        if ($avg >= 50) return 'average';
        return 'poor';
    }
}
