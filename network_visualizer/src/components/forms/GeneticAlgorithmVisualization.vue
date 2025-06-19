<template>
  <div class="form-overlay">
    <div class="algorithm-container">
      <div class="header">
        <div class="title-row">
          <h2>Genetic Algorithm Execution</h2>
          <button @click="close" class="close-button" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="header-controls">
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
            <span class="progress-text">{{ currentGeneration }} / {{ totalGenerations }} generations</span>
          </div>
          <button @click="stopAlgorithm" class="stop-button" :disabled="!isRunning">
            {{ isRunning ? 'Stop Algorithm' : 'Algorithm Finished' }}
          </button>
        </div>
      </div>

      <div class="main-content">
        <div class="left-panel">
          <div class="stats-grid">
            <div class="stat-card best-score">
              <h3>Best Score</h3>
              <div class="stat-value">{{ bestScore }}</div>
              <div class="stat-trend" :class="trendClass(bestScoreTrend)">
                <span v-if="bestScoreTrend !== 0">
                  {{ bestScoreTrend > 0 ? '↑' : '↓' }} {{ Math.abs(bestScoreTrend).toFixed(2) }}
                </span>
              </div>
            </div>

            <div class="stat-card average-score">
              <h3>Average Score</h3>
              <div class="stat-value">{{ averageScore.toFixed(2) }}</div>
              <div class="stat-trend" :class="trendClass(averageScoreTrend)">
                <span v-if="averageScoreTrend !== 0">
                  {{ averageScoreTrend > 0 ? '↑' : '↓' }} {{ Math.abs(averageScoreTrend).toFixed(2) }}
                </span>
              </div>
            </div>

            <div class="stat-card messages-sent">
              <h3>Messages Sent</h3>
              <div class="stat-value">{{ totalMessagesSent }}</div>
            </div>

            <div class="stat-card messages-accepted">
              <h3>Messages Accepted</h3>
              <div class="stat-value">{{ totalMessagesAccepted }}</div>
              <div class="acceptance-rate">
                {{ acceptanceRate }}% acceptance rate
              </div>
            </div>
          </div>

          <div class="generation-details">
            <h3>Generation Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Current Generation:</span>
                <span class="detail-value">{{ currentGeneration }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Elitism Rate:</span>
                <span class="detail-value">{{ elitismRate }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Mutation Rate:</span>
                <span class="detail-value">{{ mutationRate }}%</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Best Genome:</span>
                <span class="detail-value genome-preview">{{ bestGenomePreview }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="chart-wrapper">
            <h3>Score Evolution</h3>
            <div class="chart" ref="scoreChart" v-show="chartsMounted"></div>
            <div v-if="!chartsMounted" class="chart-placeholder">Loading chart...</div>
          </div>
          <div class="chart-wrapper">
            <h3>Messages Statistics</h3>
            <div class="chart" ref="messagesChart" v-show="chartsMounted"></div>
            <div v-if="!chartsMounted" class="chart-placeholder">Loading chart...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useGeneticAlgorithmStore } from '@/stores/geneticAlgorithmStore'
import * as echarts from 'echarts'

const emit = defineEmits(['finished', 'stopped', 'close'])

const gaStore = useGeneticAlgorithmStore()

// Chart refs and state
const scoreChart = ref(null)
const messagesChart = ref(null)
const chartsMounted = ref(false)
let scoreChartInstance = null
let messagesChartInstance = null
let resizeObserver = null

// Data refs
const previousBestScore = ref(0)
const previousAverageScore = ref(0)

// Computed properties
const isRunning = computed(() => gaStore.isRunning)
const currentGeneration = computed(() => gaStore.currentGeneration)
const totalGenerations = computed(() => gaStore.config.generations)
const progressPercentage = computed(() => (currentGeneration.value / totalGenerations.value) * 100)
const bestScore = computed(() => gaStore.stats.bestSpread)
const averageScore = computed(() => gaStore.stats.averageSpread)
const totalMessagesSent = computed(() => gaStore.stats.totalMessagesSent)
const totalMessagesAccepted = computed(() => gaStore.stats.totalMessagesAccepted)
const acceptanceRate = computed(() => {
  if (totalMessagesSent.value === 0) return 0
  return ((totalMessagesAccepted.value / totalMessagesSent.value) * 100).toFixed(2)
})
const bestGenomePreview = computed(() => {
  if (!gaStore.stats.bestSolution) return 'N/A'
  return gaStore.stats.bestSolution.map(val => val.toFixed(2)).join(', ')
})
const elitismRate = computed(() => gaStore.config.elitismRate)
const mutationRate = computed(() => gaStore.config.mutationRate)
const bestScoreTrend = computed(() => bestScore.value - previousBestScore.value)
const averageScoreTrend = computed(() => averageScore.value - previousAverageScore.value)

// Initialize charts when component is mounted
onMounted(async () => {
  await nextTick() 
  
  try {
    // Initialize resize observer
    resizeObserver = new ResizeObserver(() => {
      scoreChartInstance?.resize()
      messagesChartInstance?.resize()
    })

    // Initialize charts only if DOM elements exist
    if (scoreChart.value && messagesChart.value) {
      scoreChartInstance = echarts.init(scoreChart.value)
      messagesChartInstance = echarts.init(messagesChart.value)
      resizeObserver.observe(scoreChart.value)
      resizeObserver.observe(messagesChart.value)
      updateCharts()
      chartsMounted.value = true
    }
  } catch (error) {
    console.error('Error initializing charts:', error)
  }
})

// Clean up on unmount
onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (scoreChartInstance) {
    scoreChartInstance.dispose()
    scoreChartInstance = null
  }
  if (messagesChartInstance) {
    messagesChartInstance.dispose()
    messagesChartInstance = null
  }
})

