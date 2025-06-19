<template>
    <div class="form-overlay">
        <div class="form-container">
        <h2>Load Network</h2>
        <div v-if="errorMessage" class="error-popup">{{ errorMessage }}</div>
        <form @submit.prevent="submitForm">
            <label>
            Select JSON File:
            <input type="file" @change="handleFileUpload" accept=".json" required />
            </label>

            <label class="checkbox-label">
                <div class="checkbox-container">
                    <input type="checkbox" v-model="overwriteIds" id="overwriteIds" />
                    <span class="custom-checkbox"></span>
                </div>
                <span>Overwrite IDs if duplicated</span>
            </label>

            <label class="checkbox-label">
                <div class="checkbox-container">
                    <input type="checkbox" v-model="newNetwork" id="newNetwork" />
                    <span class="custom-checkbox"></span>
                </div>
                <span>New Network (clear current nodes)</span>
            </label>

            <div class="form-actions">
                <button type="submit" class="button-green">Load</button>
                <button type="button" class="button-red" @click="$emit('cancel')">Cancel</button>
            </div>
        </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel', 'error'])
defineProps({
errorMessage: String
})

const file = ref(null)
const overwriteIds = ref(false)
const newNetwork = ref(false)

function handleFileUpload(event) {
file.value = event.target.files[0]
}

async function submitForm() {
if (!file.value) {
    emit('error', 'You must select a file.')
    return
}

emit('submit', {
    file: file.value,
    overwriteIds: overwriteIds.value,
    newNetwork: newNetwork.value
})
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
padding: 1.8rem;
border-radius: 14px;
width: 100%;
max-width: 400px;
box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
font-family: 'Inter', sans-serif;
color: #ffffff;
display: flex;
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

label:not(.checkbox-label) {
display: block;
font-size: 0.9rem;
font-weight: 500;
color: #ffffffcc;
}

input[type="file"] {
margin-top: 0.4rem;
padding: 0.7rem 0.9rem;
width: 100%;
border-radius: 8px;
border: 1px solid #3a3a5a;
background: #1e1e2e;
color: #ffffff;
font-size: 0.9rem;
box-sizing: border-box;
}

input[type="file"]:focus {
border-color: #42b883;
outline: none;
}

button {
padding: 0.9rem 1.6rem; 
border-radius: 8px;
cursor: pointer;
transition: all 0.3s ease;
font-size: 1rem;
border: none; 
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
background-color: #c0392b;
color: white;
padding: 0.7rem 1rem;
border-radius: 6px;
text-align: center;
margin-bottom: 0.8rem;
font-size: 0.9rem;
}
</style>