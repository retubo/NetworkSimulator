<template>
  <div class="node-details-panel" :class="{ open: isOpen }">
    <!-- Cabecera -->
    <div class="header">
      <h2 class="sidebar-title">
        <span class="gradient-text">Node&nbsp;Details</span>
      </h2>
      <button class="close-button" @click="closePanel">×</button>
    </div>

    <!-- Cuerpo -->
    <div class="content" v-if="nodeData">
      <!-- 1. Información básica -->
      <details class="section" open>
        <summary class="section-title">Basic Information</summary>
        <p><strong>Name:</strong> {{ nodeData.name }}</p>
        <p><strong>ID:</strong> {{ nodeData.id }}</p>
        <p><strong>State:</strong> {{ nodeData.state }}</p>
        <p><strong>Followers:</strong> {{ (nodeData.links || []).filter(link => link.split(' -> ')[1] === nodeData.id).length }}</p>
      </details>

      <!-- 2. Propiedades -->
      <details class="section" :open="true">
        <summary class="section-title">Properties ({{ Object.keys(editableProperties).length }})</summary>
        <table v-if="hasProperties">
          <tbody>
            <tr v-for="(value, key) in editableProperties" :key="key">
              <td>{{ key }}</td>
              <td>
                <input
                  type="text"
                  :value="editableProperties[key]"
                  @input="(e) => {
                    editableProperties[key] = parseFloat(e.target.value);
                  }"
                  @keyup.enter="updateProperties"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>— No properties —</p>
      </details>

      <!-- 3. Enlaces -->
      <details class="section" :open="(nodeData.links || []).length">
        <summary class="section-title">Links ({{ (nodeData.links || []).length }})</summary>
        <ul v-if="(nodeData.links || []).length">
          <li v-for="link in nodeData.links" :key="link">{{ link }}</li>
        </ul>
        <p v-else>— Sin enlaces —</p>
      </details>

      <!-- 4. Mensajes activos -->
      <details class="section" :open="(nodeData.messages || []).length">
        <summary class="section-title">
          Active Messages ({{ (nodeData.messages || []).length }})
        </summary>
        <MessageTable
          v-if="(nodeData.messages || []).length"
          :messages="nodeData.messages"
        />
        <p v-else>— Sin mensajes activos —</p>
      </details>

      <!-- 5. Mensajes enviados -->
      <details class="section" :open="(nodeData.past_sent_messages || []).length">
        <summary class="section-title">
          Past Sent Messages ({{ (nodeData.past_sent_messages || []).length }})
        </summary>
        <MessageTable
          v-if="(nodeData.past_sent_messages || []).length"
          :messages="nodeData.past_sent_messages"
        />
        <p v-else>— Has not sent messages —</p>
      </details>

      <!-- 6. Mensajes recibidos -->
      <details class="section" :open="(nodeData.past_received_messages || []).length">
        <summary class="section-title">
          Past received messages ({{ (nodeData.past_received_messages || []).length }})
        </summary>
        <MessageTable
          v-if="(nodeData.past_received_messages || []).length"
          :messages="nodeData.past_received_messages"
        />
        <p v-else>— Has not received messages —</p>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import MessageTable from './forms/MessageTable.vue'
import { useNetworkStore } from '@/stores/networkStore'

/* ---------- Props & emits ---------- */
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  nodeData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})
const emit = defineEmits(['close'])

const closePanel = () => emit('close')
const networkStore = useNetworkStore()


/* ---------- Reactive editable copy of properties ---------- */
const editableProperties = ref({})

watch(
  () => props.nodeData,
  (newVal) => {
    if (!newVal) return
    editableProperties.value = { ...(newVal?.properties || {}) }
  },
  { immediate: true }
)

/* ---------- Update store when editing ---------- */
function updateProperties() {
  const node = networkStore.nodes.find(n => n.id === props.nodeData.id)
  if (node) {
    node.properties = { ...editableProperties.value }
  }
}

const hasProperties = computed(
  () => props.nodeData && Object.keys(props.nodeData.properties || {}).length > 0
)
</script>

<style scoped>
/* --- contenedor principal --- */
.node-details-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100%;
  background: linear-gradient(135deg, #1e1e2e, #25253a);
  color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 95;
}
.node-details-panel.open { right: 0; }

/* --- cabecera --- */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid #3a3a5a;
}
.sidebar-title { color: #fff; margin: 0; font-size: 1.4rem; }
.gradient-text {
  background: linear-gradient(45deg, #42b883, #3498db);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.close-button {
  background: none; border: none; color: #fff; font-size: 1.5rem;
  cursor: pointer; transition: color 0.2s ease-in-out;
}
.close-button:hover { color: #ff5c5c; }

input[type="text"] {
  background-color: #1e1e2e;
  color: white;
  border: 1px solid #3a3a5a;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  width: 100%;
  appearance: textfield;
}

input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="text"]:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 1px #42b883;
}

/* --- cuerpo + secciones --- */
.content { padding: 1.5rem; }
.section { margin-bottom: 1rem; border: 1px solid #3a3a5a; border-radius: 6px; }
.section-title {
  padding: 0.8rem 1rem; cursor: pointer; user-select: none;
  color: #a8dadc; text-transform: uppercase; letter-spacing: 1px;
}
.section[open] .section-title { background: rgba(255,255,255,0.05); }
.section > div,
.section > table, .section > ul { padding: 1rem 1.2rem 1.5rem; }

/* --- tablas --- */
table { width: 100%; border-collapse: collapse; }
table th, table td { border: 1px solid #3a3a5a; padding: 0.6rem; text-align: left; }
.inner-table { margin: 0; }
ul { list-style: none; padding: 0; }
ul li { margin-bottom: 0.8rem; background: rgba(255, 255, 255, 0.05); padding: 0.8rem; border-radius: 4px; }
</style>
