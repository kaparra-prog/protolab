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
  try {
    localStorage.setItem('protolab_security_checklist', JSON.stringify(checkedState));
  } catch (e) {}
}

function toggleChecklistItem(id) {
  checkedState[id] = !checkedState[id];
  saveChecklistState();
  renderSecurityView();
}

function handleChecklistKeydown(event, id) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    toggleChecklistItem(id);
  }
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
        ? 'bg-sage-soft dark:bg-emerald-950/30 border-sage/60 dark:border-emerald-700/60 shadow-sm' 
        : 'bg-warm-card dark:bg-[#201D22] border-warm-border dark:border-[#332D37] shadow-xs'}">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isAllReady ? 'bg-sage dark:bg-emerald-600 text-white shadow-sm' : 'bg-primary-soft dark:bg-primary/20 text-primary dark:text-primary-pastel'}">
              <span class="material-symbols-outlined text-2xl">${isAllReady ? 'check_circle' : 'security'}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold uppercase tracking-wider ${isAllReady ? 'text-sage-dark dark:text-emerald-300' : 'text-primary dark:text-primary-pastel'}">
                  ${isAllReady ? 'ESTADO: BANCO SEGURO PARA ENERGIZAR' : 'ESTADO: VERIFICACIÓN PENDIENTE'}
                </span>
                <span class="font-mono text-xs px-2 py-0.5 rounded-full ${isAllReady ? 'bg-white dark:bg-[#18161A] text-sage-dark dark:text-emerald-300 border border-sage/40 font-bold' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D]'}">
                  ${completed} de ${total} listos
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-heading font-bold text-warm-charcoal dark:text-[#F3EFF5] mt-1">
                ${isAllReady 
                  ? '¡Excelente! Tu circuito cumple todas las normas de seguridad.' 
                  : 'Completa la lista antes de presionar el botón de la fuente.'}
              </h2>
            </div>
          </div>

          <!-- Botones de Acción Rápida -->
          <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button onclick="markAllChecklist()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#18161A] border border-warm-border dark:border-[#38333D] text-warm-charcoal dark:text-[#F3EFF5] hover:bg-warm-card-alt dark:hover:bg-[#28242B] transition-all whitespace-nowrap">
              Marcar todo
            </button>
            <button onclick="resetChecklist()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#18161A] border border-warm-border dark:border-[#38333D] text-warm-gray dark:text-stone-300 hover:text-alert-red dark:hover:text-red-400 transition-all whitespace-nowrap">
              Reiniciar
            </button>
          </div>
        </div>

        <!-- Barra de Progreso -->
        <div class="mt-4">
          <div class="w-full h-2.5 bg-warm-border-light dark:bg-[#2A262E] rounded-full overflow-hidden">
            <div class="h-full transition-all duration-300 rounded-full ${isAllReady ? 'bg-sage dark:bg-emerald-500' : 'bg-primary-pastel dark:bg-primary'}" style="width: ${percent}%;"></div>
          </div>
          <div class="flex justify-between text-[11px] font-mono text-warm-gray dark:text-stone-400 mt-1.5">
            <span>Progreso de verificación</span>
            <span class="font-bold text-warm-charcoal dark:text-[#F3EFF5]">${percent}%</span>
          </div>
        </div>

      </div>

      <!-- LISTA DE VERIFICACIÓN INTERACTIVA (ACCESIBLE) -->
      <div class="space-y-3" role="group" aria-label="Lista de verificación de seguridad pre-energizado">
        ${SECURITY_ITEMS.map((item, index) => {
          const isChecked = !!checkedState[item.id];
          return `
            <div role="checkbox" 
                 tabindex="0"
                 aria-checked="${isChecked}"
                 aria-label="${item.title}"
                 onkeydown="handleChecklistKeydown(event, '${item.id}')"
                 onclick="toggleChecklistItem('${item.id}')"
                 class="cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 outline-none focus:ring-2 focus:ring-primary-pastel select-none ${isChecked 
                   ? 'bg-sage-soft/40 dark:bg-emerald-950/25 border-sage/60 dark:border-emerald-700/50 shadow-2xs' 
                   : 'bg-white dark:bg-[#1E1B20] hover:bg-warm-card-alt dark:hover:bg-[#252228] border-warm-border dark:border-[#332D37]'}">
              
              <!-- Checkbox Físico Estilizado -->
              <div class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all border ${isChecked 
                ? 'bg-sage dark:bg-emerald-600 border-sage dark:border-emerald-500 text-white shadow-xs' 
                : 'bg-white dark:bg-[#18161A] border-stone-300 dark:border-stone-600 hover:border-primary'}">
                ${isChecked ? '<span class="material-symbols-outlined text-[16px] font-bold">check</span>' : ''}
              </div>

              <!-- Contenido legible y sin tachado para preservar lectura clara -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xs sm:text-sm font-bold text-warm-charcoal dark:text-[#F3EFF5]">
                      ${index + 1}. ${item.title}
                    </h3>
                    ${isChecked ? `
                      <span class="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-sage-dark dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-sage/40 dark:border-emerald-700/50">
                        <span class="material-symbols-outlined text-[12px]">verified</span>
                        <span>Verificado</span>
                      </span>
                    ` : ''}
                  </div>
                  <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${item.critical ? 'bg-alert-soft dark:bg-red-950/40 text-alert-red dark:text-red-400 border border-red-200 dark:border-red-900/50' : 'bg-warm-card-alt dark:bg-[#28242B] text-warm-gray dark:text-stone-400'}">
                    ${item.tag}
                  </span>
                </div>
                <p class="text-xs text-warm-gray dark:text-stone-300 leading-relaxed">${item.desc}</p>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- PROTOCOLO DE EMERGENCIA: ¿QUÉ HACER SI ALGO SALE MAL? -->
      <div class="p-5 rounded-2xl bg-warm-card dark:bg-[#201D22] border border-warm-border dark:border-[#332D37] space-y-3">
        <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal dark:text-[#F3EFF5] flex items-center gap-1.5">
          <span class="material-symbols-outlined text-alert-red text-[18px]">medical_services</span>
          <span>Protocolo de Emergencia en el Laboratorio</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-white dark:bg-[#18161A] rounded-xl border border-warm-border dark:border-[#38333D]">
            <strong class="text-alert-red dark:text-red-400 block mb-1">1. Olor a quemado o humo</strong>
            <p class="text-warm-gray dark:text-stone-300 text-[11px]">Apaga inmediatamente el interruptor de la fuente antes de tocar cualquier cable.</p>
          </div>
          <div class="p-3 bg-white dark:bg-[#18161A] rounded-xl border border-warm-border dark:border-[#38333D]">
            <strong class="text-alert-red dark:text-red-400 block mb-1">2. Chip hirviendo al tacto</strong>
            <p class="text-warm-gray dark:text-stone-300 text-[11px]">Si tocas el integrado y quema el dedo, desconecta de inmediato: invertiste la alimentación.</p>
          </div>
          <div class="p-3 bg-white dark:bg-[#18161A] rounded-xl border border-warm-border dark:border-[#38333D]">
            <strong class="text-alert-red dark:text-red-400 block mb-1">3. Fuente pita o marca 0V</strong>
            <p class="text-warm-gray dark:text-stone-300 text-[11px]">Se disparó la protección de cortocircuito (CC). Revisa que positivo y negativo no se toquen.</p>
          </div>
        </div>
      </div>

    </div>
  `;
}
