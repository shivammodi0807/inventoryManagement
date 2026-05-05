<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('cascade');
            
            // 'demand' or 'lead_time'
            $table->enum('type', ['demand', 'lead_time']);
            
            // For demand: the future date. For lead_time: could be null or target month.
            $table->date('target_date')->nullable();
            
            // The predicted value
            $table->float('predicted_value');
            
            // Confidence intervals (mainly for demand/Prophet)
            $table->float('confidence_lower')->nullable();
            $table->float('confidence_upper')->nullable();
            
            $table->string('model_used');
            $table->string('model_version')->default('1.0');
            $table->timestamps();

            // Indexes for fast lookups
            $table->index(['product_id', 'target_date', 'type']);
            $table->index(['supplier_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
