<?php

namespace App\Modules\Analytics\Jobs;

use App\Models\Inventory\Product;
use App\Models\Supplier\Supplier;
use App\Modules\Analytics\Services\PredictionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TrainPredictiveModels implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(PredictionService $predictionService): void
    {
        Log::info('Starting predictive models training job.');

        // Train demand models for all active products
        $products = Product::where('is_active', true)->get();
        foreach ($products as $product) {
            try {
                // Trigger training
                $predictionService->trainDemandModel($product->id);
                // Sync new predictions to our DB
                $predictionService->syncPredictions($product->id);
            } catch (\Exception $e) {
                Log::error("Failed to train/sync demand model for product {$product->id}: " . $e->getMessage());
            }
        }

        // Train lead time models for all active suppliers
        $suppliers = Supplier::where('is_active', true)->get();
        foreach ($suppliers as $supplier) {
            try {
                $predictionService->trainLeadTimeModel($supplier->id);
            } catch (\Exception $e) {
                Log::error("Failed to train lead time model for supplier {$supplier->id}: " . $e->getMessage());
            }
        }

        Log::info('Finished predictive models training job.');
    }
}
