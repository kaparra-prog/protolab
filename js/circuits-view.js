// Renderizador interactivo de Circuitos Básicos y Guías de Conexión en Protoboard
let currentSelectedCircuitId = 'led-resistor';
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

// Generador seguro de íconos para evitar ligaduras faltantes de fuentes (ej. la palabra 'resistor' desfasada)
function renderBomIcon(icon, colorClass = 'text-primary') {
  if (icon === 'resistor') {
    return `<svg class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12h3.5l2-5 3 10 3-10 3 10 2-5h3.5"/>
    </svg>`;
  }
  if (icon === 'capacitor') {
    return `<svg class="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M2 12h7m6 0h7M9 5v14m6-14v14"/>
    </svg>`;
  }
  return `<span class="material-symbols-outlined text-[18px] ${colorClass} select-none leading-none overflow-hidden">${icon}</span>`;
}

function initCircuitsView() {
  renderCircuitsCatalog();
  renderCircuitDetail(currentSelectedCircuitId);
}

// Renderiza la lista izquierda de circuitos
function renderCircuitsCatalog() {
  const container = document.getElementById('circuitos-container');
  if (!container) return;

  // Filtrado
  const filteredCircuits = CIRCUITS_DATA.filter(c => {
    const matchesCategory = currentCategoryFilter === 'all' || c.category === currentCategoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                          c.summary.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- COLUMNA IZQUIERDA: BUSCADOR Y LISTA DE CIRCUITOS (4 de 12 en desktop) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        
        <!-- Buscador y Filtros -->
        <div class="bg-warm-card-alt dark:bg-[#201D22] p-3 rounded-xl border border-warm-border dark:border-[#332D37] space-y-2.5">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-gray dark:text-stone-400 text-[18px]">search</span>
            <input type="text" id="circuit-search-input" value="${currentSearchQuery}" oninput="onCircuitSearch(this.value)" 
                   placeholder="Buscar circuito (LED, 555, LM741)..." 
                   class="w-full bg-white dark:bg-[#18161A] text-xs text-warm-charcoal dark:text-[#F3EFF5] pl-8 pr-8 py-2 rounded-lg border border-warm-border dark:border-[#38333D] focus:outline-none focus:border-primary-pastel transition-all">
            ${currentSearchQuery ? `
              <button onclick="clearCircuitSearch()" title="Limpiar búsqueda" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-warm-charcoal dark:hover:text-white p-0.5 rounded-full">
                <span class="material-symbols-outlined text-[16px] block">close</span>
              </button>
            ` : ''}
          </div>

          <!-- Filtros de categoría -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
            <button onclick="setCircuitFilter('all')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'all' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              Todos (${CIRCUITS_DATA.length})
            </button>
            <button onclick="setCircuitFilter('diodos')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'diodos' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              Diodos/LED
            </button>
            <button onclick="setCircuitFilter('fuentes')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'fuentes' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              Divisores
            </button>
            <button onclick="setCircuitFilter('opamps')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'opamps' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              Op-Amps
            </button>
            <button onclick="setCircuitFilter('timers')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'timers' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              555
            </button>
            <button onclick="setCircuitFilter('transistores')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'transistores' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              Transistores
            </button>
            <button onclick="setCircuitFilter('sensores')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'sensores' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white dark:bg-[#18161A] text-warm-gray dark:text-stone-300 border border-warm-border dark:border-[#38333D] hover:bg-warm-card'}">
              Sensores
            </button>
          </div>
        </div>

        <!-- Tarjetas de Circuitos -->
        <div class="flex flex-col gap-2.5">
          ${filteredCircuits.length === 0 ? `
            <div class="p-6 text-center text-warm-gray dark:text-stone-400 text-xs bg-warm-card dark:bg-[#201D22] rounded-xl border border-warm-border dark:border-[#332D37]">
              No se encontraron circuitos con ese término.
            </div>
          ` : filteredCircuits.map(c => {
            const isSelected = c.id === currentSelectedCircuitId;
            return `
              <div onclick="selectCircuit('${c.id}')" 
                   class="cursor-pointer p-4 rounded-xl transition-all border ${isSelected 
                     ? 'bg-primary-soft/50 dark:bg-primary/20 border-primary-pastel shadow-sm ring-1 ring-primary-pastel' 
                     : 'bg-white dark:bg-[#201D22] hover:bg-warm-card-alt dark:hover:bg-[#28242B] border-warm-border dark:border-[#332D37]'}">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="font-mono text-[10px] font-bold text-primary dark:text-primary-pastel px-1.5 py-0.5 rounded-full bg-white dark:bg-[#18161A] border border-primary-border">${c.code}</span>
                      <span class="text-[10px] text-warm-gray dark:text-stone-400 uppercase tracking-wider font-semibold">${c.difficulty}</span>
                    </div>
                    <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-[#F3EFF5]">${c.title}</h3>
                  </div>
                  <span class="material-symbols-outlined text-primary dark:text-primary-pastel text-[20px]">${isSelected ? 'check_circle' : 'arrow_forward_ios'}</span>
                </div>
                <p class="text-xs text-warm-gray dark:text-stone-400 mt-1.5 line-clamp-2">${c.summary}</p>
                <div class="flex items-center gap-3 mt-3 pt-2 border-t border-warm-border-light dark:border-[#2D2832] text-[11px] font-mono text-warm-gray dark:text-stone-400">
                  <span>⚡ Voltaje: ${c.voltage}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- COLUMNA DERECHA: DETALLE INTERACTIVO Y ESQUEMA (8 de 12 en desktop) -->
      <div id="circuit-detail-wrapper" class="lg:col-span-8 flex flex-col gap-5">
        <!-- Renderizado dinámico -->
      </div>

    </div>
  `;

  container.innerHTML = html;
}

// Renderiza el detalle del circuito seleccionado
function renderCircuitDetail(circuitId) {
  currentSelectedCircuitId = circuitId;
  const circuit = CIRCUITS_DATA.find(c => c.id === circuitId);
  const detailWrapper = document.getElementById('circuit-detail-wrapper');
  if (!circuit || !detailWrapper) return;

  detailWrapper.innerHTML = `
    <!-- Tarjeta Principal del Circuito Activo -->
    <div class="bg-white dark:bg-[#1C1A1E] border border-warm-border dark:border-[#332D37] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      <!-- Encabezado con etiquetas -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-warm-border-light dark:border-[#2E2933]">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-mono text-xs font-bold text-primary dark:text-primary-pastel bg-primary-soft dark:bg-primary/20 px-2 py-0.5 rounded-md border border-primary-border">${circuit.code}</span>
            <span class="text-xs font-medium text-sage-dark dark:text-emerald-300 bg-sage-soft dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Voltaje Recomendado: ${circuit.voltage}</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-heading font-bold text-warm-charcoal dark:text-[#F3EFF5]">${circuit.title}</h2>
          <p class="text-xs sm:text-sm text-warm-gray dark:text-stone-400 mt-1">${circuit.summary}</p>
        </div>
        
        <div class="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span class="px-2.5 py-1 rounded-lg bg-warm-card-alt dark:bg-[#252228] border border-warm-border dark:border-[#38333D] text-warm-charcoal dark:text-[#F3EFF5] font-semibold">
            📊 Dificultad: ${circuit.difficulty}
          </span>
        </div>
      </div>

      <!-- SECCIÓN 1: LISTA DE MATERIALES (BOM) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-[#F3EFF5] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary dark:text-primary-pastel">inventory_2</span>
            <span>Componentes Necesarios (Lista de Materiales)</span>
          </h3>
          <span class="text-[11px] font-mono text-warm-gray dark:text-stone-400">${circuit.bom.length} elementos requeridos</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${circuit.bom.map(item => `
            <div class="flex items-start gap-3 p-3 rounded-xl bg-warm-card dark:bg-[#242127] border border-warm-border/80 dark:border-[#38333D] hover:bg-white dark:hover:bg-[#2C2830] transition-all">
              <div class="w-8 h-8 rounded-lg bg-white dark:bg-[#18161A] border border-warm-border dark:border-[#38333D] flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden">
                ${renderBomIcon(item.icon, item.color)}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <h4 class="text-xs font-bold text-warm-charcoal dark:text-[#F3EFF5] truncate">${item.name}</h4>
                  <span class="font-mono text-[10px] font-bold text-primary dark:text-primary-pastel bg-primary-soft/80 dark:bg-primary/20 px-1.5 py-0.5 rounded">${item.qty}</span>
                </div>
                <p class="text-[11px] text-warm-gray dark:text-stone-400 mt-0.5 leading-snug">${item.note}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 2: VISUALIZADOR INTERACTIVO DE PROTOBOARD (SVG) -->
      ${typeof renderBreadboardSvg === 'function' ? renderBreadboardSvg(circuit.id) : ''}

      <!-- SECCIÓN 3: GUÍA DE CONEXIÓN PASO A PASO -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-[#F3EFF5] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-sage-dark dark:text-emerald-400">account_tree</span>
            <span>Instrucciones de Conexión Paso a Paso</span>
          </h3>
          <span class="text-[11px] font-mono text-sage-dark dark:text-emerald-400 font-semibold">Sin soldar | Protoboard</span>
        </div>

        <div class="space-y-2">
          ${circuit.connections.map(c => `
            <div class="flex items-start gap-3 p-3 rounded-xl bg-warm-card-alt/60 dark:bg-[#242127] border border-warm-border dark:border-[#38333D]">
              <div class="w-6 h-6 rounded-full bg-primary-pastel dark:bg-primary text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                ${c.step}
              </div>
              <p class="text-xs text-warm-charcoal dark:text-[#E8E4EB] leading-relaxed">${c.text}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 4: TABLA RÁPIDA DE PINES Y DESTINOS -->
      <div>
        <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-[#F3EFF5] flex items-center gap-1.5 mb-3">
          <span class="material-symbols-outlined text-[18px] text-lavender-dark dark:text-purple-300">pin</span>
          <span>Resumen Rápido de Terminales / Pines</span>
        </h3>
        
        <div class="overflow-x-auto rounded-xl border border-warm-border dark:border-[#38333D]">
          <table class="w-full text-left text-xs">
            <thead class="bg-warm-card-alt dark:bg-[#242127] border-b border-warm-border dark:border-[#38333D] text-warm-gray dark:text-stone-300 font-mono text-[11px]">
              <tr>
                <th class="py-2.5 px-3">Terminal / Pin</th>
                <th class="py-2.5 px-3">¿A dónde se conecta en la protoboard?</th>
                <th class="py-2.5 px-3">Tipo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-warm-border-light dark:divide-[#2E2933] bg-white dark:bg-[#1E1B20]">
              ${circuit.pinoutGuide.map(p => {
                let badgeColor = 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
                let typeLabel = 'Pasivo';
                if (p.type === 'positive') {
                  badgeColor = 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
                  typeLabel = 'Alimentación (+)';
                } else if (p.type === 'negative') {
                  badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
                  typeLabel = 'Alimentación (-)';
                } else if (p.type === 'ground') {
                  badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
                  typeLabel = 'Tierra (GND)';
                } else if (p.type === 'signal') {
                  badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
                  typeLabel = 'Señal';
                }
                return `
                  <tr class="hover:bg-warm-card-alt/40 dark:hover:bg-[#252228] transition-colors">
                    <td class="py-2.5 px-3 font-mono font-bold text-warm-charcoal dark:text-[#F3EFF5]">${p.pin}</td>
                    <td class="py-2.5 px-3 text-warm-charcoal dark:text-[#E8E4EB]">${p.connectsTo}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${badgeColor}">
                        ${typeLabel}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALERTA DE SEGURIDAD ESPECÍFICA DEL CIRCUITO -->
      <div class="p-4 rounded-xl bg-alert-soft dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
        <span class="material-symbols-outlined text-alert-red text-[22px] flex-shrink-0 mt-0.5">warning</span>
        <div>
          <h4 class="text-xs font-bold text-alert-red font-heading uppercase tracking-wide">¡Alerta de Seguridad para no quemar piezas!</h4>
          <p class="text-xs text-warm-charcoal dark:text-[#F3EFF5] mt-1 leading-relaxed">${circuit.warning}</p>
        </div>
      </div>

    </div>
  `;
}

// Controladores de eventos
function selectCircuit(circuitId) {
  currentSelectedCircuitId = circuitId;
  renderCircuitsCatalog();
  renderCircuitDetail(circuitId);
  // En móviles, hacer scroll suave hacia el detalle
  if (window.innerWidth < 1024) {
    const detailEl = document.getElementById('circuit-detail-wrapper');
    if (detailEl) {
      detailEl.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function setCircuitFilter(category) {
  currentCategoryFilter = category;
  renderCircuitsCatalog();
}

function onCircuitSearch(query) {
  currentSearchQuery = query;
  renderCircuitsCatalog();
}

function clearCircuitSearch() {
  currentSearchQuery = '';
  renderCircuitsCatalog();
  const inp = document.getElementById('circuit-search-input');
  if (inp) inp.focus();
}
