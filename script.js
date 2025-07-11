const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSafbKaDWKFz7KgimHdBVbMm6mZg-9pmEzLhbwHN2ttWq5HZDcPSRRFgh7n6JNiwGgGAGDKhtQCxat9/pub?output=csv';

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

const loadData = () => {
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n');
      const headers = rows[0].split(',');
      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, key, i) => {
          obj[key.trim()] = values[i] ? values[i].trim() : '';
          return obj;
        }, {});
      });

      const bulan = [...new Set(data.map(d => d['Bulan']))];
      const select = document.getElementById('filter');
      select.innerHTML = bulan.map(b => `<option value="${b}">${b}</option>`).join('');

      const sortedHome = [...data].sort((a, b) => parseInt(a['No']) - parseInt(b['No']));
      const top3 = sortedHome.slice(0, 3);
      const bottom = sortedHome.slice(3);

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

      document.getElementById('topAgents').innerHTML = top3.map(createCard).join('');
      document.getElementById('bottomAgents').innerHTML = bottom.map(createCard).join('');

      const render = (selectedMonth) => {
        const filtered = data.filter(d => d['Bulan'] === selectedMonth);
        filtered.forEach(a => a.CSAT = parseFloat(a.CSAT));
        const sorted = [...filtered].sort((a, b) => parseInt(a['No']) - parseInt(b['No']));
        const top3 = sorted.slice(0, 3);
        const bottom = sorted.slice(3);

        document.getElementById('monthlyTop').innerHTML = top3.map(createCard).join('');
        document.getElementById('monthlyBottom').innerHTML = bottom.map(createCard).join('');

        const dailyLabel = filtered.map(a => a['Agent']);
        const daily = filtered.map(a => parseFloat(a['CSAT']));

        new Chart(document.getElementById('dailyChart'), {
          type: 'line',
          data: {
            labels: dailyLabel,
            datasets: [{
              label: 'CSAT Harian (%)',
              data: daily,
              borderColor: 'coral',
              fill: false
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: true } }
          }
        });

        new Chart(document.getElementById('monthlyChart'), {
          type: 'bar',
          data: {
            labels: dailyLabel,
            datasets: [{
              label: 'CSAT Bulanan (%)',
              data: daily,
              backgroundColor: 'lightblue'
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });
      };

      render(bulan[bulan.length - 1]);
      select.addEventListener('change', (e) => render(e.target.value));
    });
}

loadData();
setInterval(loadData, 86400000);
