<?php

namespace App\Shared\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $action, string $resource): Response
    {
        if (!$request->user() || !$request->user()->hasPermission($action, $resource)) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
