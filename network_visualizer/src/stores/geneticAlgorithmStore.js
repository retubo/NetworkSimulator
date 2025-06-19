import { defineStore } from 'pinia'
import { ref } from 'vue'
import cloneDeep from 'lodash/cloneDeep'

export const useGeneticAlgorithmStore = defineStore('geneticAlgorithm', () => {
  // Configuración del algoritmo
  const config = ref({
    objective: 'maximize',
    generations: 50,
    generationSize: 20,
    iterations: 10,
    elitismRate: 10,
    mutationRate: 5,
    senderNodeId: ""
  })

  // Datos de la red (copias)
  const originalNetwork = ref(null)
  const activeNetwork = ref(null)
  const prng = ref(null)

  // Datos de seguimiento
  const generationsData = ref([])
  const currentGeneration = ref(0)
  const isRunning = ref(false)

  // Estadísticas
  const stats = ref({ // Estadísticas generales del algoritmo
    totalMessagesSent: 0,
    totalMessagesAccepted: 0,
    totalMessagesRejected: 0,
    averageSpread: 0,
    bestSpread: 0,
    bestSolution: ref(null),
  })
  const current_genome_stats = ref({ // Estadísticas del genoma actual
    messagesSent: 0,
    messagesAccepted: 0,
    messagesRejected: 0,
  })

  // Métodos
  const initializeNetwork = (nodes, links) => {
    originalNetwork.value = {
      nodes: cloneDeep(nodes || []),
      links: cloneDeep(links || []),
      timestamp: Date.now()
    }
    resetActiveNetwork()
  }

  const resetActiveNetwork = () => {
    if (originalNetwork.value) {
      activeNetwork.value = cloneDeep(originalNetwork.value)
    } else {
      activeNetwork.value = {
        nodes: [],
        links: []
      }
    }
    // Resetear estadísticas de mensajes para cada evaluación
    current_genome_stats.value.totalMessagesSent = 0
    current_genome_stats.value.totalMessagesAccepted = 0
    current_genome_stats.value.totalMessagesRejected = 0
  }

  const updateConfig = (newConfig) => {
    const normalizedConfig = {
      ...newConfig,
      objective: newConfig.objective === 'maximize' ? 'maximize' : 'minimize',
      generationSize: newConfig.generation_size || newConfig.generationSize || 20
    }
    config.value = { ...config.value, ...normalizedConfig }
  }

  const resetStats = () => {
    generationsData.value = []
    currentGeneration.value = 0
    stats.value = {
      totalMessagesSent: 0,
      totalMessagesAccepted: 0,
      totalMessagesRejected: 0,
      averageSpread: 0,
      bestSpread: 0,
      bestSolution: ref(null),
    }
    resetActiveNetwork()
  }

  const addGenerationData = (data) => {
    if (!data) return
    
    generationsData.value.push(data)
    
    // Actualizar estadísticas generales
    stats.value.totalMessagesSent += data.messagesSent || 0
    stats.value.totalMessagesAccepted += data.messagesAccepted || 0
    stats.value.totalMessagesRejected += data.messagesRejected || 0
    
    if (config.value.objective === 'maximize') {
      if ((data.bestScore || 0) > stats.value.bestSpread) {
        stats.value.bestSpread = data.bestScore || 0
        stats.value.bestSolution = data.bestGenome
      }
    } else {
      if (currentGeneration.value === 0 || (data.bestScore || 0) < stats.value.bestSpread) {
        stats.value.bestSpread = data.bestScore || 0
        stats.value.bestSolution = data.bestGenome
      }
    }
    
    const validGenerations = generationsData.value.filter(gen => gen.averageScore !== undefined)
    stats.value.averageSpread = validGenerations.reduce((sum, gen) => sum + (gen.averageScore || 0), 0) / (validGenerations.length || 1)
  }

  return {
    config,
    originalNetwork,
    activeNetwork,
    prng,
    generationsData,
    currentGeneration,
    isRunning,
    stats,
    current_genome_stats,
    initializeNetwork,
    resetActiveNetwork,
    updateConfig,
    resetStats,
    addGenerationData,
  }
})