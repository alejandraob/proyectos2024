<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Business;
use App\Models\Setting;
use App\Traits\HasPlanFeatures;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use HasPlanFeatures;
    /**
     * Registrar un nuevo usuario (profesional)
     *
     * Recibe: name, email, password, telefono, nombre_negocio
     * Crea: Usuario + Negocio + Settings por defecto
     * Retorna: Usuario con token de acceso
     */
    public function register(Request $request)
    {
        // Validar los datos recibidos
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
            'nombre_negocio' => 'required|string|max:255',
        ]);

        // Crear el usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
        ]);

        // Crear el negocio asociado al usuario
        // El slug se genera automáticamente del nombre (ej: "Mi Pelu" -> "mi-pelu")
        $business = Business::create([
            'user_id' => $user->id,
            'nombre_negocio' => $request->nombre_negocio,
            'slug' => Str::slug($request->nombre_negocio) . '-' . $user->id,
        ]);

        // Crear configuración por defecto del negocio
        Setting::create([
            'business_id' => $business->id,
        ]);

        // Generar token de acceso (usando Laravel Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'business' => $business,
            'token' => $token,
        ], 201);
    }

    /**
     * Iniciar sesión
     *
     * Recibe: email, password
     * Retorna: Usuario con su negocio y token de acceso
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Verificar credenciales
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales inválidas',
            ], 401);
        }

        // Obtener usuario con su negocio y configuración
        $user = User::with('business.setting')->where('email', $request->email)->first();

        // Generar token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Cerrar sesión
     *
     * Elimina el token actual del usuario
     */
    public function logout(Request $request)
    {
        // Eliminar el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    /**
     * Obtener usuario autenticado
     *
     * Retorna: Datos del usuario con su negocio y configuración
     */
    public function me(Request $request)
    {
        // Cargar usuario con relaciones
        $user = $request->user()->load('business.setting');

        return response()->json($user);
    }

    /**
     * Solicitar recuperación de contraseña
     *
     * Recibe: email
     * Nota: Por seguridad, siempre retorna éxito (no revela si el email existe)
     * TODO: Implementar envío real de email cuando se configure SMTP
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        // Verificar si el usuario existe (solo para logging interno)
        $user = User::where('email', $request->email)->first();

        if ($user) {
            // TODO: Generar token y enviar email
            // Por ahora solo logueamos que se solicitó
            \Log::info('Solicitud de recuperación de contraseña para: ' . $request->email);
        }

        // Siempre retornar éxito por seguridad
        return response()->json([
            'message' => 'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
        ]);
    }

    /**
     * Obtener features del plan del usuario
     *
     * Retorna: Features habilitadas según el plan actual
     */
    public function features(Request $request)
    {
        $user = $request->user();
        return response()->json($this->getPlanFeatures($user));
    }
}
