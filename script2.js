/**
 * Filters the table rows based on the text entered in the search input field.
 * It hides rows that do not match the search criteria.
 * MODIFIED: The search is now EXACT, requiring the input to match the cell content.
 */
function filterTable() {
    // Get the search input value and convert to lowercase and trim for case-insensitive exact search
    let input = document.getElementById('searchInput');
    let filter = input.value.toLowerCase().trim();
    
    // Get the table and all its body rows
    let table = document.getElementById('gradeMatrix');
    let trs = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // If the filter is empty, show all rows and exit
    if (filter === "") {
        clearFilter();
        return;
    }

    // Iterate through all table rows
    for (let i = 0; i < trs.length; i++) {
        let row = trs[i];
        // Skip rows that are hidden due to previous filtering (to handle rowspan correctly)
        if (row.hasAttribute('data-hidden-by-filter')) continue;

        let rowMatch = false;
        
        let cells = row.getElementsByTagName('td');
        for (let j = 0; j < cells.length; j++) {
            // Get cell text, convert to lowercase, and trim for exact comparison
            let cellText = (cells[j].textContent || cells[j].innerText).toLowerCase().trim();
            
            // Check for EXACT match (strict equality '===')
            if (cellText === filter) {
                rowMatch = true;
                break;
            }
        }
        
        // Logic to show or hide the row
        if (rowMatch) {
            row.classList.remove('hidden');
            // If the row belongs to a group with a rowspan, ensure the rowspan cell is visible
            let groupCell = row.getElementsByClassName('sticky-col-1')[0];
            if (groupCell && groupCell.getAttribute('rowspan')) {
                groupCell.style.display = 'table-cell';
            }
        } else {
            row.classList.add('hidden');
        }

        // Handle rows with Group rowspan (i.e., the Group column is only in the first row)
        let groupCell = row.getElementsByClassName('sticky-col-1')[0];
        if (groupCell && groupCell.getAttribute('rowspan')) {
            let rowspan = parseInt(groupCell.getAttribute('rowspan')) || 1;
            let groupVisible = rowMatch; 
            
            // Check subsequent rows in the same group
            for (let k = 1; k < rowspan; k++) {
                let nextRow = trs[i + k];
                if (nextRow) {
                    let nextRowCells = nextRow.getElementsByTagName('td');
                    let nextRowMatch = false;

                    for (let l = 0; l < nextRowCells.length; l++) {
                        // Get cell text, convert to lowercase, and trim for exact comparison
                        let cellText = (nextRowCells[l].textContent || nextRowCells[l].innerText).toLowerCase().trim();
                        
                        if (cellText === filter) {
                            nextRowMatch = true;
                            break;
                        }
                    }
                    
                    if (nextRowMatch) {
                        groupVisible = true;
                        nextRow.classList.remove('hidden');
                    } else {
                        nextRow.classList.add('hidden');
                        nextRow.setAttribute('data-hidden-by-filter', 'true');
                    }
                }
            }

            // Based on if any row in the group matched, show or hide the group's first row (which contains the Group label)
            if (groupVisible) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
            // Skip the inner loop index since we handled the whole group
            i += (rowspan - 1);
        } else if (groupCell && !groupCell.getAttribute('rowspan')) {
             row.removeAttribute('data-hidden-by-filter');
        }
    }
}

/**
 * Clears the search input and makes all table rows visible again.
 */
function clearFilter() {
    document.getElementById('searchInput').value = '';
    let table = document.getElementById('gradeMatrix');
    let trs = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove('hidden');
        trs[i].removeAttribute('data-hidden-by-filter');
    }
}
