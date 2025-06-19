import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNetworkStore = defineStore('network', () => {
  const nodes = ref([
    {
      id: 'usr1',
      name: 'Juan',
      x: 200,
      y: 200,
      state: 'sending',
      value: 80,
      properties: { Funny: 0.8, Offensive: 0.6, FamilyFriendly: 0.2 },
      messages: [
        { id: 'msg1', properties: { Funny: 0.8, Offensive: 0.6, FamilyFriendly: 0.2 } },
        { id: 'msg2', properties: { Funny: 0.7, Offensive: 0.5, FamilyFriendly: 0.3 } },
      ],
      past_sent_messages: [],
      past_received_messages: [],
    },
    {
      id: 'usr2',
      name: 'Miguel',
      x: 400,
      y: 200,
      state: 'repeted',
      value: 60,
      properties: { Funny: 0.5, FamilyFriendly: 0.4 },
      messages: [
        { id: 'msg3', properties: { Funny: 0.5, FamilyFriendly: 0.4 } },
        { id: 'msg4', properties: { Funny: 0.6, FamilyFriendly: 0.5 } },
      ],
      past_sent_messages: [],
      past_received_messages: [],
    },
    {
      id: 'usr3',
      name: 'Laura',
      x: 200,
      y: 400,
      state: 'rejecting',
      value: 60,
      properties: { Girl: 0.7, OffendedEasily: 0.8, Critic: 0.6 },
      messages: [],
      past_sent_messages: [],
      past_received_messages: [],
    },
    {
      id: 'usr4',
      name: 'Mario',
      x: 400,
      y: 400,
      state: 'waiting',
      value: 60,
      properties: { Offensive: 0.6, Funny: 0.5 },
      messages: [],
      past_sent_messages: [],
      past_received_messages: [],
    },
  ])

  const links = ref([
    { source: 'usr2', target: 'usr1', state: 'sending' },
    { source: 'usr3', target: 'usr1', state: 'rejecting' },
    { source: 'usr4', target: 'usr3', state: 'waiting' },
    { source: 'usr3', target: 'usr4', state: 'waiting' }
  ])

  const messages = ref([
    { id: 'msg1', properties: { Funny: 0.8, Offensive: 0.6, FamilyFriendly: 0.2 } },
    { id: 'msg2', properties: { Funny: 0.7, Offensive: 0.5, FamilyFriendly: 0.3 } },
    { id: 'msg3', properties: { Funny: 0.5, FamilyFriendly: 0.4 } },
    { id: 'msg4', properties: { Funny: 0.6, FamilyFriendly: 0.5 } },
  ])

  const info_message = ref('')
  const infoMessageTimeout = ref(null)

  function addNode(node) {
    const existingNode = nodes.value.find((n) => n.id === node.id)
    if (existingNode) {
      console.error('Node with this ID already exists.')
      return { success: false, message: 'Node with this ID already exists.' }
    }

    nodes.value.push({
      id: node.id,
      name: node.name,
      x: node.x || 0,
      y: node.y || 0,
      state: node.state || 'waiting',
      value: node.value || 60,
      properties: node.properties,
      messages: node.messages || [],
      past_sent_messages: node.past_sent_messages || [],
      past_received_messages: node.past_received_messages || [],
    })

    updateMessages()
    return { success: true }
  }

  function addLink(id_source, id_target) {
    // Check if nodes exist
    const sourceNode = nodes.value.find((node) => node.id === id_source)
    const targetNode = nodes.value.find((node) => node.id === id_target)
    if (!sourceNode || !targetNode) {
      console.error('One or both nodes do not exist.')
      return { success: false, message: 'One or both nodes do not exist.' }
    }

    // Check if source and target are different
    if (id_source === id_target) {
      console.error('Cannot link a node to itself.')
      return { success: false, message: 'Cannot link a node to itself.' }
    }

    // Check if already exists
    const existingLink = links.value.find(
      (link) => link.source === id_source && link.target === id_target,
    )
    if (existingLink) {
      console.error('Link already exists.')
      return { success: false, message: 'Link already exists.' }
    }
    links.value.push({
      source: id_source,
      target: id_target,
      state: 'waiting',
    })

    return { success: true }
  }

  function deleteNode(nodeId) {
    const nodeIndex = nodes.value.findIndex((node) => node.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value.splice(nodeIndex, 1)
      links.value = links.value.filter((link) => link.source !== nodeId && link.target !== nodeId)
      updateMessages()
      return { success: true }
    } else {
      console.error('Node not found.')
      return { success: false, message: 'Node not found.' }
    }
  }

  function deleteLink(linkId) {
    const linkIndex = links.value.findIndex((link) => link.source + '-' + link.target === linkId)
    if (linkIndex !== -1) {
      links.value.splice(linkIndex, 1)
      return { success: true }
    } else {
      console.error('Link not found.')
      return { success: false, message: 'Link not found.' }
    }
  }

  function insertMessages(nodeId, messages_to_insert) {
    const node = nodes.value.find((node) => node.id === nodeId)
    if (node) {
      if (node.messages === undefined) {
        node.messages = []
      }
      node.messages.push(...messages_to_insert)
      messages.value.push(...messages_to_insert)
      return { success: true }
    } else {
      console.error('Node not found.')
      return { success: false, message: 'Node not found.' }
    }
  }

  function getNodeMessages(nodeId) {
    const node = nodes.value.find((node) => node.id === nodeId)
    if (node) {
      return node.messages
    } else {
      console.error('Node not found.')
      return []
    }
  }

  function getAllMessages() {
    return messages.value
  }

  function deleteAll() {
    nodes.value = []
    links.value = []
  }

  function updateMessages() {
    messages.value = []
    nodes.value.forEach((node) => {
      if (node.messages) {
        node.messages.forEach((message) => {
          messages.value.push(message)
        })
      }
    })
  }

  function getFollowers(nodeId) {
    const followers = []
    links.value.forEach((link) => {
      if (link.target === nodeId) {
        followers.push(link.source)
      }
    })
    return followers
  }

  function getNodeById(nodeId) {
    return nodes.value.find((node) => node.id === nodeId)
  }

  function getLink(sourceId, targetId) {
    return links.value.find((link) => link.source === sourceId && link.target === targetId)
  }

  // Possible states: 'waiting', 'sending', 'receiving' or 'rejecting
  function updateNodeState(nodeId, state) {
    const node = nodes.value.find((node) => node.id === nodeId)
    if (node) {
      node.state = state
    } else {
      console.error('Node not found.')
    }
  }

  function updateLinkState(sourceId, targetId, state) {
    const link = getLink(sourceId, targetId)
    if (link) {
      link.state = state
    } else {
      console.error('Link not found.')
    }
  }

  function resetStates() {
    nodes.value.forEach((node) => {
      node.state = 'waiting'
    })
    links.value.forEach((link) => {
      link.state = 'waiting'
    })
  }
  function resetMessages() {
    nodes.value.forEach((node) => {
      node.messages = []
      node.past_received_messages = []
      node.past_sent_messages = []
    })
    messages.value = []
  }

  function getNodes() {
    return nodes.value
  }

  function getCurrentStateSnapshot() {
    return {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      links: JSON.parse(JSON.stringify(links.value))
    };
  }
  
  function loadStateSnapshot(snapshot) {
    if (!snapshot || !snapshot.nodes) {
      console.error('Invalid snapshot format.')
      return
    }

    nodes.value = snapshot.nodes.map((node) => ({
      ...node,
      messages: node.messages || [],
      past_sent_messages: node.past_sent_messages || [],
      past_received_messages: node.past_received_messages || [],
    }))

    links.value = snapshot.links || []

    updateMessages()
  }


  return {
    nodes,
    links,
    messages,
    info_message,
    infoMessageTimeout,
    addNode,
    addLink,
    deleteNode,
    deleteLink,
    deleteAll,
    insertMessages,
    getNodeMessages,
    getAllMessages,
    updateMessages,
    getFollowers,
    getNodeById,
    getLink,
    updateNodeState,
    updateLinkState,
    resetStates,
    resetMessages,
    getNodes,
    getCurrentStateSnapshot,
    loadStateSnapshot
  }
})
