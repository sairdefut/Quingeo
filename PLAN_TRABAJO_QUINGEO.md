# 📋 Plan de Trabajo — Correcciones Proyecto Quingeo HCE

**Fecha:** 13 de Mayo de 2026  
**Equipo:** Daniel · Sebastian · Jonathan  
**Base:** `main` (sincronizado con origin/main)

---

## 👥 Resumen de Responsabilidades

| Desarrollador | Área Principal | Dependencias |
|---------------|---------------|--------------|
| **Daniel** | Backend (lógica de negocio, validaciones, API) | Nadie lo bloquea |
| **Sebastian** | Frontend — Formularios y controles dinámicos | Depende de endpoints de Daniel |
| **Jonathan** | Frontend — Módulos de diagnóstico y cierre de consulta | Depende de trabajo de Sebastian (estructura base) y Daniel (buscador CIE-10) |

---

## 🌿 Estructura de Ramas

```
main
├── feature/daniel/backend-correcciones
│   ├── validacion-cedula-extranjeros
│   ├── logica-glasgow-aspecto
│   ├── regla-perimetro-cefalico
│   └── buscador-cie10-por-nombre
│
├── feature/sebastian/frontend-filiacion-anamnesis
│   ├── control-dinamico-cedula-extranjero
│   ├── tipo-sangre-completo
│   ├── campo-anio-escolar
│   ├── opcion-no-recuerdo-peso-talla
│   ├── apgar-no-recuerda
│   └── antecedentes-personales-otros
│
└── feature/jonathan/frontend-examen-diagnostico
    ├── perimetro-cefalico-edad
    ├── glasgow-aspecto-general
    ├── cabeza-fontanelas-info
    ├── vacunacion-incompleto-lista
    ├── buscador-diagnostico-nombre
    └── seccion-referencia-medica
```

---

## 🔴 DANIEL — Backend (Semana 1, días 1–5)

> **Empieza primero.** Sus endpoints son necesarios para que Sebastian y Jonathan conecten el frontend correctamente.

### Rama: `feature/daniel/backend-correcciones`

---

### Tarea D-1 · Validación Cédula vs. Extranjero
**Archivo:** `controller/PacienteController.java` · `entity/Paciente.java`

- Añadir campo `tipoIdentificacion` al modelo (`CEDULA` / `EXTRANJERO`).
- Si `tipoIdentificacion = EXTRANJERO`, el campo `cedula` acepta alfanumérico sin validación de módulo 11.
- Añadir validación en el backend para no aplicar checksum de cédula ecuatoriana a extranjeros.
- Actualizar el endpoint `POST /api/pacientes` y `PUT /api/pacientes/{id}`.

**Entrega a Sebastian:** Documentar los valores válidos del enum `tipoIdentificacion`.

---

### Tarea D-2 · Lógica Glasgow → Aspecto General
**Archivo:** `service/ConsultaService.java` (o crear `GlasgowService.java`)

- Crear función que reciba un valor numérico de Glasgow (3–15) y retorne **exactamente** uno de estos tres estados (los únicos definidos en el documento):
  - `"Sobrealerta"` → puntaje más alto
  - `"Normal"` → puntaje intermedio
  - `"Activo"` → puntaje bajo
- La distribución numérica exacta por rango queda a criterio clínico del equipo médico, pero los estados posibles son **solo esos tres**.
- Exponer como campo calculado en el DTO de consulta o como endpoint auxiliar `GET /api/catalogos/glasgow/{valor}`.

**Entrega a Jonathan:** URL del endpoint o campo en el DTO.

---

### Tarea D-3 · Regla de Validación Perímetro Cefálico
**Archivo:** `service/ConsultaService.java` · `dto/ExamenFisicoDTO.java`

- Añadir validación: el campo `perimetroCefalico` solo es procesado si la edad del paciente está entre **2 y 3 años (24–36 meses)**. No aplica para recién nacidos ni menores de 2 años.
- Si llega el campo con un paciente fuera de ese rango, ignorarlo o retornar error de validación `400 Bad Request`.
- Calcular edad del paciente a partir del campo `fechaNacimiento` del modelo `Paciente`.

**Entrega a Sebastian:** Confirmar la regla de negocio para que el frontend también deshabilite el campo en UI.

---

### Tarea D-4 · Buscador CIE-10 por Nombre (Alta Prioridad — ya era bug conocido)
**Archivo:** `controller/CatalogoController.java` · `repository/EnfermedadRepository.java`

- Añadir endpoint: `GET /api/catalogos/cie10/buscar?q={texto}`
- El parámetro `q` debe buscar por **nombre de enfermedad** (LIKE `%texto%`, insensible a mayúsculas) **y también** por código CIE-10.
- Retornar máximo 20 resultados paginados para no saturar la UI.
- Asegurar que el catálogo esté correctamente cargado en base de datos (resolver el bug "Unexpected end of JSON input" existente).

