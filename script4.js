/**
 * Data Definition based on Executive Decree 13-195
 * & The Table provided in the user request.
 */
const ROLES = [
    {
        category: "الطاقم الطبي والجامعي",
        options: [
            { id: "p1", name: "أستاذ استشفائي جامعي (Professeur)", wd: 5000, we: 5600, hol: 6000 },
            { id: "p2", name: "أستاذ محاضر 'أ' / ممارس متخصص رئيس (MCA / Specialist Principal)", wd: 5000, we: 5300, hol: 5700 },
            { id: "p3", name: "أستاذ محاضر 'ب' / ممارس متخصص رئيس (MCB / Specialist Chef)", wd: 4700, we: 5000, hol: 5400 },
            { id: "p4", name: "أستاذ مساعد / ممارس متخصص مساعد (Maitre Assistant)", wd: 4300, we: 4600, hol: 5000 },
            { id: "p5", name: "ممارس عام / مقيم (Generaliste / Résident)", wd: 3500, we: 3800, hol: 4200 },
        ]
    },
    {
        category: "شبه الطبي والنفسانيون",
        options: [
            { id: "pm1", name: "شبه طبي / قابلة / نفساني / بيولوجي / فيزيائي / عون تخدير", wd: 2100, we: 2400, hol: 2800 },
            { id: "pm2", name: "شبه طبي مؤهل / مساعد تمريض (ATS)", wd: 1500, we: 1800, hol: 2200 },
        ]
    },
    {
        category: "الطاقم الإداري (مدير المناوبة)",
        options: [
            { id: "ad1", name: "أمين عام / مدير وحدة (CHU/EHU)", wd: 3000, we: 3300, hol: 3700 },
            { id: "ad2", name: "مدير فرعي / رئيس مكتب / مقتصد (CHU/EPH/EHS)", wd: 2100, we: 2400, hol: 2800 },
            { id: "ad3", name: "متصرف / ملحق إداري (Administrator/Attaché)", wd: 1800, we: 2100, hol: 2500 },
        ]
    },
    {
        category: "منح جزافية (المادة 7) - Forfait",
        options: [
            { id: "fix1", name: "أستاذ رئيس مصلحة (Chef Service)", type: "fixed", amount: 14000 },
            { id: "fix2", name: "رئيس مصلحة الاستعجالات/الانعاش/SAMU", type: "fixed", amount: 18000 },
            { id: "fix3", name: "مدير عام (CHU / EHU)", type: "fixed", amount: 18000 },
            { id: "fix4", name: "مدير مؤسسة (EPH / EHS)", type: "fixed", amount: 14000 },
            { id: "fix5", name: "مدير مؤسسة جوارية (EPSP)", type: "fixed", amount: 10000 },
        ]
    }
];

// DOM Elements
const roleSelect = document.getElementById('roleSelect');
const shiftInputsDiv = document.getElementById('shiftInputs');
const fixedRateMsg = document.getElementById('fixedRateMessage');
const priceTags = {
    wd: document.getElementById('priceWD'),
    we: document.getElementById('priceWE'),
    hol: document.getElementById('priceHol')
};
const inputs = {
    wd: document.getElementById('wdInput'),
    we: document.getElementById('weInput'),
    hol: document.getElementById('holInput')
};
const limitWarning = document.getElementById('limitWarning');

// Formatter
const money = new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', 
    currency: 'DZD', 
    minimumFractionDigits: 2 
});

// Initialize Select
(function init() {
    let html = '<option value="" disabled selected>-- اختر الرتبة --</option>';
    ROLES.forEach(group => {
        html += `<optgroup label="${group.category}">`;
        group.options.forEach(opt => {
            // Store data attributes for easy access
            const dataStr = opt.type === 'fixed' 
                ? `data-type="fixed" data-amount="${opt.amount}"`
                : `data-type="shift" data-wd="${opt.wd}" data-we="${opt.we}" data-hol="${opt.hol}"`;
            
            html += `<option value="${opt.id}" ${dataStr}>${opt.name}</option>`;
        });
        html += `</optgroup>`;
    });
    roleSelect.innerHTML = html;
})();

// Event Listener: Role Change
roleSelect.addEventListener('change', function() {
    const selected = this.options[this.selectedIndex];
    const type = selected.getAttribute('data-type');

    if (type === 'fixed') {
        // Handle Fixed Rate
        shiftInputsDiv.classList.add('hidden');
        fixedRateMsg.classList.remove('hidden');
        limitWarning.classList.add('hidden');
    } else {
        // Handle Shift Rate
        shiftInputsDiv.classList.remove('hidden');
        fixedRateMsg.classList.add('hidden');
        
        // Update Price Tags
        const wd = selected.getAttribute('data-wd');
        const we = selected.getAttribute('data-we');
        const hol = selected.getAttribute('data-hol');

        priceTags.wd.innerText = `${wd} دج`;
        priceTags.we.innerText = `${we} دج`;
        priceTags.hol.innerText = `${hol} دج`;

        checkLimit();
    }
});

// Event Listener: Input Changes (for Limit Warning)
Object.values(inputs).forEach(input => {
    input.addEventListener('input', checkLimit);
});

function checkLimit() {
    const total = 
        (parseInt(inputs.wd.value) || 0) + 
        (parseInt(inputs.we.value) || 0) + 
        (parseInt(inputs.hol.value) || 0);
    
    if (total > 6) {
        limitWarning.classList.remove('hidden');
    } else {
        limitWarning.classList.add('hidden');
    }
}

// Calculate Function
document.getElementById('calcBtn').addEventListener('click', () => {
    const selected = roleSelect.options[roleSelect.selectedIndex];
    if (!selected || selected.disabled) {
        alert("يرجى اختيار الرتبة أولاً");
        return;
    }

    let brut = 0;
    const type = selected.getAttribute('data-type');

    if (type === 'fixed') {
        brut = parseFloat(selected.getAttribute('data-amount'));
    } else {
        const c_wd = parseInt(inputs.wd.value) || 0;
        const c_we = parseInt(inputs.we.value) || 0;
        const c_hol = parseInt(inputs.hol.value) || 0;
        
        const p_wd = parseFloat(selected.getAttribute('data-wd'));
        const p_we = parseFloat(selected.getAttribute('data-we'));
        const p_hol = parseFloat(selected.getAttribute('data-hol'));

        brut = (c_wd * p_wd) + (c_we * p_we) + (c_hol * p_hol);
    }

    // Calculations
    // 1. SS (9%)
    const ss = brut * 0.09;
    
    // 2. Taxable
    const taxable = brut - ss;

    // 3. IRG (10% standard for primes)
    const irg = taxable * 0.10;

    // 4. Net
    const net = taxable - irg;

    // Render
    document.getElementById('resBrut').innerText = money.format(brut).replace("DZD", "دج");
    document.getElementById('resSS').innerText = "- " + money.format(ss).replace("DZD", "");
    document.getElementById('resIRG').innerText = "- " + money.format(irg).replace("DZD", "");
    document.getElementById('resNet').innerText = money.format(net).replace("DZD", "دج");

    // Show result
    const resSec = document.getElementById('resultSection');
    resSec.classList.remove('hidden');
    resSec.scrollIntoView({ behavior: 'smooth' });
});
