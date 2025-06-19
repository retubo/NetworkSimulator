import { useNetworkStore } from '@/stores/networkStore'
import { useSimulatorStore } from '@/stores/simulatorStore'

let intervalId = null

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

export function startEngine() {
  const networkStore = useNetworkStore()
  const simulatorStore = useSimulatorStore()
  if (intervalId) return // ya está corriendo

  if (!simulatorStore.isPaused && !simulatorStore.isSimulating) { // if the network is starting fresh (not paused)
    let currentSeed = simulatorStore.seed
    if (currentSeed === null || currentSeed === undefined || currentSeed.trim() === "") {
      // Generate a random string seed if current one is "0" or empty
      currentSeed = Math.random().toString(36).substring(2, 18).toUpperCase() // e.g., "A1B2C3D4E5F6G7H8"
      simulatorStore.seed = currentSeed // Update the store with the generated seed
      console.log(`No valid seed provided. Generated new seed: ${currentSeed}`)
    }
    simulatorStore.prng = new SeededRandom(currentSeed) // Initialize PRNG with the chosen/generated seed
    console.log(`Simulation started with seed: ${currentSeed}`)

    simulatorStore.initialMessagesCount = networkStore.messages.length
    simulatorStore.sendedMessagesCount = 0
    simulatorStore.acceptedMessagesCount = 0
    simulatorStore.rejectedMessagesCount = 0

    simulatorStore.resetTimeline();
    if (simulatorStore.toggleTimeline) {
      const initialSnapshot = networkStore.getCurrentStateSnapshot()
      simulatorStore.addTimelineFrame({
        tick: simulatorStore.currentTick, // Should be 0 after resetTimeline
        nodes: initialSnapshot.nodes,
        links: initialSnapshot.links
      })  
    }
  }
  else if (simulatorStore.isPaused) { // if the network is paused, we resume it
    console.log("Resuming simulation from paused state.")
  }

  simulatorStore.startSimulation()
  
  intervalId = setInterval(() => {
    if (!simulatorStore.isSimulating) return
    
    simulatorStore.currentTick++;
    if (simulatorStore.toggleTimeline) {
      if (simulatorStore.timeline.some(frame => frame.tick === simulatorStore.currentTick)) {
        const existingFrame = simulatorStore.timeline.find(frame => frame.tick === simulatorStore.currentTick);
        networkStore.loadStateSnapshot(existingFrame);
        return;
      }
    }

    processStep(networkStore, simulatorStore)
    networkStore.updateMessages()
    if (simulatorStore.toggleTimeline) {
      const currentTickSnapshot = networkStore.getCurrentStateSnapshot()
      simulatorStore.addTimelineFrame({
        tick: simulatorStore.currentTick,
        nodes: currentTickSnapshot.nodes,
        links: currentTickSnapshot.links
      })
    }

    if(networkStore.messages.length == 0){
      clearInterval(intervalId)
      intervalId = null
      simulatorStore.pauseSimulation()
      networkStore.resetStates()
      //simulatorStore.prng = null
      return
    } 
  }, simulatorStore.simulationSpeed)

  
}

export function pauseEngine() {
  const simulatorStore = useSimulatorStore()
  simulatorStore.pauseSimulation()
  clearInterval(intervalId)
  intervalId = null
}

export function stopEngine() {
  clearInterval(intervalId)
  intervalId = null
  const simulatorStore = useSimulatorStore()
  simulatorStore.stopSimulation()
  const networkStore = useNetworkStore()
  networkStore.resetStates()
  simulatorStore.prng = null
}

export function setSpeedMultiplier(multiplier) {
  const simulatorStore = useSimulatorStore()
  const networkStore = useNetworkStore()
  if (multiplier <= 0) {
    console.warn("Speed multiplier must be positive. No change applied.");
    return;
  }
  simulatorStore.simulationSpeed = simulatorStore.simulationSpeed / multiplier
  networkStore.info_message = `Simulation speed set to ${simulatorStore.simulationSpeed} ms per step.`

  if (networkStore.infoMessageTimeout) {
    clearTimeout(networkStore.infoMessageTimeout);
  }
  networkStore.infoMessageTimeout = setTimeout(() => {
    networkStore.info_message = '';
    networkStore.infoMessageTimeout = null;
  }, 3000);

  if (intervalId) {
    clearInterval(intervalId)
    intervalId = setInterval(() => {
      const simulatorStore = useSimulatorStore()
      const networkStore = useNetworkStore()
      
      if (!simulatorStore.isSimulating) return
      
      simulatorStore.currentTick++;
      if (simulatorStore.toggleTimeline) {
        if (simulatorStore.timeline.some(frame => frame.tick === simulatorStore.currentTick)) {
          const existingFrame = simulatorStore.timeline.find(frame => frame.tick === simulatorStore.currentTick);
          networkStore.loadStateSnapshot(existingFrame);
          return;
        }
      }
      processStep(networkStore, simulatorStore)
      networkStore.updateMessages()
      if (simulatorStore.toggleTimeline) {
        const currentTickSnapshot = networkStore.getCurrentStateSnapshot()
        simulatorStore.addTimelineFrame({
          tick: simulatorStore.currentTick,
          nodes: currentTickSnapshot.nodes,
          links: currentTickSnapshot.links
        })
      }
  
      if(networkStore.messages.length == 0){
        clearInterval(intervalId)
        intervalId = null
        simulatorStore.pauseSimulation()
        networkStore.resetStates()
        //simulatorStore.prng = null
        return
      } 
    }, simulatorStore.simulationSpeed)
  }
}

