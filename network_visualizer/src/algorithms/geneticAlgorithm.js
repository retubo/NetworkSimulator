import { useGeneticAlgorithmStore } from '@/stores/geneticAlgorithmStore'
import { cloneDeep } from 'lodash'
import { nextTick } from 'vue'

const PROPERTY_KEYS = ['Sub', 'Pol', 'Fea', 'Ang', 'Ant', 'Tru', 'Sur', 'Sad', 'Dis', 'Joy']

class SeededRandom {
  constructor(seedStr) {
    // Convert string seed to a number using a simple hash
    this.seed = this.hashString(seedStr);
    // LCG parameters (common choices)
    this.multiplier = 1664525;
    this.increment = 1013904223;
    this.modulus = Math.pow(2, 32);
  }

  hashString(str) {
    if (str === null || str === undefined || str.length === 0) {
      return Math.floor(Math.random() * Math.pow(2,32)); // Fallback for truly empty seed
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash); // Ensure positive seed
  }

  // Generates a pseudo-random number between 0 (inclusive) and 1 (exclusive)
  next() {
    this.seed = (this.multiplier * this.seed + this.increment) % this.modulus;
    return this.seed / this.modulus;
  }
}
  

// Crea un genoma aleatorio (10 valores entre 0 y 1)
function createRandomGenome() {
  return PROPERTY_KEYS.map(() => Math.random())
}

// Cruce de dos genomas (crossover)
function crossoverGenomes(parent1, parent2) {
  if (!parent1 || !parent2) return [createRandomGenome(), createRandomGenome()]
  
  const crossoverPoint = Math.floor(Math.random() * parent1.length)
  const child1 = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)]
  const child2 = [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)]
  return [child1, child2]
}

// Mutación: modifica aleatoriamente genes basado en mutationRate
function mutateGenome(genome, mutationRate) {
  if (!genome) return createRandomGenome()
  
  return genome.map(gene => {
    if (Math.random() < mutationRate / 100) {
      return Math.random()
    }
    return gene
  })
}

