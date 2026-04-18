<?php

use App\Modules\Auth\Providers\AuthServiceProvider;
use App\Modules\Inventory\Providers\InventoryProvider;
use App\Modules\PurchaseOrder\Providers\PurchaseOrderProvider;
use App\Modules\Supplier\Providers\SupplierProvider;
use App\Providers\AppServiceProvider;

return [
    AuthServiceProvider::class,
    InventoryProvider::class,
    SupplierProvider::class,
    PurchaseOrderProvider::class,
    AppServiceProvider::class,
];
