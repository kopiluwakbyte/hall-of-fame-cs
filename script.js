const sheet1URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=0&single=true&output=csv';
const sheet2URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=4322856&single=true&output=csv';

document.addEventListener("DOMContentLoaded", function () {
  loadSheet1();
  loadSheet2();
});

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// === LOAD SHEET 1 (TOP AGENTS) ===
function loadSheet1() {
  fetch(sheet1URL)
    .then(response => response.text())
    .then(csv => {
      const rows = csv.split('\n').slice(1); // skip header
      const agents = rows.map(row => {
        const [no, name, conv, complain, csat, kategori, badge] = row.split(',');
        return {
          name: name.trim(),
          conversation: parseInt(conv.replace(/,/g, '')),
          complain: parseInt(complain.replace(/,/g, '')),
          csat: parseFloat(csat),
          kategori: kategori.trim(),
          badge: badge.trim()
        };
      });

      const sorted = [...agents].sort((a, b) => b.csat - a.csat);
      const top3 = sorted.slice(0, 3);
      const others = sorted.slice(3);

      renderAgents('topAgents', top3);
      renderAgents('bottomAgents', others);
    });
}

function renderAgents(containerId, agentList) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  agentList.forEach(agent => {
    const kategoriClass = getKategoriClass(agent.kategori);
    const card = `
      <div class="card">
        <img src="https://api.dicebear.com/8.x/thumbs/svg?seed=${agent.name}" alt="${agent.name}" />
        <h3>${agent.name}</h3>
        <p><strong>CSAT:</strong> ${agent.csat} ⭐</p>
        <p><strong>Chat:</strong> ${agent.conversation} | Komplain: ${agent.complain}</p>
        <div class="kategori-label ${kategoriClass}">${agent.kategori}</div>
        <div class="badge">${agent.badge}</div>
      </div>
    `;
    container.innerHTML += card;
  });
}

function getKategoriClass(kategori) {
  if (kategori.includes('Solutif')) return 'kategori-solutif';
  if (kategori.includes('Responsif')) return 'kategori-responsif';
  if (kategori.includes('disayang')) return 'kategori-disayang';
  return 'kategori-semangat';
}

// === LOAD SHEET 2 (PIE CHART) ===
let pieChart;
function loadSheet2() {
  fetch(sheet2URL)
    .then(res => res.text())
    .then(csv => {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(','); // Nama, Conversation, User, Rating
      const rows = lines.slice(1).map(row => {
        const [name, conv, user, rating] = row.split(',');
        return {
          name: name.trim(),
          conversation: parseInt(conv.replace(/,/g, '')) || 0,
          user: parseInt(user.replace(/,/g, '')) || 0,
          rating: parseFloat(rating) || 0
        };
      });

      renderPieChart(rows, 'Conversation');

      document.getElementById('pieFilter').addEventListener('change', (e) => {
        renderPieChart(rows, e.target.value);
      });
    });
}

function renderPieChart(data, field) {
  const labels = data.map(d => d.name);
  const values = data.map(d => d[field.toLowerCase()]);
  const ctx = document.getElementById('statChart').getContext('2d');

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: field,
        data: values,
        backgroundColor: [
          '#f87171', '#fbbf24', '#34d399',
          '#60a5fa', '#a78bfa', '#f472b6', '#facc15'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
