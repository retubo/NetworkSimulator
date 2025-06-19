<template>
    <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
      <button class="toggle-menu-button" @click="toggleSidebar">
        {{ isCollapsed ? '☰' : '×' }}
      </button>
      <div v-if="store.info_message" 
        class="info-popup"
        :class="{ 'fade-out': fadingOut }">
      {{ store.info_message }}
    </div>
      <div class="sidebar-content">
        <div v-if="isCollapsed" class="collapsed-buttons">
          <template v-if="lastTab === 'editor'">
            <button class="icon-button" @click="mostrarFormularioNode = !mostrarFormularioNode" title="Add Node">➕</button>
            <button class="icon-button" @click="toggleEditMode" title="Toggle Add Links">🔗</button>
            <button class="icon-button" @click="toggleDeleteMode" title="Toggle Delete Nodes">🗑️</button>
            <button class="icon-button" @click="toggleDeleteLinksMode" title="Toggle Remove Links">✂️</button>
            <button class="icon-button" @click="mostrarFormularioSave = !mostrarFormularioSave" title="Save Network">💾</button>
            <button class="icon-button" @click="mostrarFormularioLoad = !mostrarFormularioLoad" title="Load Network">⬆️</button>
          </template>

          <template v-else-if="lastTab === 'simulator'">
            <button class="icon-button" title="Play" @click="startEngine" >▶️</button>
            <button class="icon-button" title="Pause" @click="pauseEngine">⏸️</button>
            <button class="icon-button" title="Stop" @click="stopEngine">⏹️</button>
            <button class="icon-button" title="Speed x2" @click="() => setSpeedMultiplier(2)">⏩</button>
            <button class="icon-button" title="Speed 0.5x" @click="() => setSpeedMultiplier(0.5)">⏪</button>
          </template>
        </div>
        <div v-if="!isCollapsed">
          <!-- Tabs -->
          <div class="tabs">
            <button :class="{ active: activeTab === 'editor' }" @click="setTab('editor')">Editor</button>
            <button :class="{ active: activeTab === 'simulator' }" @click="setTab('simulator')">Simulator</button>
          </div>

          <div v-if="activeTab === 'editor'" class="expanded-content">
            <h2 class="sidebar-title">
              <span class="gradient-text">Network Editor</span>
            </h2>

            <button class="green-button" @click="mostrarFormularioNode = !mostrarFormularioNode">
              <span class="icon">+</span>
              <span>Add Node</span>
            </button>

            <div class="function-container">
              <button class="green-toggle" @click="toggleEditMode">
                <span class="icon">🔗</span>
                <span v-if="editModesStore.toggleEditLinks" class="status-icon">✔</span>
                <span v-else class="status-icon">✖</span>
              </button>

              <button class="green-flat-button" @click="mostrarFormularioLink = !mostrarFormularioLink">
                <span class="icon">🔄</span>
                <span>Add Link</span>
              </button>
            </div>

            <div class="function-container">
              <button class="red-toggle" @click="toggleDeleteMode">
                <span class="icon">🗑️</span>
                <span v-if="editModesStore.toggleDeleteNodes" class="status-icon">✔</span>
                <span v-else class="status-icon">✖</span>
              </button>
              <button class="red-flat-button" @click="mostrarFormularioDeleteNode = !mostrarFormularioDeleteNode">
                <span class="icon">🗑️</span>
                <span>Delete Node</span>
              </button>
            </div>
            <div class="function-container">
              <button class="red-toggle full-width-toggle" @click="toggleDeleteLinksMode">
                <span class="icon">✂️</span>
                <span v-if="editModesStore.toggleDeleteLinks" class="status-icon">✔</span>
                <span v-else class="status-icon">✖</span>
                <span>Remove Links</span>
              </button>
            </div>
            <div class="function-container">
              <button class="green-flat-button" @click="mostrarFormularioSave = !mostrarFormularioSave">
                <span class="icon">💾</span>
                <span>Save Network</span>
              </button>
            </div>
            <div class="function-container">
              <button class="green-flat-button" @click="mostrarFormularioLoad = !mostrarFormularioLoad">
                <span class="icon">⬆️</span>
                <span>Load Network</span>
              </button>
            </div>
            <div class="function-container">
              <button class="green-toggle Inject-message" @click="handletoggleInjectMessageMode">
                <span class="icon">✉️</span>
                <span v-if="editModesStore.toggleInjectMessage" class="status-icon">✔</span>
                <span v-else class="status-icon">✖</span>
              </button>
              <button class="green-button Inject-message top-row" @click="handleShowFloodNodeForm">
                <span class="icon">📩</span>
                <span>Flood Node</span>
              </button>
            </div>
            <button class="green-flat-button insert-multiple" @click="handleShowInsertMultipleMessagesForm">
              <span class="icon">📨</span>
              <span>Insert Multiple Messages</span>
            </button> 
          </div>
          <div v-else-if="activeTab === 'simulator'">
            <NetworkSimulator
            @showGeneticAlgorithmForm="handleShowGeneticAlgorithmForm"
            />
          </div>
        </div>
          <AddNodeForm
            v-if="mostrarFormularioNode"
            @submit="handleAddNode"
            @cancel="mostrarFormularioNode = false"
            :error-message="errorMessage"
          />
          <AddLinkForm
            v-if="mostrarFormularioLink"
            @submit="handleAddLink"
            @cancel="mostrarFormularioLink = false"
            :error-message="errorMessage"
          />
          <DeleteNodeForm
            v-if="mostrarFormularioDeleteNode"
            @submit="handleDeleteNode"
            @cancel="mostrarFormularioDeleteNode = false"
            :error-message="errorMessage"
          />
          <SaveNetworkForm
            v-if="mostrarFormularioSave"
            @submit="handleSaveNetwork"
            @cancel="mostrarFormularioSave = false"
          />
          <LoadNetworkForm
            v-if="mostrarFormularioLoad"
            @submit="handleLoadNetwork"
            @cancel="mostrarFormularioLoad = false"
            @error="(msg) => errorMessage = msg"
            :error-message="errorMessage"
          /> 
          <FloodNodeForm
            v-if="mostrarFormularioFloodNode"
            @submit="handleFloodNode"
            @cancel="mostrarFormularioFloodNode = false"
            :error-message="errorMessage"
          /> 
          <InsertMultipleMessagesForm
            v-if="mostrarFormularioInsertMultipleMessages"
            @submit="handleInsertMultipleMessages"
            @cancel="mostrarFormularioInsertMultipleMessages = false"
            :error-message="errorMessage"
          />
          <InjectMessageModeForm
            v-if="mostrarFormularioInjectMessageMode"
            @submit="handleInjectMessageMode"
            @cancel="handleInjectMessageModeCancel"
            :error-message="errorMessage"
          />
          <GeneticAlgorithmForm
            v-if="mostrarFormularioGeneticAlgorithm"
            @submit="handleGeneticAlgorithm"
            @cancel="mostrarFormularioGeneticAlgorithm = false"
            :error-message="errorMessage"
          />
          <GeneticAlgorithmVisualization
            v-if="showVisualizationGA"
            :algorithm-running="algorithmRunning"
            @stopped="geneticAlgorithmStore.isRunning = false"
            @close="showVisualizationGA = false"
          />
      </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AddNodeForm from './forms/AddNodeForm.vue'
