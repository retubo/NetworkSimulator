<template>
    <div class="form-overlay">
      <div class="form-container">
        <h2>Delete Node</h2>
        <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
        <form @submit.prevent="submitForm">
          <label>
            Node ID:
            <select v-model="form.nodeId" required>
              <option disabled value="">-- Select a node --</option>
              <option v-for="node in nodes" :key="node.id" :value="node.id">
                {{ node.id }} ({{ node.name }})
              </option>
            </select>
          </label>
          <div class="form-actions">
            <button type="submit" class="button-red">Delete Node</button>
            <button type="button" class="button-neutral" @click="$emit('cancel')">Cancel</button>          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useNetworkStore } from '@/stores/networkStore'

  const networkStore = useNetworkStore()
  const nodes = ref(networkStore.nodes)
  const emit = defineEmits(['submit', 'cancel'])
  
  defineProps({
    errorMessage: String,
  })
  
  const form = ref({
    nodeId: ''
  })
  
  const submitForm = () => {
    emit('submit', { nodeId: form.value.nodeId })
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
}

.form-container {
  background: linear-gradient(135deg, #1e1e2e, #25253a);
  color: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', sans-serif;
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

input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 0.3rem;
  border: 1px solid #3a3a5a;
  border-radius: 10px;
  background: #1e1e2e;
  color: #ffffff;
  font-size: 0.95rem;
}

input::placeholder {
  color: #a8dadc;
  opacity: 0.7;
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

.button-neutral {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #a8dadc;
}
.button-neutral:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>