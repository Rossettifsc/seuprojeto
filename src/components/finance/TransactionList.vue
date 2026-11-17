<template>
  <div v-if="transactions.length" class="transaction-list">
    <div v-for="transaction in transactions" :key="transaction.id" class="transaction-row">
      <span class="transaction-icon" :class="transaction.type">
        <ion-icon :icon="iconForCategory(transaction.category)" />
      </span>
      <div class="transaction-main">
        <strong>{{ transaction.title }}</strong>
        <span>{{ transaction.category }} · {{ formatDate(transaction.date) }}</span>
      </div>
      <strong class="transaction-amount" :class="transaction.type">
        {{ transaction.type === 'income' ? '+' : '−' }}{{ formatCurrency(transaction.amount) }}
      </strong>
      <button
        class="icon-button remove-button"
        title="Excluir transação"
        :aria-label="`Excluir ${transaction.title}`"
        @click="emit('remove', transaction.id)"
      >
        <ion-icon :icon="closeOutline" />
      </button>
    </div>
  </div>
  <div v-else class="empty-list">
    <span class="empty-icon"><ion-icon :icon="swapHorizontalOutline" /></span>
    <span>Suas transações aparecerão aqui.</span>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  cafeOutline,
  carOutline,
  closeOutline,
  heartOutline,
  homeOutline,
  schoolOutline,
  swapHorizontalOutline,
  walletOutline,
} from 'ionicons/icons';
import type { FinanceTransaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/utils/financeFormatters';

defineProps<{ transactions: FinanceTransaction[] }>();
const emit = defineEmits<{ remove: [transactionId: string] }>();

function iconForCategory(category: string) {
  if (category === 'Moradia') return homeOutline;
  if (category === 'Transporte') return carOutline;
  if (category === 'Saúde') return heartOutline;
  if (category === 'Educação') return schoolOutline;
  if (category === 'Alimentação' || category === 'Lazer') return cafeOutline;
  return walletOutline;
}
</script>
