// Data derived from the Official Grid (2024 update based on Decree 304-07 mod)
// Format: [Base Index, Degree Step Value]
const GRID_DATA = {
    "1": { base: 400, step: 20, label: "الصنف 1" },
    "2": { base: 419, step: 21, label: "الصنف 2" },
    "3": { base: 440, step: 22, label: "الصنف 3" },
    "4": { base: 463, step: 23, label: "الصنف 4" },
    "5": { base: 488, step: 24, label: "الصنف 5" },
    "6": { base: 515, step: 26, label: "الصنف 6" },
    "7": { base: 548, step: 27, label: "الصنف 7" },
    "8": { base: 579, step: 29, label: "الصنف 8" },
    "9": { base: 618, step: 31, label: "الصنف 9" },
    "10": { base: 653, step: 33, label: "الصنف 10" },
    "11": { base: 698, step: 35, label: "الصنف 11" },
    "12": { base: 737, step: 37, label: "الصنف 12" },
    "13": { base: 778, step: 39, label: "الصنف 13" },
    "14": { base: 821, step: 41, label: "الصنف 14" },
    "15": { base: 866, step: 43, label: "الصنف 15" },
    "16": { base: 913, step: 46, label: "الصنف 16" },
    "17": { base: 962, step: 48, label: "الصنف 17" },
    // Sub Categories (Hors Catégorie)
    "sub1": { base: 1130, step: 57, label: "قسم فرعي 1" },
    "sub2": { base: 1190, step: 60, label: "قسم فرعي 2" },
    "sub3": { base: 1255, step: 63, label: "قسم فرعي 3" },
    "sub4": { base: 1325, step: 66, label: "قسم فرعي 4" },
    "sub5": { base: 1400, step: 70, label: "قسم فرعي 5" },
    "sub6": { base: 1480, step: 74, label: "قسم فرعي 6" },
    "sub7": { base: 1680, step: 84, label: "قسم فرعي 7" },
};

const POINT_VALUE = 45; // Value of 1 point in DZD

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gradeSelect = document.getElementById('gradeSelect');
    const degreeSelect = document.getElementById('degreeSelect');
    const rateInput = document.getElementById('rateInput');
    const calcBtn = document.getElementById('calcBtn');
    const resultSection = document.getElementById('resultSection');

    // Populate Select Options
    (function init() {
        // Standard Classes
        let options = `<optgroup label="المجموعات (A, B, C, D)">`;
        for (let i = 1; i <= 17; i++) {
            options += `<option value="${i}">الصنف ${i}</option>`;
        }
        options += `</optgroup>`;
        
        // Sub Classes
        options += `<optgroup label="خارج الصنف (F.S)">`;
        for (let i = 1; i <= 7; i++) {
            options += `<option value="sub${i}">قسم فرعي ${i}</option>`;
        }
        options += `</optgroup>`;

        gradeSelect.innerHTML = options;
        
        // Set default to Class 12 (as per example)
        gradeSelect.value = "12";
        degreeSelect.value = "3";
    })();

    // Formatter
    const money = new Intl.NumberFormat('fr-DZ', { 
        style: 'currency', 
        currency: 'DZD',
        minimumFractionDigits: 2 
    });

    // Calculation Function
    function calculate() {
        const classKey = gradeSelect.value;
        const degree = parseInt(degreeSelect.value);
        const rate = parseFloat(rateInput.value);

        if (!GRID_DATA[classKey]) return;
        if (isNaN(rate) || rate < 0) {
            alert("يرجى إدخال نسبة صحيحة");
            return;
        }

        const data = GRID_DATA[classKey];
        
        // 1. Calculate Indices
        const baseIndex = data.base;
        const degreeIndex = data.step * degree;
        const totalIndex = baseIndex + degreeIndex;

        // 2. Calculate Main Salary (Base for PRI)
        const mainSalary = totalIndex * POINT_VALUE;

        // 3. Calculate Gross Bonus (Monthly)
        const grossMonthly = mainSalary * (rate / 100);

        // 4. Deductions
        const ssDeduction = grossMonthly * 0.09; // 9% CNAS
        const taxableIncome = grossMonthly - ssDeduction;
        const irgDeduction = taxableIncome * 0.10; // 10% IRG (Fixed rate for primes typically)

        // 5. Net
        const netMonthly = taxableIncome - irgDeduction;
        const netQuarterly = netMonthly * 3;

        // Update UI
        document.getElementById('displayBaseSalary').innerText = money.format(mainSalary).replace("DZD", "دج");
        document.getElementById('displayNetQuarterly').innerText = money.format(netQuarterly).replace("DZD", "دج");
        document.getElementById('detailRateDisplay').innerText = `النسبة المطبقة ${rate}%`;

        // Table Details
        document.getElementById('lblBaseIndex').innerText = baseIndex;
        document.getElementById('lblDegreeIndex').innerText = `${data.step} × ${degree} = ${degreeIndex}`;
        document.getElementById('lblTotalIndex').innerText = totalIndex;
        document.getElementById('lblReferenceSalary').innerText = money.format(mainSalary).replace("DZD", "");

        document.getElementById('lblRawFormula').innerText = `${money.format(mainSalary).replace("DZD","").trim()} × ${rate}%`;
        document.getElementById('valGrossMonthly').innerText = money.format(grossMonthly).replace("DZD", "");

        document.getElementById('valSS').innerText = "- " + money.format(ssDeduction).replace("DZD", "");
        document.getElementById('valTaxable').innerText = money.format(taxableIncome).replace("DZD", "");
        document.getElementById('valIRG').innerText = "- " + money.format(irgDeduction).replace("DZD", "");

        document.getElementById('valNetMonthly').innerText = money.format(netMonthly).replace("DZD", "دج");
        document.getElementById('valNetQuarterly').innerText = money.format(netQuarterly).replace("DZD", "دج");

        // Show Results
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    calcBtn.addEventListener('click', calculate);
});
