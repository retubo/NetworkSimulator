<script setup>
import { useRouter } from 'vue-router'
import NetworkIcon from '@/assets/NetowrkVisualizedIconNoBackground.png'

const router = useRouter()

const startApp = () => {
  router.push('/network')
}
</script>

<template>
  <div class="home-container">
    <img :src="NetworkIcon" alt="Network Visualizer Icon" class="app-icon" />
    <!-- <h1>Network Visualizer</h1> -->
    <p>By Alejandro Díez Muñoz.</p>
    <p>Project Supervisor: Prof. Jaime Moreno Llorena</p>
    <p>Universidad Autónoma de Madrid - 2024-2025</p>
    <button class="start-button" @click="startApp">Start Exploring</button>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.app-icon {
  width: 300px;
  height: 332px;
  /* margin-bottom: 20px; */
}

h1 {
  font-size: 3rem;
  font-weight: bold;
}

p {
  font-size: 1.2rem;
  margin-top: 10px;
  opacity: 0.8;
  max-width: 600px;
}

/* Botón de inicio */
.start-button {
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 1.2rem;
  background: #00c896;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.start-button:hover {
  background: #00f5a0;
  transform: scale(1.05);
}

.start-button:active {
  transform: scale(0.95);
}

</style>
