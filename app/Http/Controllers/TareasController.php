<?php
namespace App\Http\Controllers;

use App\Models\Tarea;
use App\Models\CUsuario;
use App\Models\Evidencia; // Importamos Evidencia
use Illuminate\Http\Request;

class TareasController extends Controller
{
    // Obtener todas las tareas de un proyecto
    public function obtenerPorProyecto($idProyecto)
    {
        $tareas = Tarea::where('id_proyecto', $idProyecto)->get();

        $tareasConResponsableYEvidencias = $tareas->map(function ($tarea) {
            $usuario = CUsuario::find($tarea->id_usuario);

            $responsable = $usuario
                ? $usuario->u_nombre . ' ' . $usuario->a_paterno . ' ' . $usuario->a_materno
                : 'No definido';

            // Obtener todas las evidencias asociadas a la tarea
            $evidencias = Evidencia::where('id_tarea', $tarea->id_tarea)->get()->map(function($e){
                return [
                    'id' => $e->id_evidencia,
                    'url' => $e->archivo_url, // Aquí usamos el accessor que ya creaste
                    'fecha' => $e->fecha
                ];
            });

            return [
                'id_tarea'    => $tarea->id_tarea,
                'id_proyecto' => $tarea->id_proyecto,
                'id_usuario'  => $tarea->id_usuario,
                't_nombre'    => $tarea->t_nombre,
                'descripcion' => $tarea->descripcion,
                'tf_inicio'   => $tarea->tf_inicio,
                'tf_fin'      => $tarea->tf_fin,
                't_estatus'   => $tarea->t_estatus,
                'responsable' => $responsable,
                'evidencias'  => $evidencias, // <-- Aquí devolvemos las fotos o archivos
            ];
        });

        return response()->json($tareasConResponsableYEvidencias);
    }
}
