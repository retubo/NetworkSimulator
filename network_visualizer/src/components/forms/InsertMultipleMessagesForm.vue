<template>
    <div class="form-overlay">
      <div class="form-container">
        <h2>Insert Messages to Multiple Nodes</h2>
        <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
        <form @submit.prevent="submitForm" class="form-scrollable">
  
          <div class="messages-section">
            <h3>Messages to Insert</h3>
            <div v-for="(messageEntry, entryIndex) in form.messages" :key="entryIndex" class="message-card">
              <div class="message-header">
                <div class="node-id-input">
                  <label>
                    Node ID:
                    <input v-model="messageEntry.nodeId" required placeholder="Enter target node ID" />
                  </label>
                </div>
                <div class="message-id-input">
                  <label>
                    Message ID:
                    <input v-model="messageEntry.id" required placeholder="Enter message ID" />
                  </label>
                </div>
                <button type="button" class="button-red small" @click="removeMessageEntry(entryIndex)">❌</button>
              </div>
  
              <div class="properties">
                <h4>Properties</h4>
                <div
                  v-for="(prop, propIndex) in messageEntry.properties"
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
                  <button type="button" class="button-red small" @click="removeProperty(entryIndex, propIndex)">❌</button>
                </div>
                <button type="button" class="button-neutral small" @click="addProperty(entryIndex)">+ Add Property</button>
              </div>
            </div>
  
            <div class="buttons-row">
              <button type="button" class="button-neutral" @click="addMessageEntry">+ Add Message Entry</button>
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
        nodeId: '',
        id: '',
        properties: []
      }
    ]
  })
  
  const triggerFileInput = () => {
    fileInput.value.click()
  }
  
  const addMessageEntry = () => {
    form.value.messages.push({
      nodeId: '',
      id: '',
      properties: []
    })
  }
  
  const removeMessageEntry = (index) => {
    form.value.messages.splice(index, 1)
  }
  
  const addProperty = (messageEntryIndex) => {
    form.value.messages[messageEntryIndex].properties.push({ key: '', value: '' })
  }
  
  const removeProperty = (messageEntryIndex, propIndex) => {
    form.value.messages[messageEntryIndex].properties.splice(propIndex, 1);
  }
  
  const loadFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        event.target.value = '';
  
        if (!data || typeof data !== 'object' || !data.messages) {
          throw new Error('File must contain a "messages" array at the root.');
        }
  
        if (!Array.isArray(data.messages)) {
          throw new Error('"messages" must be an array.');
        }
  
        const loadedMessages = data.messages.map((msg, index) => {
          if (!msg.nodeid || typeof msg.nodeid !== 'string') {
            throw new Error(`Message entry ${index} is missing a valid 'nodeid'.`);
          }
           if (!msg.id || typeof msg.id !== 'string') {
            throw new Error(`Message entry ${index} (nodeid: ${msg.nodeid}) is missing a valid 'id'.`);
          }
  
          if (!msg.properties || typeof msg.properties !== 'object') {
            throw new Error(`Message entry ${index} (nodeid: ${msg.nodeid}, id: ${msg.id}) is missing a 'properties' object.`);
          }
  
          const properties = Object.entries(msg.properties).map(([key, value]) => {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              throw new Error(`Message entry ${index} (nodeid: ${msg.nodeid}, id: ${msg.id}) property '${key}' has an invalid number value.`);
            }
            if (numValue < 0 || numValue > 1) {
              throw new Error(`Message entry ${index} (nodeid: ${msg.nodeid}, id: ${msg.id}) property '${key}' must be between 0 and 1.`);
            }
            return { key, value: numValue };
          });
  
          return {
            nodeId: msg.nodeid,
            id: msg.id,
            properties
          };
        });
  
        form.value.messages = loadedMessages;
  
      } catch (error) {
        emit('error', 'Error loading file: ' + error.message);
        console.error('File load error:', error);
        event.target.value = '';
      }
    };
  
    reader.onerror = () => {
      emit('error', 'Error reading file');
      event.target.value = '';
    };
  
    reader.readAsText(file);
  };
  
  const submitForm = () => {
    const messagesToSubmit = form.value.messages.map(messageEntry => ({
      nodeId: messageEntry.nodeId,
      id: messageEntry.id,
      properties: messageEntry.properties.reduce((acc, prop) => {
        acc[prop.key] = parseFloat(prop.value);
        return acc;
      }, {})
    }));
  
    emit('submit', messagesToSubmit);
  
    form.value = {
      messages: [{
        nodeId: '',
        id: '',
        properties: []
      }]
    };
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
    max-width: 600px;
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
  
  h4 {
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
    color: #a8dadc;
  }
  
  label {
    display: block;
    margin-bottom: 0.8rem;
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
    gap: 1rem;
  }
  
  .node-id-input,
  .message-id-input {
    flex: 1;
  }
  
  .node-id-input label,
  .message-id-input label {
      margin-bottom: 0;
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
  
  .file-upload {
    display: inline-block;
    cursor: pointer;
    text-align: center;
  }
  
  .error-popup {
    background-color: #ff5c5c;
    color: white;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .buttons-row button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  </style>
  