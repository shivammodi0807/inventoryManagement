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
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained();
            $table->enum('type', ['receipt', "sale", "adjustment", "transfer", "return", "damage"]);
            $table->integer('quantity_change');
            $table->unsignedInteger('quantity_before');
            $table->unsignedInteger('quantity_after');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

            $table->index('product_id');
            $table->index('created_at');
            $table->index('type');
            $table->index(['product_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