import AddLinkForm from './forms/AddLinkForm.vue'
import DeleteNodeForm from './forms/DeleteNodeForm.vue'
import { useEditModesStore } from '@/stores/editModesStore'
import { useNetworkStore } from '@/stores/networkStore'
import { useGeneticAlgorithmStore } from '@/stores/geneticAlgorithmStore'
import SaveNetworkForm from './forms/SaveNetworkForm.vue'
import LoadNetworkForm from './forms/LoadNetworkForm.vue'
import NetworkSimulator from './NetworkSimulator.vue'
import FloodNodeForm from './forms/FloodNodeForm.vue'
import InsertMultipleMessagesForm from './forms/InsertMultipleMessagesForm.vue'
import InjectMessageModeForm from './forms/InjectMessageModeForm.vue'
import GeneticAlgorithmForm from './forms/GeneticAlgorithmForm.vue'
import { startEngine, pauseEngine, stopEngine, setSpeedMultiplier } from '@/engine'
import GeneticAlgorithmVisualization from './forms/GeneticAlgorithmVisualization.vue'
import { runGeneticAlgorithm } from '@/algorithms/geneticAlgorithm'


const editModesStore = useEditModesStore()
const geneticAlgorithmStore = useGeneticAlgorithmStore()
const store = useNetworkStore()
const isCollapsed = ref(false)
const mostrarFormularioNode = ref(false)
const mostrarFormularioLink = ref(false)
const mostrarFormularioDeleteNode = ref(false)
const mostrarFormularioSave = ref(false)
const mostrarFormularioLoad = ref(false)
const mostrarFormularioFloodNode = ref(false)
const mostrarFormularioInsertMultipleMessages = ref(false)
const mostrarFormularioInjectMessageMode = ref(false)
const mostrarFormularioGeneticAlgorithm = ref(false)
const activeTab = ref('editor')
const lastTab = ref('editor')
const errorMessage = ref('')
const showVisualizationGA = ref(false)
const algorithmRunning = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  if (!isCollapsed.value) {
    activeTab.value = lastTab.value
  }
}

