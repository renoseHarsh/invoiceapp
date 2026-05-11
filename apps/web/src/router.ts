// apps/web/src/router.ts
import { createRouter, createWebHistory } from 'vue-router'
import InvoiceList from './views/InvoiceList.vue'
import InvoiceCreate from './views/InvoiceCreate.vue'
import InvoiceDetail from './views/InvoiceDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/invoices' },
    { path: '/invoices', component: InvoiceList },
    { path: '/invoices/new', component: InvoiceCreate },
    { path: '/invoices/:id', component: InvoiceDetail },
  ],
})

export default router
