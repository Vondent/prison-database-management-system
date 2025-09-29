/* Prison DBMS - scripts.js */

// ========== Connection Status ==========
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    try {
        const response = await fetch('/check-db-connection');
        const text = await response.text();
        statusElem.textContent = text;
    } catch (err) {
        statusElem.textContent = 'connection timed out';
    } finally {
        loadingGifElem.style.display = 'none';
        statusElem.style.display = 'inline';
    }
}

// ========== Inmate Management ==========
async function initDatabase() {
    const res = await fetch('/init-db', { method: 'POST' });
    const data = await res.json();
    alert(data.success ? 'Database initialized successfully!' : 'Database initialization failed!');

    if (data.success) {
        fetchInmates();  // Refresh the table
    }
}

async function insertData() {
    const res = await fetch('/insert-data', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        alert('Data inserted successfully!');
        fetchInmates();  // Refresh inmate table after successful insertion
    } else {
        alert('Data insertion failed!');
    }
}


async function fetchInmates() {
    try {
        const response = await fetch('/inmates');
        const { success, data } = await response.json();
        if (!success) throw new Error();

        const tableBody = document.querySelector('#inmateTable tbody');
        tableBody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            const values = [
                row.INMATEID,
                row.HOLDINGCELL,
                row.HEALTHNUM,
                new Date(row.STARTDATE).toISOString().split('T')[0],
                new Date(row.ENDDATE).toISOString().split('T')[0]
            ];
            values.forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to fetch inmates');
    }
}

//INSERTION
async function addInmate(event) {
    event.preventDefault();

    const inmateId = document.getElementById('inmateId').value;
    const holdingCell = document.getElementById('holdingCell').value;
    const healthNum = document.getElementById('healthNum').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const res = await fetch('/add-inmate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inmateId, holdingCell, healthNum, startDate, endDate })
    });

    const data = await res.json();
    const msgElem = document.getElementById('inmateFormMsg');
    msgElem.textContent = data.success ? 'Inmate added successfully!' : 'Error adding inmate';
    if (data.success) fetchInmates();
}

// UPDATE INMATE CELL

document.getElementById("update-inmate").addEventListener("submit", async function (event) {
    event.preventDefault();

    const inmateId = document.getElementById("InmateIDUpdate").value;
    const newHoldingCell = document.getElementById("holdingCellUpdate").value;

    try {
        const response = await fetch("/transfer-inmate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inmateId, newHoldingCell }),
        });

        const data = await response.json();
        alert(data.message);

        if (data.success) {
            document.getElementById("update-inmate").reset();
            fetchInmates();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to transfer inmate.");
    }
});

// SELECTION BASED ON RELEASE DA
async function loadUpcomingReleases() {
    const response = await fetch('/inmates-leaving-soon');
    const data = await response.json();

    const tbody = document.getElementById('releaseTable').querySelector('tbody');
    tbody.innerHTML = '';

    if (data.success && data.data.length > 0) {
        data.data.forEach(inmate => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = inmate.INMATEID;
            row.insertCell(1).textContent = inmate.HOLDINGCELL;
            row.insertCell(2).textContent = inmate.HEALTHNUM;
            row.insertCell(3).textContent = new Date(inmate.STARTDATE)
            row.insertCell(4).textContent = new Date(inmate.ENDDATE)
        });
    } else {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = 'No inmates releasing in the next 30 days.';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkDatabaseStatus();
    // loadInmates();
    loadUpcomingReleases();

    document.getElementById("removeInmateForm").addEventListener("submit", async function (event) {
        event.preventDefault(); 
        removeInmate();
    });
});

// DELETE INMATE
document.getElementById("removeInmateForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const inmateId = document.getElementById("removeInmateId").value;
    const messageDiv = document.getElementById("removeInmateMsg");

    if (!inmateId) {
        messageDiv.innerHTML = "<p style='color: red;'>Please enter an Inmate ID.</p>";
        return;
    }

    try {
        const response = await fetch("/remove-inmate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inmateID: inmateId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server error response:", errorText);
            throw new Error("Server responded with an error.");
        }

        const data = await response.json();

        if (data.success) {
            messageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
            document.getElementById("removeInmateForm").reset();
            // loadInmates();
            fetchInmates();
        } else {
            messageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
        }
    } catch (error) {
        console.error("Error removing inmate:", error);
        messageDiv.innerHTML = "<p style='color: red;'>Failed to remove inmate. Please try again later.</p>";
    }
});

