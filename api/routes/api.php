<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MeasurementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgressController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/measurements', [MeasurementController::class, 'store']);
    Route::get('/measurements', [MeasurementController::class, 'index']);
    Route::get('/measurements/{part}', [MeasurementController::class, 'byPart']);
    Route::delete('/measurements/{id}', [MeasurementController::class, 'destroy']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/progress/estimate', [ProgressController::class, 'estimate']);
});