**Entrega a Jonathan:** Endpoint funcional y documentado.

---

### Tarea D-5 · Endpoint de Referencia Médica
**Archivo:** `entity/Consulta.java` · `controller/ConsultaController.java`

- Añadir campo `referenciaHospital: boolean` y `motivoReferencia: String` a la entidad `Consulta`.
- El campo en la UI debe llamarse exactamente: **"Paciente referido a otro hospital por lesión"** con opciones `Sí` / `No`.
- Incluir estos campos en el DTO de creación y respuesta.
- Migración SQL: `ALTER TABLE consultas ADD COLUMN referencia_hospital TINYINT(1) DEFAULT 0, ADD COLUMN motivo_referencia VARCHAR(500)`.

**Entrega a Jonathan:** Campos disponibles en el endpoint de guardar consulta.

---

### ✅ Checklist Daniel antes de hacer merge a `main`
- [ ] D-1: Validación cédula/extranjero en backend
- [ ] D-2: Lógica Glasgow con endpoint o campo DTO
- [ ] D-3: Regla perímetro cefálico validada
- [ ] D-4: Buscador CIE-10 funciona por nombre Y por código
- [ ] D-5: Campos referencia médica en BD y API
- [ ] Pruebas con Postman o tests unitarios básicos
- [ ] PR hacia `main` con descripción de endpoints nuevos/modificados

---

## 🟡 SEBASTIAN — Frontend: Filiación y Anamnesis (Semana 1–2, días 3–8)

> **Puede empezar en paralelo con Daniel** en los cambios puramente de UI. Los cambios que necesitan validación del backend (D-1, D-3) deben conectarse una vez Daniel entregue.

### Rama: `feature/sebastian/frontend-filiacion-anamnesis`

---

### Tarea S-1 · Control Dinámico Cédula / Extranjero
**Archivo:** `pages/pacientes/RegistroPaciente.tsx` (o similar)

- Añadir un selector/radio: `"Ecuatoriano"` | `"Extranjero"`.
- Si se selecciona **Ecuatoriano**: mostrar input de cédula con validación módulo 11 existente.
- Si se selecciona **Extranjero**: mostrar input con label `"Número de Identificación"` sin validación de formato.
- Conectar con el campo `tipoIdentificacion` del backend (D-1).

---

### Tarea S-2 · Tipo de Sangre — Menú Completo
**Archivo:** Componente de registro de paciente

- Verificar que el `<select>` de tipo de sangre contenga exactamente: `A+, A-, B+, B-, AB+, AB-, O+, O-`.
- Si falta alguna opción, añadirla. Si viene de catálogo dinámico, verificar que el backend la incluya.

*(Tarea rápida — estimado 30 minutos)*

---

### Tarea S-3 · Campo "Año Escolar"
**Archivo:** Sección de información escolar en el formulario de paciente

- Añadir campo `Año Escolar` como `<select>` o `<input type="text">`.
- Opciones sugeridas: `Inicial 1, Inicial 2, 1ro Básica, … 10mo Básica, 1ro Bachillerato, 2do Bachillerato, 3ro Bachillerato, Universidad, No aplica`.
- Solo visible si el paciente es menor de 25 años (condicional por edad).

---

### Tarea S-4 · "No Recuerdo" en Peso y Talla
**Archivos:** Sección perinatal y sección de signos vitales históricos

- En los campos de **Peso al nacer** y **Talla al nacer**: añadir un checkbox `"No recuerda"`.
- Cuando el checkbox esté marcado: deshabilitar el input numérico y enviar `null` al backend.
- Aplicar el mismo patrón en controles previos históricos donde existan campos de peso/talla.

---

### Tarea S-5 · Test de Apgar — "No Recuerda"
**Archivo:** Sección de antecedentes perinatales

- Añadir opción `"No recuerda"` en el input/select del Test de Apgar (minuto 1 y minuto 5).
- Cuando se seleccione, los campos numéricos de Apgar quedan deshabilitados y se envía `null`.

---

### Tarea S-6 · Antecedentes Personales — Campo "Otros"
**Archivo:** Sección de antecedentes personales

- Al final de la lista de antecedentes personales, añadir una opción `"Otros"` (checkbox).
- Al marcar `"Otros"`: desplegar un `<textarea>` de texto libre para describir el antecedente.
- El texto se guarda en el campo correspondiente del DTO de antecedentes.

---

### Tarea S-7 · Perímetro Cefálico — Habilitar solo entre 2 y 3 años
**Archivo:** Sección de examen físico

