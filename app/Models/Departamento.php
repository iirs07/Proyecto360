<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'c_departamento';

    protected $fillable = [
        'd_nombre',
        'area_id'
    ];

    public $timestamps = false;
    protected $primaryKey = 'id_departamento';
    public $incrementing = true;
    protected $keyType = 'int';

    // Relación inversa: un departamento pertenece a un área
    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id', 'id');
    }
}
