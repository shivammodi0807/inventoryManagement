<?php

use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    \App\Modules\Auth\Providers\AuthServiceProvider::class,
];
