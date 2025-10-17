// script.js
(() => {
  const perc = {
    "الدنيا": 40,
    "المتوسطة": 40,
    "القصوى": 20
  };

  const orderPriority = ["الدنيا", "المتوسطة", "القصوى"]; // أولوية عند التساوي

  const elCount = document.getElementById("count");
  const btn = document.getElementById("calcBtn");
  const exBtn = document.getElementById("exampleBtn");
  const res = document.getElementById("result");

  function compute(n){
    n = Math.max(0, Math.floor(Number(n) || 0));
    if(n === 0) return {error: "أدخل عدداً صحيحاً أكبر من أو يساوي 1."};

    // حسابات دقيقة: نستخدم كسر عشري مباشر لكن نعالج المقارنات بدقة كافية
    const raw = {};
    const base = {};
    const frac = {};
    let totalBase = 0;

    for(const key of Object.keys(perc)){
      raw[key] = (n * perc[key]) / 100;
      base[key] = Math.floor(raw[key]);
      frac[key] = raw[key] - base[key];
      totalBase += base[key];
    }

    let remaining = n - totalBase;
    // نوزع المقاعد المتبقية حسب أكبر قيمة عشرية، وعند تساوي نختار حسب orderPriority
    const allocation = Object.assign({}, base);

    if(remaining > 0){
      // array of keys sorted by frac desc, then by priority order
      const keys = Object.keys(frac).slice();
      keys.sort((a,b) => {
        if(Math.abs(frac[b] - frac[a]) > 1e-9) return frac[b] - frac[a];
        // عند التساوي: الأولوية للمدة الدنيا ثم المتوسطة ثم القصوى
        return orderPriority.indexOf(a) - orderPriority.indexOf(b);
      });
      // نمنح المقاعد واحداً تلو الآخر
      for(let i=0;i<remaining;i++){
        allocation[keys[i % keys.length]]++;
      }
    }

    return {n, raw, base, frac, allocation, remaining};
  }

  function renderOut(obj){
    if(obj.error){
      res.innerHTML = `<p class="important">${obj.error}</p>`;
      return;
    }
    const {n, raw, base, frac, allocation, remaining} = obj;
    const rows = [];
    rows.push(`<div class="result-row"><div class="small">إجمالي الموظفين:</div><div class="important">${n}</div></div>`);

    rows.push(`<table class="table" role="table">
      <thead><tr><th>المدة</th><th>النسبة</th><th>النتيجة (ن × %) = قيمتها</th><th>الجزء الصحيح</th><th>الكسور</th><th>النهائي (مقاعد)</th></tr></thead>
      <tbody>
        ${Object.keys(perc).map(k => {
          return `<tr>
            <td>${k}</td>
            <td>${perc[k]}%</td>
            <td>${n} × ${perc[k]}% = ${raw[k].toFixed(3)}</td>
            <td>${base[k]}</td>
            <td>${frac[k].toFixed(3)}</td>
            <td class="important">${allocation[k]}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`);

    rows.push(`<p class="note">مجموع المقاعد من الأجزاء الصحيحة = ${Object.values(base).reduce((a,b)=>a+b,0)} — المقاعد المتبقية التي وزعت = ${remaining}</p>`);

    res.innerHTML = rows.join("");
  }

  btn.addEventListener("click", () => {
    renderOut(compute(elCount.value));
  });

  exBtn.addEventListener("click", () => {
    elCount.value = 4;
    renderOut(compute(4));
  });

  // عرض افتراضي
  renderOut(compute(elCount.value));
})();
