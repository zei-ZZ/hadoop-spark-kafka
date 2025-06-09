const API_URL = 'http://localhost:5001';

const form = document.getElementById('add-form');
const tableBody = document.querySelector('#data-table tbody');

async function fetchData() {
  const res = await fetch(`${API_URL}/data`);
  const data = await res.json();
  renderTable(data);
}

function renderTable(data) {
  tableBody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.name}</td><td>${item.magnitude}</td><td>${item.location}</td>`;
    tableBody.appendChild(row);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const magnitude = parseFloat(document.getElementById('magnitude').value);
  const location = document.getElementById('location').value;

  await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, magnitude, location })
  });

  form.reset();
  fetchData();
});

fetchData();
