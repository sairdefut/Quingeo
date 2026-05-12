if (navigator.onLine) {
    // ONLINE: POST directo al backend
    console.log('[DEBUG] ONLINE: Enviando POST directo al backend...');

    const token = localStorage.getItem('token');

    const fetchUrl = API_BASE_URL.endsWith('/api')
        ? `${API_BASE_URL}/sync/up`
        : `${API_BASE_URL}/api/sync/up`;

    const response = await fetch(fetchUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            entity: 'paciente',
            type: 'CREATE',
            data: pacienteParaBackend
        })
    });

    if (response.status === 403) {
        handleUnauthorized();
        return;
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] ❌ Error del backend:', errorText);
        throw new Error(`Error al guardar en servidor (${response.status}): ${errorText || response.statusText}`);
    }

    const mappings = await response.json();
    console.log('[DEBUG] Paciente guardado en backend exitosamente. Mapeos recibidos:', mappings);

    // Actualizar ID local si el backend lo devuelve
    if (mappings && Array.isArray(mappings)) {
        const mapping = mappings.find((m: any) => m.uuidOffline === pacienteParaBackend.uuidOffline);

        if (mapping && mapping.newId) {
            paciente.idPaciente = mapping.newId;
            console.log('[DEBUG] 🆔 ID asignado por backend:', mapping.newId);
        }
    }

    // Guardar localmente DESPUÉS de confirmar que se guardó en el servidor
    await dbHelpers.savePaciente(paciente);
}