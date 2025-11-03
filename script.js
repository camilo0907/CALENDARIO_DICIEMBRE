document.addEventListener('DOMContentLoaded', async () => {
  const calendar = document.getElementById('calendar');

  // 🔥 Funciones Firebase (expuestas por index.html)
  const { guardarCita, cargarCitas, borrarCita } = window;

  // 🗂️ Cargar citas desde Firebase
  let citas = await cargarCitas();

  // Crear los días de diciembre (31 días)
  for (let i = 1; i <= 31; i++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.dataset.day = i;

    const number = document.createElement('span');
    number.textContent = i;

    const status = document.createElement('div');
    status.classList.add('status');
    status.textContent = citas[i]?.length ? 'Con cita' : 'Disponible';

    if (citas[i]) {
      day.classList.add('con-cita');
    }

    day.appendChild(number);
    day.appendChild(status);
    calendar.appendChild(day);

    day.addEventListener('click', () => abrirDia(i));
  }

  // Crear el modal
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3 id="modal-dia"></h3>
      <ul id="lista-citas"></ul>
      <input type="text" id="nuevaCita" placeholder="Nueva cita..." />
      <button id="agregarCita">Agregar</button>
      <button id="cerrarModal">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);

  const modalDia = document.getElementById('modal-dia');
  const listaCitas = document.getElementById('lista-citas');
  const nuevaCita = document.getElementById('nuevaCita');
  const agregarCitaBtn = document.getElementById('agregarCita');
  const cerrarModal = document.getElementById('cerrarModal');

  let diaActual = null;

  function abrirDia(dia) {
    diaActual = dia;
    modalDia.textContent = `Día ${dia}`;
    listaCitas.innerHTML = '';

    const citasDia = citas[dia] || [];
    if (citasDia.length === 0) {
      listaCitas.innerHTML = '<li class="sin-citas">Sin citas aún 💕</li>';
    } else {
      citasDia.forEach((texto, index) => {
        const li = document.createElement('li');
        li.textContent = texto;

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = '❌';
        btnEliminar.classList.add('btn-eliminar');
        btnEliminar.addEventListener('click', async () => {
          await borrarCita(dia);
          delete citas[dia];
          actualizarCalendario();
          abrirDia(dia);
        });

        li.appendChild(btnEliminar);
        listaCitas.appendChild(li);
      });
    }

    modal.style.display = 'flex';
  }

  function actualizarCalendario() {
    document.querySelectorAll('.day').forEach(day => {
      const d = day.dataset.day;
      const status = day.querySelector('.status');
      status.textContent = citas[d]?.length ? 'Con cita' : 'Disponible';

      if (citas[d]) {
        day.classList.add('con-cita');
      } else {
        day.classList.remove('con-cita');
      }
    });
  }

  agregarCitaBtn.addEventListener('click', async () => {
    const texto = nuevaCita.value.trim();
    if (texto === '') return;

    if (!citas[diaActual]) citas[diaActual] = [];
    citas[diaActual].push(texto);

    await guardarCita(diaActual, texto);

    nuevaCita.value = '';
    actualizarCalendario();
    abrirDia(diaActual);
  });

  cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
});
