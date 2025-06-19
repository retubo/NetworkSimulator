<template>
    <div>
      <h2 class="sidebar-title">
        <span class="gradient-text">Network Simulator</span>
      </h2>
      <div class="simulator-content">
        <div class="function-container top-row">
            <button class="green-flat-button" @click="startEngine">
            <span v-if="simulatorStore.isSimulating">Playing</span>
            <span v-else>▶ Play</span>
            </button>
          <button class="green-flat-button" @click="pauseEngine">
            <span v-if="simulatorStore.isPaused">Paused</span>
            <span v-else>⏸ Pause</span>
          </button>
          <button class="red-flat-button" @click="stopEngine">
            <span v-if="!simulatorStore.isSimulating && !simulatorStore.isPaused">Stopped</span>
            <span v-else>⏹ Stop</span>
          </button>
        </div>
        <div class="function-container">
          <button class="green-flat-button" @click="() => setSpeedMultiplier(2)">⏩ x2</button>
          <button class="green-flat-button" @click="() => setSpeedMultiplier(0.5)">⏪ x0.5</button>
        </div>
        <div class="function-container">
          <button class="green-toggle" @click="toggleTimeline">
            <span class="icon">📝</span>
            <span v-if="simulatorStore.toggleTimeline" class="status-icon">✔</span>
            <span v-else class="status-icon">✖</span>
          </button>
          <button class="green-flat-button" @click="singleStepEngine(networkStore, simulatorStore)">Single Step Simulation</button>
        </div>
        <button class="green-flat-button insert-multiple" @click="showGeneticAlgorithmForm">
          <span class="icon">🧠</span>
          <span>Execute Genetic Algorithm</span>
        </button>
        <div class="stats-section">
          <!-- <h3 class="section-title">Statistics</h3> -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ nodesCount }}</div>
              <div class="stat-label">Total Nodes</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ linksCount }}</div>
              <div class="stat-label">Connections</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ messagesCount }}</div>
              <div class="stat-label">Messages to send</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ sendedMessages }}</div>
              <div class="stat-label">Sended Messages</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ acceptedMessages }}</div>
              <div class="stat-label">Accepted Messages</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ rejectedMessages }}</div>
              <div class="stat-label">Rejected Messages</div>
            </div>
          </div>
        </div>
        <div class="function-container">
          <label for="seed-input" class="seed-label">Seed:</label>
          <input
              id="seed-input"
              class="seed-input"
              type="text"
              v-model.number="simulatorStore.seed"
              :disabled="simulatorStore.prng !== null"
              @keyup.enter="updateProperties"
            />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useNetworkStore } from '@/stores/networkStore'
  import { useSimulatorStore } from '@/stores/simulatorStore'
  import { startEngine, pauseEngine, stopEngine, setSpeedMultiplier , singleStepEngine } from '@/engine'
  // import { runGeneticAlgorithm } from '@/algorithms/geneticAlgorithm'

  const networkStore = useNetworkStore()
  const simulatorStore = useSimulatorStore()
  const emit = defineEmits(['showGeneticAlgorithmForm'])

  // function launchGA() {
  //   const result = runGeneticAlgorithm()
  //   console.log('Resultado final del algoritmo genético:', result)
  // }

  const showGeneticAlgorithmForm = () => {
    emit('showGeneticAlgorithmForm')
  }

  function toggleTimeline() {
    if (simulatorStore.isSimulating || simulatorStore.isPaused) {
      console.warn('Cannot toggle timeline while the simulation is running or paused.')
      networkStore.info_message = `Cannot toggle timeline while the simulation is running or paused.`

      if (networkStore.infoMessageTimeout) {
        clearTimeout(networkStore.infoMessageTimeout);
      }
      networkStore.infoMessageTimeout = setTimeout(() => {
        networkStore.info_message = '';
        networkStore.infoMessageTimeout = null;
      }, 3000);
      return
    }
    simulatorStore.toggleTimelinefunction()
    networkStore.info_message = `Toggled timeline.`

    if (networkStore.infoMessageTimeout) {
      clearTimeout(networkStore.infoMessageTimeout);
    }
    networkStore.infoMessageTimeout = setTimeout(() => {
      networkStore.info_message = '';
      networkStore.infoMessageTimeout = null;
    }, 3000);
  }

  // Hacer las counts reactivas con computed
  const nodesCount = computed(() => networkStore.nodes.length)
  const linksCount = computed(() => networkStore.links.length)
  const messagesCount = computed(() => networkStore.messages.length)
  const rejectedMessages = computed(() => simulatorStore.rejectedMessagesCount)
  const sendedMessages = computed(() => simulatorStore.sendedMessagesCount)
  const acceptedMessages = computed(() => simulatorStore.acceptedMessagesCount)
  </script>
  
<style scoped>
.stats-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem 1rem;
  margin-top: 1rem; 
}

.section-title {
  color: #a8dadc;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(100px, 1fr));
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.stat-item {
  background: rgba(255, 255, 255, 0.08);
  padding: 1.2rem 0.8rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 600;
  color: #42b883;
  line-height: 1.2;
  margin-bottom: 0.4rem;
}

.stat-label {
  color: #a8dadc;
  font-size: 0.85rem;
  opacity: 0.9;
}

.insert-multiple{
  margin-top: 1rem;
  
}

.top-row {
  margin-top: 0px;
}

.seed-label {
  font-size: 0.9rem;
  color: #a8dadc;
  margin-bottom: 0.5rem;
  display: block;
}

.seed-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid #555;
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  color: #ffffff;
  font-size: 1rem;
}
input[type="text"]:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 1px #42b883;
}

</style>