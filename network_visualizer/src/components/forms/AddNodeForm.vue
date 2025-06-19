<template>
  <div class="form-overlay">
    <div class="form-container">
      <h2>Add Node</h2>
      <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
      <form @submit.prevent="submitForm" class="form-scrollable">
        <label>
          Name:
          <input v-model="form.name" required />
        </label>
        <label>
          ID:
          <input v-model="form.id" required />
        </label>
        <div class="properties">
          <h3>Properties</h3>
          <div
            v-for="(prop, index) in form.properties"
            :key="index"
            class="property-row"
          >
            <input
              v-model="prop.key"
              placeholder="Key"
              required
            />
            <input
              v-model="prop.value"
              placeholder="Value"
              required
            />
            <button type="button" class="button-red" @click="removeProperty(index)">❌</button>
          </div>
          <button type="button" class="button-neutral" @click="addProperty">+ Add Property</button>
        </div>
        <div class="form-actions">
          <button type="submit" class="button-green">Add Node</button>
          <button type="button" class="button-red" @click="$emit('cancel')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

defineProps({
  errorMessage: String,
})

const form = ref({
  name: '',
  id: '',
  properties: [],
})

const addProperty = () => {
  form.value.properties.push({ key: '', value: '' })
}

const removeProperty = (index) => {
  form.value.properties.splice(index, 1)
}

const submitForm = () => {
  const propertiesObject = form.value.properties.reduce((acc, prop) => {
    acc[prop.key] = prop.value
    return acc
  }, {})
  emit('submit', { ...form.value, properties: propertiesObject })
  form.value = { name: '', id: '', properties: [] }
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

.properties {
  margin-top: 1rem;
}

.property-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.property-row input {
  flex: 1;
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

.button-neutral {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #a8dadc;
}
.button-neutral:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-popup {
  background-color: #ff5c5c;
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}
</style>