function setTab(tab) {
  activeTab.value = tab
  lastTab.value = tab
  editModesStore.setAllToFalse()
}

function toggleEditMode() {
  store.info_message = `Toggled EditLinksMode.`

  if (store.infoMessageTimeout) {
    clearTimeout(store.infoMessageTimeout);
  }
  store.infoMessageTimeout = setTimeout(() => {
    store.info_message = '';
    store.infoMessageTimeout = null;
  }, 3000);
  editModesStore.toggleEditLinksMode()
}
function toggleDeleteMode() {
  store.info_message = `Toggled DeleteNodesMode.`

  if (store.infoMessageTimeout) {
    clearTimeout(store.infoMessageTimeout);
  }
  store.infoMessageTimeout = setTimeout(() => {
    store.info_message = '';
    store.infoMessageTimeout = null;
  }, 3000);
  editModesStore.toggleDeleteNodesMode()
}
function toggleDeleteLinksMode() {
  store.info_message = `Toggled DeleteLinksMode.`

  if (store.infoMessageTimeout) {
    clearTimeout(store.infoMessageTimeout);
  }
  store.infoMessageTimeout = setTimeout(() => {
    store.info_message = '';
    store.infoMessageTimeout = null;
  }, 3000);
  editModesStore.toggleDeleteLinksMode()
}

const handleShowFloodNodeForm = () => {
  mostrarFormularioFloodNode.value = true
}

const handleShowInsertMultipleMessagesForm = () => {
  mostrarFormularioInsertMultipleMessages.value = true
}

const handleShowGeneticAlgorithmForm = () => {
  mostrarFormularioGeneticAlgorithm.value = true
}

const handletoggleInjectMessageMode = () => {
  editModesStore.toggleInjectMessageMode()
  if (editModesStore.toggleInjectMessage) {
    mostrarFormularioInjectMessageMode.value = true
  } else {
    mostrarFormularioInjectMessageMode.value = false
  }
}

function handleAddNode(nodo) {
  const result = store.addNode(nodo)
  if (!result.success) {
  errorMessage.value = result.message
  // setTimeout(() => {
  //   errorMessage.value = '' // Clear the error message after 3 seconds
  // }, 3000)
  } else {
    mostrarFormularioNode.value = false
    errorMessage.value = ''
  }
}

function handleAddLink(linkData) {
  const result = store.addLink(linkData.source, linkData.target)
  if (!result.success) {
    errorMessage.value = result.message
  } else {
    mostrarFormularioLink.value = false
    errorMessage.value = ''
  }
}