- Leer la fecha de nacimiento del paciente en contexto.
- Si la edad es **menor a 2 años o mayor a 3 años**: deshabilitar el campo `Perímetro Cefálico` con un tooltip: `"Solo disponible para pacientes entre 2 y 3 años"`.
- Si la edad está **entre 2 y 3 años (24–36 meses)**: habilitar normalmente.
- Coordinar con D-3 (Daniel también valida en backend).

---

### ✅ Checklist Sebastian antes de hacer merge a `main`
- [ ] S-1: Control dinámico cédula/extranjero conectado
- [ ] S-2: Menú tipo de sangre con 8 opciones
- [ ] S-3: Campo año escolar visible y funcional
- [ ] S-4: "No recuerda" en peso y talla (perinatal e histórico)
- [ ] S-5: "No recuerda" en Apgar
- [ ] S-6: Antecedentes personales "Otros" con campo libre
- [ ] S-7: Perímetro cefálico deshabilitado por edad
- [ ] Pruebas manuales en navegador (Chrome + modo offline)
- [ ] PR hacia `main`

---

## 🟢 JONATHAN — Frontend: Examen Físico, Diagnóstico y Cierre (Semana 2, días 6–10)

> **Depende de:**  
> - **Daniel (D-2):** Lógica Glasgow → para conectar el cálculo automático de aspecto.  
> - **Daniel (D-4):** Endpoint CIE-10 por nombre → para implementar el buscador.  
> - **Daniel (D-5):** Campos referencia médica → para la sección de cierre.  
> Puede trabajar la maqueta/UI mientras espera los endpoints.

### Rama: `feature/jonathan/frontend-examen-diagnostico`

---

### Tarea J-1 · Glasgow — Selector Numérico + Aspecto General Automático
**Archivo:** Sección de examen físico / Glasgow

- Reemplazar el input actual de Glasgow por un `<select>` o `<input type="number" min="3" max="15">`.
- Al cambiar el valor, calcular automáticamente el Aspecto General con **exactamente estos tres estados** (los únicos definidos en el documento):
  - `"Sobrealerta"`
  - `"Normal"`
  - `"Activo"`
- La distribución numérica de los rangos debe coordinarse con el equipo médico del proyecto.
- Mostrar el resultado en un campo de solo lectura junto al input de Glasgow.
- Conectar con el endpoint de Daniel (D-2) o replicar la lógica en el frontend directamente (más simple).

---

### Tarea J-2 · Cabeza y Fontanelas — Información y "Otros"
**Archivo:** Sección de examen físico / Cabeza

- Añadir texto de ayuda (tooltip o nota informativa):
  - `"Fontanela anterior: se cierra alrededor de los 18–24 meses"`
  - `"Fontanela posterior: se cierra alrededor de los 2–3 meses"`
- Añadir opción `"Otros"` con campo de texto libre para describir hallazgos adicionales en la cabeza.
- Patrón igual al de antecedentes personales (S-6).

---

### Tarea J-3 · Módulo de Vacunación — Lista de Faltantes
**Archivo:** Sección de vacunación

- Cuando el esquema de vacunación se marque como `"Incompleto"`:
  - Desplegar la lista completa del esquema de vacunación del MSP Ecuador.
  - Cada vacuna con checkbox para marcar `"Falta"` o `"Aplicada"`.
- Cuando se marque `"Completo"`, ocultar la lista.
- Las vacunas faltantes deben guardarse en el modelo de la consulta.

> **Referencia vacunas MSP Ecuador:** Hepatitis B, BCG, Rotavirus, Pentavalente, Neumococo, IPV, OPV, SRP, Varicela, DPT, Fiebre Amarilla, VPH, Influenza.

---

### Tarea J-4 · Buscador de Diagnóstico CIE-10 por Nombre
**Archivo:** Sección de diagnóstico

- Reemplazar el input actual (que requiere conocer el código) por un **buscador con autocompletado**.
- Al escribir texto, llamar a `GET /api/catalogos/cie10/buscar?q={texto}` (endpoint de Daniel D-4).
- Mostrar resultados en dropdown: `[Código] - Nombre de enfermedad`.
- Al seleccionar, guardar el código CIE-10 en el modelo.
- Mínimo 3 caracteres para iniciar la búsqueda (evitar llamadas innecesarias).
- Considerar debounce de 300ms.

---

### Tarea J-5 · Sección de Cierre — Referencia Médica
**Archivo:** Fin del flujo de consulta (después de plan terapéutico)

- Añadir una nueva sección al final del formulario de consulta: `"Derivación / Referencia"`.
- Incluir el campo con el texto exacto del documento: **"Paciente referido a otro hospital por lesión"** con opciones `Sí` / `No`.
- Conectar con los campos `referenciaHospital` y `motivoReferencia` del backend (D-5).
- Esta sección se muestra **siempre al final**, antes del botón de guardar consulta.

---

