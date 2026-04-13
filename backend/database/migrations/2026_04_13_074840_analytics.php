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
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained();
            $table->date('predicted_date');
            $table->float('predicted_demand');
            $table->float('confidence_lower');
            $table->float('confidence_upper');
            $table->string('model_used');
            $table->string('model_version');
            $table->timestamps();

            $table->index(['product_id', "predicted_date"]);
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
