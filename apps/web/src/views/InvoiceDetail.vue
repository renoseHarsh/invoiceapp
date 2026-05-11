<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Invoice Detail View</h1>
      <button class="bg-gray-200 px-4 py-2 rounded border border-gray-400">Download PDF</button>
    </div>
    <p class="text-gray-600 mb-4">Invoice ID: {{ $route.params.id }}</p>
    <router-link to="/invoices" class="text-blue-600 underline">Back to list</router-link>
  </div>
</template>
