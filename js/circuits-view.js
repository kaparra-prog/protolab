// Renderizador interactivo de Circuitos Básicos y Guías de Conexión en Protoboard
let currentSelectedCircuitId = 'led-resistor';
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

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
        <div class="bg-warm-card-alt p-3 rounded-xl border border-warm-border space-y-2.5">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-gray text-[18px]">search</span>
            <input type="text" id="circuit-search-input" value="${currentSearchQuery}" oninput="onCircuitSearch(this.value)" 
                   placeholder="Buscar circuito (LED, 555, LM741)..." 
                   class="w-full bg-white text-xs text-warm-charcoal pl-8 pr-3 py-2 rounded-lg border border-warm-border focus:outline-none focus:border-primary-pastel transition-all">
          </div>

          <!-- Filtros de categoría -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
            <button onclick="setCircuitFilter('all')" class="px-2.5 py-1 rounded-lg transition-all ${currentCategoryFilter === 'all' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Todos (${CIRCUITS_DATA.length})
            </button>
            <button onclick="setCircuitFilter('diodos')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'diodos' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Diodos/LED
            </button>
            <button onclick="setCircuitFilter('fuentes')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'fuentes' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Divisores
            </button>
            <button onclick="setCircuitFilter('opamps')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'opamps' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Op-Amps
            </button>
            <button onclick="setCircuitFilter('timers')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentCategoryFilter === 'timers' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              555
            </button>
          </div>
        </div>

        <!-- Tarjetas de Circuitos -->
        <div class="flex flex-col gap-2.5">
          ${filteredCircuits.length === 0 ? `
            <div class="p-6 text-center text-warm-gray text-xs bg-warm-card rounded-xl border border-warm-border">
              No se encontraron circuitos con ese término.
            </div>
          ` : filteredCircuits.map(c => {
            const isSelected = c.id === currentSelectedCircuitId;
            return `
              <div onclick="selectCircuit('${c.id}')" 
                   class="cursor-pointer p-4 rounded-xl transition-all border ${isSelected 
                     ? 'bg-primary-soft/40 border-primary-pastel shadow-sm ring-1 ring-primary-pastel' 
                     : 'bg-white hover:bg-warm-card-alt border-warm-border'}">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="font-mono text-[10px] font-bold text-primary px-1.5 py-0.5 rounded-full bg-white border border-primary-border">${c.code}</span>
                      <span class="text-[10px] text-warm-gray uppercase tracking-wider font-semibold">${c.difficulty}</span>
                    </div>
                    <h3 class="font-heading font-bold text-sm text-warm-charcoal">${c.title}</h3>
                  </div>
                  <span class="material-symbols-outlined text-primary text-[20px]">${isSelected ? 'check_circle' : 'arrow_forward_ios'}</span>
                </div>
                <p class="text-xs text-warm-gray mt-1.5 line-clamp-2">${c.summary}</p>
                <div class="flex items-center gap-3 mt-3 pt-2 border-t border-warm-border-light text-[11px] font-mono text-warm-gray">
                  <span>⚡ ${c.voltage}</span>
                  <span>⏱️ ${c.time}</span>
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
    <div class="bg-white border border-warm-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      <!-- Encabezado con etiquetas -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-warm-border-light">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-xs font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-md border border-primary-border">${circuit.code}</span>
            <span class="text-xs font-medium text-sage-dark bg-sage-soft px-2 py-0.5 rounded-md">Voltaje Recomendado: ${circuit.voltage}</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-heading font-bold text-warm-charcoal">${circuit.title}</h2>
          <p class="text-xs sm:text-sm text-warm-gray mt-1">${circuit.summary}</p>
        </div>
        
        <div class="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span class="px-2.5 py-1 rounded-lg bg-warm-card-alt border border-warm-border text-warm-charcoal font-semibold">
            ⏱️ ${circuit.time}
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-warm-card-alt border border-warm-border text-warm-charcoal font-semibold">
            📊 ${circuit.difficulty}
          </span>
        </div>
      </div>

      <!-- SECCIÓN 1: LISTA DE MATERIALES (BOM) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-heading font-bold text-sm text-warm-charcoal flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
            <span>Componentes Necesarios (Lista de Materiales)</span>
          </h3>
          <span class="text-[11px] font-mono text-warm-gray">${circuit.bom.length} elementos requeridos</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${circuit.bom.map(item => `
            <div class="flex items-start gap-3 p-3 rounded-xl bg-warm-card border border-warm-border/80 hover:bg-white transition-all">
              <div class="w-8 h-8 rounded-lg bg-white border border-warm-border flex items-center justify-center flex-shrink-0 shadow-2xs">
                <span class="material-symbols-outlined text-[18px] ${item.color}">${item.icon}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <h4 class="text-xs font-bold text-warm-charcoal truncate">${item.name}</h4>
                  <span class="font-mono text-[10px] font-bold text-primary bg-primary-soft/80 px-1.5 py-0.5 rounded">${item.qty}</span>
                </div>
                <p class="text-[11px] text-warm-gray mt-0.5 leading-snug">${item.note}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 2: GUÍA DE CONEXIÓN EN PROTOBOARD PASO A PASO -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-heading font-bold text-sm text-warm-charcoal flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-sage-dark">account_tree</span>
            <span>Instrucciones de Conexión Paso a Paso</span>
          </h3>
          <span class="text-[11px] font-mono text-sage-dark font-semibold">Sin soldar | Protoboard</span>
        </div>

        <div class="space-y-2">
          ${circuit.connections.map(c => `
            <div class="flex items-start gap-3 p-3 rounded-xl bg-warm-card-alt/60 border border-warm-border">
              <div class="w-6 h-6 rounded-full bg-primary-pastel text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                ${c.step}
              </div>
              <p class="text-xs text-warm-charcoal leading-relaxed">${c.text}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 3: TABLA RÁPIDA DE PINES Y DESTINOS -->
      <div>
        <h3 class="font-heading font-bold text-sm text-warm-charcoal flex items-center gap-1.5 mb-3">
          <span class="material-symbols-outlined text-[18px] text-lavender-dark">pin</span>
          <span>Resumen Rápido de Terminales / Pines</span>
        </h3>
        
        <div class="overflow-x-auto rounded-xl border border-warm-border">
          <table class="w-full text-left text-xs">
            <thead class="bg-warm-card-alt border-b border-warm-border text-warm-gray font-mono text-[11px]">
              <tr>
                <th class="py-2.5 px-3">Terminal / Pin</th>
                <th class="py-2.5 px-3">¿A dónde se conecta en la protoboard?</th>
                <th class="py-2.5 px-3">Tipo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-warm-border-light bg-white">
              ${circuit.pinoutGuide.map(p => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (p.type === 'positive') badgeColor = 'bg-rose-100 text-rose-700';
                if (p.type === 'negative' || p.type === 'ground') badgeColor = 'bg-blue-100 text-blue-800';
                if (p.type === 'signal') badgeColor = 'bg-amber-100 text-amber-800';
                return `
                  <tr class="hover:bg-warm-card-alt/40 transition-colors">
                    <td class="py-2.5 px-3 font-mono font-bold text-warm-charcoal">${p.pin}</td>
                    <td class="py-2.5 px-3 text-warm-charcoal">${p.connectsTo}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${badgeColor}">
                        ${p.type}
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
      <div class="p-4 rounded-xl bg-alert-soft border border-red-200 flex items-start gap-3">
        <span class="material-symbols-outlined text-alert-red text-[22px] flex-shrink-0 mt-0.5">warning</span>
        <div>
          <h4 class="text-xs font-bold text-alert-red font-heading uppercase tracking-wide">¡Alerta de Seguridad para no quemar piezas!</h4>
          <p class="text-xs text-warm-charcoal mt-1 leading-relaxed">${circuit.warning}</p>
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
