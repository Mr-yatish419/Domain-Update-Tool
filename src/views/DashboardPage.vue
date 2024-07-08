<template>
  <div class="dashboard">
    <button class="exit-button" @click="redirectToDomainChange">Exit</button>
    <h1>Dashboard</h1>
    <div class="summary">
      <p>Total Domains: {{ totalDomains }}</p>
    </div>
    <div class="charts-container">
      <div class="row">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export default {
  data() {
    return {
      totalDomains: 0,
      chartInstance: null,
      userData: [],
    };
  },
  async created() {
    await this.fetchSummary();
    await this.fetchUserData();
    this.$nextTick(() => {
      setTimeout(() => {
        this.initializeCharts();
      }, 100); // Adding a slight delay to ensure canvas elements are rendered
    });
  },
  methods: {
    redirectToDomainChange() {
      window.location.href = '/Domainchange';
    },
    async fetchSummary() {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await fetch(`http://localhost/sentence-validation/FetchDashboardData.php?user_id=${userId}`);
        const data = await response.json();
        this.totalDomains = data.summary.totalDomains;
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    },
    async fetchUserData() {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await fetch(`http://localhost/sentence-validation/FetchDashboardData.php?user_id=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('User Data:', data); // Log the fetched user data
        this.userData = data.userData;
        console.log('User Data for Chart:', this.userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    initializeCharts() {
      this.$nextTick(() => {
        const canvas1 = this.$refs.chartCanvas;

        if (canvas1) {
          const ctx1 = canvas1.getContext('2d');

          // Grouping data by user_id for the chart
          const groupedData = this.userData.reduce((acc, curr) => {
            const date = curr.date;
            if (!acc[date]) {
              acc[date] = { date: date, domainCounts: 0 };
            }
            acc[date].domainCounts += curr.domain_count;
            return acc;
          }, {});

          const chartData = Object.values(groupedData);

          // Chart: User-specific Domain Changes
          const config = {
            type: 'bar',
            data: {
              labels: chartData.map(item => item.date),
              datasets: [{
                label: `User Domain Changes`,
                data: chartData.map(item => item.domainCounts),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
              }],
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Domain Changes Per Day',
                },
              },
              scales: {
                x: {
                  type: 'time',
                  display: true,
                  offset: true,
                  ticks: {
                    source: 'data',
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 45,
                  },
                  time: {
                    unit: 'day',
                    tooltipFormat: 'MMM dd',
                    displayFormats: {
                      day: 'MMM dd'
                    }
                  }
                },
              },
            },
          };

          this.chartInstance = new Chart(ctx1, config);
        } else {
          console.error('Canvas element not found.');
        }
      });
    },
  },
  watch: {
    userData(newData) {
      if (this.chartInstance) {
        const groupedData = newData.reduce((acc, curr) => {
          const date = curr.date;
          if (!acc[date]) {
            acc[date] = { date: date, domainCounts: 0 };
          }
          acc[date].domainCounts += curr.domain_count;
          return acc;
        }, {});

        const chartData = Object.values(groupedData);

        this.chartInstance.data.labels = chartData.map(item => item.date);
        this.chartInstance.data.datasets[0].data = chartData.map(item => item.domainCounts);
        this.chartInstance.update();
      }
    }
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
  text-align: center;
  position: relative;
}

.exit-button {
  position: absolute;
  top: -60px;
  left: 0;
  background-color: #ff000096;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
}

.summary {
  margin-bottom: 20px;
}

.summary p {
  font-size: 20px;
  font-weight: bold;
}

.charts-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.row {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
}

.row canvas {
  flex: 1;
  max-width: 40%;
  height: 300px !important;
}

@media (max-width: 768px) {


  .row canvas {
    max-width: 90%;
    height: 300px !important;
  }
}

@media (max-width: 480px) {

  .row canvas {
    max-width: 100%;
    height: 300px !important;
  }
}
</style>

