<template>
  <div class="network-view-container">
    <NetworkMenu
      class="sidebar"
    />
    <div class="main-content">
      <NetworkCanvas   :is-details-open="isPanelOpen"
       :nodes="store.nodes" :links="store.links" @node-click="handleNodeClick" @link-click="handleLinkClick"/>
    </div>
    <NodeDetailsPanel :isOpen="isPanelOpen" :nodeData="selectedNode" @close="isPanelOpen = false" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import NetworkMenu from '@/components/NetworkMenu.vue'
import NetworkCanvas from '@/components/NetworkCanvas.vue'
import NodeDetailsPanel from '@/components/NodeDetailsPanel.vue'
import { useNetworkStore } from '@/stores/networkStore'
import { useEditModesStore } from '@/stores/editModesStore'

const store = useNetworkStore()

const isPanelOpen = ref(false)
const selectedNode = ref({})
const editModesStore = useEditModesStore()

watch(() => store.nodes, () => {
  selectedNode.value = store.getNodeById(selectedNode.value.id) || ref({})
})

const handleNodeClick = (node) => {
  // selectedNode.value = node
  // isPanelOpen.value = true
  if (!editModesStore.toggleEditLinks && !editModesStore.toggleDeleteNodes && !editModesStore.toggleInjectMessage) {
    // Comportamiento normal (no está en modo de edición de enlaces)
    selectedNode.value = node
    isPanelOpen.value = true
    return
  }
  isPanelOpen.value = false
  if (editModesStore.toggleDeleteNodes) {
    // Modo de eliminación de nodos activado
    store.deleteNode(node.id)
    store.nodes = [...store.nodes]
  }
  else if (editModesStore.toggleEditLinks) {
    // Modo de edición de enlaces activado
    if (!editModesStore.firstNode) {
      // Set the first node
      editModesStore.firstNode = node
      console.log(`First node selected: ${node.id}`)
      store.info_message = `Node ${node.id} selected. Now select another node to create a link.`
      if (store.infoMessageTimeout) {
        clearTimeout(store.infoMessageTimeout);
      }
      store.infoMessageTimeout = setTimeout(() => {
        store.info_message = '';
        store.infoMessageTimeout = null;
      }, 3000);
    } else {
      // Create a link between the first node and the second node
      const sourceId = editModesStore.firstNode.id
      const targetId = node.id
    
      if (sourceId !== targetId) {
        console.log(`Creating link from ${sourceId} to ${targetId}`)
        store.addLink(sourceId, targetId)
        store.links = [...store.links]
      } else {
        console.log("Cannot create a link to the same node.")
      }
      // Reset the first node after creating the link
      editModesStore.firstNode = null
    }
  }
  else if (editModesStore.toggleInjectMessage) {
    // Modo de inyección de mensajes activado
    const messagesToInject = editModesStore.messages.map(msg => {
      if (editModesStore.overwriteIdsMessages) {
        // Generar nuevo ID único para cada mensaje
        const baseId = msg.id
        let newId = baseId
        let suffix = 1
        
        while (store.messages.some(m => m.id === newId)) {
          newId = `${baseId}_${suffix}`
          suffix++;
        }
        
        return {
          ...msg,
          id: newId
        };
      }
      return msg
    });
    
    store.insertMessages(node.id, messagesToInject)
    store.nodes = [...store.nodes]
    store.messages = [...store.messages]
  }
}
const handleLinkClick = (linkId) => {
  if (editModesStore.toggleDeleteLinks) {
    // Modo de eliminación de enlaces activado
    store.deleteLink(linkId)
    store.links = [...store.links]
  }  
}

</script>
<style scoped>
.network-view-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  background: #1a1a1a;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  z-index: 100;
}

.main-content {
  flex: 1;
  height: 100%;
}
</style>
