<script setup lang="ts">
import { PaginatedInvoiceSchema, type PaginatedInvoice } from 'shared'
import { onMounted, ref } from 'vue'

const invoices = ref<PaginatedInvoice | null>(null)
const error = ref('')

async function updateList(page: number) {
  try {
    const res = await fetch(`http://localhost:3000/api/invoices?page=${page}`)
    if (!res.ok) {
      error.value = 'Failed to fetch invoices'
      return
    }
    const result = await res.json()

    const data = PaginatedInvoiceSchema.safeParse(result)

    if (!data.success) {
      error.value = 'Invalid server response'
      console.log(data)
      return
    }
    invoices.value = data.data
    error.value = ''
  } catch {
    error.value = 'Server Error'
  }
}

onMounted(async () => {
  await updateList(1)
})
</script>

<template>
  <div v-if="error" class="rounded border border-red-500/20 bg-red-500/10 p-4 text-red-500">
    {{ error }}
  </div>
  <div v-else-if="invoices" class="max-w-5xl mx-auto p-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">Invoices</h1>

      <router-link to="/invoices/new" class="rounded bg-black text-white px-4 py-2">
        Create Invoice
      </router-link>
    </div>

    <div class="rounded border overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left p-4">Number</th>

            <th class="text-left p-4">Customer</th>

            <th class="text-left p-4">Status</th>

            <th class="text-left p-4">Total</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="invoice in invoices.items"
            :key="invoice.id"
            class="border-t hover:bg-gray-50 cursor-pointer"
            @click="$router.push(`/invoices/${invoice.id}`)"
          >
            <td class="p-4 font-medium">
              {{ invoice.number }}
            </td>

            <td class="p-4">
              {{ invoice.customerName }}
            </td>

            <td class="p-4 capitalize">
              {{ invoice.status }}
            </td>

            <td class="p-4">
              {{ invoice.totalMinor / 100 }}
              {{ invoice.currency }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-6">
      <button
        class="rounded border px-4 py-2 disabled:opacity-50"
        @click="updateList(invoices.page - 1)"
        :disabled="invoices.page === 1"
      >
        Previous
      </button>

      <p>
        Page {{ invoices.page }} of
        {{ invoices.totalPages }}
      </p>

      <button
        class="rounded border px-4 py-2 disabled:opacity-50"
        @click="updateList(invoices.page + 1)"
        :disabled="invoices.page === invoices.totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>
