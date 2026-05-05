<?php

namespace Database\Seeders;

use App\Models\Auth\User;
use App\Models\Inventory\Product;
use App\Models\Supplier\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class HistoricalDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting historical data generation (25 months)...');

        $products = Product::where('is_active', true)->get();
        if ($products->isEmpty()) {
            $this->command->error('No active products found. Please run DatabaseSeeder first.');
            return;
        }

        $suppliers = Supplier::where('is_active', true)->get();
        $admin = User::first(); // Assuming at least one user exists

        if (!$admin || $suppliers->isEmpty()) {
            $this->command->error('Missing users or suppliers.');
            return;
        }

        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subMonths(25)->startOfMonth();
        $totalDays = $startDate->diffInDays($endDate);

        $this->command->info("Generating data from {$startDate->toDateString()} to {$endDate->toDateString()} ({$totalDays} days).");

        $inventoryLogs = [];
        $purchaseOrders = [];
        $purchaseOrderItems = [];

        // For each product, generate daily sales
        $this->command->getOutput()->progressStart($products->count());

        foreach ($products as $product) {
            $baseDemand = rand(5, 20); // Average daily demand for this product
            
            // To simulate stock constraints, we don't strictly calculate current stock day by day,
            // we are just seeding historical logs so the ML model can learn demand patterns.
            
            for ($day = 0; $day <= $totalDays; $day++) {
                $currentDate = $startDate->copy()->addDays($day);
                
                // --- 1. Generate Demand (Sales) ---
                // Add seasonality
                $isWeekend = $currentDate->isWeekend();
                $month = $currentDate->month;
                
                // Weekly seasonality: 30% more on weekends
                $weekendMultiplier = $isWeekend ? 1.3 : 1.0;
                
                // Yearly seasonality: Q4 (Nov, Dec) is 50% higher
                $holidayMultiplier = in_array($month, [11, 12]) ? 1.5 : 1.0;
                
                // Trend: 1% growth MoM
                $monthsElapsed = $startDate->diffInMonths($currentDate);
                $trendMultiplier = 1 + ($monthsElapsed * 0.01);
                
                // Noise
                $noise = rand(-2, 3);
                
                $dailyDemand = max(0, (int) round($baseDemand * $weekendMultiplier * $holidayMultiplier * $trendMultiplier) + $noise);
                
                // Sometimes zero demand (e.g., 5% chance)
                if (rand(1, 100) <= 5) {
                    $dailyDemand = 0;
                }

                if ($dailyDemand > 0) {
                    $inventoryLogs[] = [
                        'product_id' => $product->id,
                        'type' => 'sale',
                        'quantity_change' => -$dailyDemand,
                        'quantity_before' => 1000, // Dummy for historical training
                        'quantity_after' => 1000 - $dailyDemand,
                        'notes' => 'Synthetic historical sale',
                        'user_id' => $admin->id,
                        'created_at' => $currentDate->toDateTimeString(),
                        'updated_at' => $currentDate->toDateTimeString(),
                    ];
                }

                // Chunk inserts to save memory
                if (count($inventoryLogs) >= 1000) {
                    DB::table('inventory_logs')->insert($inventoryLogs);
                    $inventoryLogs = [];
                }
            }
            
            $this->command->getOutput()->progressAdvance();
        }

        if (count($inventoryLogs) > 0) {
            DB::table('inventory_logs')->insert($inventoryLogs);
        }

        $this->command->getOutput()->progressFinish();
        $this->command->info('Inventory logs generated.');

        // --- 2. Generate Purchase Orders (Lead Time Data) ---
        $this->command->info('Generating purchase orders for lead time simulation...');
        
        // Let's create ~2 POs per month for 25 months
        $totalPOs = 25 * 2;
        $poCount = 0;

        for ($i = 0; $i < $totalPOs; $i++) {
            // Random date in the last 25 months
            $orderDate = $startDate->copy()->addDays(rand(0, $totalDays - 15)); // Minus 15 to ensure delivery happens before today
            $supplier = $suppliers->random();
            
            // Expected lead time: 5-7 days
            $expectedLeadTime = rand(5, 7);
            $expectedDelivery = $orderDate->copy()->addDays($expectedLeadTime);
            
            // Actual lead time variance
            // Supplier 1 is always late, Supplier 2 is on time
            $delay = 0;
            if ($supplier->id % 2 == 0) {
                // Late supplier
                $delay = rand(1, 4); // 1-4 days late
            } else {
                // On time or early
                $delay = rand(-1, 0); 
            }
            
            // Winter months (Nov, Dec, Jan) cause more delays
            if (in_array($orderDate->month, [11, 12, 1])) {
                $delay += rand(1, 3);
            }

            $actualDelivery = $expectedDelivery->copy()->addDays($delay);

            $poId = DB::table('purchase_orders')->insertGetId([
                'order_number' => 'PO-' . strtoupper(Str::random(8)),
                'supplier_id' => $supplier->id,
                'status' => 'received',
                'order_date' => $orderDate->toDateString(),
                'exp_delivery' => $expectedDelivery->toDateString(),
                'total_amount' => rand(1000, 5000) / 10,
                'description' => 'Synthetic historical PO',
                'user_id' => $admin->id,
                'created_at' => $orderDate->toDateTimeString(),
                'updated_at' => $actualDelivery->toDateTimeString(), // Crucial for actual lead time
            ]);

            // Add 1-3 items to this PO, ensuring it does not exceed total products available
            $itemsCount = min(rand(1, 3), $products->count());
            $poProducts = $products->random($itemsCount);
            
            foreach ($poProducts as $p) {
                $qty = rand(50, 200);
                $purchaseOrderItems[] = [
                    'purchase_order_id' => $poId,
                    'product_id' => $p->id,
                    'qty_ordered' => $qty,
                    'qty_received' => $qty,
                    'cost_price' => $p->cost_price,
                    'created_at' => $orderDate->toDateTimeString(),
                    'updated_at' => $actualDelivery->toDateTimeString(),
                ];
            }

            if (count($purchaseOrderItems) >= 100) {
                DB::table('purchase_order_items')->insert($purchaseOrderItems);
                $purchaseOrderItems = [];
            }
        }

        if (count($purchaseOrderItems) > 0) {
            DB::table('purchase_order_items')->insert($purchaseOrderItems);
        }

        $this->command->info('Purchase orders generated.');
        $this->command->info('Historical data generation complete!');
    }
}
