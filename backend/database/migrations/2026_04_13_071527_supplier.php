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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('payment_terms')->nullable(); //Payment conditions
            $table->decimal("rating", 2, 1)->nullable(); //suppier rating
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('name');
        });

        Schema::create('product_supplier', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('supplier_sku')->nullable();
            $table->decimal('cost_price', 12, 2);
            $table->unsignedInteger('est_delivery_days');
            $table->boolean('is_preferred')->default(false);
            $table->unsignedInteger('min_order_qty')->default(1);
            $table->timestamps();

            $table->unique(['product_id', "supplier_id"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_supplier');
        Schema::dropIfExists('suppliers');
    }
};
