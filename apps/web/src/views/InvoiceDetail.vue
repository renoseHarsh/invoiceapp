<script setup lang="ts">
import { InvoiceSchema, type GetInvoiceData, type InvoiceStatus } from 'shared'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

const error = ref('')
const invoice = ref<GetInvoiceData | null>(null)

async function loadInvoice() {
  try {
    const res = await fetch(`http://localhost:3000/api/invoices/${route.params.id}`)
    if (!res.ok) {
      error.value = `Faile to fetch, status ${res.status}`
      return
    }
    const result = await res.json()
    const data = InvoiceSchema.safeParse(result)

    if (!data.success) {
      error.value = 'Invalid Server Response'
      return
    }
    invoice.value = data.data
  } catch (some) {
    console.log(some)
    error.value = 'Server Error'
  }
}

onMounted(loadInvoice)

async function updateStatus(status: InvoiceStatus) {
  try {
    const res = await fetch(`http://localhost:3000/api/invoices/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      error.value = 'Failed to update status'
      return
    }
    loadInvoice()
  } catch {
    error.value = 'Server Error'
  }
}

function openPdf() {
  window.open(`http://localhost:3000/api/invoices/${invoice.value!.id}/pdf`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <div v-if="error" class="rounded border border-red-500/20 bg-red-500/10 p-4 text-red-500">
      {{ error }}
    </div>
    <div v-else-if="invoice">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">
            {{ invoice.number }}
          </h1>

          <p class="text-gray-500 mt-1">
            {{ invoice.customerName }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            v-if="invoice.status === 'draft'"
            class="rounded border px-4 py-2 cursor-pointer"
            @click="updateStatus('issued')"
          >
            Mark as Issued
          </button>

          <div v-else-if="invoice.status === 'issued'" class="flex gap-2">
            <button class="rounded border px-4 py-2 cursor-pointer" @click="updateStatus('paid')">
              Mark as Paid
            </button>
            <button class="rounded border px-4 py-2 cursor-pointer" @click="updateStatus('void')">
              Mark as void
            </button>
          </div>

          <button @click="openPdf" class="rounded bg-black text-white px-4 py-2">
            Download PDF
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="rounded border p-4">
          <p class="text-sm text-gray-500 mb-1">Status</p>

          <p class="font-medium capitalize">
            {{ invoice.status }}
          </p>
        </div>

        <div class="rounded border p-4">
          <p class="text-sm text-gray-500 mb-1">Due Date</p>

          <p class="font-medium">
            {{ new Date(invoice.dueAt).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <div class="rounded border overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left p-4">Description</th>

              <th class="text-left p-4">Qty</th>

              <th class="text-left p-4">Unit Price</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in invoice.lineItems" :key="index" class="border-t">
              <td class="p-4">
                {{ item.description }}
              </td>

              <td class="p-4">
                {{ item.quantity }}
              </td>

              <td class="p-4">
                {{ item.unitPriceMinor / 100 }}
                {{ invoice.currency }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-8 ml-auto max-w-sm space-y-3">
        <div class="flex justify-between">
          <span>Subtotal</span>

          <span>
            {{ invoice.subtotalMinor / 100 }}
            {{ invoice.currency }}
          </span>
        </div>

        <div class="flex justify-between">
          <span>Tax</span>

          <span>
            {{ invoice.taxMinor / 100 }}
            {{ invoice.currency }}
          </span>
        </div>

        <div class="flex justify-between text-lg font-bold border-t pt-3">
          <span>Total</span>

          <span>
            {{ invoice.totalMinor / 100 }}
            {{ invoice.currency }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
