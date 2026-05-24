package ec.gob.salud.hce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@Entity
// ESTA LÍNEA ES LA QUE CONECTA CON LA BASE DE DATOS
@Table(name = "grupos_etnicos") 
public class GrupoEtnico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo_etnico")
    private Integer idGrupoEtnico;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

     // Auditoría
    @Column(name = "uuid_offline", length = 36)
    private String uuidOffline;

    @Column(name = "sync_status", length = 20)
    private String syncStatus;

    @Column(name = "last_modified")
    private Date lastModified;

    @Column(length = 20)
    private String origin;

    @PrePersist
    protected void onCreate() {
        this.lastModified = new Date();
        if (this.uuidOffline == null)            this.uuidOffline = java.util.UUID.randomUUID().toString();
        if (this.syncStatus == null)            this.syncStatus = "PENDING";
        if (this.origin == null)            this.origin = "WEB";
    }
}