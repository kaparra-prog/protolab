// Módulo de Checklist de Seguridad Pre-Energizado para ProtoLab
const SECURITY_ITEMS = [
  {
    id: 'chk-power-off',
    category: 'fuente',
    title: 'Fuente de alimentación apagada mientras armas',
    desc: 'El interruptor de la fuente de poder del laboratorio debe estar en OFF o con los cables desconectados de la protoboard mientras insertas o mueves componentes.',
    critical: true,
    tag: 'OBLIGATORIO'
  },
  {
    id: 'chk-voltage-calibrated',
    category: 'fuente',
    title: 'Voltaje medido y calibrado antes de conectar',
    desc: 'Verifica con el voltímetro o la pantalla de la fuente que el voltaje sea el requerido (ej. exactamente 5.0V y no 15V o 30V por error de la perilla).',
    critical: true,
    tag: 'CRÍTICO'
  },
  {
    id: 'chk-polarity-rails',
    category: 'fuente',
    title: 'Polaridad de rieles (+ Rojo, - Azul/Negro)',
    desc: 'Confirma que el cable rojo de la fuente vaya exclusivamente a la línea roja (+), y el negro a la línea azul (GND). No los cruces.',
    critical: true,
    tag: 'POLARIDAD'
  },
  {
    id: 'chk-no-shorts',
    category: 'inspeccion',
    title: 'Inspección visual anti-cortocircuito',
    desc: 'Asegúrate de que ningún cable pelado, terminal de resistencia o pata de capacitor esté tocando accidentalmente el riel contrario.',
    critical: true,
    tag: 'CORTO'
  },
  {
    id: 'chk-led-resistors',
    category: 'componentes',
    title: 'Resistencia limitadora colocada en cada LED',
    desc: 'Nunca conectes un diodo LED directo a la fuente. Siempre debe tener una resistencia en serie (mínimo 220 Ω o 330 Ω para 5V).',
    critical: true,
    tag: 'SEMICONDUCTOR'
  },
  {
    id: 'chk-ic-notch',
    category: 'componentes',
    title: 'Orientación de circuitos integrados (Muesca y Pin 1)',
    desc: 'Revisa que la muesca semicircular o punto indicador del chip (LM741, 555) esté orientada según el diagrama y montado sobre la ranura central.',
    critical: true,
    tag: 'INTEGRADOS'
  },
  {
    id: 'chk-capacitors-polar',
    category: 'componentes',
    title: 'Polaridad de capacitores electrolíticos',
    desc: 'La franja con el signo menos (-) o la pata corta del capacitor electrolítico DEBE ir conectada hacia la tierra (GND). Si se invierte puede explotar.',
    critical: true,
    tag: 'EXPLOSIÓN'
  }
];

// Estado local
let checkedState = {};

function initSecurityView() {
  loadChecklistState();
  renderSecurityView();
}

function loadChecklistState() {
  try {
    const saved = localStorage.getItem('protolab_security_checklist');
    if (saved) {
      checkedState = JSON.parse(saved);
    } else {
      checkedState = {};
    }
  } catch (e) {
    checkedState = {};
  }
}

function saveChecklistState() {
  localStorage.setItem('protolab_security_checklist', JSON.stringify(checkedState));
}

function toggleChecklistItem(id) {
  checkedState[id] = !checkedState[id];
  saveChecklistState();
  renderSecurityView();
}

function resetChecklist() {
  checkedState = {};
  saveChecklistState();
  renderSecurityView();
}

function markAllChecklist() {
  SECURITY_ITEMS.forEach(item => {
    checkedState[item.id] = true;
  });
  saveChecklistState();
  renderSecurityView();
}

