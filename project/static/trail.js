const bookingIdEl = document.getElementById("bookingId");
const slotEl = document.getElementById("slot");
const patientNameLiveEl = document.getElementById("patientNameLive");
const errorMsgEl = document.getElementById("errorMsg");
const refreshBtn = document.getElementById("refreshLive");
const liveTimeEl = document.getElementById("liveTime");
const approxBox = document.getElementById("approxBox");

refreshBtn.addEventListener('click', ()=>{
  const bookingId = bookingIdEl.value.trim();
  if(!bookingId){
    errorMsgEl.textContent='Please enter Booking ID';
    errorMsgEl.classList.remove('hidden');
    slotEl.value=''; patientNameLiveEl.value=''; 
    approxBox.textContent = '';
    return;
  }

  fetch('/get_booking',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({bookingId})
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.error){
      errorMsgEl.textContent=data.error;
      errorMsgEl.classList.remove('hidden');
      slotEl.value=''; patientNameLiveEl.value='';
      approxBox.textContent = '';
    } else {
      errorMsgEl.classList.add('hidden');
      slotEl.value = data.slot;
      patientNameLiveEl.value = data.name;

      // Display estimated total wait time
      approxBox.textContent = `${data.estimated_wait} mins`;
      liveTimeEl.textContent = 'now';
    }
  })
  .catch(err=>{
    console.error(err);
    errorMsgEl.textContent='Error fetching booking';
    errorMsgEl.classList.remove('hidden');
    slotEl.value=''; patientNameLiveEl.value='';
    approxBox.textContent = '';
  });
});
