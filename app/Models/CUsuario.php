<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CUsuario extends Model
{
    protected $table = 'c_usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false; // Evitar created_at y updated_at

    protected $fillable = [
        'id_departamento',
        'u_nombre',
        'a_paterno',
        'a_materno',
        'telefono',
    ];
}

