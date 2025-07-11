// === Konstanta URL Sheet CSV ===
const sheet1URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=0&single=true&output=csv';
const sheet2URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=4322856&single=true&output=csv';

// === Load Data saat DOM Siap ===
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

// === SHEET 1 (TOP AGENT) ===
function loadSheet1() {
  fetch(sheet1URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split('\n').slice(1); // Skip header
      const agents = rows.map(row => {
        const [no, name, conv, reply, csat, kategori, badge, image] = row.split(',');
        return {
          no: parseInt(no),
          name: name?.trim(),
          conversation: parseInt(conv?.replace(/,/g, '')) || 0,
          reply: reply?.trim(),
          csat: parseFloat(csat) || 0,
          kategori: kategori?.trim(),
          badge: badge?.trim(),
          image: image?.trim()
        };
      }).filter(a => a.name);

      const sorted = [...agents].sort((a, b) => a.no - b.no);
      renderAgents('topAgents', sorted.slice(0, 3));
      renderAgents('bottomAgents', sorted.slice(3));
    });
}

function renderAgents(containerId, agentList) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  agentList.forEach(agent => {
    const kategoriClass = getKategoriClass(agent.kategori);
    const imgSrc = agent.image || `https://api.dicebear.com/8.x/thumbs/svg?seed=${agent.name}`;
    container.innerHTML += `
      <div class="card">
        <img src="${imgSrc}" alt="${agent.name}" />
        <h3>${agent.name}</h3>
        <p><strong>CSAT:</strong> ${agent.csat} ⭐</p>
        <p><strong>Chat:</strong> ${agent.conversation} 💬</p>
        <p><strong>First Reply: ${agent.reply} ⏰</p>
        <div class="kategori-label ${kategoriClass}">${agent.kategori}</div>
        <div class="badge">${agent.badge}</div>
      </div>
    `;
  });
}

function getKategoriClass(kategori) {
  if (kategori.includes('Solutif')) return 'kategori-solutif';
  if (kategori.includes('Responsif')) return 'kategori-responsif';
  if (kategori.includes('disayang')) return 'kategori-disayang';
  return 'kategori-semangat';
}

// === SHEET 2 (PIE CHART) ===
let pieChart;
function loadSheet2() {
  fetch(sheet2URL)
    .then(res => res.text())
    .then(csv => {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(row => {
        const [name, conv, user, rating] = row.split(',');
        return {
          name: name?.trim(),
          conversation: parseInt(conv?.replace(/,/g, '')) || 0,
          user: parseInt(user?.replace(/,/g, '')) || 0,
          rating: parseFloat(rating) || 0
        };
      }).filter(a => a.name);

      renderPieChart(rows, 'Conversation');
      document.getElementById('pieFilter').addEventListener('change', e => {
        renderPieChart(rows, e.target.value);
      });
    });
}

function renderPieChart(data, field) {
  const ctx = document.getElementById('statChart').getContext('2d');
  const labels = data.map(d => d.name);
  const values = data.map(d => d[field.toLowerCase()]);

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
        datalabels: {
          formatter: (value, ctx) => {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1) + '%';
            return `${ctx.chart.data.labels[ctx.dataIndex]}\n${value} (${percentage})`;
          },
          color: '#fff',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        legend: {
          position: 'bottom'
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}
