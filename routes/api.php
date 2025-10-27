<?php
use App\Http\Controllers\ReporteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\InvitacionController;
use App\Http\Controllers\RegistroPaso1Controller;
use App\Http\Controllers\RegistroPaso2Controller;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProyectoController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\TareasController;
use App\Http\Controllers\ProyectosController; // Tu controlador para proyectos por departamento
use App\Http\Controllers\ProgresoController;
Route::get('/reporte', [ReporteController::class, 'generarPDF']);

Route::get('/departamentos/{depId}/progresos', [ProgresoController::class, 'obtenerProgresosPorDepartamento']);

Route::get('/departamentos', [DepartamentoController::class, 'index']);


Route::get('/proyectos/{id}/progreso', [ProgresoController::class, 'obtenerProgreso']);


/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/


Route::get('/proyectos/{idProyecto}/tareas', [TareasController::class, 'obtenerPorProyecto']);


// Login
Route::post('/login', [AuthController::class, 'login']);

// Departamentos públicos
Route::get('/departamentos', [DepartamentoController::class, 'index']);

// Invitaciones
Route::post('/invitaciones/crear', [InvitacionController::class, 'crear']);

// Registro pasos
Route::post('/RegistroPaso1/invitado', [RegistroPaso1Controller::class, 'validarInvitacion']);
Route::post('/RegistroPaso2/invitado', [RegistroPaso2Controller::class, 'paso2']);

// Password reset
Route::post('/password-reset/send-token', [PasswordResetController::class, 'sendToken']); // Paso 1
Route::post('/password-reset', [PasswordResetController::class, 'reset']); // Paso 2

/*
|--------------------------------------------------------------------------
| Rutas Protegidas por JWT
|--------------------------------------------------------------------------
*/

Route::middleware(['jwt.auth'])->group(function () {

    // Usuario autenticado
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/usuario', [AuthController::class, 'usuario']);

    // Proyectos
    Route::get('/proyectos', [ProyectoController::class, 'index']); // Todos los proyectos
    Route::post('/proyectos', [ProyectoController::class, 'store']); // Crear proyecto
    Route::get('/proyectos/departamento/{depId}', [ProyectosController::class, 'obtenerPorDepartamento']); // Proyectos por departamento

    // Tareas
    Route::post('/tareas', [TareaController::class, 'store']);
    Route::get('/proyectos/{id}/tareas', [TareaController::class, 'indexPorProyecto']);
});

// Ruta fallback para login cuando no autenticado
Route::get('/login', function () {
    return response()->json(['error' => 'No autenticado'], 401);
})->name('login');