function handleDeleteNode(node) {
  const result = store.deleteNode(node.nodeId)
  if (!result.success) {
    errorMessage.value = result.message
  } else {
    mostrarFormularioDeleteNode.value = false
    errorMessage.value = ''
  }
}

function handleSaveNetwork(fileName, saveMessages) {
  let saving_nodes = store.nodes

  if (!saveMessages) {
    // Remove messages from the nodes
    saving_nodes = store.nodes.map(node => {
      const { messages, past_received_messages, past_sent_messages, ...rest } = node;
      void messages,
      void past_received_messages,
      void past_sent_messages
      return rest;
    });
  }
  
  const networkData = {
    nodes: saving_nodes,
    links: store.links
  }
  

  const json = JSON.stringify(networkData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`
  link.click()

  URL.revokeObjectURL(url)
  mostrarFormularioSave.value = false
}

async function handleLoadNetwork({ file, overwriteIds, newNetwork }) {
  try {
    
    const fileContent = await file.text();
    const FileNetworkData = JSON.parse(fileContent);

    if (!FileNetworkData.nodes && !FileNetworkData.links) {
      throw new Error('The file must contain "nodes" or "links".');
    }

    if (newNetwork) {
      store.deleteAll();
    }

    const existingNodeIds = new Set();
    store.nodes.forEach(node => existingNodeIds.add(node.id))

    const idMap = new Map();

    FileNetworkData.nodes.forEach((node) => {
      let nodeId = node.id;

      if (existingNodeIds.has(nodeId)) {
        if (!overwriteIds) {
          throw new Error(`Node ID "${nodeId}" already exists. Please choose a different ID or enable "Overwrite IDs".`);
        }
        let suffix = 1;
        let newId = `${nodeId}_${suffix}`;
        while (existingNodeIds.has(newId)) {
          suffix++;
          newId = `${nodeId}_${suffix}`;
        }
        idMap.set(nodeId, newId);
        nodeId = newId;
      } else {
        idMap.set(nodeId, nodeId);
      }

      existingNodeIds.add(nodeId);

      console.log('Adding node:', nodeId);
      store.addNode({
        id: nodeId,
        name: node.name,
        properties: node.properties,
        state: node.state,
        x: node.x,
        y: node.y,
        value: node.value,
        messages: node.messages || [],
        past_received_messages: node.past_received_messages || [],
        past_sent_messages: node.past_sent_messages || []
      });
    });

    FileNetworkData.links.forEach((link) => {
      let sourceId = idMap.get(link.source) || link.source;
      let targetId = idMap.get(link.target) || link.target;

      console.log('Adding link:', sourceId, '->', targetId);
      store.addLink(sourceId, targetId);
    });

    mostrarFormularioLoad.value = false;
    errorMessage.value = '';

  } catch (error) {
    console.error('Error loading the network:', error.message);
    errorMessage.value = error.message || 'Failed to load the network.';
  }
}
 
function handleFloodNode(formData) {
  console.log('Attempting to insert messages for node:', formData.nodeId, formData.messages);
  errorMessage.value = ''; 
 
  const result = store.insertMessages(formData.nodeId, formData.messages);

  if (!result || !result.success) {
    errorMessage.value = result ? result.message : 'Unknown error during insertion.';
    console.error('Store insertion failed:', errorMessage.value);
  } else {
    console.log('Successfully inserted messages for node:', formData.nodeId);
    mostrarFormularioFloodNode.value = false;
    errorMessage.value = ''; 
  }
}

function handleInsertMultipleMessages(messageEntries) {
  console.log('Received message entries:', messageEntries);
  errorMessage.value = '';

  const messagesByNode = messageEntries.reduce((acc, entry) => {
    if (!acc[entry.nodeId]) {
      acc[entry.nodeId] = [];
    }
    acc[entry.nodeId].push({
      id: entry.id,
      properties: entry.properties
    });
    return acc;
  }, {});

  for (const [nodeId, messages] of Object.entries(messagesByNode)) {
    const result = store.insertMessages(nodeId, messages);

    if (!result?.success) {
      errorMessage.value = `Error inserting messages for node ${nodeId}: ${result?.message || 'Unknown error'}`;
      console.error(errorMessage.value);
    } else {
      console.log(`Successfully inserted messages for node ${nodeId}`);
    }
  }

  if (!errorMessage.value) {
    mostrarFormularioInsertMultipleMessages.value = false;
    console.log('All messages processed.');
  }
}

function handleInjectMessageModeCancel() {
  mostrarFormularioInjectMessageMode.value = false
  editModesStore.toggleInjectMessageMode()
}

function handleInjectMessageMode(formData){
  editModesStore.addMessages(formData.messages)
  editModesStore.overwriteIdsMessages= formData.overwriteIds
  errorMessage.value = ''
  mostrarFormularioInjectMessageMode.value = false

  const count = editModesStore.messages.length
  store.info_message = `${count} message${count !== 1 ? 's' : ''} prepared for injection.`

  if (store.infoMessageTimeout) {
    clearTimeout(store.infoMessageTimeout);
  }
  store.infoMessageTimeout = setTimeout(() => {
    store.info_message = '';
    store.infoMessageTimeout = null;
  }, 3000);
}

const handleGeneticAlgorithm = async (formData) => {
  console.log('Received Genetic Algorithm form data:', formData);
  errorMessage.value = '';
  mostrarFormularioGeneticAlgorithm.value = false;
  
  const gaStore = useGeneticAlgorithmStore()
  gaStore.updateConfig({
    objective: formData.objective === 'maximize' ? 'maximize' : 'minimize',
    generations: formData.generations,
    generationSize: formData.generation_size,
    iterations: formData.iterations,
    elitismRate: formData.elitismRate,
    mutationRate: formData.mutationRate,
    senderNodeId: formData.senderNodeId
  })

  // Mostrar visualización
  showVisualizationGA.value = true
  algorithmRunning.value = true
  
  try {
    const bestMessage = await runGeneticAlgorithm(
      store.nodes,
      store.links
    )
    console.log('Best message found:', bestMessage)
  } catch (error) {
    console.error('Algorithm failed:', error)
  }

}

const fadingOut = ref(false)

watch(() => store.info_message, (newVal) => {
  if (newVal) {
    // Reinicia animación si hay un nuevo mensaje
    fadingOut.value = false

    // Si ya había un timeout anterior, límpialo
    if (store.infoMessageTimeout) {
      clearTimeout(store.infoMessageTimeout)
    }

    // Empieza fade-out antes de eliminar el mensaje
    store.infoMessageTimeout = setTimeout(() => {
      fadingOut.value = true

      // Espera a que termine la animación (1s en este caso)
      setTimeout(() => {
        store.info_message = ''
        fadingOut.value = false
        store.infoMessageTimeout = null
      }, 1000)
    }, 2500) // Tiempo visible antes del fade-out
  }
})

</script>

<style scoped>
.sidebar-container {
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e2e, #25253a);
  border-right: 1px solid #3a3a5a;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar-container.collapsed {
  width: 60px;
}

.sidebar-content {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
}

.sidebar-container.collapsed .sidebar-content {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.toggle-menu-button {
  position: absolute;
  right: -40px;
  top: 20px;
  background: #42b883;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 100;
  transition: all 0.2s;
}

.toggle-menu-button:hover {
  background: #3aa875;
}

.expanded-content {
  flex: 1;
}
.insert-multiple{
  margin-top: 1rem;
  
}

.top-row {
  margin-top: 0px;
}

.Inject-message {
  height: 64px;
}

.tabs {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  flex: 1;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a8dadc;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tabs button.active {
  background: #42b88340;
  color: white;
  font-weight: 600;
}


sidebar-container.collapsed {
  width: 60px;
}

.collapsed-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 10px;
}

.info-popup {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(66, 184, 131, 0.15); 
  border: 1px solid #42b883;
  color: #42b883;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
  backdrop-filter: blur(4px);
  opacity: 1;
  /* animation: fadeOut 3s ease-out forwards; */
  transition: all 1s ease;
}

.fade-out{
  animation: fadeOut 1s ease-out forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}


</style>
