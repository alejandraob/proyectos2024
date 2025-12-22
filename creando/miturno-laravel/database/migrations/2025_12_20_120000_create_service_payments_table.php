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
        Schema::create('service_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('service_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('monto', 10, 2);
            $table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia', 'mercadopago', 'otro'])->default('efectivo');
            $table->enum('estado', ['pendiente', 'pagado', 'cancelado', 'reembolsado'])->default('pagado');
            $table->string('descripcion')->nullable();
            $table->string('referencia')->nullable(); // número de transacción o referencia
            $table->date('fecha_pago');
            $table->timestamps();

            $table->index(['business_id', 'fecha_pago']);
            $table->index(['business_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_payments');
    }
};
