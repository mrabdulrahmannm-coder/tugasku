<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->string('nama_tugas');
            $table->string('dosen')->nullable();
            $table->date('deadline_date');
            $table->time('deadline_time')->default('23:59:00');
            $table->enum('prioritas', ['Rendah', 'Sedang', 'Tinggi'])->default('Sedang');
            $table->enum('status', ['Terlambat', 'Hari Ini', 'Mendatang', 'Selesai'])->default('Mendatang');
            $table->string('link_elearning', 500)->nullable();
            $table->text('catatan')->nullable();
            $table->boolean('is_pengingat_active')->default(true);
            $table->integer('nilai')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};