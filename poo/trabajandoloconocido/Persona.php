<?php
class Persona{

    private $nombre;
    private $apellido;
    private $dni;
    private $domicilio;
    private $provincia;
    private $telefono;
    private $email;
    private $fechaNacimiento;

    public function __construct($nombre, $apellido, $dni, $domicilio, $provincia, $telefono, $email, $fechaNacimiento){
        $this->nombre = $nombre;
        $this->apellido = $apellido;
        $this->dni = $dni;
        $this->domicilio = $domicilio;
        $this->provincia = $provincia;
        $this->telefono = $telefono;
        $this->email = $email;
        $this->fechaNacimiento = $fechaNacimiento;
    }

/*crearemos los getteres */
public function getNombre(){
    return $this->nombre;
}
public function getApellido(){
    return $this->apellido;
}
public function getDni(){
    return $this->dni;
}
public function getDomicilio(){
    return $this->domicilio;
}
public function getProvincia(){
    return $this->provincia;
}
public function getTelefono(){
    return $this->telefono;
}
public function getEmail(){
    return $this->email;
}
public function getFechaNacimiento(){
    return $this->fechaNacimiento;
}

/*crearemos los setteres */
public function setNombre($nombre){
    $this->nombre = $nombre;
}
public function setApellido($apellido){
    $this->apellido = $apellido;
}
public function setDni($dni){
    $this->dni = $dni;
}
public function setDomicilio($domicilio){
    $this->domicilio = $domicilio;
}
public function setProvincia($provincia){
    $this->provincia = $provincia;
}
public function setTelefono($telefono){
    $this->telefono = $telefono;
}
public function setEmail($email){
    $this->email = $email;
}
public function setFechaNacimiento($fechaNacimiento){
    $this->fechaNacimiento = $fechaNacimiento;
}

public function __toString(){
    return "Nombre: ".$this->nombre." Apellido: ".$this->apellido." DNI: ".$this->dni." Domicilio: ".$this->domicilio." Provincia: ".$this->provincia." Telefono: ".$this->telefono." Email: ".$this->email." Fecha de Nacimiento: ".$this->fechaNacimiento;
}




}