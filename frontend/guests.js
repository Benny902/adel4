async function loadGuests() {
    try {
        const response = await fetch("http://localhost:7000/guests");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const guests = data.guests;
        const totalAttendees = data.totalGuests;

        const tableBody = document.getElementById("guestTableBody");
        const totalAttendeesElement = document.getElementById("totalAttendees");

        tableBody.innerHTML = ""; // Clear previous entries
        totalAttendeesElement.innerText = `כמות אורחים: ${totalAttendees}`;

        guests.forEach((guest, index) => {
            const row = tableBody.insertRow();

            // Add Actions cell
            const actionsCell = row.insertCell(0);
            
            const editButton = document.createElement("button");
            editButton.innerText = "ערוך";
            editButton.onclick = () => editGuest(guest.phone);
            
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "מחק";
            deleteButton.onclick = () => deleteGuest(guest.phone);
            
            // Add spacing between buttons
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(document.createTextNode("\u00A0")); // Adds a non-breaking space
            actionsCell.appendChild(deleteButton);
        
            // Insert other guest details
            row.insertCell(1).innerText = guest.submissionDate || "";
            row.insertCell(2).innerText = guest.phone;
            row.insertCell(3).innerText = guest.name;
        
            // Add row number cell
            row.insertCell(4).innerText = index + 1; // Row number (1-based index)
        });
    } catch (error) {
        console.error("Failed to load guests:", error);
    }
}



// Load guests when the page is loaded
window.onload = loadGuests;

async function deleteGuest(phone) {
    if (confirm("Are you sure you want to delete this guest?")) {
        try {
            const response = await fetch("http://localhost:7000/delete_guest", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Guest deleted successfully!");
            loadGuests(); // Refresh the guest list
        } catch (error) {
            console.error("Failed to delete guest:", error);
        }
    }
}

async function editGuest(phone) {
    const newName = prompt("Enter new name:", "");

    if (newName) {
        try {
            const response = await fetch("http://localhost:7000/edit_guest", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name: newName })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Guest updated successfully!");
            loadGuests(); // Refresh the guest list
        } catch (error) {
            console.error("Failed to edit guest:", error);
        }
    } else {
        alert("Name must be provided for editing.");
    }
}

let sortOrder = { column: -1, ascending: true }; // Track sort state

function sortTable(columnIndex) {
    const table = document.getElementById("guestTable");
    const rows = Array.from(table.rows).slice(1); // Skip header row

    // Sort the rows
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].innerText;
        const bText = b.cells[columnIndex].innerText;

        return sortOrder.ascending
            ? aText.localeCompare(bText)
            : bText.localeCompare(aText); // Sort strings
    });

    // Toggle sort order for next click
    sortOrder.column = columnIndex;
    sortOrder.ascending = !sortOrder.ascending;

    // Append sorted rows back to the table
    rows.forEach(row => table.appendChild(row));
}
