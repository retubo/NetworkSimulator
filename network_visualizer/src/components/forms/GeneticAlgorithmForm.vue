<template>
    <div class="form-overlay">
      <div class="form-container">
        <h2>Genetic Algorithm</h2>
        <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
        <form @submit.prevent="submitForm" class="form-scrollable">
          <label>
            Objective:
            <select v-model="form.objective" required>
              <option value="maximize">Maximize Spread</option>
              <option value="minimize">Minimize Spread</option>
            </select>
          </label>
  
          <label>
            Number of generations:
            <input type="number" min="1" v-model.number="form.generations" required />
          </label>
  
          <label>
            Size of generations:
            <input type="number" min="1" v-model.number="form.generation_size" required />
          </label>
  
          <label>
            Number of iterations per individual:
            <input type="number" min="1" v-model.number="form.iterations" required />
          </label>
  
          <label>
            Elitism (%):
            <input type="number" min="0" max="100" v-model.number="form.elitismRate" required />
          </label>
  
          <label>
            Mutation Rate (%):
            <input type="number" min="0" max="100" v-model.number="form.mutationRate" required />
          </label>

          <label>
            Initial Sender Node:
            <select v-model="form.senderNodeId" required>
              <option disabled value="">-- Select a node --</option>
              <option v-for="node in nodes" :key="node.id" :value="node.id">
                {{ node.id }} ({{ node.name }})
              </option>
            </select>
          </label>
  
          <div class="form-actions">
            <button type="submit" class="button-green">Launch Algorithm</button>
            <button type="button" class="button-red" @click="$emit('cancel')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useNetworkStore } from '@/stores/networkStore'

  const emit = defineEmits(['submit', 'cancel'])
  const networkStore = useNetworkStore()
  const nodes = networkStore.nodes
  
  defineProps({
    errorMessage: String,
  })
  
  const form = ref({
    objective: 'maximize',
    generations: 50,
    generation_size: 20,
    iterations: 10,
    elitismRate: 10,      
    mutationRate: 5, 
    senderNodeId: "",     
  })
  
  const submitForm = () => {
    emit('submit', { ...form.value })
  }
  </script>
  
  
  <style scoped>
  .form-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(30, 30, 46, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  
  .form-container {
    background: linear-gradient(135deg, #1e1e2e, #25253a);
    color: #ffffff;
    padding: 2rem;
    border-radius: 16px;
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
  }
  
  .form-scrollable {
    overflow-y: auto;
    flex: 1;
    padding-right: 0.5rem;
  }
  
  h2 {
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(45deg, #42b883, #3498db);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  label {
    display: block;
    margin-bottom: 1.2rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.3rem;
    border: 1px solid #3a3a5a;
    border-radius: 10px;
    background: #1e1e2e;
    color: #ffffff;
    font-size: 0.95rem;
    appearance: none; /* oculta flechitas en inputs numéricos */
    -moz-appearance: textfield;
  }
  
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input::placeholder {
    color: #a8dadc;
    opacity: 0.7;
  }
  
  .form-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  
  button {
    padding: 0.9rem 1.6rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
  }
  
  .button-green {
    background: #42b88320;
    color: #42b883;
    border: 1px solid #42b88340;
  }
  .button-green:hover {
    background: #42b88330;
    transform: translateY(-1px);
  }
  
  .button-red {
    background: #ff5c5c20;
    color: #ff5c5c;
    border: 1px solid #ff5c5c40;
  }
  .button-red:hover {
    background: #ff5c5c40;
    transform: translateY(-1px);
  }
  
  .error-popup {
    background-color: #ff5c5c;
    color: white;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  /* Checkbox estilo */
  label:not(.checkbox-label) {
    display: block;
    margin-bottom: 1.2rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .checkbox-container {
    position: relative;
    margin-right: 0.75rem;
  }
  
  .checkbox-container input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .custom-checkbox {
    position: relative;
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: #1e1e2e;
    border: 1px solid #3a3a5a;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .checkbox-container input[type="checkbox"]:checked ~ .custom-checkbox {
    background-color: #42b883;
    border-color: #42b883;
  }
  
  .custom-checkbox:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .checkbox-container input[type="checkbox"]:checked ~ .custom-checkbox:after {
    display: block;
  }
  </style>
  