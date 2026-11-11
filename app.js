const slides = [...document.querySelectorAll('.slide')];
let current = 0;
const counter = document.getElementById('counter');
const progressBar = document.getElementById('progressBar');
const toc = document.getElementById('toc');
const tocList = document.getElementById('tocList');

function showSlide(index){
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((s,i)=>s.classList.toggle('active', i===current));
  counter.textContent = `${current+1} / ${slides.length}`;
  progressBar.style.width = `${((current+1)/slides.length)*100}%`;
  [...tocList.children].forEach((b,i)=>b.classList.toggle('active',i===current));
  history.replaceState(null,'',`#${current+1}`);
}
function next(){ showSlide(current+1) } function prev(){ showSlide(current-1) }
document.getElementById('next').onclick = next;
document.getElementById('prev').onclick = prev;
document.addEventListener('keydown',e=>{
  if(imageViewer?.classList.contains('open')){
    if(e.key==='Escape') closeImageViewer();
    if(e.key==='ArrowRight'){e.preventDefault();stepImageViewer(1);}
    if(e.key==='ArrowLeft'){e.preventDefault();stepImageViewer(-1);}
    return;
  }
  if(document.querySelector('.modal.open')){ if(e.key==='Escape') closeCatalog(); return; }
  if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();next();}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev();}
  if(e.key==='Home')showSlide(0); if(e.key==='End')showSlide(slides.length-1);
  if(e.key==='Escape' && toc.classList.contains('open')) toc.classList.remove('open');
});
slides.forEach((s,i)=>{
  const b=document.createElement('button'); b.innerHTML=`<b>${String(i+1).padStart(2,'0')}</b><span>${s.dataset.title||'Diapositiva'}</span>`;
  b.onclick=()=>{showSlide(i);toc.classList.remove('open')};tocList.appendChild(b);
});
document.getElementById('tocBtn').onclick=()=>toc.classList.toggle('open');
document.getElementById('tocClose').onclick=()=>toc.classList.remove('open');
document.getElementById('fullBtn').onclick=()=> document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
const hash = parseInt(location.hash.replace('#',''),10); if(hash) current=Math.min(slides.length-1,Math.max(0,hash-1)); showSlide(current);


// Visor ampliado para diagramas, evidencias y capturas
const imageViewer = document.getElementById('imageViewer');
const imageViewerImg = document.getElementById('imageViewerImg');
const imageViewerTitle = document.getElementById('imageViewerTitle');
const imageViewerClose = document.getElementById('imageViewerClose');
const imageViewerPrev = document.getElementById('imageViewerPrev');
const imageViewerNext = document.getElementById('imageViewerNext');
let viewerImages = [];
let viewerIndex = 0;

function getZoomableImages(){
  return [...document.querySelectorAll('.slide img')].filter(img => !img.src.includes('/brand/'));
}

function imageLabel(img){
  const figure = img.closest('figure');
  const caption = figure?.querySelector('figcaption')?.textContent?.trim();
  return caption || img.alt || 'Imagen de la presentación';
}

function openImageViewer(img){
  const activeSlide = img.closest('.slide');
  viewerImages = [...activeSlide.querySelectorAll('img')].filter(item => !item.src.includes('/brand/'));
  viewerIndex = Math.max(0, viewerImages.indexOf(img));
  renderImageViewer();
  imageViewer.classList.add('open');
  imageViewer.setAttribute('aria-hidden','false');
  document.body.classList.add('viewer-open');
}

function renderImageViewer(){
  const img = viewerImages[viewerIndex];
  if(!img) return;
  imageViewerImg.src = img.currentSrc || img.src;
  imageViewerImg.alt = img.alt || '';
  imageViewerTitle.textContent = imageLabel(img);
  const multiple = viewerImages.length > 1;
  imageViewerPrev.hidden = !multiple;
  imageViewerNext.hidden = !multiple;
}

function stepImageViewer(delta){
  if(viewerImages.length < 2) return;
  viewerIndex = (viewerIndex + delta + viewerImages.length) % viewerImages.length;
  renderImageViewer();
}

function closeImageViewer(){
  imageViewer.classList.remove('open');
  imageViewer.setAttribute('aria-hidden','true');
  document.body.classList.remove('viewer-open');
  setTimeout(()=>{ if(!imageViewer.classList.contains('open')) imageViewerImg.src=''; },180);
}

getZoomableImages().forEach(img=>{
  img.classList.add('zoomable-image');
  img.setAttribute('tabindex','0');
  img.setAttribute('role','button');
  img.setAttribute('aria-label',`${imageLabel(img)}. Abrir imagen completa`);
  img.addEventListener('click',()=>openImageViewer(img));
  img.addEventListener('keydown',e=>{
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openImageViewer(img); }
  });
});

