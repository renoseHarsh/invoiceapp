<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Invoice List</h1>
      <router-link to="/invoices/new" class="bg-black text-white px-4 py-2 rounded"
        >Create Invoice</router-link
      >
    </div>
    <p class="text-gray-600">Table: number, customer, total, status, action: view</p>
  </div>
</template>
