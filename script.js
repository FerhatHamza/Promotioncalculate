(() => {
  const perc = { "الدنيا": 40, "المتوسطة": 40, "القصوى": 20 };
  const orderPriority = ["الدنيا", "المتوسطة", "القصوى"];

  const elCount = document.getElementById("count");
  const btn = document.getElementById("calcBtn");
  const res = document.getElementById("result");

  function compute(n){
    n = Math.max(0, Math.floor(Number(n) || 0));
    if(n === 0) return {error:"أدخل عدداً صحيحاً أكبر من أو يساوي 1."};

    const raw={}, base={}, frac={};
    let totalBase=0;
    for(const k in perc){
      raw[k]=(n*perc[k])/100;
      base[k]=Math.floor(raw[k]);
      frac[k]=raw[k]-base[k];
      totalBase+=base[k];
    }

    let remaining=n-totalBase;
    const allocation={...base};
    if(remaining>0){
      const keys=Object.keys(frac).slice();
      keys.sort((a,b)=>{
        if(Math.abs(frac[b]-frac[a])>1e-9) return frac[b]-frac[a];
        return orderPriority.indexOf(a)-orderPriority.indexOf(b);
      });
      for(let i=0;i<remaining;i++) allocation[keys[i%keys.length]]++;
    }

    return {n,raw,base,frac,allocation,remaining};
  }

  function renderOut(obj){
    if(obj.error){res.innerHTML=`<p class="important">${obj.error}</p>`;return;}
    const {n,raw,base,frac,allocation,remaining}=obj;
    const rows=[];
    rows.push(`<div class="result-row"><div class="small">إجمالي الموظفين:</div><div class="important">${n}</div></div>`);
    rows.push(`<table class="table">
      <thead><tr><th>المدة</th><th>النسبة</th><th>النتيجة (ن × %) = القيمة</th><th>الجزء الصحيح</th><th>الكسور</th><th>النهائي (مقاعد)</th></tr></thead>
      <tbody>${Object.keys(perc).map(k=>`
        <tr>
          <td>${k}</td>
          <td>${perc[k]}%</td>
          <td>${n} × ${perc[k]}% = ${raw[k].toFixed(3)}</td>
          <td>${base[k]}</td>
          <td>${frac[k].toFixed(3)}</td>
          <td class="important">${allocation[k]}</td>
        </tr>`).join("")}</tbody>
    </table>`);
    rows.push(`<p class="note">مجموع المقاعد من الأجزاء الصحيحة = ${Object.values(base).reduce((a,b)=>a+b,0)} — المقاعد المتبقية الموزعة = ${remaining}</p>`);
    res.innerHTML=rows.join("");
  }

  btn.addEventListener("click",()=>renderOut(compute(elCount.value)));
  renderOut(compute(elCount.value));
})();