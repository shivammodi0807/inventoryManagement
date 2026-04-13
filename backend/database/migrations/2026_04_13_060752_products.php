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
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('unit_price', 12, 2);
            $table->decimal('cost_price', 12, 2);
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->unsignedInteger("reorder_point");  //minimum stock units
            $table->unsignedInteger('reorder_quantity'); //stock quantity to reorder
            $table->unsignedInteger('lead_time_days')->default(7);
            $table->json('attributes')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('user_id')->constrained('users', "id");
            $table->timestamps();

            // index 
            $table->index('sku');
            $table->index('category_id');
            $table->index('name');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
