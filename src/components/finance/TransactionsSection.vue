<template>
  <div class="welcome-row page-title-row">
    <div>
      <p class="eyebrow">ACOMPANHAMENTO</p>
      <h1>Transações</h1>
      <p class="muted">Acompanhe tudo o que entra e sai.</p>
    </div>
    <button class="primary-button" @click="emit('new-transaction')">
      <ion-icon :icon="addOutline" /> Nova transação
    </button>
  </div>

  <section class="panel full-panel">
    <div class="panel-heading transaction-heading">
      <div>
        <h2>Todas as movimentações</h2>
        <p>{{ transactions.length }} registros encontrados</p>
      </div>
      <div class="filter-group" aria-label="Filtrar transações">
        <button :class="{ selected: filter === 'all' }" @click="filter = 'all'">Todas</button>
        <button :class="{ selected: filter === 'income' }" @click="filter = 'income'">Receitas</button>
        <button :class="{ selected: filter === 'expense' }" @click="filter = 'expense'">Despesas</button>
      </div>
    </div>
    <TransactionList :transactions="transactions" @remove="emit('remove-transaction', $event)" />
  </section>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import type { FinanceTransaction, TransactionType } from '@/types/finance';
import TransactionList from '@/components/finance/TransactionList.vue';

defineProps<{ transactions: FinanceTransaction[] }>();
const filter = defineModel<'all' | TransactionType>('filter', { required: true });
const emit = defineEmits<{
  'new-transaction': [];
  'remove-transaction': [transactionId: string];
}>();
</script>
