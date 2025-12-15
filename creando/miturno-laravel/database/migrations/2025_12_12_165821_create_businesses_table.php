<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nombre_negocio');
            $table->string('rubro')->nullable(); // peluquería, uñas, etc.
            $table->string('direccion')->nullable();
            $table->string('slug')->unique(); // para URL pública: /mi-pelu
            $table->string('timezone')->default('America/Argentina/Buenos_Aires');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
