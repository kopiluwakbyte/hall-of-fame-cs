const agents = [
  { nama: 'Dewi Wulandari', csat: 98.5, foto: 'https://i.imgur.com/xxx1.jpg' },
  { nama: 'Raka Pradana', csat: 97.8, foto: 'https://i.imgur.com/xxx2.jpg' },
  { nama: 'Fitri Aulia', csat: 96.9, foto: 'https://i.imgur.com/xxx3.jpg' },
  { nama: 'Bagas Saputra', csat: 89.4, foto: 'https://i.imgur.com/xxx4.jpg' },
  { nama: 'Lia Kusuma', csat: 88.7, foto: 'https://i.imgur.com/xxx5.jpg' },
  { nama: 'Andi Setiawan', csat: 85.2, foto: 'https://i.imgur.com/xxx6.jpg' }
];

agents.sort((a, b) => b.csat - a.csat);
const top3 = agents.slice(0, 3);
const bottom3 = agents.slice(-3);

const createCard = (agent) => `
  <div class="card">
    <img src="${agent.foto}" alt="${agent.nama}" />
    <h3>${agent.nama}</h3>
    <p>CSAT: ${agent.csat}%</p>
  </div>
`;

document.getElementById('topAgents').innerHTML = top3.map(createCard).join('');
document.getElementById('bottomAgents').innerHTML = bottom3.map(createCard).join('');

const days = ['1', '2', '3', '4', '5', '6', '7'];
const dailyCSAT = [95, 94, 96, 97, 93, 98, 96];

new Chart(document.getElementById('dailyChart'), {
  type: 'line',
  data: {
    labels: days,
    datasets: [{
      label: 'CSAT Harian (%)',
      data: dailyCSAT,
      borderColor: 'coral',
      fill: false
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: true } }
  }
});

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const monthlyCSAT = [93, 94, 96, 92, 97, 95];

new Chart(document.getElementById('monthlyChart'), {
  type: 'bar',
  data: {
    labels: months,
    datasets: [{
      label: 'CSAT Bulanan (%)',
      data: monthlyCSAT,
      backgroundColor: 'lightblue'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } }
  }
});
