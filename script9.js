/**
 * CONFIGURATION PARAMETERS (Decree 24-79 / Feb 2024)
 * All values are extracted from the updated Official Journal images (No. 11).
 */
const CONFIG = {
    // Distance Rule: > 50km
    minDistance: 50, 

    // Time Ranges (Decree Art 4)
    lunch: { start: 11, end: 14, checkPoint: 12.01 }, // If present between 11-14
    dinner: { start: 18, end: 21, checkPoint: 19.01 }, // If present between 18-21
    lodging: { start: 0, end: 6, checkPoint: 0.01 },   // If present between 00-06

    /**
     * RATES (DA) - Extracted from "Tableau Annexe" (Image 10)
     * "Meal" = Déjeuner OR Dîner (Single meal price)
     */
    rates: {
        // NORTH ZONE (Régions du Nord)
        north_1_10:     { meal: 600, lodging: 2400 }, // Cat 1-10
        north_11_plus:  { meal: 800, lodging: 3200 }, // Cat 11+
        
        // SOUTH ZONE (Régions du Sud) - New Decree groups 1+ together
        south_all:      { meal: 1000, lodging: 4000 }, // Cat 1+

        // HIGH FUNCTIONS (Fonctions Supérieures)
        high_function:  { meal: 1600, lodging: 6400 }
    },

    /**
     * TRANSPORT RATES (DA per KM) - (Article 5)
     * Updated: Personal vehicle is now 8 DA/km (was 2 DA)
     */
    transport: {
        personal_car: 8.0,  // Image 8, Art 5
        other_moto: 3.0,    // Estimate (Law doesn't specify moto in snippet, kept adjustable)
        none: 0
    },

    /**
     * REDUCTIONS (Percentage Multiplier)
     * Article 9: If hosted by organism -> reduced to 25% (multiply by 0.25)
     */
    reductions: {
        hosted: 0.25,  // 25%
        full: 1.0      // 100%
    }
};

/**
 * Main Calculation Function
 */
function calculateExpenses() {
    // 1. Get User Inputs
    const category = document.getElementById('employeeCategory').value;
    const startVal = document.getElementById('startDate').value;
    const endVal = document.getElementById('endDate').value;
    const distance = parseFloat(document.getElementById('distance').value) || 0;
    const transportType = document.getElementById('transportType').value;
    const isAdminHosted = document.getElementById('adminHosted').checked;

    // 2. Validate Dates
    if (!startVal || !endVal) {
        return; // Do nothing if dates empty
    }
    const startDate = new Date(startVal);
    const endDate = new Date(endVal);

    if (endDate <= startDate) {
        alert("تاريخ العودة يجب أن يكون بعد تاريخ الانطلاق");
        return;
    }

    // 3. Count Meals & Nights
    const counts = countOccurrences(startDate, endDate);

    // 4. Get Price for Category
    const rateData = CONFIG.rates[category];
    
    // 5. Apply Reductions (Article 9)
    // If Admin Hosted: Apply 25% (0.25) to EVERYTHING (Food + Lodging)
    const coefficient = isAdminHosted ? CONFIG.reductions.hosted : CONFIG.reductions.full;

    const mealCost = rateData.meal * coefficient;
    const lodgingCost = rateData.lodging * coefficient;

    // 6. Calculate Totals
    const totalLunch = counts.lunches * mealCost;
    const totalDinner = counts.dinners * mealCost;
    const totalFood = totalLunch + totalDinner;
    const totalLodging = counts.nights * lodgingCost;

    // 7. Calculate Transport
    // Note: Transport is NOT subject to the 25% reduction, usually.
    let totalTransport = 0;
    if (transportType !== 'none') {
        const kmRate = CONFIG.transport[transportType];
        totalTransport = distance * kmRate;
    }

    const grandTotal = totalFood + totalLodging + totalTransport;

    // 8. Update UI
    updateUI(counts, totalFood, totalLodging, totalTransport, grandTotal);
}

/**
 * Helper: Count how many time-slots were touched
 */
function countOccurrences(start, end) {
    let lunches = 0;
    let dinners = 0;
    let nights = 0;

    // We iterate hour by hour to be safe
    let current = new Date(start);
    // Align to next hour to start clean loop
    current.setMinutes(0); 
    
    // Safety break for infinite loops (e.g. if user selects 10 years)
    let safety = 0;

    // Clone to not modify original
    let iterator = new Date(start);

    // Efficient Loop: Check every hour
    while (iterator < end && safety < 10000) {
        safety++;
        
        // Check Lunch (11:00 - 14:00)
        // We trigger if the person is present at a specific point in this range (e.g. 12:00)
        if (isTimeInMission(iterator, end, 12)) lunches++; // Check 12:00
        
        // Check Dinner (18:00 - 21:00)
        if (isTimeInMission(iterator, end, 19)) dinners++; // Check 19:00

        // Check Night (00:00 - 06:00)
        if (isTimeInMission(iterator, end, 0)) nights++;   // Check 00:00 (Midnight)

        // Advance 24 hours to check next day? No, simplified logic below:
        // Actually, simpler logic:
        // Iterate days.
        iterator.setTime(iterator.getTime() + (60*60*1000)); // Add 1 hour? No, slow.
    }
    
    // Better Logic: Iterate Days
    lunches = 0; dinners = 0; nights = 0;
    let ptr = new Date(start);
    
    while(ptr < end) {
        // Check Lunch for this day (12:00)
        let lunchTime = new Date(ptr); lunchTime.setHours(12,0,0,0);
        if (ptr <= lunchTime && end > lunchTime) lunches++;

        // Check Dinner for this day (19:00)
        let dinnerTime = new Date(ptr); dinnerTime.setHours(19,0,0,0);
        if (ptr <= dinnerTime && end > dinnerTime) dinners++;

        // Check Night (00:00 of NEXT day)
        // Note: The night is 00h-06h. If you stay over midnight, you get it.
        let nightTime = new Date(ptr); 
        nightTime.setDate(nightTime.getDate() + 1); // Next day
        nightTime.setHours(0,0,0,0); // Midnight
        
        if (ptr <= nightTime && end > nightTime) nights++;

        // Move to next day
        ptr.setDate(ptr.getDate() + 1);
        ptr.setHours(0,1,0,0); // Reset to start of day
    }

    return { lunches, dinners, nights };
}

/**
 * Update the HTML elements
 */
function updateUI(counts, food, lodging, transport, total) {
    // Counts
    document.getElementById('lunchCount').innerText = counts.lunches;
    document.getElementById('dinnerCount').innerText = counts.dinners;
    document.getElementById('nightCount').innerText = counts.nights;

    // Money
    const fmt = (n) => n.toLocaleString('fr-DZ', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' دج';
    
    document.getElementById('totalFood').innerText = fmt(food);
    document.getElementById('totalLodging').innerText = fmt(lodging);
    document.getElementById('totalTransport').innerText = fmt(transport);
    
    // Grand Total Animation
    const totalEl = document.getElementById('grandTotal');
    totalEl.innerText = fmt(total);
}

// Initial Run
window.onload = function() {
    const now = new Date();
    // Default: Start today 08:00, End tomorrow 16:00
    const start = new Date(now); start.setHours(8,0,0,0);
    const end = new Date(now); end.setDate(end.getDate()+1); end.setHours(16,0,0,0);
    
    const toLocalISO = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    document.getElementById('startDate').value = toLocalISO(start);
    document.getElementById('endDate').value = toLocalISO(end);
};
