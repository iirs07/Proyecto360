<?php
use Illuminate\Support\Facades\Route;

// Todas las rutas que no sean api van a React
Route::get('/{any}', function () {
    return view('app'); // aquí va tu app.blade.php que monta React
})->where('any', '^(?!api).*$');
