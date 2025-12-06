// Data Definition (Same as before based on Decree 13-195)
const ROLES = [
    {
        category: "الطاقم الطبي والجامعي",
        options: [
            { id: "p1", name: "أستاذ استشفائي (Professeur)", wd: 5000, we: 5600, hol: 6000 },
            { id: "p2", name: "أستاذ محاضر 'أ' / ممارس رئيس", wd: 5000, we: 5300, hol: 5700 },
            { id: "p3", name: "أستاذ محاضر 'ب' / ممارس رئيس", wd: 4700, we: 5000, hol: 5400 },
            { id: "p4", name: "أستاذ مساعد / ممارس مساعد", wd: 4300, we: 4600, hol: 5000 },
            { id: "p5", name: "ممارس عام / مقيم", wd: 3500, we: 3800, hol: 4200 },
        ]
    },
    {
        category: "شبه الطبي والنفسانيون",
        options: [
            { id: "pm1", name: "شبه طبي / نفساني / بيولوجي", wd: 2100, we: 2400, hol: 2800 },
            { id: "pm2", name: "شبه طبي مؤهل / مساعد تمريض", wd: 1500, we: 1800, hol: 2200 },
        ]
    },
    {
        category: "الإداريون",
        options: [
            { id: "ad1", name: "أمين عام / مدير وحدة", wd: 3000, we: 3300, hol: 3700 },
            { id: "ad2", name: "مدير فرعي / مقتصد", wd: 2100, we: 2400, hol: 2800 },
            { id: "ad3", name: "متصرف / ملحق إداري", wd: 1800, we: 2100, hol: 2500 },
        ]
    },
    {
        category: "منح جزافية (Forfait)",
        options: [
            { id: "fix1", name: "أستاذ رئيس مصلحة", type: "fixed", amount: 14000 },
            { id: "fix2", name: "رئيس مصلحة الاستعجالات", type: "fixed", amount: 18000 },
            { id: "fix3", name: "مدير عام (CHU)", type: "fixed", amount: 18000 },
            { id: "fix4", name: "مدير مؤسسة (EPH)", type: "fixed", amount: 14000 },
            { id: "fix5", name: "مدير مؤسسة جوارية", type: "fixed", amount: 10000 },
        ]
    }
];

const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const grandTotalEl = document.getElementById('grandTotal');
const totalCountEl = document.getElementById('totalCount');

let rowCount = 0;

// Format Currency
const money = new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', currency: 'DZD', minimumFractionDigits: 2 
});

// Generate Select Options HTML once
let optionsHTML = '<option value="" disabled selected>-- اختر الرتبة --</option>';
ROLES.forEach(group => {
    optionsHTML += `<optgroup label="${group.category}">`;
    group.options.forEach(opt => {
        // Store pricing in data attributes
        const dataStr = opt.type === 'fixed' 
            ? `data-type="fixed" data-amount="${opt.amount}"`
            : `data-type="shift" data-wd="${opt.wd}" data-we="${opt.we}" data-hol="${opt.hol}"`;
        optionsHTML += `<option value="${opt.id}" ${dataStr}>${opt.name}</option>`;
    });
    optionsHTML += `</optgroup>`;
});

