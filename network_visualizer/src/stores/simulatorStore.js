import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSimulatorStore = defineStore('simulatorStore', {
  state: () => ({
    isSimulating: false,
    isPaused: false, 
    simulationSpeed: 1000,
    sendedMessages: ref([]),
    sendedMessagesCount: 0,
    acceptedMessagesCount: 0,
    rejectedMessagesCount: 0,
    initialMessagesCount: 0,
    toggleTimeline: false, // Toggle for showing/hiding timeline
    seed: "",
    prng: null, // Pseudo-Random Number Generator instance
    timeline: ref([]), // Stores frames: { tick: number, nodes: [] , links: [] }
    currentTick: ref(0),
  }),
  actions: {
    startSimulation() {
      this.isSimulating = true
      this.isPaused = false
      console.log('Simulation started')
    },
    pauseSimulation() {
      this.isSimulating = false
      this.isPaused = true
      console.log('Simulation paused')
    },
    stopSimulation() {
      this.isSimulating = false
      this.isPaused = false
      this.resetTimeline()
      this.sendedMessagesCount = 0
      this.acceptedMessagesCount = 0
      this.rejectedMessagesCount = 0
      this.initialMessagesCount = 0
      console.log('Simulation stopped')
    },
    resetTimeline() {
      this.timeline = []
      this.currentTick = 0
      console.log('Timeline reset')
    },
    addTimelineFrame(frame) {
      // frame should be an object like { tick: number, nodes: [] , links: [] }
      this.timeline.push(frame)
    },
    toggleTimelinefunction() {
      this.toggleTimeline = !this.toggleTimeline    }
  },
})
