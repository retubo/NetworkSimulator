import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditModesStore = defineStore('editModesStore', () => {
    const firstNode = ref(null)
    const toggleEditLinks = ref(false)
    const toggleDeleteNodes = ref(false)
    const toggleDeleteLinks = ref(false)
    const toggleInjectMessage = ref(false)
    const overwriteIdsMessages = ref(false)

    const messages = ref([null])

    function addMessages(newMessages) {
        messages.value = []
        messages.value.push(...newMessages)
    }

    function clearMessages() {
        messages.value = []
    }


    const setAllToFalse = () => {
        toggleEditLinks.value = false
        toggleDeleteNodes.value = false
        toggleDeleteLinks.value = false
        toggleInjectMessage.value = false
    }

    const toggleDeleteNodesMode = () => {
        toggleDeleteNodes.value = !toggleDeleteNodes.value
        if (toggleDeleteNodes.value) {
            toggleEditLinks.value = false
            toggleDeleteLinks.value = false
            toggleInjectMessage.value = false
        }
    }

    const toggleEditLinksMode = () => {
        toggleEditLinks.value = !toggleEditLinks.value
        if (toggleEditLinks.value) {
            toggleDeleteNodes.value = false
            toggleDeleteLinks.value = false
            toggleInjectMessage.value = false
        }
    }

    const toggleDeleteLinksMode = () => {
        toggleDeleteLinks.value = !toggleDeleteLinks.value
        if (toggleDeleteLinks.value) {
            toggleEditLinks.value = false
            toggleDeleteNodes.value = false
            toggleInjectMessage.value = false
        }
    }

    const toggleInjectMessageMode = () => {
        toggleInjectMessage.value = !toggleInjectMessage.value
        if (toggleInjectMessage.value) {
            toggleEditLinks.value = false
            toggleDeleteLinks.value = false
            toggleDeleteNodes.value = false
        }
    }

    return {
        firstNode,
        toggleEditLinks,
        toggleDeleteNodes,
        toggleDeleteLinks,
        toggleInjectMessage,
        overwriteIdsMessages,
        messages,
        addMessages,
        clearMessages,
        toggleEditLinksMode,
        toggleDeleteNodesMode,
        toggleDeleteLinksMode,
        toggleInjectMessageMode,
        setAllToFalse
    }
})