<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;
use App\Models\Proyecto;

class TareaController extends Controller
{
    // Crear tarea
    public function store(Request $request)
    {
        try {
            $tarea = Tarea::create([
                'id_proyecto' => $request->id_proyecto,
                'id_usuario'  => $request->id_usuario,
                't_nombre'    => $request->t_nombre,
                'descripcion' => $request->descripcion,
                'tf_inicio'   => $request->tf_inicio,
                'tf_fin'      => $request->tf_fin,
                't_estatus'   => 'Pendiente',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tarea creada correctamente',
                'tarea'   => $tarea
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Obtener tareas por proyecto
    public function indexPorProyecto($id)
    {
        $proyecto = Proyecto::find($id);

        if (!$proyecto) {
            return response()->json(['error' => 'Proyecto no encontrado'], 404);
        }

        $tareas = $proyecto->tareas; // usa la relación definida

        return response()->json([
            'proyecto' => $proyecto,
            'tareas' => $tareas
        ]);
    }
}


