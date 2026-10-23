<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    use HasFactory;

    protected $table = 'tugas';

    protected $fillable = [
        'user_id',
        'semester',
        'mata_kuliah_id',
        'nama_tugas',
        'dosen',
        'deadline_date',
        'deadline_time',
        'prioritas',
        'status',
        'link_elearning',
        'catatan',
        'is_pengingat_active',
        'nilai',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }
}