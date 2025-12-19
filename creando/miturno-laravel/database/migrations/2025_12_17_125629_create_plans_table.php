<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 3)->default('ARS');
            $table->integer('appointments_limit')->nullable();
            $table->integer('professionals_limit')->default(1);
            $table->boolean('email_reminders')->default(false);
            $table->boolean('whatsapp_enabled')->default(false);
            $table->boolean('public_page')->default(true);
            $table->boolean('priority_support')->default(false);
            $table->boolean('advanced_reports')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
