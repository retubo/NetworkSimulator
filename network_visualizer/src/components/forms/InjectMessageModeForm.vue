<template>
  <div class="form-overlay">
    <div class="form-container">
      <h2>Insert Message Mode</h2>
      <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
      <form @submit.prevent="submitForm" class="form-scrollable">
        <div class="messages-section">
          <h3>Messages</h3>
          <div v-for="(message, index) in form.messages" :key="index" class="message-card">
            <div class="message-header">
              <div class="message-id-input">
                <label>
                  Message ID:
                  <input v-model="message.id" required placeholder="Enter message ID" />
                </label>
              </div>
              <button type="button" class="button-red small" @click="removeMessage(index)">❌</button>
            </div>
            
            <div class="properties">
              <div
                v-for="(prop, propIndex) in message.properties"
                :key="propIndex"
                class="property-row"
              >
                <input
                  v-model="prop.key"
                  placeholder="Property key"
                  required
                />
                <input
                  v-model="prop.value"
                  placeholder="Value"
                  required
                />
                <button type="button" class="button-red small" @click="removeProperty(index, propIndex)">❌</button>
              </div>
              <button type="button" class="button-neutral small" @click="addProperty(index)">+ Add Property</button>
            </div>
          </div>
          
          <div class="buttons-row">
            <button type="button" class="button-neutral" @click="addMessage">+ Add Message</button>
            <button type="button" class="button-neutral" @click="triggerFileInput">
              📁 Load from File
            </button>
            <input 
              ref="fileInput"
              type="file" 
              @change="loadFromFile" 
              accept=".json" 
              style="display: none" 
            />
          </div>
        </div>

        <label class="checkbox-label">
          <div class="checkbox-container">
            <input type="checkbox" v-model="overwriteIds" id="overwriteIds" />
            <span class="custom-checkbox"></span>
          </div>
          <span>Overwrite IDs if duplicated</span>
        </label>

        <div class="form-actions">
          <button type="submit" class="button-green">Insert Messages</button>
          <button type="button" class="button-red" @click="$emit('cancel')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel', 'error'])
const fileInput = ref(null)

defineProps({
  errorMessage: String,
})

const form = ref({
  messages: [
    {
      id: '',
      properties: []
    }
  ]
})

const overwriteIds = ref(false)

const triggerFileInput = () => {
  fileInput.value.click()
}

const addMessage = () => {
  form.value.messages.push({
    id: '',
    properties: []
  })
}

const removeMessage = (index) => {
  form.value.messages.splice(index, 1)
}

const addProperty = (messageIndex) => {
  form.value.messages[messageIndex].properties.push({ key: '', value: '' })
}

const removeProperty = (messageIndex, propIndex) => {
  form.value.messages[messageIndex].properties.splice(propIndex, 1)
}

const loadFromFile = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Clear the file input to allow re-uploading same file
      event.target.value = '';
      
      // Validate the root structure
      if (!data || typeof data !== 'object' || !data.messages) {
        throw new Error('File must contain a "messages" array');
      }

      // Validate messages is an array
      if (!Array.isArray(data.messages)) {
        throw new Error('"messages" must be an array');
      }

      const loadedMessages = data.messages.map((msg, index) => {
        // Validate each message has required fields
        if (!msg.id || typeof msg.id !== 'string') {
          throw new Error(`Message ${index} is missing a valid ID`);
        }
        
        if (!msg.properties || typeof msg.properties !== 'object') {
          throw new Error(`Message ${msg.id} is missing properties object`);
        }

        // Convert properties to array format
        const properties = Object.entries(msg.properties).map(([key, value]) => {
          // Validate property value
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            throw new Error(`Message ${msg.id} property ${key} has invalid number`);
          }
          if (numValue < 0 || numValue > 1) {
            throw new Error(`Message ${msg.id} property ${key} must be between 0 and 1`);
          }
          return { key, value: numValue };
        });

        return {
          id: msg.id,
          properties
        };
      });

      // Replace existing messages with loaded ones
      form.value.messages = loadedMessages;

    } catch (error) {
      emit('error', 'Error loading file: ' + error.message);
      console.error('File load error:', error);
    }
  };
  
  reader.onerror = () => {
    emit('error', 'Error reading file');
    event.target.value = ''; // Reset file input
  };
  
  reader.readAsText(file);
};

const submitForm = () => {
  const messagesToSubmit = form.value.messages.map(message => ({
    id: message.id,
    properties: message.properties.reduce((acc, prop) => {
      acc[prop.key] = parseFloat(prop.value)
      return acc
    }, {})
  }))
  
  emit('submit', {
    messages: messagesToSubmit,
    overwriteIds: overwriteIds.value
  })
  
  // Reset form
  form.value = {
    messages: [{
      id: '',
      properties: []
    }]
  }
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
  max-width: 500px;
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

h3 {
  font-size: 1rem;
  margin: 1.5rem 0 0.8rem;
  color: #a8dadc;
}

label:not(.checkbox-label) {
  display: block;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
}

input:not([type="checkbox"]) {
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

.messages-section {
  margin-top: 1rem;
}

.message-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid #42b883;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.message-header span {
  font-weight: 500;
  color: #42b883;
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

.buttons-row {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
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

button.small {
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
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

/* Checkbox styles */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #ffffffcc;
  user-select: none;
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

.message-id-input {
  flex: 1;
  margin-right: 1rem;
}

.message-id-input label {
  margin-bottom: 0;
}

.message-id-input input {
  margin-top: 0.3rem;
}

.buttons-row {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.buttons-row button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

input[type="number"] {
  -moz-appearance: textfield;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>