// Watch for data changes to update charts
watch(() => gaStore.generationsData, (newVal) => {
  if (newVal.length > 0) {
    updateCharts()
  }
}, { deep: true })
watch(() => gaStore.isRunning, () => {
  updateCharts()
}, { deep: true })


function trendClass(trendValue) {
  if (trendValue > 0) return 'positive'
  if (trendValue < 0) return 'negative'
  return 'neutral'
}

function updateCharts() {
  if (!scoreChartInstance || !messagesChartInstance) return

  const generations = gaStore.generationsData
  if (generations.length === 0) return

  // Update trends
  if (generations.length > 1) {
    previousBestScore.value = generations[generations.length - 2].bestScore
    previousAverageScore.value = generations[generations.length - 2].averageScore
  }

  // Prepare data for charts
  const generationNumbers = generations.map((_, idx) => (idx + 1).toString());
  const bestScores = generations.map(gen => gen.bestScore);
  const averageScores = generations.map(gen => gen.averageScore);
  const messagesSent = generations.map(gen => gen.messagesSent || 0);
  const messagesAccepted = generations.map(gen => gen.messagesAccepted || 0);
  const messagesRejected = generations.map(gen => (gen.messagesSent || 0) - (gen.messagesAccepted || 0));

  // Configuración del gráfico de scores
  const scoreOption = {
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const data = params[0]
        return `Generation ${data.name}<br/>
                Best: ${data.value[1]}<br/>
                Avg: ${generations[data.dataIndex].averageScore.toFixed(2)}`
      }
    },
    legend: {
      data: ['Best Score', 'Average Score'],
      textStyle: { color: '#ffffff' }
    },
    xAxis: {
      type: 'category',
      data: generationNumbers,
      axisLabel: { color: '#a8dadc' }
    },
    yAxis: {
      type: 'value',
      name: 'Spread',
      nameTextStyle: { color: '#a8dadc' },
      axisLabel: { color: '#a8dadc' }
    },
    series: [
      {
        name: 'Best Score',
        type: 'line',
        showSymbol: true,
        data: bestScores, 
        lineStyle: {
          color: '#42b883',
          width: 3
        },
        itemStyle: {
          color: '#42b883'
        }
      },
      {
        name: 'Average Score',
        type: 'line',
        showSymbol: true,
        data: averageScores,
        lineStyle: {
          color: '#3498db',
          width: 3
        },
        itemStyle: {
          color: '#3498db'
        }
      }
    ],
    animation: !gaStore.isRunning,
    backgroundColor: 'transparent'
  }

  // Configuración del gráfico de mensajes
  const messagesOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Sent', 'Accepted', 'Rejected'],
      textStyle: { color: '#ffffff' }
    },
    xAxis: {
      type: 'category',
      data: generationNumbers,
      axisLabel: { color: '#a8dadc' }
    },
    yAxis: {
      type: 'value',
      name: 'Messages',
      nameTextStyle: { color: '#a8dadc' },
      axisLabel: { color: '#a8dadc' }
    },
    series: [
      {
        name: 'Sent',
        type: 'bar',
        stack: 'total',
        data: messagesSent,
        itemStyle: {
          color: '#3498db'
        }
      },
      {
        name: 'Accepted',
        type: 'bar',
        stack: 'total',
        data: messagesAccepted,
        itemStyle: {
          color: '#42b883'
        }
      },
      {
        name: 'Rejected',
        type: 'bar',
        stack: 'total',
        data: messagesRejected,
        itemStyle: {
          color: '#ff5c5c'
        }
      }
    ],
    animation: !gaStore.isRunning,
    backgroundColor: 'transparent'
  }

  // Set chart options
  try {
    scoreChartInstance.setOption(scoreOption, { notMerge: true });
    messagesChartInstance.setOption(messagesOption, { notMerge: true });
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}

