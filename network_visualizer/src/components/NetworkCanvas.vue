<template>
  <div class="network-canvas-container">
    <div ref="networkContainer" class="network-container"></div>
    <div
      v-if="(simulatorStore.isSimulating || simulatorStore.isPaused) && simulatorStore.toggleTimeline" 
      class="timeline-controls" :class="{ 'details-open': props.isDetailsOpen }">
      <div class="timeline-bar">
        <button
          v-for="frame in simulatorStore.timeline"
          :key="frame.tick"
          :class="['timeline-tick', { 'active': frame.tick === simulatorStore.currentTick, 'simulating': simulatorStore.isSimulating }]"
          :disabled="simulatorStore.isSimulating && frame.tick !== simulatorStore.currentTick"
          @click="!simulatorStore.isSimulating && loadStateFromTick(frame.tick)"
          :title="`Tick: ${frame.tick}`"
        >
          <span class="tick-marker"></span>
        </button>
      </div>
    </div>
    <div class="controls" :class="{ 'details-open': props.isDetailsOpen }">
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <button class="reset-button" @click="resetView">Reset</button>
      <button class="reset-button" @click="togglePhysics">
        {{ physicsEnabled ? '🧲 ✔️' : '🧲 ❌' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { DataSet, Network } from 'vis-network/standalone'
import { useNetworkStore } from '@/stores/networkStore'
import { useSimulatorStore } from '@/stores/simulatorStore'

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
  links: {
    type: Array,
    required: true,
  },
  isDetailsOpen: {
    type: Boolean,
    required: true,
  },
})

const store = useNetworkStore()
const simulatorStore = useSimulatorStore()
const emit = defineEmits(['node-click', 'link-click'])
const networkContainer = ref(null)
let network = null
const nodesData = new DataSet([])
const edgesData = new DataSet([])
const physicsEnabled = ref(true)

const options = {
  autoResize: true,
  layout: {
    improvedLayout: true,
  },
  physics: {
    enabled: true,
    forceAtlas2Based: {
      gravitationalConstant: -50,
      centralGravity: 0.005,
      springLength: 230,
      springConstant: 0.18,
    },
    maxVelocity: 146,
    solver: 'forceAtlas2Based',
    timestep: 0.35,
    stabilization: {
      enabled: true,
      iterations: 200,
    },
  },
  interaction: {
    hover: true,
    navigationButtons: false,
    keyboard: true,
  },
  nodes: {
    shape: 'dot', // Use 'dot' or 'circle' to support size scaling
    font: {
      color: '#ffffff',
      size: 14},
    // },
    // scaling: {
    //   min: 10, // Minimum size of nodes
    //   max: 50, // Maximum size of nodes
    // },
  },
  edges: {
    arrows: {
      to: { enabled: true, scaleFactor: 0.6 },
    },
    color: {
      color: '#848484',
    },
  },
}

const initNetwork = () => {
  updateNodes()
  updateEdges()

  const data = {
    nodes: nodesData,
    edges: edgesData,
  }

  network = new Network(networkContainer.value, data, options)

  // Handle node click events
  network.on('click', (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      const node = props.nodes.find((n) => n.id === nodeId)

      // Calculate the size of the node
      const incomingLinksCount = props.links.reduce((acc, link) => {
        acc[link.target] = (acc[link.target] || 1) + 1
        return acc
      }, {})
      const size = (incomingLinksCount[nodeId] || 1) * 10

      const links = props.links
        .filter((link) => link.source === nodeId || link.target === nodeId)
        .map((link) => `${link.source} -> ${link.target}`)

      emit('node-click', { ...node, size, links })
    }
    else if (params.edges.length > 0) {
      const linkId = params.edges[0]
      emit('link-click', linkId)
    }
  })

}

