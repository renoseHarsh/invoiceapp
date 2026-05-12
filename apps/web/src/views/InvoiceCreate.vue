<script setup lang="ts">
import { ref } from "vue";
import { flattenError } from "shared";
import { CreateInvoiceSchema } from "shared";
import router from "@/router";


const form = ref({
  customerName: "",
  customerEmail: "",
  currency: "USD",
  taxRateBps: "",
  dueAt: "",
  lineItems: [
    {
      description: "",
      quantity: "",
      unitPriceMinor: "",
    },
  ],
});

const error = ref("")

function addLineItem() {
  form.value.lineItems.push({
    description: "",
    quantity: "",
    unitPriceMinor: "",
  });
}

function removeLineItem(index: number) {
  form.value.lineItems.splice(index, 1);
}

async function submit() {
  const body = {
    ...form.value,
    dueAt: new Date(form.value.dueAt).toISOString()
  }
  const result = CreateInvoiceSchema.safeParse(body);
  if (!result.success) {
    error.value = JSON.stringify(
      flattenError(result.error).fieldErrors,
      null,
      2,
    );
    return;
  }
  error.value = ""

  try {

    const res = await fetch("http://localhost:3000/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.data),
    });

    if (!res.ok) {
      error.value = "Failed to create invoice";
      return;
    }
    await router.push("/invoices")
  } catch {
    error.value = "Server Error";
  }

}

</script>

<template>
  <form @submit.prevent="submit" class="max-w-2xl mx-auto p-6 space-y-6">
    <div class="space-y-4">
      <input v-model="form.customerName" type="text" placeholder="Customer Name" class="w-full border p-3 rounded" />

      <input v-model="form.customerEmail" type="email" placeholder="Customer Email" class="w-full border p-3 rounded"
        required />

      <div class="grid grid-cols-2 gap-4">
        <input v-model="form.currency" type="text" maxlength="3" placeholder="USD" class="border p-3 rounded uppercase"
          required />

        <input v-model.number="form.taxRateBps" type="number" placeholder="Tax Rate (bps)" class="border p-3 rounded"
          required />
      </div>

      <div>
        <label class="block text-sm font-medium">
          Due Date
        </label>
        <input v-model="form.dueAt" type="datetime-local" class="w-full border p-3 rounded" required
          :min="new Date().toISOString().slice(0, 16)" />
      </div>
    </div>

    <div class="space-y-4">
      <div v-for="(item, index) in form.lineItems" :key="index" class="border rounded p-4 space-y-3">
        <input v-model="item.description" type="text" placeholder="Description" class="w-full border p-3 rounded"
          required />

        <div class="grid grid-cols-2 gap-3">
          <input v-model.number="item.quantity" type="number" min="1" placeholder="Quantity" required
            class="border p-3 rounded" />

          <input v-model.number="item.unitPriceMinor" type="number" min="0" placeholder="Unit Price (minor)" required
            class="border p-3 rounded" />
        </div>

        <button type="button" @click="removeLineItem(index)" class="text-red-500 text-sm cursor-pointer">
          Remove
        </button>
      </div>

      <button type="button" @click="addLineItem" class="border px-4 py-2 rounded cursor-pointer">
        Add Line Item
      </button>
    </div>
    <div v-if="error" class="mt-4 rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
      {{ error }}
    </div>


    <button type="submit" class="w-full bg-black text-white py-3 rounded cursor-pointer">
      Create Invoice
    </button>
  </form>
</template>