// Convierte un genoma a un objeto mensaje con propiedades nombradas
function genomeToMessage(genome) {
  if (!genome) return { id: 'invalid-genome', properties: {} }
  
  const properties = {}
  PROPERTY_KEYS.forEach((key, i) => {
    properties[key] = genome[i] || 0
  })
  return { 
    id: `ga-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, 
    properties 
  }
}

// Función de compatibilidad
function compatibilityScore(nodeStats, messageStats, prefix) {
  let score = 0
  for (const key of PROPERTY_KEYS) {
    const nodeVal = nodeStats[`${prefix}_${key}`] ?? 0
    const msgVal = messageStats[key] ?? 0
    score += Math.abs(nodeVal - msgVal)
  }
  if (PROPERTY_KEYS.length === 0) return 1
  return Math.max(0, 1 - (score / PROPERTY_KEYS.length))
}

// Simulación de un paso del algoritmo genético
function processGeneticStep(gaStore) {
  // Resetear estados
  // gaStore.activeNetwork.nodes.forEach(node => {
  //   node.state = 'waiting'
  // })
  // gaStore.activeNetwork.links.forEach(link => {
  //   link.state = 'waiting'
  // })
  
  // Procesar mensajes en cada nodo
  const nodesToProcess = [...gaStore.activeNetwork.nodes]
  for (const node of nodesToProcess) {
    if (node.messages.length > 0) {
      const msg = node.messages.shift()
      node.past_received_messages.push(cloneDeep(msg))

      const sendProbability = compatibilityScore(node.properties, msg.properties, 'out')

      if (gaStore.prng.next() < sendProbability && 
          !node.past_sent_messages.some(m => m.id === msg.id)) {
        node.state = 'sending'
        node.past_sent_messages.push(cloneDeep(msg))

        // Enviar mensaje a los seguidores
        const followers = gaStore.activeNetwork.links
          .filter(link => link.source === node.id)
          .map(link => link.target)
          
        for (const followerId of followers) {
          const follower = gaStore.activeNetwork.nodes.find(n => n.id === followerId)
          if (follower) {
            readGeneticMessage(gaStore, msg, followerId, node.id)
            gaStore.stats.totalMessagesSent++
            gaStore.current_genome_stats.messagesSent++
          }
        }
      } else {
        node.state = 'rejecting'
      }
    }
  }
}

// Lógica de aceptación del mensaje para el algoritmo genético
function readGeneticMessage(gaStore, message, followerId, senderId) {
  const node = gaStore.activeNetwork.nodes.find(n => n.id === followerId)
  const acceptanceProbability = compatibilityScore(node.properties, message.properties, 'in')

  if (gaStore.prng.next() < acceptanceProbability) {
    if (!node.past_received_messages.some(m => m.id === message.id)) {
      const link = gaStore.activeNetwork.links.find(l => l.source === senderId && l.target === followerId)
      if (link) link.state = 'sending'
      
      node.messages.push(cloneDeep(message))
      gaStore.stats.totalMessagesAccepted++
      gaStore.current_genome_stats.messagesAccepted++
    }
  } else {
    const link = gaStore.activeNetwork.links.find(l => l.source === senderId && l.target === followerId)
    if (link) link.state = 'rejecting'
    gaStore.stats.totalMessagesRejected++
    gaStore.current_genome_stats.messagesRejected++
  }
}

// Función de fitness que usa el motor de simulación
async function calculateFitness(genome, gaStore) {
  const message = genomeToMessage(genome)
  
  // Resetear la red activa a su estado original
  gaStore.resetActiveNetwork()
  
  // Configurar generador de números aleatorios
  gaStore.prng = new SeededRandom('genetic-algorithm')
  
  // Insertar mensaje en el primer nodo con la identidad gaStore.senderNodeId
  const sender = gaStore.activeNetwork.nodes.find(node => node.id === gaStore.config.senderNodeId)
  if (sender) {
    sender.messages.push(message)
  }

  // Estadísticas de esta evaluación
  gaStore.current_genome_stats = {
    messagesSent: 0,
    messagesAccepted: 0,
    messagesRejected: 0
  }

  // Simular pasos
  for (let i = 0; i < gaStore.config.iterations; i++) {
    processGeneticStep(gaStore)
  }

  // Calcular alcance (cuántos nodos recibieron el mensaje)
  const spread = gaStore.current_genome_stats.messagesAccepted

  return {
    score: spread,
    ...gaStore.current_genome_stats
  }
}

// Algoritmo genético principal
export async function runGeneticAlgorithm(nodes, links) {
  const gaStore = useGeneticAlgorithmStore()

  // Remove all messages from nodes
  const copiedNodes = cloneDeep(nodes);
  copiedNodes.forEach(node => {
    node.messages = [];
    node.past_received_messages = [];
    node.past_sent_messages = [];
  });
  
  // Inicializar almacenamiento
  gaStore.initializeNetwork(copiedNodes, links)
  gaStore.resetStats()
  gaStore.isRunning = true
  gaStore.prng = new SeededRandom('genetic-algorithm')

  try {
    const config = gaStore.config
    const generationSize = config.generationSize || 20
    const generations = config.generations || 50
    const elitismRate = config.elitismRate || 10
    const mutationRate = config.mutationRate || 5
    const objective = config.objective === 'maximize' ? 'maximize' : 'minimize'

    // Calcular número de individuos élite
    const eliteCount = Math.max(1, Math.floor(generationSize * elitismRate / 100))

    // Población inicial
    let population = Array(generationSize).fill().map(() => createRandomGenome())
    
    for (let gen = 0; gen < generations && gaStore.isRunning; gen++) {
      await nextTick()
      gaStore.currentGeneration = gen + 1
      
      // Evaluar la población actual
      const evaluatedPopulation = []
      
      for (const genome of population) {
        // Evaluar el genoma
        const result = await calculateFitness(genome, gaStore)
        
        evaluatedPopulation.push({
          genome,
          score: result.score,
          messagesSent: result.messagesSent,
          messagesAccepted: result.messagesAccepted,
          messagesRejected: result.messagesRejected
        })
      }

      // Ordenar la población según el objetivo
      evaluatedPopulation.sort((a, b) => 
        objective === 'maximize' ? b.score - a.score : a.score - b.score
      )
      
      // Seleccionar los mejores individuos (élite)
      const elite = evaluatedPopulation.slice(0, eliteCount).map(item => item.genome)
      const bestInGeneration = evaluatedPopulation[0] || { genome: null, score: 0 }

      // Guardar datos de la generación
      const averageScore = evaluatedPopulation.reduce((sum, item) => sum + (item?.score || 0), 0) / generationSize
      
      gaStore.addGenerationData({
        generation: gen + 1,
        bestGenome: bestInGeneration.genome,
        bestScore: bestInGeneration.score,
        averageScore,
        messagesSent: bestInGeneration.messagesSent || 0,
        messagesAccepted: bestInGeneration.messagesAccepted || 0,
        messagesRejected: bestInGeneration.messagesRejected || 0
      })
      await new Promise(resolve => setTimeout(resolve, 50))

      // Actualizar mejor solución global
      if (!gaStore.stats.bestSolution || 
          (objective === 'maximize' && bestInGeneration.score > gaStore.stats.bestSpread) ||
          (objective === 'minimize' && bestInGeneration.score < gaStore.stats.bestSpread)) {
        gaStore.stats.bestSolution = bestInGeneration.genome
        gaStore.stats.bestSpread = bestInGeneration.score
      }

      // Crear nueva población (élite + descendencia)
      const newPopulation = [...elite]
      
      while (newPopulation.length < generationSize) {
        // Selección de padres por torneo
        const tournamentSize = 3
        const tournament = []
        for (let i = 0; i < tournamentSize; i++) {
          const candidate = evaluatedPopulation[Math.floor(Math.random() * evaluatedPopulation.length)]
          if (candidate) tournament.push(candidate)
        }
        
        if (tournament.length > 0) {
          tournament.sort((a, b) => (b?.score || 0) - (a?.score || 0))
          const parent1 = tournament[0]?.genome || createRandomGenome()
          const parent2 = tournament[1]?.genome || createRandomGenome()
          
          // Cruce
          const [child1, child2] = crossoverGenomes(parent1, parent2)
          
          // Mutación
          newPopulation.push(mutateGenome(child1, mutationRate))
          if (newPopulation.length < generationSize) {
            newPopulation.push(mutateGenome(child2, mutationRate))
          }
        } else {
          newPopulation.push(createRandomGenome())
        }
      }
      
      population = newPopulation
    }

    // Devolver la mejor solución encontrada
    return genomeToMessage(gaStore.stats.bestSolution)
  } catch (error) {
    console.error('Error in genetic algorithm:', error)
    throw error
  } finally {
    gaStore.isRunning = false
  }
}

// Función para detener el algoritmo genético
export function stopGeneticAlgorithm() {
  const gaStore = useGeneticAlgorithmStore()
  gaStore.isRunning = false
}