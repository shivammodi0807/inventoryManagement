<?php
 
 use Illuminate\Http\Request;
 use Illuminate\Support\Facades\Route;
 use Illuminate\Support\Facades\Auth;
 use Illuminate\Support\Facades\Broadcast;
 
 // Broadcasting auth – Sanctum session middleware is already applied globally
 // via statefulApi() in bootstrap/app.php, so no explicit middleware needed.
 Broadcast::routes(['middleware' => ['auth:sanctum']]);
 require __DIR__.'/channels.php';
 
 // Modular routes take precedence, load from app/Modules/
 $modulesPath = app_path('Modules');
 if (is_dir($modulesPath)) {
     foreach (scandir($modulesPath) as $module) {
         if ($module === '.' || $module === '..') continue;
         $apiRoutes = $modulesPath . '/' . $module . '/Routes/api.php';
         if (file_exists($apiRoutes)) {
             Route::group(['middleware' => 'api'], function () use ($apiRoutes) {
                 require $apiRoutes;
             });
         }
     }
 }
