// Constantes para los elementos del DOM
const formularioMuestra = document.getElementById('formularioMuestra');
const tablaBody = document.querySelector('#tabla-muestras tbody');
const tablaMuestras = document.getElementById('tabla-muestras');
const mensajeVacio = document.getElementById('mensaje-vacio');
const botonLimpiar = document.getElementById('limpiarDatos');
const botonExportar = document.getElementById('exportarDatos');
const formularioMapa = document.getElementById('formularioMapa');
const KEY_STORAGE = 'muestrasGeologicas';

/**
 * Función que construye la URL de Google Maps y abre una nueva pestaña.
 * @param {string} latitud - Valor de la latitud.
 * @param {string} longitud - Valor de la longitud.
 */
function abrirEnGoogleMaps(latitud, longitud) {
    if (!latitud || !longitud) {
        alert("Coordenadas no válidas.");
        return;
    }
    // Formato de URL de Google Maps para buscar coordenadas específicas
    const url = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
    window.open(url, '_blank');
}

/**
 * Manejador para el formulario manual de coordenadas.
 */
function manejarEnvioMapa(e) {
    e.preventDefault(); 
    
    const latitud = document.getElementById('mapLatitud').value;
    const longitud = document.getElementById('mapLongitud').value;
    
    abrirEnGoogleMaps(latitud, longitud);
}

// --- FUNCIONALIDADES EXISTENTES (SIN CAMBIOS FUNCIONALES) ---

function obtenerMuestras() {
    const muestrasJSON = localStorage.getItem(KEY_STORAGE);
    return muestrasJSON ? JSON.parse(muestrasJSON) : [];
}

function guardarMuestras(muestras) {
    localStorage.setItem(KEY_STORAGE, JSON.stringify(muestras));
}

function eliminarMuestra(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este punto de datos?')) return; 
    let muestras = obtenerMuestras();
    muestras = muestras.filter(muestra => muestra.id !== id); 
    guardarMuestras(muestras);
    renderizarMuestras();
    alert('Punto de datos eliminado exitosamente.');
}

function habilitarEdicion(id, fila) {
    const celdas = fila.getElementsByTagName('td');
    const campos = ['numeroMuestra', 'localidad', 'pais', 'latitud', 'longitud', 'mineralogia', 'paleontologia'];
    
    campos.forEach((campo, index) => {
        const valorActual = celdas[index].textContent;
        celdas[index].innerHTML = `<input type="text" value="${valorActual}" class="input-edicion" id="edit-${campo}-${id}">`;
    });

    // La celda de Acciones es ahora la penúltima (antes de la celda de Mapa)
    const celdaAccionesIndex = campos.length + 1; 
    const celdaAcciones = celdas[celdaAccionesIndex]; 
    celdaAcciones.innerHTML = ''; 
    
    const botonGuardar = document.createElement('button');
    botonGuardar.textContent = 'Guardar';
    botonGuardar.classList.add('btn-accion', 'btn-guardar-edicion');
    botonGuardar.onclick = () => guardarEdicion(id); 

    celdaAcciones.appendChild(botonGuardar);
}

function guardarEdicion(id) {
    const nuevosDatos = {
        numeroMuestra: document.getElementById(`edit-numeroMuestra-${id}`).value,
        localidad: document.getElementById(`edit-localidad-${id}`).value,
        pais: document.getElementById(`edit-pais-${id}`).value,
        latitud: document.getElementById(`edit-latitud-${id}`).value,
        longitud: document.getElementById(`edit-longitud-${id}`).value,
        mineralogia: document.getElementById(`edit-mineralogia-${id}`).value,
        paleontologia: document.getElementById(`edit-paleontologia-${id}`).value
    };
    
    if (Object.values(nuevosDatos).some(val => !val)) {
        alert('Todos los campos deben tener un valor.');
        return;
    }

    let muestras = obtenerMuestras();
    const indiceMuestra = muestras.findIndex(muestra => muestra.id === id);

    if (indiceMuestra !== -1) {
        muestras[indiceMuestra] = { ...muestras[indiceMuestra], ...nuevosDatos }; 
    }

    guardarMuestras(muestras);
    renderizarMuestras();
    alert('Punto de datos actualizado exitosamente.');
}

/**
 * Función que renderiza la tabla con los datos de las muestras.
 * Incluye la creación del botón 'Ver en Mapa' para cada fila.
 */
