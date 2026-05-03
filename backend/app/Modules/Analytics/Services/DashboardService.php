<?php

namespace App\Modules\Analytics\Services;

use App\Models\Inventory\Product;
use App\Models\Inventory\InventoryLog;
use App\Models\Purchase\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    public function getDashboardStats(): array
    {
        return [
            'kpis' => [
                'total_skus' => $this->getTotalSkus(),
                'total_stock_value' => $this->getTotalStockValue(),
                'low_stock_count' => $this->getLowStockCount(),
                'open_po_count' => $this->getOpenPOCount(),
            ],
            'charts' => [
                'stock_movements' => $this->getStockMovements(),
                'category_value' => $this->getCategoryValue(),
            ],
            'widgets' => [
                'low_stock_items' => $this->getLowStockItems(),
            ]
        ];
    }

    private function getTotalSkus(): int
    {
        return Product::where('is_active', true)->count();
    }

    private function getTotalStockValue(): float
    {
        // Value = sum(product.cost_price * stock_levels.current_stock)
        return (float) DB::table('stock_levels')
            ->join('products', 'stock_levels.product_id', '=', 'products.id')
            ->selectRaw('SUM(products.cost_price * stock_levels.current_stock) as total_value')
            ->value('total_value') ?? 0;
    }

    private function getLowStockCount(): int
    {
        // Products where total_stock <= reorder_point
        return DB::table('products')
            ->leftJoin('stock_levels', 'products.id', '=', 'stock_levels.product_id')
            ->where('products.is_active', true)
            ->whereNull('products.deleted_at')
            ->select('products.id')
            ->groupBy('products.id', 'products.reorder_point')
            ->havingRaw('COALESCE(SUM(stock_levels.current_stock), 0) <= products.reorder_point')
            ->get()
            ->count();
    }

    private function getOpenPOCount(): int
    {
        return PurchaseOrder::whereIn('status', ['draft', 'submitted', 'confirmed'])->count();
    }

    private function getStockMovements(): array
    {
        $days = 7;
        $endDate = Carbon::now()->endOfDay();
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        $logs = DB::table('inventory_logs')
            ->selectRaw('DATE(created_at) as date, type, SUM(quantity_change) as total_change')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'type')
            ->get();

        $movements = [];
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::now()->subDays($days - 1 - $i)->format('Y-m-d');
            $movements[$date] = [
                'date' => Carbon::now()->subDays($days - 1 - $i)->format('M d'),
                'received' => 0,
                'issued' => 0,
            ];
        }

        foreach ($logs as $log) {
            $dateFormatted = Carbon::parse($log->date)->format('Y-m-d');
            if (isset($movements[$dateFormatted])) {
                if (in_array($log->type, ['receipt', 'return'])) {
                    $movements[$dateFormatted]['received'] += $log->total_change;
                } else if (in_array($log->type, ['sale', 'damage'])) {
                    $movements[$dateFormatted]['issued'] += abs($log->total_change); // Ensure issued is positive
                } else if ($log->type === 'adjustment') {
                    if ($log->total_change > 0) {
                        $movements[$dateFormatted]['received'] += $log->total_change;
                    } else {
                        $movements[$dateFormatted]['issued'] += abs($log->total_change);
                    }
                }
            }
        }

        return array_values($movements);
    }

    private function getCategoryValue(): array
    {
        $categories = DB::table('stock_levels')
            ->join('products', 'stock_levels.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('COALESCE(categories.name, "Uncategorized") as name, SUM(products.cost_price * stock_levels.current_stock) as value')
            ->groupBy('name')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        return $categories->map(function ($item) {
            return [
                'name' => $item->name,
                'value' => (float) $item->value
            ];
        })->toArray();
    }

    private function getLowStockItems(): array
    {
        $items = DB::table('products')
            ->leftJoin('stock_levels', 'products.id', '=', 'stock_levels.product_id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select('products.id', 'products.name', 'products.sku', 'products.reorder_point', 'categories.name as category_name')
            ->selectRaw('COALESCE(SUM(stock_levels.current_stock), 0) as total_stock')
            ->where('products.is_active', true)
            ->whereNull('products.deleted_at')
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.reorder_point', 'categories.name')
            ->havingRaw('total_stock <= products.reorder_point')
            ->orderBy('total_stock')
            ->limit(10)
            ->get();

        return $items->toArray();
    }
}
