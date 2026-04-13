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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('order_number')->unique();
            $table->foreignId('supplier_id')->constrained();
            $table->enum('status', ['draft', 'submitted', 'confirmed', 'partially_received', 'received', 'cancelled'])->default('draft');
            $table->date('order_date');
            $table->date('exp_delivery')->nullable();
            $table->decimal('total_amount', 14, 2);
            $table->text('description')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

            $table->index('supplier_id');
            $table->index('status');
            $table->index('order_date');
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->unsignedInteger("qty_ordered");
            $table->unsignedInteger('qty_received')->default(0);
            $table->decimal('cost_price', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists("purchase_orders");
    }
};