function stopAlgorithm() {
  emit('stopped')
}

function close() {
  emit('close')
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 30, 46, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  overflow-y: auto;
  padding: 1rem;
}

.algorithm-container {
  background: #1e1e2e;
  color: #ffffff;
  padding: 1.5rem;
  border-radius: 16px;
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

h2, h3 {
  margin: 0;
  color: #ffffff;
}

h2 {
  font-size: 1.5rem;
  background: linear-gradient(45deg, #42b883, #3498db);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.progress-container {
  flex-grow: 1;
  min-width: 200px;
  max-width: 300px;
  background: #3a3a5a;
  border-radius: 8px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #3498db);
  border-radius: 8px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.stop-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: #ff5c5c20;
  color: #ff5c5c;
  border: 1px solid #ff5c5c40;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.stop-button:hover {
  background: #ff5c5c40;
}

.stop-button:disabled {
  background: #3a3a5a;
  color: #a8dadc;
  cursor: not-allowed;
  border-color: #3a3a5a;
}

.close-button {
  background: none;
  border: none;
  color: #a8dadc;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.close-button svg {
  display: block;
}

.main-content {
  display: flex;
  gap: 1.5rem;
  overflow: hidden;
  flex: 1;
}

.left-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.right-panel {
  flex: 2;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #25253a;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.best-score .stat-value {
  color: #42b883;
}

.average-score .stat-value {
  color: #3498db;
}

.messages-sent .stat-value {
  color: #3498db;
}

.messages-accepted .stat-value {
  color: #42b883;
}

.stat-trend {
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-trend.positive {
  color: #42b883;
}

.stat-trend.negative {
  color: #ff5c5c;
}

.stat-trend.neutral {
  color: #a8dadc;
}

.acceptance-rate {
  font-size: 0.9rem;
  color: #a8dadc;
}

.chart-wrapper {
  background: #25253a;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 250px;
  width: 100%;
  min-height: 250px; 
  flex: 1;
}

.chart-placeholder {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a8dadc;
  font-style: italic;
}

.generation-details {
  background: #25253a;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.85rem;
  color: #a8dadc;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
}

.genome-preview {
  font-family: monospace;
  font-size: 0.85rem;
  word-break: break-all;
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-panel, .right-panel {
    min-width: 100%;
  }
  
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-container {
    max-width: 100%;
  }
}
</style>