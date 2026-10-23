<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MataKuliahController;
use App\Http\Controllers\Api\PengaturanController;
use App\Http\Controllers\Api\TugasController;
use App\Http\Controllers\Api\UmpanBalikController;
use Illuminate\Support\Facades\Route;

// Public Routes (Dapat diakses tanpa token)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');

// Lupa / Atur Ulang Password
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:reset-password');

// Protected Routes (Wajib membawa Bearer Token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/summary', [TugasController::class, 'summary']);
    Route::get('/dashboard/notifikasi', [TugasController::class, 'notifikasi']);
    Route::get('/dashboard/jadwal', [TugasController::class, 'jadwal']);
    Route::get('/dashboard/kalender', [TugasController::class, 'kalender']);

    // Tugas API
    Route::get('/tugas', [TugasController::class, 'index']);
    Route::post('/tugas', [TugasController::class, 'store']);
    Route::get('/tugas/{id}', [TugasController::class, 'show']);
    Route::put('/tugas/{id}', [TugasController::class, 'update']);
    Route::patch('/tugas/{id}/complete', [TugasController::class, 'complete']);
    Route::delete('/tugas/{id}', [TugasController::class, 'destroy']);

    // Mata Kuliah API
    Route::get('/mata-kuliah', [MataKuliahController::class, 'index']);
    Route::post('/mata-kuliah', [MataKuliahController::class, 'store']);
    Route::delete('/mata-kuliah/{id}', [MataKuliahController::class, 'destroy']);

    // Umpan Balik API
    Route::get('/umpan-balik', [UmpanBalikController::class, 'index']);
    Route::post('/umpan-balik', [UmpanBalikController::class, 'store']);
    Route::get('/admin/umpan-balik', [UmpanBalikController::class, 'adminIndex'])->middleware('admin');

    // Pengaturan API
    Route::prefix('pengaturan')->group(function () {
        Route::get('/profil', [PengaturanController::class, 'profil']);
        Route::put('/profil', [PengaturanController::class, 'updateProfil']);
        Route::post('/foto', [PengaturanController::class, 'updateFoto']);
        Route::put('/password', [PengaturanController::class, 'updatePassword']);
        Route::put('/settings', [PengaturanController::class, 'updateSettings']);
        Route::get('/export', [PengaturanController::class, 'exportData']);
        Route::delete('/reset', [PengaturanController::class, 'resetData']);
    });
});