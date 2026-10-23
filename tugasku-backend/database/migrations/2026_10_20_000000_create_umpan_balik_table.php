<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('umpan_balik', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('kategori', ['saran', 'bug', 'pujian', 'lainnya'])->default('saran');
            $table->unsignedTinyInteger('rating')->default(5);
            $table->string('judul');
            $table->text('pesan');
            $table->string('lampiran')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('umpan_balik');
    }
};