const updateNodes = () => {
  if (network!= null){
    updateNodePositions(network.getPositions())
  }
  nodesData.clear()

  // Calculate the number of incoming links for each node
  const incomingLinksCount = props.links.reduce((acc, link) => {
    acc[link.target] = (acc[link.target] || 1) + 1
    return acc
  }, {})

  props.nodes.forEach((node) => {
    nodesData.add({
      id: node.id,
      label: node.name, // Only display the name
      x: node.x,
      y: node.y,
      shape: 'dot', // Ensure the shape supports size scaling
      size: (incomingLinksCount[node.id] || 1) * 10, // Size proportional to incoming links
      color: {
        background: node.state === 'sending' 
          ? '#42b883' 
          : node.state === 'receiving' 
          ? '#C5B358' 
          : node.state === 'rejecting' 
          ? '#ff4d4d' 
          : node.state === 'repeted'
          ? '#848484'
          : '#61a5ff',
        border: '#ccc',
      },
      font: { color: '#fff', align: 'center' },
    })
  })
}

const updateEdges = () => {
  edgesData.clear()
  props.links.forEach((link) => {
    const targetNode = props.nodes.find((node) => node.id === link.target)
    edgesData.add({
      id: `${link.source}-${link.target}`,
      from: link.source,
      to: link.target,
      width: targetNode && targetNode.state === 'sending' ? 2 : 1, // Thicker links if target node is in 'sending' state
      color: link.state === 'sending' 
          ? '#42b883' // Green if target is sending and source is receiving
          : link.state === 'rejecting'
          ? '#ff0000' // Red if target is sending but source is not receiving
          : '#848484', // Default color
    })
  })
}

const updateNodeSizes = () => {
  // Calculate the number of incoming links for each node
  const incomingLinksCount = props.links.reduce((acc, link) => {
    acc[link.target] = (acc[link.target] || 1) + 1
    return acc
  }, {})

  // Update the size of each node in the dataset
  nodesData.forEach((node) => {
    const newSize = (incomingLinksCount[node.id] || 1) * 10 // Size proportional to incoming links
    nodesData.update({
      id: node.id,
      size: newSize,
    })
  })
}

function updateNodePositions(positions) {
  for (const id in positions) {
      store.nodes.forEach((node) => {
          if (node.id === id) {
              node.x = positions[id].x
              node.y = positions[id].y
          }
      })
  }
}

const resetView = () => {
  if (network) {
    network.fit()
  }
}

const zoomIn = () => {
  if (network) {
    network.moveTo({ scale: network.getScale() * 1.2 })
  }
}

const zoomOut = () => {
  if (network) {
    network.moveTo({ scale: network.getScale() / 1.2 })
  }
}

const togglePhysics = () => {
  physicsEnabled.value = !physicsEnabled.value
  if (network) {
    network.setOptions({
      physics: { enabled: physicsEnabled.value }
    })
  }
}

const loadStateFromTick = (tickNumber) => {
  if (simulatorStore.isSimulating) return; 

  const frame = simulatorStore.timeline.find(f => f.tick === tickNumber);
  if (frame) {
    console.log(`Loading state from Tick: ${tickNumber}`);
    const newNodesState = JSON.parse(JSON.stringify(frame.nodes));
    const newEdgesState = JSON.parse(JSON.stringify(frame.links));
    
    store.nodes = newNodesState;
    store.links = newEdgesState;
    
    simulatorStore.currentTick = tickNumber;
  } else {
    console.warn(`Frame for tick ${tickNumber} not found in timeline.`);
  }
}

