// Elements
const bookingIdEl = document.getElementById("bookingId");
const slotEl = document.getElementById("slot");
const patientNameLiveEl = document.getElementById("patientNameLive");
const errorMsgEl = document.getElementById("errorMsg");

const queueNumberEl = document.getElementById('queueNumber');
const liveTimeEl = document.getElementById('liveTime');
const refreshBtn = document.getElementById('refreshLive');
const canvas = document.getElementById('liveChart');

// Sample chart data
let sampleLabels = ['Now','+15','+30','+45','+60','+75'];
let sampleData = [6, 12, 9, 15, 10, 8];

// Rounded rectangle helper
function roundRect(ctx,x,y,w,h,r,fill,stroke,fillStyle){
  if (!r) r = 5;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fillStyle || 'rgba(255,255,255,0.08)'; ctx.fill(); }
  if (stroke) ctx.stroke();
}

// Draw bar chart
function drawBarChart(canvas, labels, data){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const padding = 20;
  const w = canvas.width - padding*2;
  const h = canvas.height - padding*2;
  const barGap = 12;
  const num = data.length;
  const barWidth = (w - (num-1)*barGap)/num;
  const max = Math.max(...data,1);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for(let i=0;i<=4;i++){
    const y = padding + (h/4)*i;
    ctx.moveTo(padding,y);
    ctx.lineTo(padding+w,y);
  }
  ctx.stroke();

  for(let i=0;i<num;i++){
    const value = data[i];
    const x = padding + i*(barWidth + barGap);
    const barH = (value/max)*(h-8);
    const y = padding + (h - barH);
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0,'rgba(0,183,255,0.95)');
    grad.addColorStop(1,'rgba(0,120,255,0.8)');
    roundRect(ctx,x,y,barWidth,barH,6,true,false,grad);

    ctx.fillStyle = 'rgba(230,247,255,0.9)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x+barWidth/2, padding+h+14);
    ctx.fillText(String(value), x+barWidth/2, y-6);
  }
}

// Canvas setup
function setupCanvas(){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  canvas.getContext('2d').scale(dpr,dpr);
}

function renderChart(){ setupCanvas(); drawBarChart(canvas,sampleLabels,sampleData); }
renderChart();
window.addEventListener('resize', ()=>{ renderChart(); });

// Booking ID fetch
bookingIdEl.addEventListener('change', ()=>{
  const bookingId = bookingIdEl.value.trim();
  if(!bookingId) return;

  fetch('/get_booking',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({bookingId})
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.error){
      slotEl.value = '';
      patientNameLiveEl.value = '';
      errorMsgEl.textContent = data.error;
      errorMsgEl.classList.remove('hidden');
    } else {
      slotEl.value = data.slot;
      patientNameLiveEl.value = data.name;
      errorMsgEl.classList.add('hidden');
    }
  })
  .catch(err=>{
    console.error("Fetch error:", err);
    slotEl.value = '';
    patientNameLiveEl.value = '';
    errorMsgEl.textContent = 'Error fetching booking';
    errorMsgEl.classList.remove('hidden');
  });
});

// Refresh live simulation
refreshBtn.addEventListener('click', ()=>{
  const q = Math.floor(Math.random()*6)+5;
  const max = 10;
  queueNumberEl.innerHTML = `${q}<span class="slash">/</span><span class="max">${max}</span>`;

  const hour = 10 + Math.floor(Math.random()*5);
  const min = [0,15,30,45][Math.floor(Math.random()*4)];
  slotEl.value = `${pad(hour)}:${pad(min)} ${hour<12?'AM':'PM'} - ${pad(hour)}:${pad((min+15)%60)} ${hour<12?'AM':'PM'}`;

  sampleData = sampleData.map(v=>Math.max(2,Math.round(v + (Math.random()*8 - 4))));
  renderChart();

  const now = new Date();
  liveTimeEl.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
});

function pad(n){ return String(n).padStart(2,'0'); }
