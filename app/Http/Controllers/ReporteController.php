<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Mpdf\Mpdf;
use App\Models\Proyecto;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    /**
     * Genera el reporte PDF filtrando proyectos por departamento, periodo y estatus.
     */
    public function generarPDF(Request $request)
    {
        $nombreArchivo = 'reporte_superusuario.pdf';

        // 1️⃣ OBTENER FILTROS
        $departamentosString = $request->query('departamentos');
        $tipoProyecto = $request->query('tipoProyecto');
        $anio = $request->query('anio');
        $mes = $request->query('mes');
        $fechaInicio = $request->query('fechaInicio');
        $fechaFin = $request->query('fechaFin');

        if (empty($departamentosString)) {
            return response()->json(['message' => 'Falta seleccionar al menos un departamento.'], 400);
        }

        $depIds = explode(',', $departamentosString);

        // 2️⃣ CONSULTA BASE
        $query = Proyecto::query()->whereIn('id_departamento', $depIds);

        // Filtrar por estatus
        if ($tipoProyecto !== 'Ambos') {
            $estatusDB = ($tipoProyecto === 'Finalizados') ? 'Finalizado' : 'En proceso';
            $query->where('p_estatus', $estatusDB);
        }

        // Filtrar por fechas o año/mes
        if ($fechaInicio && $fechaFin) {
            $query->whereBetween('pf_inicio', [$fechaInicio, $fechaFin]);
        } elseif ($anio) {
            if ($mes) {
                $query->whereYear('pf_inicio', $anio)->whereMonth('pf_inicio', $mes);
            } else {
                $query->whereYear('pf_inicio', $anio);
            }
        }

        // 3️⃣ CARGAR RELACIONES
        $proyectos = $query->with(['departamento.area', 'encargado', 'tareas'])->get();

        // 4️⃣ CALCULAR RESPONSABLE, AVANCE Y AGRUPAR POR ÁREA Y ESTADO
        $proyectosAgrupados = [];

        foreach ($proyectos as $p) {
            // Obtener responsable
            if ($p->encargado) {
                $nombreResponsable = $p->encargado->u_nombre . ' ' . $p->encargado->a_paterno . ' ' . $p->encargado->a_materno;
            } else {
                $jefe = DB::table('usuario as u')
                    ->join('c_usuario as cu', 'u.id_usuario', '=', 'cu.id_usuario')
                    ->where('u.rol', 'Jefe')
                    ->where('cu.id_departamento', $p->id_departamento)
                    ->select('cu.u_nombre', 'cu.a_paterno', 'cu.a_materno')
                    ->first();

                $nombreResponsable = $jefe
                    ? $jefe->u_nombre . ' ' . $jefe->a_paterno . ' ' . $jefe->a_materno
                    : 'Sin Asignar';
            }

            $p->responsable = $nombreResponsable;

            // Calcular porcentaje de avance
            $total = $p->tareas->count();
            $completadas = $p->tareas->where('t_estatus', 'Completada')->count();
            $p->avance_porcentaje = $total > 0 ? round(($completadas / $total) * 100) : 0;

            // Nombre del área
            $areaNombre = $p->departamento->area->nombre ?? 'Sin Área';

            // Estado del proyecto
            $estado = $p->p_estatus;

            // Agrupar
            $proyectosAgrupados[$areaNombre][$estado][] = $p;
        }

        // Ordenar por fecha de inicio ascendente (más antiguo primero)
foreach ($proyectosAgrupados as $area => &$estados) {
    foreach ($estados as $estado => &$listaProyectos) {
        usort($listaProyectos, fn($a, $b) => strtotime($a->pf_inicio) - strtotime($b->pf_inicio));
    }
}


        // 5️⃣ FECHA Y HORA
        date_default_timezone_set('America/Mexico_City');
        $hoy = date('d/m/Y');
        $hora = date('H:i:s');

        // 6️⃣ CONFIGURACIÓN MPDF
        $mpdf = new Mpdf([
            'format' => 'Letter',
            'margin_top' => 20,
            'margin_bottom' => 50,
            'margin_left' => 20,
            'margin_right' => 20,
        ]);

        $mpdf->showImageErrors = true;
        $mpdf->SetWatermarkImage(public_path('imagenes/logo2.png'), 0.1, [150, 200], 'C');
        $mpdf->showWatermarkImage = true;

        // 7️⃣ CSS
        $cssPath = resource_path('views/pdf/pdf.css');
        if (file_exists($cssPath)) {
            $css = file_get_contents($cssPath);
            $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        }

        // 8️⃣ DATOS PARA LA VISTA
        $data = [
            'proyectosAgrupados' => $proyectosAgrupados,
            'filtros' => [
                'tipoProyecto' => $tipoProyecto,
                'fechaInicio' => $fechaInicio,
                'fechaFin' => $fechaFin,
                'anio' => $anio,
                'mes' => $mes,
            ],
            'hoy' => $hoy,
            'hora' => $hora,
        ];

        // Renderizar vista
        $html = view('pdf.reporte_superusuario', $data)->render();

        // 9️⃣ FOOTER
        $mpdf->SetHTMLFooter(
            '<div style="text-align:center; font-size:11px; color:#666;">
                Sistema de Gestión de Proyectos - H. Ayuntamiento de Minatitlán - Página {PAGENO} de {nbpg}
            </div>'
        );

        $mpdf->WriteHTML($html, \Mpdf\HTMLParserMode::HTML_BODY);

        // 10️⃣ RESPUESTA
        return response($mpdf->Output('', 'S'), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="'.$nombreArchivo.'"');
    }
}
