// Renderizador del Buscador de Pinouts Express para ProtoLab
let currentSelectedPinoutId = 'lm7805';
let currentPinoutCategory = 'all';
let currentPinoutSearch = '';

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
                          (comp.typeCategoryLabel && comp.typeCategoryLabel.toLowerCase().includes(currentPinoutSearch.toLowerCase())) ||
                          comp.description.toLowerCase().includes(currentPinoutSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedComp = PINOUTS_DATA.find(c => c.id === currentSelectedPinoutId) || filtered[0] || PINOUTS_DATA[0];

  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- COLUMNA IZQUIERDA: BUSCADOR Y LISTA DE COMPONENTES (4 de 12) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        
        <div class="bg-warm-card-alt p-3 rounded-xl border border-warm-border space-y-2.5">
          <!-- Input de búsqueda -->
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-gray text-[18px]">manage_search</span>
            <input type="text" id="pinout-search-input" value="${currentPinoutSearch}" oninput="onPinoutSearch(this.value)"
                   placeholder="Buscar chip, transistor, sensor..."
                   class="w-full bg-white text-xs text-warm-charcoal pl-8 pr-3 py-2 rounded-lg border border-warm-border focus:outline-none focus:border-primary-pastel transition-all">
          </div>

          <!-- Filtros de categoría ampliados -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
            <button onclick="setPinoutCategory('all')" class="px-2.5 py-1 rounded-lg transition-all ${currentPinoutCategory === 'all' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Todos (${PINOUTS_DATA.length})
            </button>
            <button onclick="setPinoutCategory('regulator')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'regulator' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Reguladores
            </button>
            <button onclick="setPinoutCategory('transistor')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'transistor' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Transistores
            </button>
            <button onclick="setPinoutCategory('opamp')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'opamp' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Op-Amps
            </button>
            <button onclick="setPinoutCategory('timer')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'timer' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              555
            </button>
            <button onclick="setPinoutCategory('sensor')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'sensor' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Sensores
            </button>
            <button onclick="setPinoutCategory('opto')" class="px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${currentPinoutCategory === 'opto' ? 'bg-primary text-white font-bold shadow-xs' : 'bg-white text-warm-gray border border-warm-border hover:bg-warm-card'}">
              Opto / Diodos
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
            let catBadge = 'bg-stone-100 text-stone-700';
            if (c.category === 'regulator') catBadge = 'bg-blue-100 text-blue-800';
            if (c.category === 'transistor') catBadge = 'bg-amber-100 text-amber-800';
            if (c.category === 'opamp') catBadge = 'bg-purple-100 text-purple-700';
            if (c.category === 'timer') catBadge = 'bg-emerald-100 text-emerald-800';
            if (c.category === 'sensor') catBadge = 'bg-cyan-100 text-cyan-800';
            if (c.category === 'opto' || c.category === 'diode') catBadge = 'bg-rose-100 text-rose-800';

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
                  <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${catBadge}">
                    ${c.category.toUpperCase()}
                  </span>
                </div>
                <p class="text-xs font-heading font-bold text-warm-charcoal mt-1.5">${c.fullName}</p>
                <p class="text-[11px] text-primary font-medium mt-0.5 line-clamp-1">${c.typeCategoryLabel || ''}</p>
                <div class="mt-2 text-[10px] font-mono text-warm-gray truncate">
                  ⚡ ${c.voltages.typ}
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
          
          <!-- Encabezado con Identificación Explícita de Tipo de Componente -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-warm-border-light">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="font-mono text-sm font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-md border border-primary-border">${selectedComp.name}</span>
                <span class="font-mono text-xs px-2 py-0.5 rounded bg-warm-card-alt border border-warm-border text-warm-charcoal font-semibold">${selectedComp.package}</span>
                <span class="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-sage-soft text-sage-dark font-bold border border-sage/40">${selectedComp.typeCategoryLabel}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-heading font-bold text-warm-charcoal">${selectedComp.fullName}</h2>
              <p class="text-xs sm:text-sm text-warm-gray mt-1 leading-relaxed">${selectedComp.description}</p>
            </div>
            
            <div class="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs bg-sage-soft px-3 py-1.5 rounded-xl border border-sage/40 text-sage-dark font-bold shrink-0">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Datos Verificados</span>
            </div>
          </div>

          <!-- RANGOS DE VOLTAJE DE OPERACIÓN -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-xl bg-warm-card border border-warm-border">
              <span class="text-[10px] font-mono text-warm-gray uppercase block font-semibold">Voltaje Mínimo</span>
              <span class="font-mono text-sm sm:text-base font-bold text-warm-charcoal mt-1 block">${selectedComp.voltages.min}</span>
              <span class="text-[10px] text-warm-gray">Para funcionamiento</span>
            </div>
            <div class="p-3.5 rounded-xl bg-warm-card border border-warm-border">
              <span class="text-[10px] font-mono text-warm-gray uppercase block font-semibold">Voltaje Típico en Lab</span>
              <span class="font-mono text-sm sm:text-base font-bold text-sage-dark mt-1 block">${selectedComp.voltages.typ}</span>
              <span class="text-[10px] text-warm-gray">Recomendado para prácticas</span>
            </div>
            <div class="p-3.5 rounded-xl bg-alert-soft/50 border border-red-200">
              <span class="text-[10px] font-mono text-alert-red uppercase block font-semibold">Máximo Absoluto (Límite)</span>
              <span class="font-mono text-sm sm:text-base font-bold text-alert-red mt-1 block">${selectedComp.voltages.maxAbs}</span>
              <span class="text-[10px] text-alert-red font-medium">¡Por encima se quema!</span>
            </div>
          </div>

          <!-- ALERTA DE SEGURIDAD DEL COMPONENTE -->
          <div class="p-3 rounded-xl bg-warm-card-alt border border-warm-border text-xs flex items-center gap-2 text-warm-charcoal">
            <span class="material-symbols-outlined text-primary text-[18px] shrink-0">info</span>
            <span><strong>Regla de oro:</strong> ${selectedComp.voltages.warning}</span>
          </div>

          <!-- DIAGRAMA VISUAL DEL ENCAPSULADO Y PINES (PINOUT) -->
          <div class="bg-warm-card-alt p-5 rounded-2xl border border-warm-border space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[17px] text-primary">schema</span>
                <span>Diagrama Físico de Pines (Pinout)</span>
              </h3>
              <span class="text-[11px] font-mono text-warm-gray">Identificación de Terminales</span>
            </div>

            <!-- RENDERIZADO VISUAL SEGÚN ENCAPSULADO (TO-220, TO-92, DIP-8, DIP-6, DO-41) -->
            ${renderPhysicalComponentDiagram(selectedComp)}

          </div>

          <!-- LISTA DETALLADA DE PINES Y EXPLICACIÓN DE USO EN LAB -->
          <div>
            <h3 class="font-heading font-bold text-sm text-warm-charcoal mb-3 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-primary">pin</span>
              <span>Función de cada Terminal en la Protoboard</span>
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
                        <span class="font-mono text-xs font-bold w-6 h-6 rounded-md bg-warm-charcoal text-white flex items-center justify-center shrink-0">${pin.num}</span>
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

// Renderiza el gráfico interactivo del encapsulado según su tipo
function renderPhysicalComponentDiagram(comp) {
  // CASO 1: REGULADOR LINEAL TO-220 (LM7805, LM7812)
  if (comp.package === 'TO-220') {
    return `
      <div class="py-6 flex flex-col items-center justify-center select-none bg-white rounded-xl border border-warm-border p-4 shadow-2xs">
        <div class="text-center mb-4">
          <span class="font-mono text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-md border border-primary-border">
            VISTA FRONTAL (Aleta metálica atrás, letras hacia ti)
          </span>
          <p class="text-[11px] text-warm-gray mt-1">Con los pines apuntando hacia abajo: Pin 1 (Izquierda), Pin 2 (Centro), Pin 3 (Derecha)</p>
        </div>

        <div class="relative flex flex-col items-center">
          <!-- Aleta metálica superior con orificio para disipador -->
          <div class="w-36 h-14 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400 rounded-t-lg border border-stone-400 flex items-center justify-center relative shadow-xs">
            <div class="w-7 h-7 rounded-full bg-warm-card border-2 border-stone-500 shadow-inner flex items-center justify-center" title="Orificio para fijar disipador de calor de aluminio">
              <span class="w-2 h-2 rounded-full bg-stone-400"></span>
            </div>
          </div>

          <!-- Cuerpo plástico negro del TO-220 -->
          <div class="w-40 h-24 bg-[#1F2024] rounded-b-md border border-stone-700 flex flex-col items-center justify-between shadow-md relative z-10 p-2.5">
            <div class="w-full flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>TO-220</span>
              <span class="text-sage-soft font-bold">1.0A REGULADO</span>
            </div>
            <!-- Grabado frontal -->
            <div class="text-center my-auto">
              <span class="font-mono text-sm font-bold text-white tracking-widest block">${comp.name}</span>
              <span class="font-mono text-[9px] text-stone-300">REGULADOR LINEAL</span>
            </div>
            <div class="w-full text-center text-[8px] font-mono text-stone-500">
              ProtoLab Lab Standard
            </div>
          </div>

          <!-- 3 Patas metálicas separadas con identificación visual directa -->
          <div class="flex items-start justify-between w-36 gap-6 pt-0">
            <!-- Pin 1: IN -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-3 h-16 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-300 rounded-b shadow-xs"></div>
              <div class="mt-2 text-center">
                <span class="w-6 h-6 rounded-full bg-rose-500 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto shadow-xs">1</span>
                <span class="font-mono text-xs font-bold text-rose-700 block mt-1">IN</span>
                <span class="font-mono text-[10px] text-warm-charcoal font-semibold block">Entrada</span>
                <span class="font-mono text-[9px] text-warm-gray block">Vin (+V)</span>
              </div>
            </div>

            <!-- Pin 2: GND -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-3 h-16 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-300 rounded-b shadow-xs"></div>
              <div class="mt-2 text-center">
                <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto shadow-xs">2</span>
                <span class="font-mono text-xs font-bold text-blue-700 block mt-1">GND</span>
                <span class="font-mono text-[10px] text-warm-charcoal font-semibold block">Tierra</span>
                <span class="font-mono text-[9px] text-warm-gray block">Masa (0V)</span>
              </div>
            </div>

            <!-- Pin 3: OUT -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-3 h-16 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-300 rounded-b shadow-xs"></div>
              <div class="mt-2 text-center">
                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto shadow-xs">3</span>
                <span class="font-mono text-xs font-bold text-emerald-700 block mt-1">OUT</span>
                <span class="font-mono text-[10px] text-warm-charcoal font-semibold block">Salida</span>
                <span class="font-mono text-[9px] text-warm-gray block">Vout limpia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // CASO 2: TRANSISTORES Y SENSORES TO-92 (2N2222A, BC547, LM35)
  if (comp.package === 'TO-92') {
    return `
      <div class="py-6 flex flex-col items-center justify-center select-none bg-white rounded-xl border border-warm-border p-4 shadow-2xs">
        <div class="text-center mb-4">
          <span class="font-mono text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-md border border-primary-border">
            VISTA FRONTAL (Cara plana hacia ti, letras legibles de frente)
          </span>
          <p class="text-[11px] text-warm-gray mt-1">Mirando la superficie plana con las patas hacia abajo</p>
        </div>

        <div class="relative flex flex-col items-center">
          <!-- Cuerpo D-Shape del TO-92 -->
          <div class="relative w-36 h-24 bg-[#23252A] rounded-t-3xl border-t-2 border-x-2 border-stone-600 flex flex-col items-center justify-between shadow-md p-2.5">
            <!-- Curva trasera que simula el semicilindro -->
            <div class="absolute -top-2 left-2 right-2 h-3 bg-stone-700/50 rounded-t-full -z-10"></div>
            
            <div class="w-full flex items-center justify-between text-[8px] font-mono text-stone-400">
              <span>TO-92</span>
              <span>CARA PLANA</span>
            </div>

            <!-- Grabado del chip -->
            <div class="text-center my-auto">
              <span class="font-mono text-sm font-bold text-white tracking-wider block">${comp.name}</span>
              <span class="font-mono text-[9px] text-stone-300 font-medium">${comp.typeCategoryLabel.split('(')[0]}</span>
            </div>

            <div class="w-full text-center text-[8px] font-mono text-stone-500">
              Frente plano
            </div>
          </div>

          <!-- 3 Patas del TO-92 -->
          <div class="flex items-start justify-between w-36 gap-4 pt-0">
            ${comp.pins.map(p => `
              <div class="flex flex-col items-center flex-1">
                <div class="w-2.5 h-16 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-300 rounded-b shadow-xs"></div>
                <div class="mt-2 text-center">
                  <span class="w-6 h-6 rounded-full bg-warm-charcoal text-white font-mono text-xs font-bold flex items-center justify-center mx-auto shadow-xs">${p.num}</span>
                  <span class="font-mono text-xs font-bold text-primary block mt-1">${p.name.split(' ')[0]}</span>
                  <span class="font-mono text-[9px] text-warm-gray block max-w-[80px] leading-tight">${p.role.split('(')[0]}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${comp.id === 'bc547' ? `
          <div class="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-center max-w-md">
            <span class="font-mono text-xs font-bold text-amber-800 block">⚠️ ¡Diferencia con el transistor 2N2222!</span>
            <p class="text-[11px] text-warm-charcoal mt-0.5">El BC547 europeo tiene orden <strong>Pin 1: Colector, Pin 2: Base, Pin 3: Emisor</strong> (al contrario que el 2N2222 que empieza por Emisor).</p>
          </div>
        ` : ''}

        ${comp.id === '2n2222' ? `
          <div class="mt-5 p-3 rounded-xl bg-sage-soft border border-sage/40 text-center max-w-md">
            <span class="font-mono text-xs font-bold text-sage-dark block">✓ Conexión estándar de laboratorio (E - B - C)</span>
            <p class="text-[11px] text-warm-charcoal mt-0.5">Pin 1: Emisor a masa, Pin 2: Base con resistor de 1kΩ, Pin 3: Colector hacia la carga.</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  // CASO 3: DIODO RECTIFICADOR DO-41 (1N4007)
  if (comp.package === 'DO-41') {
    return `
      <div class="py-6 flex flex-col items-center justify-center select-none bg-white rounded-xl border border-warm-border p-4 shadow-2xs">
        <div class="text-center mb-4">
          <span class="font-mono text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-md border border-primary-border">
            ENCAPSULADO DO-41 (Diodo de silicio)
          </span>
          <p class="text-[11px] text-warm-gray mt-1">La banda plateada indica SIEMPRE el terminal Cátodo (-)</p>
        </div>

        <div class="flex items-center justify-center gap-1 my-5 overflow-x-auto max-w-full">
          <!-- Pata izquierda (Ánodo) -->
          <div class="w-16 sm:w-20 h-2.5 bg-gradient-to-b from-stone-300 via-stone-100 to-stone-400 rounded-l-full shadow-inner"></div>
          
          <!-- Cuerpo del diodo cilíndrico negro con franja plateada -->
          <div class="relative w-48 h-16 bg-[#1A1C20] rounded-lg border border-stone-700 flex items-center justify-between shadow-md overflow-hidden">
            <!-- Grabado cuerpo liso -->
            <div class="pl-4 flex flex-col justify-center">
              <span class="font-mono text-xs font-bold text-white tracking-widest">1N4007</span>
              <span class="font-mono text-[9px] text-stone-400">RECTIFICADOR // 1A</span>
            </div>
            <!-- Franja Plateada de Cátodo -->
            <div class="w-10 h-full bg-gradient-to-r from-stone-300 via-stone-100 to-stone-400 shadow-md flex items-center justify-center">
              <span class="font-mono text-[9px] font-bold text-stone-800 rotate-90 uppercase tracking-wider">Cátodo</span>
            </div>
          </div>

          <!-- Pata derecha (Cátodo) -->
          <div class="w-16 sm:w-20 h-2.5 bg-gradient-to-b from-stone-300 via-stone-100 to-stone-400 rounded-r-full shadow-inner"></div>
        </div>

        <!-- Identificación terminales -->
        <div class="flex items-center justify-between w-64 sm:w-80 text-xs font-mono font-bold mt-2">
          <div class="text-left">
            <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">Ánodo (+)</span>
            <span class="text-[10px] text-warm-gray font-normal block mt-1">Sin franja (Pata 1)</span>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">Cátodo (-)</span>
            <span class="text-[10px] text-warm-gray font-normal block mt-1">Lado con franja plateada (Pata 2)</span>
          </div>
        </div>
      </div>
    `;
  }

  // CASO 4: OPTOACOPLADOR DIP-6 (4N35)
  if (comp.package === 'DIP-6') {
    const leftPins = comp.pins.filter(p => p.num <= 3);
    const rightPins = comp.pins.filter(p => p.num >= 4).sort((a,b) => b.num - a.num);

    return `
      <div class="py-4 flex items-center justify-center overflow-x-auto select-none bg-white rounded-xl border border-warm-border p-4 shadow-2xs">
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- LADO IZQUIERDO: PINES 1 A 3 (Entrada Óptica) -->
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

          <!-- CUERPO CENTRAL DIP-6 -->
          <div class="w-24 sm:w-28 h-44 bg-[#2B2D33] text-stone-300 rounded-xl border border-stone-600 flex flex-col items-center justify-between py-3 px-2 shadow-md relative">
            <div class="flex flex-col items-center w-full">
              <div class="w-6 h-3 bg-stone-800 rounded-b-full border-b border-stone-600"></div>
              <div class="w-full flex items-center justify-between px-2 mt-1">
                <div class="w-2.5 h-2.5 rounded-full bg-stone-400/50 border border-stone-300" title="Punto indicador Pin 1"></div>
                <span class="font-mono text-[8px] text-stone-400 font-bold">${comp.name}</span>
              </div>
            </div>

            <div class="flex flex-col items-center text-center my-auto">
              <span class="material-symbols-outlined text-stone-400 text-[22px]">visibility</span>
              <span class="font-mono font-bold text-xs text-white tracking-widest mt-1">${comp.name}</span>
              <span class="font-mono text-[9px] text-stone-400">OPTO-DIP6</span>
            </div>

            <div class="text-[8px] font-mono text-stone-500">
              Aislamiento
            </div>
          </div>

          <!-- LADO DERECHO: PINES 6 A 4 (Salida Fototransistor) -->
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
  }

  // CASO 5: INTEGRADOS DIP-8 (LM741, NE555, LM358)
  const leftPins = comp.pins.filter(p => p.num <= 4);
  const rightPins = comp.pins.filter(p => p.num >= 5).sort((a,b) => b.num - a.num);

  return `
    <div class="py-4 flex items-center justify-center overflow-x-auto select-none bg-white rounded-xl border border-warm-border p-4 shadow-2xs">
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
