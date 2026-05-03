<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.Auth.User.{id}', function ($user, $id) {
    \Illuminate\Support\Facades\Log::info('Channel Auth Check', ['user_id' => $user->id, 'requested_id' => $id]);
    return true; 
});
