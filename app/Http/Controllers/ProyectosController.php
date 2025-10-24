<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proyecto;

class ProyectosController extends Controller
{
public function obtenerPorDepartamento($depId)
{
    $proyectos = Proyecto::where('id_departamento', $depId)->get();
    if ($proyectos->isEmpty()) {
        return response()->json(['mensaje' => 'No se encontraron proyectos'], 404);
    }

    return response()->json($proyectos);
}

}

