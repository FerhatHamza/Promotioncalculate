/**
 * Filters the table rows based on the text entered in the search input field.
 * It hides rows that do not match the search criteria.
 */
function filterTable() {
    // Get the search input value and convert to lowercase for case-insensitive search
    let input = document.getElementById('searchInput');
    let filter = input.value.toLowerCase().trim();
    
    // Get the table and all its body rows
    let table = document.getElementById('gradeMatrix');
    let trs = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // Iterate through all table rows
    for (let i = 0; i < trs.length; i++) {
        let row = trs[i];
        // Skip rows that are hidden due to previous filtering (to handle rowspan correctly)
        if (row.hasAttribute('data-hidden-by-filter')) continue;

        let rowMatch = false;
        
        // Check the text content of all cells in the current row
        // We look at the Group (index 0), Category (index 1), and Minimale Index (index 2)
        // and any of the scale indices for a match.
        
        let cells = row.getElementsByTagName('td');
        for (let j = 0; j < cells.length; j++) {
            let cellText = cells[j].textContent || cells[j].innerText;
            // Check if the cell has a rowspan, meaning the content belongs to the row above
            if (cells[j].getAttribute('rowspan')) {
                // If it's a rowspan cell, we only check it for the first row of its group
                // In our HTML structure, Group (col 1) and Hors Catégorie (col 1) are rowspan.
                if (j === 0) { // Group column check
                    let groupName = cellText.toLowerCase();
                    if (groupName.includes(filter)) {
                        rowMatch = true;
                        break;
                    }
                }
                // We'll skip other rowspan cells in subsequent rows since they are empty for the purpose of the table structure here.
            } else if (cellText.toLowerCase().includes(filter)) {
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
        // Check if the Group cell is present (not skipped by rowspan) and if the group name matches.
        let groupCell = row.getElementsByClassName('sticky-col-1')[0];
        if (groupCell && groupCell.getAttribute('rowspan')) {
            // This is the *first* row of a group. We check if any subsequent row in the group matches.
            let rowspan = parseInt(groupCell.getAttribute('rowspan')) || 1;
            let groupVisible = rowMatch; // Assume the first row's group is visible if it matches
            
            // Check subsequent rows in the same group
            for (let k = 1; k < rowspan; k++) {
                let nextRow = trs[i + k];
                if (nextRow) {
                    let nextRowCells = nextRow.getElementsByTagName('td');
                    let nextRowMatch = false;

                    for (let l = 0; l < nextRowCells.length; l++) {
                        let cellText = nextRowCells[l].textContent || nextRowCells[l].innerText;
                        if (cellText.toLowerCase().includes(filter)) {
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
            // This is a row that does not contain the group label (it's part of a group rowspan)
            // It will be handled in the logic above when the first row of its group is processed.
            // Remove the temporary attribute
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
