<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use App\Models\Inventory\Product;

class Prediction extends Model
{
    protected $fillable = [
        'product_id',
        'predicted_date',
        'predicted_demand',
        'confidence_lower',
        'confidence_upper',
        'model_used',
        'model_version',
    ];

    protected $casts = [
        'predicted_date' => 'date',
        'predicted_demand' => 'float',
        'confidence_lower' => 'float',
        'confidence_upper' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