function renderizarMuestras() {
    const muestras = obtenerMuestras();
    tablaBody.innerHTML = ''; 

    // Lógica para mostrar/ocultar elementos
    const tablaVisible = muestras.length > 0;
    mensajeVacio.classList.toggle('oculto', tablaVisible);
    tablaMuestras.classList.toggle('oculto', !tablaVisible);
    botonLimpiar.classList.toggle('oculto', !tablaVisible);
    botonExportar.classList.toggle('oculto', !tablaVisible); 

    if (!tablaVisible) return;

    // Itera y crea las filas de la tabla
    muestras.forEach(muestra => {
        const fila = tablaBody.insertRow();
        
        // Insertamos los 7 campos
        fila.insertCell().textContent = muestra.numeroMuestra;
        fila.insertCell().textContent = muestra.localidad;
        fila.insertCell().textContent = muestra.pais;
        fila.insertCell().textContent = muestra.latitud;
        fila.insertCell().textContent = muestra.longitud;
        fila.insertCell().textContent = muestra.mineralogia;
        fila.insertCell().textContent = muestra.paleontologia;

        // Celda de MAPA (NUEVA CELDA)
        const celdaMapa = fila.insertCell();
        const botonMapa = document.createElement('button');
        botonMapa.textContent = 'Ver en Mapa';
        botonMapa.classList.add('btn-accion', 'btn-mapa');
        // Usamos la función de Google Maps
        botonMapa.onclick = () => abrirEnGoogleMaps(muestra.latitud, muestra.longitud); 
        celdaMapa.appendChild(botonMapa);
        
        // Celda de Acciones (Editar/Eliminar)
        const celdaAcciones = fila.insertCell();
        
        // Botón Editar
        const botonEditar = document.createElement('button');
        botonEditar.textContent = 'Editar';
        botonEditar.classList.add('btn-accion', 'btn-editar');
        botonEditar.onclick = () => habilitarEdicion(muestra.id, fila); 
        
        // Botón Eliminar
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.classList.add('btn-accion', 'btn-eliminar');
        botonEliminar.onclick = () => eliminarMuestra(muestra.id); 

        celdaAcciones.appendChild(botonEditar);
        celdaAcciones.appendChild(botonEliminar);
    });
}

function manejarEnvioFormulario(e) {
    e.preventDefault(); 

    const numeroMuestra = document.getElementById('numeroMuestra').value;
    const localidad = document.getElementById('localidad').value;
    const pais = document.getElementById('pais').value;
    const latitud = document.getElementById('latitud').value;
    const longitud = document.getElementById('longitud').value;
    const mineralogia = document.getElementById('mineralogia').value;
    const paleontologia = document.getElementById('paleontologia').value;

    const nuevoId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

    const nuevaMuestra = {
        id: nuevoId, 
        numeroMuestra: numeroMuestra,
        localidad: localidad,
        pais: pais,
        latitud: latitud,
        longitud: longitud,
        mineralogia: mineralogia,
        paleontologia: paleontologia
    };

    const muestras = obtenerMuestras();
    muestras.push(nuevaMuestra);
    guardarMuestras(muestras);

    renderizarMuestras();
    formularioMuestra.reset(); 
    
    alert('Punto de datos guardado exitosamente en el almacenamiento local.');
}

function manejarExportarDatos() {
    const muestras = obtenerMuestras();

    if (muestras.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const cabeceras = ['ID', 'Número de muestra', 'Localidad', 'País', 'Latitud', 'Longitud', 'Mineralogía', 'Paleontología']; 
    
    const filasCSV = muestras.map(muestra => 
        `${muestra.id},${muestra.numeroMuestra.replace(/,/g, ' ')},${muestra.localidad.replace(/,/g, ' ')},${muestra.pais.replace(/,/g, ' ')},${muestra.latitud.replace(/,/g, ' ')},${muestra.longitud.replace(/,/g, ' ')},${muestra.mineralogia.replace(/,/g, ' ')},${muestra.paleontologia.replace(/,/g, ' ')}`
    );

    const contenidoCSV = [cabeceras.join(','), ...filasCSV].join('\n');

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.setAttribute('href', url);
    
    const fecha = new Date().toISOString().slice(0, 10);
    enlaceDescarga.setAttribute('download', `datos_geologicos_${fecha}.csv`);
    
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);

    alert('Datos exportados exitosamente como CSV.');
}

function manejarLimpiarDatos() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos guardados? Esta acción es irreversible.')) {
        localStorage.removeItem(KEY_STORAGE);
        renderizarMuestras();
        alert('Todos los datos han sido eliminados del almacenamiento local.');

        if (confirm('La tabla está vacía. ¿Deseas recargar la página ahora?')) {
             window.location.reload(); 
        }
    }
}


// --- INICIALIZACIÓN DE LA APLICACIÓN ---

// 1. Asigna los eventos
formularioMuestra.addEventListener('submit', manejarEnvioFormulario);
formularioMapa.addEventListener('submit', manejarEnvioMapa); // NUEVO EVENTO
botonLimpiar.addEventListener('click', manejarLimpiarDatos);
botonExportar.addEventListener('click', manejarExportarDatos); 

// 2. Carga inicial: Renderiza los datos que puedan estar ya guardados
document.addEventListener('DOMContentLoaded', renderizarMuestras);