// public/medical.js
async function loadMedicalData() {
    try {
      const res = await fetch('/medical-data');
      const { success, data } = await res.json();
  
      if (!success) {
        alert('Failed to fetch medical data.');
        return;
      }
  
      const tbody = document.querySelector('#medicalTable tbody');
      tbody.innerHTML = '';
      data.forEach(record => {
        const tr = document.createElement('tr');
        for (const val of Object.values(record)) {
          const td = document.createElement('td');
          td.textContent = val;
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error fetching medical data:', err);
    }
  }

  document.getElementById('addMedicalForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        recordNum: document.getElementById('recordNum').value,
        bloodType: document.getElementById('bloodType').value,
        weight: document.getElementById('weight').value,
        sex: document.getElementById('sex').value,
        height: document.getElementById('height').value,
        inmateId: document.getElementById('inmateId').value
    };

    const res = await fetch('/add-medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);
    if (result.success) loadMedicalRecords();
});

async function loadMedicalRecords() {
    const res = await fetch('/medical-records');
    const { data } = await res.json();

    const tbody = document.querySelector('#medicalTable tbody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        for (const key in row) {
            const td = document.createElement('td');
            td.textContent = row[key];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

async function loadJoinedData() {
  const res = await fetch('/medical-joined');
  const { data } = await res.json();

  const container = document.getElementById('joinedResult');

  if (!data || data.length === 0) {
      container.innerHTML = "<p>No joined records found.</p>";
      return;
  }

  let tableHTML = `
      <table border="1">
          <thead>
              <tr>
                  <th>Inmate ID</th>
                  <th>Holding Cell</th>
                  <th>Blood Type</th>
                  <th>Weight</th>
                  <th>Height</th>
                  <th>Crime</th>
                  <th>Duration (Years)</th>
              </tr>
          </thead>
          <tbody>
  `;

  data.forEach(row => {
      tableHTML += `
          <tr>
              <td>${row.INMATEID}</td>
              <td>${row.HOLDINGCELL}</td>
              <td>${row.BLOODTYPE}</td>
              <td>${row.WEIGHT}</td>
              <td>${row.HEIGHT}</td>
              <td>${row.CRIME}</td>
              <td>${row.DURATION}</td>
          </tr>
      `;
  });

  tableHTML += `</tbody></table>`;
  container.innerHTML = tableHTML;
}


  