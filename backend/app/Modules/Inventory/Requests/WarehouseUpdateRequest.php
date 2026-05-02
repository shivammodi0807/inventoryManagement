<?php

namespace App\Modules\Inventory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WarehouseUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ignore the current warehouse's own name when checking uniqueness
        $warehouseId = $this->route('warehouse');

        return [
            'name'      => ['sometimes', 'required', 'string', 'max:255', "unique:warehouses,name,{$warehouseId}"],
            'location'  => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A warehouse with this name already exists.',
        ];
    }
}
