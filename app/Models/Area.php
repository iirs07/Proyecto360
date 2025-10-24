<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $table = 'c_areas';

    protected $fillable = [
        'nombre'
    ];

    public $timestamps = false; // No tienes created_at ni updated_at
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    // Relación: un área tiene muchos departamentos
    public function departamentos()
    {
        return $this->hasMany(Departamento::class, 'area_id', 'id');
    }
}
