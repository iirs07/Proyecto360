<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tareas', function (Blueprint $table) {
            // Cambiar el valor por defecto de t_estatus a 'Pendiente'
            $table->string('t_estatus', 50)->default('Pendiente')->change();
        });
    }

    public function down(): void
    {
        Schema::table('tareas', function (Blueprint $table) {
            // Volver al valor anterior si es necesario
            $table->string('t_estatus', 50)->default('EN PROCESO')->change();
        });
    }
};

