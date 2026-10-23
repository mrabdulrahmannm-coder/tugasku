<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    use HasFactory;

    protected $table = 'mata_kuliah';

    protected $fillable = [
        'user_id',
        'kode_matkul',
        'nama_matkul',
        'sks',
        'kategori',
        'dosen_pengampu',
        'ruangan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tugas()
    {
        return $this->hasMany(Tugas::class);
    }
}