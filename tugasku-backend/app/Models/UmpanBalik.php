<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UmpanBalik extends Model
{
    use HasFactory;

    protected $table = 'umpan_balik';

    protected $fillable = [
        'user_id',
        'kategori',
        'rating',
        'judul',
        'pesan',
        'lampiran',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