### ✅ Checklist Jonathan antes de hacer merge a `main`
- [ ] J-1: Glasgow con selector numérico y aspecto general automático
- [ ] J-2: Info fontanelas + "Otros" en sección cabeza
- [ ] J-3: Lista de vacunas faltantes al marcar "Incompleto"
- [ ] J-4: Buscador CIE-10 por nombre con autocompletado
- [ ] J-5: Sección de referencia médica al final del flujo
- [ ] Pruebas en Chrome con backend levantado (Docker)
- [ ] PR hacia `main`

---

## 🔗 Diagrama de Dependencias

```
SEMANA 1                          SEMANA 2
Días 1-5                          Días 6-10
                                  
DANIEL ──────────────────────────────────────────► merge a main
 D-1 (cédula)       ──────────► Sebastian S-1 conecta
 D-2 (glasgow)      ──────────────────────────────► Jonathan J-1 conecta
 D-3 (perímetro)    ──────────► Sebastian S-7 conecta
 D-4 (CIE-10)       ──────────────────────────────► Jonathan J-4 conecta
 D-5 (referencia)   ──────────────────────────────► Jonathan J-5 conecta

SEBASTIAN ──────────────────────────────────────────► merge a main
 S-1 a S-6 (UI pura) → puede iniciar día 1
 S-1, S-7 (con backend) → finaliza cuando Daniel entrega D-1 y D-3

JONATHAN ──────────────────────────────────────────► merge a main
 J-2, J-3 (UI pura) → puede iniciar en paralelo día 3-4
 J-1, J-4, J-5 → requiere D-2, D-4, D-5 de Daniel
```

---

## 📅 Cronograma Estimado

| Día | Daniel | Sebastian | Jonathan |
|-----|--------|-----------|----------|
| 1–2 | D-1, D-2, D-3 | S-2, S-3 (UI simple) | Preparar maqueta J-2, J-3 |
| 3–4 | D-4, D-5 | S-4, S-5, S-6 | J-2, J-3 (implementar) |
| 5 | PR + revisión | S-1, S-7 (conectar) | Espera endpoints Daniel |
| 6–7 | Apoyo / revisión de PRs | Finalizar + PR | J-1, J-4, J-5 |
| 8–9 | — | — | Finalizar + PR |
| 10 | **Merge final + testing integrado** | | |

---

## ⚠️ Notas Importantes

1. **Bug CIE-10 existente** (D-4): Es alta prioridad porque ya estaba roto. Daniel debe resolverlo primero antes de conectar el buscador de Jonathan.

2. **Sincronización offline**: Al añadir campos nuevos (`tipoIdentificacion`, `referenciaHospital`, etc.), verificar que el `syncService.ts` los incluya en el payload de `syncUp` y que el modelo de IndexedDB (Dexie) también se actualice.

3. **Modelo Dexie**: Si se añaden campos nuevos a entidades existentes, puede ser necesario incrementar la versión de la base de datos en `db/db.ts` para evitar errores de IndexedDB.

4. **Pull Request workflow sugerido:**
   ```
   feature/... → PR → revisión cruzada (otro miembro del equipo) → merge a main
   ```

5. **JWT_SECRET hardcodeado**: Sigue pendiente del sprint anterior. No es parte de este plan pero no olvidar antes de producción.

---

## 📁 Archivos Clave a Modificar

### Backend (Daniel)
```
backend-hce/src/main/java/ec/gob/salud/hce/backend/
├── entity/Paciente.java              ← D-1 (tipoIdentificacion)
├── entity/Consulta.java              ← D-5 (referenciaHospital)
├── dto/PacienteDTO.java              ← D-1
├── dto/ConsultaDTO.java              ← D-2, D-5
├── service/ConsultaService.java      ← D-2, D-3
├── controller/CatalogoController.java ← D-4
└── repository/EnfermedadRepository.java ← D-4
```

### Frontend (Sebastian)
```
hce_frontend/src/
├── pages/pacientes/RegistroPaciente.tsx   ← S-1, S-2, S-3
├── pages/historial/Perinatal.tsx          ← S-4, S-5
├── pages/historial/AntecedentesPersonales.tsx ← S-6
└── pages/historial/ExamenFisico.tsx       ← S-7
```

### Frontend (Jonathan)
```
hce_frontend/src/
├── pages/historial/ExamenFisico.tsx       ← J-1, J-2
├── pages/historial/Vacunacion.tsx         ← J-3
├── pages/historial/Diagnostico.tsx        ← J-4
├── pages/historial/PlanTerapeutico.tsx    ← J-5 (o crear CierreConsulta.tsx)
└── db/db.ts                               ← Verificar versión Dexie si aplica
```

---

*Plan generado el 13 de Mayo de 2026 para el proyecto Quingeo - HCE*
