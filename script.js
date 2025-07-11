const SHEET1_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=0&single=true&output=csv';
const SHEET2_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=4322856&single=true&output=csv';

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

const kategoriClass = kategori => {
  if (kategori.includes('Solutif')) return 'kategori-solutif';
  if (kategori.includes('Responsif')) return 'kategori-responsif';
  if (kategori.includes('disayang')) return 'kategori-disayang';
  return 'kategori-semangat';
};

const createCard = (agent) => {
  const kategori = agent['Kategori'] || '-';
  return `
    <div class="card fade-up">
      <img src="${agent['Foto'] || 'https://via.placeholder.com/120'}" alt="${agent['Agent'] || 'Agent'}" />
      <h3>${agent['Agent']}</h3>
      <p><strong>CSAT:</strong> ${agent['CSAT']} ⭐</p>
      <p><strong>Chat:</strong> ${agent['Total Conversation']} | Komplain: ${agent['Total Komplain']}</p>
      <p class="kategori-label ${kategoriClass(kategori)}">${kategori}</p>
      <p class="badge">${agent['Badge'] || ''}</p>
    </div>
  `;
};

// sheet1 for top agents
const SHEET1_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=0&single=true&output=csv';
// sheet2 for monthly pie chart
const SHEET2_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=4322856&single=true&output=csv';

// --- HOME SECTION ---
fetch(SHEET1_URL)
  .then(res => res.text())
  .then(csv => {
    const [header, ...lines] = csv.trim().split('\n');
    const keys = header.split(',');
    const data = lines.map(row => {
      const values = row.split(',');
      return keys.reduce((obj, key, i) => {
        obj[key.trim()] = values[i] ? values[i].trim() : '';
        return obj;
      }, {});
    });

    const top3 = data.slice(0, 3);
    const others = data.slice(3);
    document.getElementById('topAgents').innerHTML = top3.map(createCard).join('');
    document.getElementById('bottomAgents').innerHTML = others.map(createCard).join('');
  });

// --- MONTH SECTION ---
const pieCtx = document.getElementById('statChart').getContext('2d');
let pieChart;

function renderPieChart(data, key) {
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: data.map(item => item.Nama),
      datasets: [{
        label: key,
        data: data.map(item => parseFloat(item[key]) || 0),
        backgroundColor: [
          '#f87171', '#fb923c', '#facc15', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'
        ]
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1500,
        easing: 'easeOutBounce'
      },
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch(SHEET2_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n').map(row => row.split(','));
      const header = rows[0];
      const data = rows.slice(1);

      // expecting: Nama, Conversation, User, Rating
const formatted = data.map(r => {
  return {
    Nama: r[0],
    Conversation: parseInt(r[1].replace(/,/g, '')) || 0,
    User: parseInt(r[2].replace(/,/g, '')) || 0,
    Rating: parseFloat(r[3]) || 0
  };
}).filter(d => d.Nama);

      renderPieChart(formatted, 'Conversation');

      document.getElementById('pieFilter').addEventListener('change', (e) => {
        renderPieChart(formatted, e.target.value);
      });
    });
});

