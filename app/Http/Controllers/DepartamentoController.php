<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;

class DepartamentoController extends Controller
{
    public function index()
    {
        // Traer todas las áreas con sus departamentos
        $areas = Area::with('departamentos')->get();

        return response()->json($areas, 200, [], JSON_UNESCAPED_UNICODE);
    }
}
