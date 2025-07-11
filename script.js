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
      <img src="${agent['Foto'] || 'https://via.placeholder.com/120'}" alt="${agent['Agent']}" />
      <h3>${agent['Agent']}</h3>
      <p><strong>CSAT:</strong> ${agent['CSAT']} ⭐</p>
      <p><strong>Chat:</strong> ${agent['Total Conversation']} | Komplain: ${agent['Total Komplain']}</p>
      <p class="kategori-label ${kategoriClass(kategori)}">${kategori}</p>
      <p class="badge">${agent['Badge'] || ''}</p>
    </div>
  `;
};

const SHEET2_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?gid=4322856&single=true&output=csv';

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
      const [headerLine, ...lines] = csv.trim().split('\n');
      const headers = headerLine.split(',');
      const data = lines.map(line => {
        const values = line.split(',');
        return headers.reduce((obj, key, i) => {
          obj[key.trim()] = values[i] ? values[i].trim() : '';
          return obj;
        }, {});
      });

      const grouped = {};
      data.forEach(row => {
        const nama = row['Nama'] || row['Agent'] || 'Unknown';
        if (!grouped[nama]) grouped[nama] = { Nama: nama, Conversation: 0, User: 0, Rating: 0, count: 0 };
        grouped[nama].Conversation += parseInt(row['Conversation']) || 0;
        grouped[nama].User += parseInt(row['User']) || 0;
        grouped[nama].Rating += parseFloat(row['Rating']) || 0;
        grouped[nama].count++;
      });

      const pieData = Object.values(grouped).map(item => {
        item.Rating = (item.Rating / item.count).toFixed(2);
        return item;
      });

      renderPieChart(pieData, 'Conversation');
      document.getElementById('pieFilter').addEventListener('change', (e) => {
        renderPieChart(pieData, e.target.value);
      });
    });
});