// Add Row Function
function addRow() {
    emptyState.classList.add('hidden');
    rowCount++;
    
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition row-anim group";
    tr.id = `row-${rowCount}`;
    
    tr.innerHTML = `
        <td class="px-4 py-3 text-slate-400 font-mono text-sm">${rowCount}</td>
        <td class="px-4 py-3">
            <input type="text" placeholder="اسم الموظف" class="w-full bg-transparent border-b border-transparent focus:border-primary focus:outline-none transition px-2 py-1 text-sm">
        </td>
        <td class="px-4 py-3">
            <select class="role-select w-full bg-white border border-slate-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary">
                ${optionsHTML}
            </select>
        </td>
        <td class="px-4 py-3 bg-blue-50/30">
            <input type="number" min="0" max="30" value="0" class="inp-wd w-full text-center bg-transparent border-b border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-700" disabled>
        </td>
        <td class="px-4 py-3 bg-indigo-50/30">
            <input type="number" min="0" max="10" value="0" class="inp-we w-full text-center bg-transparent border-b border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-700" disabled>
        </td>
        <td class="px-4 py-3 bg-rose-50/30">
            <input type="number" min="0" max="10" value="0" class="inp-hol w-full text-center bg-transparent border-b border-slate-200 focus:border-rose-500 focus:outline-none font-bold text-slate-700" disabled>
        </td>
        <td class="px-4 py-3 text-left">
            <div class="font-mono font-bold text-emerald-600 net-display">0.00 دج</div>
            <div class="text-[10px] text-slate-400">Net à Payer</div>
        </td>
        <td class="px-4 py-3 text-center">
            <button onclick="deleteRow(this)" class="text-slate-300 hover:text-red-500 transition p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            </button>
        </td>
    `;
    
    tableBody.appendChild(tr);
    
    // Attach Listeners to this new row
    const select = tr.querySelector('.role-select');
    const inputs = tr.querySelectorAll('input[type="number"]');
    
    select.addEventListener('change', () => handleRoleChange(tr));
    inputs.forEach(inp => inp.addEventListener('input', () => calculateRow(tr)));
    
    updateSummary();
}

// Handle Dropdown Change
function handleRoleChange(row) {
    const select = row.querySelector('.role-select');
    const selectedOpt = select.options[select.selectedIndex];
    const type = selectedOpt.getAttribute('data-type');
    
    const inps = {
        wd: row.querySelector('.inp-wd'),
        we: row.querySelector('.inp-we'),
        hol: row.querySelector('.inp-hol')
    };
    
    if (type === 'fixed') {
        // Disable inputs and visual cue
        Object.values(inps).forEach(inp => {
            inp.value = 0;
            inp.disabled = true;
            inp.parentElement.classList.add('opacity-50', 'bg-slate-100');
        });
    } else {
        // Enable inputs
        Object.values(inps).forEach(inp => {
            inp.disabled = false;
            inp.parentElement.classList.remove('opacity-50', 'bg-slate-100');
        });
    }
    
    calculateRow(row);
}

// Calculate Single Row Logic
function calculateRow(row) {
    const select = row.querySelector('.role-select');
    const selectedOpt = select.options[select.selectedIndex];
    
    if (!selectedOpt || selectedOpt.disabled) return;
    
    const type = selectedOpt.getAttribute('data-type');
    let gross = 0;
    
    if (type === 'fixed') {
        gross = parseFloat(selectedOpt.getAttribute('data-amount'));
    } else {
        const counts = {
            wd: parseInt(row.querySelector('.inp-wd').value) || 0,
            we: parseInt(row.querySelector('.inp-we').value) || 0,
            hol: parseInt(row.querySelector('.inp-hol').value) || 0
        };
        const prices = {
            wd: parseFloat(selectedOpt.getAttribute('data-wd')),
            we: parseFloat(selectedOpt.getAttribute('data-we')),
            hol: parseFloat(selectedOpt.getAttribute('data-hol'))
        };
        
        gross = (counts.wd * prices.wd) + (counts.we * prices.we) + (counts.hol * prices.hol);
    }
    
    // Deductions
    const ss = gross * 0.09;
    const taxable = gross - ss;
    const irg = taxable * 0.10;
    const net = taxable - irg;
    
    // Display in Row
    row.querySelector('.net-display').innerText = money.format(net).replace("DZD", "دج");
    row.dataset.netValue = net; // Store for total calculation
    
    updateSummary();
}

// Delete Row
window.deleteRow = function(btn) {
    const row = btn.closest('tr');
    row.remove();
    updateSummary();
    if(tableBody.children.length === 0) emptyState.classList.remove('hidden');
}

// Update Grand Total
function updateSummary() {
    const rows = tableBody.querySelectorAll('tr');
    let total = 0;
    
    rows.forEach(row => {
        total += parseFloat(row.dataset.netValue) || 0;
    });
    
    grandTotalEl.innerText = money.format(total).replace("DZD", "دج");
    totalCountEl.innerText = rows.length;
}

// Initial Listener
document.getElementById('addBtn').addEventListener('click', addRow);

// Start with one row
addRow();