//AGGREGATION WITH GROUP BY
document.getElementById("count-inmate-cell").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent form submission

    try {
        const response = await fetch("/inmates-count-by-cell");
        const data = await response.json();

        if (data.success) {
            displayInmateCounts(data.data);
        } else {
            console.error("Error fetching inmate counts:", data.message);
            alert("Failed to retrieve inmate counts.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching inmate counts.");
    }
});

function drawInmatePieChart(counts) {
    const ctx = document.getElementById('inmatePieChart').getContext('2d');
    
    const labels = counts.map(row => row.HOLDINGCELL);
    const data = counts.map(row => row.INMATECOUNT);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Inmates by Cell Type',
                data: data,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}


function displayInmateCounts(counts) {
    let message = "<h4>Inmate Count by Cell Type:</h4><ul>";
    counts.forEach(row => {
        message += `<li>${row.HOLDINGCELL}: ${row.INMATECOUNT}</li>`;
    });
    message += "</ul>";
    document.getElementById("inmateCountResult").innerHTML = message;

    drawInmatePieChart(counts);
}

// AGGREGATION WITH HAVING
document.getElementById("group-inmate-count").addEventListener("click", async function (event) {
    event.preventDefault();
    
    const minCount = document.getElementById("countN").value;

    if (!minCount || minCount <= 0) {
        alert("Please enter a valid minimum inmate count.");
        return;
    }

    try {
        const response = await fetch(`/crowded-cells/${minCount}`);
        const data = await response.json();

        if (data.success) {
            let output = "<h4>Crowded Cells:</h4><ul>";

            if (data.data.length === 0) {
                output += "<li>No crowded cells found.</li>";
            } else {
                data.data.forEach(cell => {
                    output += `<li>${cell.HOLDINGCELL}: ${cell.INMATECOUNT} inmates</li>`;
                });
            }
            
            output += "</ul>";
            document.getElementById("crowdedCellsResult").innerHTML = output;
        } else {
            alert("Failed to fetch crowded cells.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching data.");
    }
});

//DIVISION FIND ALL INMATES WHO HAVE BEEN IN ALL CELL TYPE
document.getElementById("get-all-cells-inmates").addEventListener("click", async function () {
    try {
        const response = await fetch("/inmates-all-cells");
        const data = await response.json();

        let output = "<h4>Inmates Held in All Cell Types:</h4><ul>";

        if (data.success && data.data.length > 0) {
            data.data.forEach(inmate => {
                output += `<li>Inmate ID: ${inmate.INMATEID}</li>`;
            });
        } else {
            output += "<li>No inmates have been in all cell types.</li>";
        }

        output += "</ul>";
        document.getElementById("allCellsInmatesResult").innerHTML = output;
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching data.");
    }
});

async function removeInmate(event){
    event.preventDefault();
    const InmateID = document.getElementById("InmateIDDelete").value;

    const response = await fetch("/remove-inmate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ InmateID: InmateID })
    })

    const result = await response.json();

    msgElem.textContent = data.success ? 'Inmate removed successfully!' : 'Error removing inmate';
}

async function loadHighSeverityPrisons() {
    try {
        const res = await fetch('/high-severity-prisons');
        const { success, data } = await res.json();

        const container = document.getElementById('highSeverityResult');
        container.innerHTML = "";

        if (success && data.length > 0) {
            let table = `<table border="1">
                            <thead><tr><th>Prison Number</th><th>High Severity Inmate Count</th></tr></thead>
                            <tbody>`;
            data.forEach(row => {
                table += `<tr><td>${row.PRISONNUM}</td><td>${row.HIGHSEVERITYCOUNT}</td></tr>`;
            });
            table += `</tbody></table>`;
            container.innerHTML = table;
        } else {
            container.innerHTML = "<p>No data found.</p>";
        }
    } catch (err) {
        console.error("Failed to fetch high-severity prison data:", err);
        document.getElementById('highSeverityResult').innerHTML = "<p>Error fetching data.</p>";
    }
}




// ========== Init Page ==========
window.onload = function () {
    checkDbConnection();
    fetchInmates();
    loadUpcomingReleases();
    removeInmate()
    document.getElementById('inmateForm').addEventListener('submit', addInmate);

    document.getElementById("removeInmateForm").addEventListener("submit", function (event) {
        event.preventDefault();
        removeInmate();
    });

    document.getElementById("inmateForm").addEventListener("submit", function (event) {
        event.preventDefault();
        addInmate();
    });
};