function renderSecurityView() {
  const container = document.getElementById('seguridad-container');
  if (!container) return;

  const total = SECURITY_ITEMS.length;
  const completed = SECURITY_ITEMS.filter(item => checkedState[item.id]).length;
  const percent = Math.round((completed / total) * 100);
  const isAllReady = completed === total;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- BANNER DE ESTADO DEL BANCO DE TRABAJO -->
      <div class="p-5 sm:p-6 rounded-2xl border transition-all ${isAllReady 
        ? 'bg-sage-soft border-sage/60 shadow-sm' 
        : 'bg-warm-card border-warm-border shadow-xs'}">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isAllReady ? 'bg-sage text-white shadow-sm' : 'bg-primary-soft text-primary'}">
              <span class="material-symbols-outlined text-2xl">${isAllReady ? 'check_circle' : 'security'}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold uppercase tracking-wider ${isAllReady ? 'text-sage-dark' : 'text-primary'}">
                  ${isAllReady ? 'ESTADO: BANCO SEGURO PARA ENERGIZAR' : 'ESTADO: VERIFICACIÓN PENDIENTE'}
                </span>
                <span class="font-mono text-xs px-2 py-0.5 rounded-full ${isAllReady ? 'bg-white text-sage-dark border border-sage/40 font-bold' : 'bg-white text-warm-gray border border-warm-border'}">
                  ${completed} de ${total} listos
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-heading font-bold text-warm-charcoal mt-1">
                ${isAllReady 
                  ? '¡Excelente! Tu circuito cumple todas las normas de seguridad.' 
                  : 'Completa la lista antes de presionar el botón de la fuente.'}
              </h2>
            </div>
          </div>

          <!-- Botones de Acción Rápida -->
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <button onclick="markAllChecklist()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-warm-border text-warm-charcoal hover:bg-warm-card-alt transition-all">
              Marcar todo
            </button>
            <button onclick="resetChecklist()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-warm-border text-warm-gray hover:text-alert-red transition-all">
              Reiniciar
            </button>
          </div>
        </div>

        <!-- Barra de Progreso -->
        <div class="mt-4">
          <div class="w-full h-2.5 bg-warm-border-light rounded-full overflow-hidden">
            <div class="h-full transition-all duration-300 rounded-full ${isAllReady ? 'bg-sage' : 'bg-primary-pastel'}" style="width: ${percent}%;"></div>
          </div>
          <div class="flex justify-between text-[11px] font-mono text-warm-gray mt-1.5">
            <span>Progreso de verificación</span>
            <span class="font-bold text-warm-charcoal">${percent}%</span>
          </div>
        </div>

      </div>

      <!-- LISTA DE VERIFICACIÓN INTERACTIVA -->
      <div class="space-y-3">
        ${SECURITY_ITEMS.map((item, index) => {
          const isChecked = !!checkedState[item.id];
          return `
            <div onclick="toggleChecklistItem('${item.id}')"
                 class="cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${isChecked 
                   ? 'bg-sage-soft/30 border-sage/40 shadow-2xs' 
                   : 'bg-white hover:bg-warm-card-alt border-warm-border'}">
              
              <!-- Checkbox Físico Estilizado -->
              <div class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all border ${isChecked 
                ? 'bg-sage border-sage text-white shadow-xs' 
                : 'bg-white border-stone-300 hover:border-primary'}">
                ${isChecked ? '<span class="material-symbols-outlined text-[16px] font-bold">check</span>' : ''}
              </div>

              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <h3 class="text-xs sm:text-sm font-bold text-warm-charcoal ${isChecked ? 'line-through text-warm-gray' : ''}">
                    ${index + 1}. ${item.title}
                  </h3>
                  <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${item.critical ? 'bg-alert-soft text-alert-red border border-red-200' : 'bg-warm-card-alt text-warm-gray'}">
                    ${item.tag}
                  </span>
                </div>
                <p class="text-xs text-warm-gray leading-relaxed ${isChecked ? 'opacity-70' : ''}">${item.desc}</p>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- PROTOCOLO DE EMERGENCIA: ¿QUÉ HACER SI ALGO SALE MAL? -->
      <div class="p-5 rounded-2xl bg-warm-card border border-warm-border space-y-3">
        <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal flex items-center gap-1.5">
          <span class="material-symbols-outlined text-alert-red text-[18px]">medical_services</span>
          <span>Protocolo de Emergencia en el Laboratorio</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-white rounded-xl border border-warm-border">
            <strong class="text-alert-red block mb-1">1. Olor a quemado o humo</strong>
            <p class="text-warm-gray text-[11px]">Apaga inmediatamente el interruptor de la fuente antes de tocar cualquier cable.</p>
          </div>
          <div class="p-3 bg-white rounded-xl border border-warm-border">
            <strong class="text-alert-red block mb-1">2. Chip hirviendo al tacto</strong>
            <p class="text-warm-gray text-[11px]">Si tocas el integrado y quema el dedo, desconecta de inmediato: invertiste la alimentación.</p>
          </div>
          <div class="p-3 bg-white rounded-xl border border-warm-border">
            <strong class="text-alert-red block mb-1">3. Fuente pita o marca 0V</strong>
            <p class="text-warm-gray text-[11px]">Se disparó la protección de cortocircuito (CC). Revisa que positivo y negativo no se toquen.</p>
          </div>
        </div>
      </div>

    </div>
  `;
}