imageViewerClose.onclick = closeImageViewer;
imageViewerPrev.onclick = ()=>stepImageViewer(-1);
imageViewerNext.onclick = ()=>stepImageViewer(1);
imageViewer.addEventListener('click',e=>{ if(e.target===imageViewer) closeImageViewer(); });
imageViewerImg.addEventListener('click',e=>e.stopPropagation());

// Air particles
const canvas=document.getElementById('airfield'),ctx=canvas.getContext('2d'); let particles=[];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);particles=Array.from({length:Math.min(70,Math.floor(innerWidth/20))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.8+.4,vx:Math.random()*.18+.03,vy:(Math.random()-.5)*.12,a:Math.random()*.35+.08}))}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x>innerWidth+10)p.x=-10;if(p.y<0)p.y=innerHeight;if(p.y>innerHeight)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(81,222,235,${p.a})`;ctx.fill()}requestAnimationFrame(draw)}
addEventListener('resize',resize);resize();draw();

const FUNCTIONS = [
['main.py','quitar_tildes(texto)','Normaliza nombres de ciudad a minúsculas y elimina tildes para comparar textos de forma estable.'],
['main.py','ciudad_valida(ciudad)','Valida que la ciudad exista como texto y solo contenga letras, espacios, guion o apóstrofe.'],
['main.py','coincide_ciudad(lugar, ciudad)','Compara la localidad de OpenAQ con la ciudad solicitada después de normalizar ambos textos.'],
['main.py','normalizar_ubicacion(lugar)','Reduce el JSON de una estación a id, ciudad, nombre, fuente y coordenadas útiles para el frontend.'],
['main.py','crudas_desde_lectura(lugar, lecturas)','Relaciona sensores con lecturas y construye mediciones crudas solo para PM2.5, NO₂ y O₃.'],
['main.py','armar_consulta(ciudad, mediciones)','Construye la respuesta final: ciudad, fecha, fuente, mediciones, AQI EPA y referencia OMS.'],
['main.py','consultar_ciudad(cliente, ciudad)','Orquesta búsqueda de ubicaciones, últimas lecturas, normalización y armado de la consulta.'],
['main.py','crear_app(...)','Crea la app Flask, configura CORS, carga .env y conecta cliente OpenAQ con almacenamiento.'],
['main.py','salud()','Endpoint GET /salud. Reporta estado, versión y si la clave OpenAQ está configurada.'],
['main.py','ubicaciones()','Endpoint GET /ubicaciones. Valida ciudad, consulta OpenAQ y devuelve estaciones encontradas.'],
['main.py','consultar()','Endpoint POST /consultar. Procesa JSON, controla errores, guarda consulta y devuelve resultados.'],
['main.py','historial()','Endpoint GET /historial. Devuelve consultas guardadas, de la más reciente a la más antigua.'],
['main.py','historial_borrar()','Endpoint DELETE /historial. Limpia historial y devuelve cuántos registros se eliminaron.'],
['main.py','historial_descargar()','Endpoint GET /historial/descargar. Genera una respuesta CSV descargable.'],
['main.py','historial_mediciones()','Endpoint GET /historial/mediciones. Aplica filtros por estación, contaminante y fechas.'],
['main.py','_filtros_historial()','Centraliza lectura y validación de filtros usados por los reportes.'],
['main.py','reportes_grafica()','Endpoint GET /reportes/grafica. Genera PNG del historial con Matplotlib.'],
['main.py','reportes_estadisticas()','Endpoint GET /reportes/estadisticas. Genera estadísticas y gráfica con pandas/Matplotlib.'],
['main.py','servir_grafica(nombre)','Entrega desde Flask los PNG guardados en backend/static/graficas.'],
['cliente_openaq.py','ErrorOpenAQ','Excepción propia para traducir fallos de red o de la API a errores controlados del sistema.'],
['cliente_openaq.py','ClienteOpenAQ.__init__()','Carga API key, timeout y una sesión HTTP reutilizable con requests.Session().'],
['cliente_openaq.py','_encabezados()','Construye X-API-Key y Accept. Falla de forma explícita si falta la credencial.'],
['cliente_openaq.py','obtener(ruta, params)','Hace GET, controla timeout/HTTP/JSON y garantiza que exista una lista results.'],
['cliente_openaq.py','obtener_todo(ruta, params)','Implementa paginación acumulando páginas hasta completar resultados o alcanzar el límite.'],
['cliente_openaq.py','buscar_ubicaciones(iso)','Consulta /locations de OpenAQ para el país indicado; el proyecto usa CO.'],
['cliente_openaq.py','ultima_lectura(ubicacion_id)','Consulta /locations/{id}/latest y devuelve las últimas lecturas de una estación.'],
['normalizacion.py','parsear_fecha(valor)','Convierte ISO-8601 a datetime UTC; devuelve None si la fecha es inválida o carece de zona.'],
['normalizacion.py','_fecha_iso(fecha)','Devuelve la fecha UTC en formato YYYY-MM-DDTHH:MM:SSZ.'],
['normalizacion.py','normalizar_mediciones(crudas)','Valida campos, tipo numérico, contaminante, periodo, fecha y duplicados; devuelve mediciones y avisos.'],
['aqi.py','normalizar_unidad(unidad)','Homologa variantes de µg/m³, ppm y ppb sin convertir entre magnitudes.'],
['aqi.py','categoria_aqi(indice)','Recorre los topes del AQI y devuelve la categoría correspondiente.'],
['aqi.py','truncar(valor, decimales)','Aplica truncamiento previo al cálculo de AQI según el contaminante.'],
['aqi.py','aqi_desde_concentracion(...)','Busca el breakpoint compatible e interpola linealmente el AQI. Devuelve None si no aplica.'],
['aqi.py','calcular_aqi(mediciones)','Calcula candidatos compatibles y conserva el índice más alto como resultado principal.'],
['oms.py','comparar_medicion(medicion)','Compara una medición con la guía OMS compatible y devuelve estado, diferencia y explicación.'],
['oms.py','comparar_oms(mediciones)','Ejecuta todas las comparaciones y elige una principal sin mezclarla con el AQI.'],
['almacen.py','Almacen.__init__()','Define la ruta de SQLite, crea la carpeta e inicializa el esquema.'],
['almacen.py','_conectar()','Abre sqlite3.connect(), configura Row y devuelve la conexión.'],
['almacen.py','_iniciar()','Lee schema_v1.sql y ejecuta el script de creación de tablas.'],
['almacen.py','guardar_consulta_ok(...)','Inserta consulta, estación y mediciones usando SQL parametrizado e INSERT OR IGNORE.'],
['almacen.py','borrar_historial()','Cuenta consultas y elimina mediciones, consultas y estaciones.'],
['almacen.py','listar_consultas()','Consulta historial ordenado DESC y convierte cada sqlite3.Row a dict.'],
['almacen.py','csv_consultas()','Usa io.StringIO y csv.DictWriter para construir el CSV en memoria.'],
['almacen.py','listar_mediciones(...)','Construye SQL dinámico con filtros seguros y devuelve mediciones ordenadas por fecha.'],
['reportes.py','_asegurar_carpeta()','Crea backend/static/graficas cuando es necesario.'],
['reportes.py','_nombre_seguro(texto)','Limpia texto para usarlo en nombres de archivo PNG sin caracteres problemáticos.'],
['reportes.py','url_publica(nombre, base_url)','Construye la URL relativa o absoluta con la que Angular abre la imagen.'],
['reportes.py','generar_imagen_historial(...)','Convierte filas a DataFrame, grafica serie temporal y guarda PNG.'],
['reportes.py','generar_imagen_estadisticas(...)','Agrupa con groupby/agg y genera gráficas de promedio y cantidad.'],
['errores.py','respuesta_error(codigo, mensaje, estado)','Estandariza todos los errores como JSON {error, mensaje} más el estado HTTP.'],
['analisis.py','mediciones_a_dataframe(filas)','Crea DataFrame, convierte valor/fecha, elimina inválidos y ordena cronológicamente.'],
['analisis.py','resumen_consulta(df, contaminante)','Calcula total, promedio, mínimo y máximo para mostrar en la interfaz.'],
['analisis.py','generar_grafica_historial(...)','Construye una figura de línea con puntos reales y puede guardarla en disco.'],
['analisis.py','exportar_reporte_excel(df, ruta)','Agrupa métricas por contaminante y exporta un resumen a Excel.']
];

const modal=document.getElementById('catalog'),grid=document.getElementById('catalogGrid'),search=document.getElementById('catalogSearch'),count=document.getElementById('catalogCount');
function renderCatalog(q=''){
 const term=q.trim().toLowerCase();const rows=FUNCTIONS.filter(r=>r.join(' ').toLowerCase().includes(term));
 grid.innerHTML=rows.map(([m,n,d])=>`<article class="catalog-item"><span class="module">${m}</span><code>${n}</code><p>${d}</p></article>`).join('');
 count.textContent=`${rows.length} de ${FUNCTIONS.length}`;
}
function openCatalog(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');renderCatalog(search.value);setTimeout(()=>search.focus(),50)}
function closeCatalog(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.querySelectorAll('[data-open-catalog]').forEach(b=>b.onclick=openCatalog);document.getElementById('catalogClose').onclick=closeCatalog;modal.addEventListener('click',e=>{if(e.target===modal)closeCatalog()});search.addEventListener('input',e=>renderCatalog(e.target.value));renderCatalog();