export function singleStepEngine(networkStore, simulatorStore) {
  if (!simulatorStore.isSimulating && !simulatorStore.isPaused) {
    console.warn("Simulation is not started.");
    networkStore.info_message = `Please start the simulation first.`

    if (networkStore.infoMessageTimeout) {
      clearTimeout(networkStore.infoMessageTimeout);
    }
    networkStore.infoMessageTimeout = setTimeout(() => {
      networkStore.info_message = '';
      networkStore.infoMessageTimeout = null;
    }, 3000);
    return;
  }
  networkStore.resetStates()
  simulatorStore.currentTick++;
  if (simulatorStore.toggleTimeline) {
    if (simulatorStore.timeline.some(frame => frame.tick === simulatorStore.currentTick)) {
      const existingFrame = simulatorStore.timeline.find(frame => frame.tick === simulatorStore.currentTick);
      networkStore.loadStateSnapshot(existingFrame);
      return;
    }
  }
  // Paso de simulación
  const nodesToProcess = [...networkStore.nodes];

  for (const node of nodesToProcess) {
    processMessages(node, networkStore, simulatorStore)
    networkStore.updateMessages()
  }

  if (simulatorStore.toggleTimeline) {
    const currentTickSnapshot = networkStore.getCurrentStateSnapshot()
    simulatorStore.addTimelineFrame({
      tick: simulatorStore.currentTick,
      nodes: currentTickSnapshot.nodes,
      links: currentTickSnapshot.links
    })
  }

  if(networkStore.messages.length == 0){
    clearInterval(intervalId)
    intervalId = null
    simulatorStore.pauseSimulation()
    networkStore.resetStates()
    //simulatorStore.prng = null
    return
  }
}

function processStep(networkStore, simulatorStore) {
  networkStore.resetStates()
  // Paso de simulación
  const nodesToProcess = [...networkStore.nodes];

  for (const node of nodesToProcess) {
    processMessages(node, networkStore, simulatorStore)
    networkStore.updateMessages()
  }
}

function readMessage(networkStore, simulatorStore, message, followerId, senderId) {
  const node = networkStore.getNodeById(followerId)
  //Aplicamos lógica para ver si lo acepta o no
  const acceptanceProbability = compatibilityScore(node.properties, message.properties, 'in')

  if (!simulatorStore.prng) {
    console.error("PRNG not initialized in readMessage. Call startEngine first.");
    // Decide on fallback behavior: maybe always reject or use Math.random with a warning
    return; 
  }

  if (simulatorStore.prng.next() < acceptanceProbability) {
    console.log("Accepted with probability: ", acceptanceProbability)
    if (!node.past_received_messages.some(receivedMessage => receivedMessage.id === message.id)) {
      //networkStore.updateNodeState(nodeId, 'receiving')
      networkStore.updateLinkState(followerId, senderId, 'sending')
      networkStore.insertMessages(followerId, [message])
      simulatorStore.acceptedMessagesCount++
    }
  }
  else {
    console.log("Rejected with probability: ", acceptanceProbability)
    networkStore.updateLinkState(followerId, senderId, 'rejecting')
    simulatorStore.rejectedMessagesCount++
  }
}

function processMessages(node, networkStore, simulatorStore) {
  if (node.messages.length > 0) {
    const msg = node.messages.shift()
    node.past_received_messages.push(msg)

    if (!simulatorStore.prng) {
      console.error("PRNG not initialized in processMessages. Call startEngine first.");
      return; // Exit if PRNG is not initialized
    }
    // Aplicamos lógica para ver si lo envía o no
    const sendProbability = compatibilityScore(node.properties, msg.properties, 'out')
    if (simulatorStore.prng.next() < sendProbability) {
      // Si no se ha enviado el mensaje antes se envía
      if (!node.past_sent_messages.some(sentMessage => sentMessage.id === msg.id)) {
        networkStore.updateNodeState(node.id, 'sending')
        node.past_sent_messages.push(msg)
        

        // Se envía el mensaje a los seguidores
        const followers = networkStore.getFollowers(node.id)
        for (const followerId of followers) {
          readMessage(networkStore, simulatorStore, msg, followerId, node.id)
          simulatorStore.sendedMessagesCount++
        }

        if (!simulatorStore.sendedMessages.some(sentMessage => sentMessage.id === msg.id)) {
          simulatorStore.sendedMessages.push(msg)
        }
      }
      else {
        networkStore.updateNodeState(node.id, 'repeted')
      }
      
    }
    else {
      networkStore.updateNodeState(node.id, 'rejecting')
    }
  }
}

function compatibilityScore(nodeStats, messageStats, prefix) {
  let score = 0
  const keys = [
    'Sub', 'Pol', 'Fea', 'Ang', 'Ant', 'Tru', 'Sur', 'Sad', 'Dis', 'Joy'
  ]
  for (const key of keys) {
    const nodeVal = nodeStats[`${prefix}_${key}`] ?? 0
    const msgVal = messageStats[key] ?? 0
    score += Math.abs(nodeVal - msgVal)
  }
  if (keys.length === 0) return 1;
  return Math.max(0, 1 - (score / keys.length));// 1 = perfecto match, 0 = incompatibles
}