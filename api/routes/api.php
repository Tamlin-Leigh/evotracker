<?php

use App\Http\Controllers\MeasurementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgressController;
use App\Http\Middleware\VerifyFirebaseToken;
use Illuminate\Support\Facades\Route;

Route::middleware(VerifyFirebaseToken::class)->group(function () {
    Route::post('/measurements', [MeasurementController::class, 'store']);
    Route::get('/measurements', [MeasurementController::class, 'index']);
    Route::get('/measurements/{part}', [MeasurementController::class, 'byPart']);
    Route::delete('/measurements/{id}', [MeasurementController::class, 'destroy']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/progress/estimate', [ProgressController::class, 'estimate']);
});
