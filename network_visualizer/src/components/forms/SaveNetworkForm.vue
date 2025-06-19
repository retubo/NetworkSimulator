<template>
    <div class="form-overlay">
      <div class="form-container">
        <h2>Save Network</h2>
        <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
        <form @submit.prevent="submitForm">
          <label>
            File Name:
            <input v-model="fileName" required />
          </label>
          <label class="checkbox-label">
              <div class="checkbox-container">
                  <input type="checkbox" v-model="saveMessages" id="saveMessages" />
                  <span class="custom-checkbox"></span>
              </div>
              <span>Save Messages</span>
          </label>
          <div class="form-actions">
            <button type="submit" class="button-green">Save</button>
            <button type="button" class="button-red" @click="$emit('cancel')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])
const fileName = ref('')
const errorMessage = ref('')
const saveMessages = ref(false)

function submitForm() {
  if (!fileName.value.trim()) {
    errorMessage.value = 'File name is required.'
    return
  }
  emit('submit', fileName.value.trim(), saveMessages.value)
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
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  flex-direction: column;
  gap: 1rem;  
}

.form-container h2 {
font-size: 1.3rem;
margin-bottom: 1.2rem;
background: linear-gradient(45deg, #42b883, #3498db);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
text-align: center;
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #42b883, #3498db);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}


label:not(.checkbox-label) {
display: block;
font-size: 0.9rem;
font-weight: 500;
color: #ffffffcc;
}

.checkbox-label {
  margin-top: 1rem;
}
input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 0.3rem;
  border-radius: 10px;
  border: 1px solid #3a3a5a;
  background: #1e1e2e;
  color: #ffffff;
  font-size: 0.95rem;
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

</style>
