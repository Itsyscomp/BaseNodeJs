class Usuario {
    constructor(id, nombre, documento, correo) {
        // always initialize all instance properties
        this.id = id;
        this.nombre = nombre;
        this.documento = documento;
        this.correo = correo;
    }
    getUsuarioId() {
        return this.id;
    }
    getUsuarioNombre() {
        return this.nombre;
    }
    getUsuarioDocumento() {
        return this.documento;
    }

    getUsuarioCorreo() {
        return this.correo;
    }
}
module.exports = Usuario;