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
        Schema::create('stock_levels', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('total_stock');
            $table->unsignedInteger('stock_reserved');
            $table->unsignedInteger('current_stock');
            $table->timestamp('stock_verified_on');
            $table->timestamps();

            $table->unique(["product_id", 'warehouse_id']);
            $table->index('product_id');
            $table->index('warehouse_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_levels');
    }
};