onMounted(() => {
  initNetwork()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (network) {
    network.destroy()
    network = null
  }
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (network) {
    network.redraw()
  }
}

watch(() => props.nodes, updateNodes, { deep: true })
watch(() => props.nodes, updateEdges, { deep: true })
watch(() => props.links, updateEdges, { deep: true })
watch(() => props.links, updateNodeSizes, { deep: true })
</script>

<style scoped>
.network-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #151520;
  background-image:
    repeating-linear-gradient(0deg, #212133, #212133 1px, transparent 1px, transparent 50px),
    repeating-linear-gradient(90deg, #212133, #212133 1px, transparent 1px, transparent 50px);
  background-size: 50px 50px;
  overflow: hidden;
  border: 1px solid #34495e;
  border-radius: 8px;
}

.network-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  transition: right 0.3s ease-in-out;
}

.controls.details-open {
  right: 420px; /* Adjust to match the width of the NodeDetailsPanel */
}

.controls button {
  background: #42b883;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  width: 40px;
  height: 40px;
  text-align: center;
  transition: background 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.controls .reset-button {
  width: auto;
  padding: 8px 16px;
}

.controls button:hover {
  background: #3aa875;
}

.controls button:active {
  transform: translateY(0px);
  background: rgba(60, 170, 120, 0.9);
}

/* Timeline Controls Styling */
.timeline-controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto; /* Fit content */
  max-width: 50%; /* Max width to prevent overflow on small screens */
  padding: 5px;
  background: rgba(44, 62, 80, 0.7); /* Semi-transparent background */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
  transition: bottom 0.3s ease-in-out; /* For future adjustments if needed */
  overflow-x: auto; /* Enable horizontal scrolling if content overflows */
  overflow-y: hidden; /* Prevent vertical scrolling */
}
.timeline-controls.details-open {
  /* Adjust if needed when details panel is open, though centering might be fine */
  /* For example, shift it left slightly: */
  /* transform: translateX(calc(-50% - 200px)); */ /* if details panel pushes it too far right */
}


.timeline-bar {
  display: flex;
  align-items: center;
  overflow-x: auto; /* Allow horizontal scrolling if many ticks */
  overflow-y: hidden;
  padding: 5px 0;
  max-width: 100%; /* Ensure it doesn't overflow its parent */
}

/* Custom scrollbar for timeline bar */
.timeline-bar::-webkit-scrollbar {
  height: 6px;
}
.timeline-bar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}
.timeline-bar::-webkit-scrollbar-thumb {
  background: #42b883;
  border-radius: 3px;
}
.timeline-bar::-webkit-scrollbar-thumb:hover {
  background: #3aa875;
}


.timeline-tick {
  background: rgba(128, 128, 128, 0.5); /* Default tick color: greyish */
  border: 1px solid rgba(128, 128, 128, 0.8);
  min-width: 12px; /* Minimum width for a tick */
  height: 25px; /* Height of the tick */
  padding: 0 3px; /* Minimal padding */
  margin: 0 1px; /* Space between ticks */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
  color: white; /* For any text/icon inside, though tick-marker is used */
  font-size: 10px; /* If you were to put numbers */
}

.timeline-tick .tick-marker {
  width: 4px; /* Width of the visual line inside the button */
  height: 60%; /* Height of the line relative to button */
  background-color: rgba(255,255,255,0.5);
  border-radius: 1px;
  display: inline-block;
}


.timeline-tick:hover:not(:disabled) {
  background-color: rgba(100, 100, 100, 0.7);
  border-color: rgba(100, 100, 100, 1);
  transform: scaleY(1.1);
}

.timeline-tick.active {
  background-color: #42b883; /* Active tick color: green */
  border-color: #3aa875;
  transform: scaleY(1.2); /* Make active tick slightly taller */
}
.timeline-tick.active .tick-marker {
  background-color: rgba(255,255,255,0.9);
}


.timeline-tick:disabled,
.timeline-tick.simulating:not(.active) { /* Style for non-active ticks when simulating */
  background-color: rgba(80, 80, 80, 0.4);
  border-color: rgba(80, 80, 80, 0.6);
  cursor: not-allowed;
  transform: none;
}
.timeline-tick.simulating:not(.active) .tick-marker {
  background-color: rgba(255,255,255,0.3);
}

.timeline-tick:first-child {
  margin-left: 5px;
}
.timeline-tick:last-child {
  margin-right: 5px;
}
</style>
