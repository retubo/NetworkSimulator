<template>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Properties</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="msg in messages" :key="msg.id">
          <td>{{ msg.id }}</td>
          <td>
            <table class="inner-table">
              <tbody>
                <tr v-for="(val, key) in msg.properties" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ val }}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  defineProps({
    messages: {
      type: Array,
      required: true,
    },
  })
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  
  th,
  td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  
  .inner-table {
    width: 100%;
    border: none;
  }
  
  .inner-table td {
    border: none;
    padding: 0.25rem;
  }
  </style>
  