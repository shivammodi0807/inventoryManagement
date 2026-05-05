<?php

namespace App\Modules\Analytics\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\Inventory\Product;
use App\Models\Supplier\Supplier;
use Illuminate\Support\Collection;

class PredictionService
{
    protected string $mlUrl;

    public function __construct()
    {
        $this->mlUrl = rtrim(config('services.ml.url', 'http://localhost:8001'), '/');
    }

    /**
     * Get predictions from the database for a given product.
     */
    public function getDemandPredictions(int $productId, int $days = 30): Collection
    {
        return DB::table('predictions')
            ->where('product_id', $productId)
            ->where('type', 'demand')
            ->where('target_date', '>=', now()->toDateString())
            ->where('target_date', '<=', now()->addDays($days)->toDateString())
            ->orderBy('target_date')
            ->get();
    }

    /**
     * Call ML service to train a model for a specific product.
     */
    public function trainDemandModel(int $productId, int $horizonDays = 30): bool
    {
        $response = Http::timeout(120)->post("{$this->mlUrl}/train/demand", [
            'product_id' => $productId,
            'horizon_days' => $horizonDays
        ]);

        return $response->successful();
    }

    /**
     * Call ML service to train lead time model for a specific supplier.
     */
    public function trainLeadTimeModel(int $supplierId): bool
    {
        $response = Http::timeout(120)->post("{$this->mlUrl}/train/lead-time", [
            'supplier_id' => $supplierId
        ]);

        return $response->successful();
    }

    /**
     * Fetch predictions from ML service and store in database.
     */
    public function syncPredictions(int $productId): void
    {
        $response = Http::timeout(30)->post("{$this->mlUrl}/predict", [
            'product_id' => $productId,
            'horizon_days' => 30
        ]);

        if ($response->successful()) {
            $data = $response->json();
            
            if (isset($data['predictions'])) {
                // Clear old future predictions
                DB::table('predictions')
                    ->where('product_id', $productId)
                    ->where('type', 'demand')
                    ->where('target_date', '>=', now()->toDateString())
                    ->delete();

                $inserts = [];
                foreach ($data['predictions'] as $pred) {
                    $inserts[] = [
                        'product_id' => $productId,
                        'type' => 'demand',
                        'target_date' => $pred['date'],
                        'predicted_value' => $pred['demand'],
                        'confidence_lower' => $pred['lower'],
                        'confidence_upper' => $pred['upper'],
                        'model_used' => 'prophet',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                DB::table('predictions')->insert($inserts);
            }
        }
    }

    /**
     * Calculate Safety Stock based on AI predictions.
     * Service Level = 95% (Z-score = 1.65)
     */
    public function calculateSafetyStock(int $productId, float $stdDevLeadTime, float $avgDailyDemand): float
    {
        // Safety Stock = Z * stdDev(LT) * SQRT(AvgDemand)
        $zScore = 1.65; // 95%
        
        $safetyStock = $zScore * $stdDevLeadTime * sqrt($avgDailyDemand);
        
        return round($safetyStock);
    }
}
