<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    protected $table = 'proyectos';

    protected $primaryKey = 'id_proyecto'; // clave primaria real

    protected $fillable = [
        'id_departamento',
        'p_nombre',
        'descripcion',
        'pf_inicio',
        'pf_fin',
        'p_estatus'
    ];

    public $timestamps = false; // desactiva created_at y updated_at

    // Relación con tareas
    public function tareas()
    {
        return $this->hasMany(\App\Models\Tarea::class, 'id_proyecto', 'id_proyecto');
    }
    public function departamento()
    {
        // Se relaciona con la clave foránea 'id_departamento' en la tabla 'proyectos'
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }
    // Ejemplo de relación Encargado (Asumiendo que tu modelo de usuario se llama User)
public function encargado()
    {
        // Se relaciona con CUsuario usando la clave foránea 'id_encargado' 
        // en la tabla 'proyectos' y la clave local 'id_usuario' en 'c_usuario'.
        return $this->belongsTo(CUsuario::class, 'id_encargado', 'id_usuario');
    }
    
    // 🟢 AGREGAR ESTE ACCESOR para calcular el avance (si no tienes una columna fija)
    public function getAvancePorcentajeAttribute()
    {
        $totalTareas = $this->tareas()->count();
        
        if ($totalTareas === 0) {
            return 0;
        }
        
        // Asumiendo que las tareas completadas tienen estatus 'Completada'
        $tareasCompletadas = $this->tareas()->where('t_estatus', 'Completada')->count(); 
        
        return round(($tareasCompletadas / $totalTareas) * 100);
    }

}