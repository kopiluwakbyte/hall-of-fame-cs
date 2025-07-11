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

fetch(SHEET2_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').map(r => r.split(','));
    const header = rows[0];
    const data = rows.slice(1).map(r => {
      return {
        tanggal: r[0],
        CSAT: parseFloat(r[1]),
        Conversation: parseInt(r[2]),
        Komplain: parseInt(r[3])
      }
    });

    const ctx = document.getElementById('statChart').getContext('2d');
    let chart;

    const renderChart = (label) => {
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => d.tanggal),
          datasets: [{
            label: label,
            data: data.map(d => d[label]),
            borderColor: 'coral',
            fill: false,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: true }
          }
        }
      });
    };

    renderChart('CSAT');
    document.getElementById('statFilter').addEventListener('change', (e) => {
      renderChart(e.target.value);
    });
  });
