<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Usuario extends Authenticatable implements JWTSubject
{
    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario'; 
    public $timestamps = false;

    protected $fillable = [
        'id_usuario_login',
        'rol',
        'correo',
        'contrasena',
    ];

    protected $hidden = [
        'contrasena', // para que no se muestre al retornar JSON
    ];

    // Métodos requeridos por JWT
    public function getJWTIdentifier() {
        return $this->getKey();
    }

    public function getJWTCustomClaims() {
        return [];
    }
}
