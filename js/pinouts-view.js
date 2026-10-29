// Renderizador del Buscador de Pinouts Express para ProtoLab
let currentSelectedPinoutId = 'lm741';
let currentPinoutCategory = 'all';
let currentPinoutSearch = '';
let activeInspectedPin = null;

function initPinoutsView() {
  renderPinoutsView();
}

function renderPinoutsView() {
  const container = document.getElementById('pinouts-container');
  if (!container) return;

  const filtered = PINOUTS_DATA.filter(comp => {
    const matchesCategory = currentPinoutCategory === 'all' || comp.category === currentPinoutCategory;
    const matchesSearch = comp.name.toLowerCase().includes(currentPinoutSearch.toLowerCase()) ||
                          comp.fullName.toLowerCase().includes(currentPinoutSearch.toLowerCase()) ||
                          comp.description.toLowerCase().includes(currentPinoutSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedComp = PINOUTS_DATA.find(c => c.id === currentSelectedPinoutId) || PINOUTS_DATA[0];

  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- COLUMNA IZQUIERDA: BUSCADOR Y LISTA DE COMPONENTES (4 de 12) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        
        <div class="bg-warm-card-alt p-3 rounded-xl border border-warm-border space-y-2.5">
          <!-- Input de búsqueda -->
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-gray text-[18px]">manage_search</span>
            <input type="text" id="pinout-search-input" value="${currentPinoutSearch}" oninput="onPinoutSearch(this.value)"
                   placeholder="Buscar chip (LM741, 555, 7805)..."
                   class="w-full bg-white text-xs text-warm-charcoal pl-8 pr-3 py-2 rounded-lg border border-warm-border focus:outline-none focus:border-primary-pastel transition-all">
          </div>

          <!-- Filtros de categoría -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
            <button onclick="setPinoutCategory('all')" class="px-2.5 py-1 rounded-lg transition-all ${currentPinoutCategory === 'all' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Todos (${PINOUTS_DATA.length})
            </button>
            <button onclick="setPinoutCategory('opamp')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'opamp' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Op-Amps
            </button>
            <button onclick="setPinoutCategory('timer')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'timer' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              555
            </button>
            <button onclick="setPinoutCategory('regulator')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'regulator' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Reguladores
            </button>
            <button onclick="setPinoutCategory('transistor')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'transistor' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Transistores
            </button>
          </div>
        </div>

        <!-- Lista de Componentes -->
        <div class="flex flex-col gap-2">
          ${filtered.length === 0 ? `
            <div class="p-6 text-center text-warm-gray text-xs bg-warm-card rounded-xl border border-warm-border">
              No se encontró ningún componente con ese término.
            </div>
          ` : filtered.map(c => {
            const isSelected = c.id === selectedComp.id;
            return `
              <div onclick="selectPinout('${c.id}')"
                   class="cursor-pointer p-3.5 rounded-xl transition-all border ${isSelected
                     ? 'bg-primary-soft/40 border-primary-pastel shadow-sm ring-1 ring-primary-pastel'
                     : 'bg-white hover:bg-warm-card-alt border-warm-border'}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-warm-border text-warm-charcoal">${c.name}</span>
                    <span class="font-mono text-[10px] text-warm-gray">${c.package}</span>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${c.category === 'opamp' ? 'bg-purple-100 text-purple-700' : c.category === 'timer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                    ${c.category.toUpperCase()}
                  </span>
                </div>
                <p class="text-xs font-heading font-medium text-warm-charcoal mt-1.5">${c.fullName}</p>
                <div class="mt-2 text-[10px] font-mono text-warm-gray truncate">
                  ⚡ V_typ: <strong class="text-warm-charcoal">${c.voltages.typ}</strong>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- COLUMNA DERECHA: VISOR GRÁFICO DEL CHIP Y VOLTAJES (8 de 12) -->
      <div class="lg:col-span-8 flex flex-col gap-5">
        
        <!-- Tarjeta del Componente -->
        <div class="bg-white border border-warm-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          
          <!-- Encabezado -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-warm-border-light">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono text-sm font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-md border border-primary-border">${selectedComp.name}</span>
                <span class="font-mono text-xs px-2 py-0.5 rounded bg-warm-card-alt border border-warm-border text-warm-gray">${selectedComp.package}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-heading font-bold text-warm-charcoal">${selectedComp.fullName}</h2>
              <p class="text-xs sm:text-sm text-warm-gray mt-1">${selectedComp.description}</p>
            </div>
            
            <div class="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs bg-sage-soft px-3 py-1.5 rounded-xl border border-sage/40 text-sage-dark font-bold">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Datos Rápidos Verificados</span>
            </div>
          </div>

          <!-- RANGOS DE VOLTAJE DE OPERACIÓN (Sin abrir PDF de 40 páginas) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-xl bg-warm-card border border-warm-border">
              <span class="text-[10px] font-mono text-warm-gray uppercase block font-semibold">Voltaje Mínimo</span>
              <span class="font-mono text-lg font-bold text-warm-charcoal mt-1 block">${selectedComp.voltages.min}</span>
              <span class="text-[10px] text-warm-gray">Para encender</span>
            </div>
            <div class="p-3.5 rounded-xl bg-warm-card border border-warm-border">
              <span class="text-[10px] font-mono text-warm-gray uppercase block font-semibold">Voltaje Típico en Lab</span>
              <span class="font-mono text-lg font-bold text-sage-dark mt-1 block">${selectedComp.voltages.typ}</span>
              <span class="text-[10px] text-warm-gray">Recomendado para prácticas</span>
            </div>
            <div class="p-3.5 rounded-xl bg-alert-soft/50 border border-red-200">
              <span class="text-[10px] font-mono text-alert-red uppercase block font-semibold">Máximo Absoluto (Límite)</span>
              <span class="font-mono text-lg font-bold text-alert-red mt-1 block">${selectedComp.voltages.maxAbs}</span>
              <span class="text-[10px] text-alert-red font-medium">¡Por encima se quema!</span>
            </div>
          </div>

          <!-- ALERTA DE VOLTAJE -->
          <div class="p-3 rounded-xl bg-warm-card-alt border border-warm-border text-xs flex items-center gap-2 text-warm-charcoal">
            <span class="material-symbols-outlined text-primary text-[18px]">info</span>
            <span><strong>Regla de oro:</strong> ${selectedComp.voltages.warning}</span>
          </div>

          <!-- DIAGRAMA VISUAL DEL CHIP INTEGRADO -->
          <div class="bg-warm-card-alt p-5 rounded-2xl border border-warm-border space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[17px] text-primary">schema</span>
                <span>Diagrama Físico de Pines (Pinout)</span>
              </h3>
              <span class="text-[11px] font-mono text-warm-gray">Vista superior</span>
            </div>

            <!-- RENDERIZADO SEGÚN ENCAPSULADO (DIP-8 o TRANSISTOR) -->
            ${renderPhysicalChipDiagram(selectedComp)}

          </div>

          <!-- LISTA DETALLADA DE PINES Y EXPLICACIÓN -->
          <div>
            <h3 class="font-heading font-bold text-sm text-warm-charcoal mb-3 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-primary">pin</span>
              <span>Función de cada Pin en el Laboratorio</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${selectedComp.pins.map(pin => {
                let badgeClass = 'bg-stone-100 text-stone-700 border-stone-200';
                if (pin.type === 'positive') badgeClass = 'bg-rose-100 text-rose-700 border-rose-200';
                if (pin.type === 'negative' || pin.type === 'ground') badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                if (pin.type === 'signal') badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';

                return `
                  <div class="p-3 rounded-xl bg-white border border-warm-border space-y-1 hover:border-primary-pastel transition-all">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-xs font-bold w-6 h-6 rounded-md bg-warm-charcoal text-white flex items-center justify-center">${pin.num}</span>
                        <span class="font-mono text-xs font-bold text-warm-charcoal">${pin.name}</span>
                      </div>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${badgeClass}">
                        ${pin.role}
                      </span>
                    </div>
                    <p class="text-[11px] text-warm-gray leading-relaxed pl-7">${pin.desc}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;

  container.innerHTML = html;
}

// Renderiza el gráfico interactivo del encapsulado DIP-8 o TO-220/TO-92
function renderPhysicalChipDiagram(comp) {
  if (comp.package === 'DIP-8') {
    const leftPins = comp.pins.filter(p => p.num <= 4);
    const rightPins = comp.pins.filter(p => p.num >= 5).sort((a,b) => b.num - a.num); // 8, 7, 6, 5

    return `
      <div class="py-4 flex items-center justify-center overflow-x-auto select-none">
        <div class="flex items-center gap-2 sm:gap-4">
          
          <!-- LADO IZQUIERDO: PINES 1 A 4 -->
          <div class="flex flex-col gap-3 text-right">
            ${leftPins.map(p => `
              <div class="flex items-center justify-end gap-2 group cursor-pointer" title="${p.name}: ${p.role}">
                <div class="flex flex-col">
                  <span class="font-mono text-xs font-bold text-warm-charcoal">${p.name}</span>
                  <span class="font-mono text-[9px] text-warm-gray uppercase">${p.role}</span>
                </div>
                <div class="w-6 sm:w-8 h-2.5 rounded-l bg-stone-300 group-hover:bg-primary-pastel transition-colors"></div>
                <span class="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-warm-border text-warm-charcoal shadow-2xs">${p.num}</span>
              </div>
            `).join('')}
          </div>

          <!-- CUERPO CENTRAL DIP-8 -->
          <div class="w-24 sm:w-28 h-56 bg-[#2B2D33] text-stone-300 rounded-xl border border-stone-600 flex flex-col items-center justify-between py-3 px-2 shadow-md relative">
            <!-- Muesca superior (Notch) y Punto de Pin 1 -->
            <div class="flex flex-col items-center w-full">
              <div class="w-6 h-3 bg-stone-800 rounded-b-full border-b border-stone-600"></div>
              <div class="w-full flex items-center justify-between px-2 mt-1">
                <div class="w-2.5 h-2.5 rounded-full bg-stone-400/50 border border-stone-300" title="Punto indicador Pin 1"></div>
                <span class="font-mono text-[8px] text-stone-400 font-bold tracking-wider">${comp.name}</span>
              </div>
            </div>

            <!-- Grabado láser del chip -->
            <div class="flex flex-col items-center text-center my-auto">
              <span class="material-symbols-outlined text-stone-400 text-[24px]">memory</span>
              <span class="font-mono font-bold text-xs text-white tracking-widest mt-1">${comp.name}</span>
              <span class="font-mono text-[9px] text-stone-400">DIP-8</span>
            </div>

            <!-- Marca inferior -->
            <div class="text-[8px] font-mono text-stone-500">
              ProtoLab Lab
            </div>
          </div>

          <!-- LADO DERECHO: PINES 8 A 5 -->
          <div class="flex flex-col gap-3 text-left">
            ${rightPins.map(p => `
              <div class="flex items-center justify-start gap-2 group cursor-pointer" title="${p.name}: ${p.role}">
                <span class="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-warm-border text-warm-charcoal shadow-2xs">${p.num}</span>
                <div class="w-6 sm:w-8 h-2.5 rounded-r bg-stone-300 group-hover:bg-primary-pastel transition-colors"></div>
                <div class="flex flex-col">
                  <span class="font-mono text-xs font-bold text-warm-charcoal">${p.name}</span>
                  <span class="font-mono text-[9px] text-warm-gray uppercase">${p.role}</span>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </div>
    `;
  } else {
    // Encapsulados de 3 pines (TO-220 o TO-92)
    return `
      <div class="py-6 flex flex-col items-center justify-center select-none">
        <div class="p-4 rounded-2xl bg-white border border-warm-border shadow-xs max-w-sm w-full space-y-4">
          <div class="text-center">
            <span class="font-mono text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-md border border-primary-border">
              Encapsulado ${comp.package}
            </span>
            <p class="text-xs text-warm-gray mt-1">Mirando el componente de frente con las patas hacia abajo</p>
          </div>

          <div class="flex items-center justify-center gap-4 py-3">
            ${comp.pins.map(p => `
              <div class="flex flex-col items-center gap-1.5">
                <span class="font-mono text-xs font-bold text-warm-charcoal">${p.name}</span>
                <div class="w-3 h-12 bg-stone-300 rounded-b shadow-inner"></div>
                <span class="w-6 h-6 rounded-full bg-warm-charcoal text-white font-mono text-xs font-bold flex items-center justify-center shadow-2xs">
                  ${p.num}
                </span>
                <span class="text-[10px] font-mono text-warm-gray text-center">${p.role}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

// Controladores
function selectPinout(id) {
  currentSelectedPinoutId = id;
  renderPinoutsView();
}

function setPinoutCategory(cat) {
  currentPinoutCategory = cat;
  renderPinoutsView();
}

function onPinoutSearch(q) {
  currentPinoutSearch = q;
  renderPinoutsView();
}
