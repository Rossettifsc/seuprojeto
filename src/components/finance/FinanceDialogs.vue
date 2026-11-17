<template>
  <div v-if="transactionOpen" class="modal-backdrop" @click.self="transactionOpen = false">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
      <div class="modal-heading">
        <div>
          <p class="eyebrow">REGISTRO FINANCEIRO</p>
          <h2 id="transaction-modal-title">Nova transação</h2>
        </div>
        <button class="icon-button" aria-label="Fechar" @click="transactionOpen = false">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>
      <form class="modal-form" @submit.prevent="emit('save-transaction')">
        <div class="type-toggle">
          <button
            type="button"
            :class="{ selected: transactionForm.type === 'expense' }"
            @click="transactionForm.type = 'expense'"
          >
            <ion-icon :icon="arrowUpOutline" /> Despesa
          </button>
          <button
            type="button"
            :class="{ selected: transactionForm.type === 'income' }"
            @click="transactionForm.type = 'income'"
          >
            <ion-icon :icon="arrowDownOutline" /> Receita
          </button>
        </div>
        <label>
          Descrição
          <input v-model.trim="transactionForm.title" maxlength="80" placeholder="Ex.: Conta de luz" required />
        </label>
        <label>
          Valor
          <div class="amount-input">
            <span>R$</span>
            <input
              v-model.number="transactionForm.amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>
        </label>
        <div class="form-row">
          <label>
            Categoria
            <select v-model="transactionForm.category" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>
          <label>Data<input v-model="transactionForm.date" type="date" required /></label>
        </div>
        <div class="modal-actions">
          <button type="button" class="outline-button" @click="transactionOpen = false">Cancelar</button>
          <button class="primary-button" type="submit" :disabled="busy">Salvar transação</button>
        </div>
      </form>
    </section>
  </div>

  <div v-if="goalOpen" class="modal-backdrop" @click.self="goalOpen = false">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title">
      <div class="modal-heading">
        <div>
          <p class="eyebrow">PLANEJE SEU FUTURO</p>
          <h2 id="goal-modal-title">Nova meta financeira</h2>
        </div>
        <button class="icon-button" aria-label="Fechar" @click="goalOpen = false">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>
      <form class="modal-form" @submit.prevent="emit('save-goal')">
        <label>
          Nome da meta
          <input v-model.trim="goalForm.title" maxlength="80" placeholder="Ex.: Viagem de férias" required />
        </label>
        <label>
          Valor desejado
          <div class="amount-input">
            <span>R$</span>
            <input
              v-model.number="goalForm.target_amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>
        </label>
        <label>Data desejada<input v-model="goalForm.due_date" type="date" :min="today" required /></label>
        <div class="modal-actions">
          <button type="button" class="outline-button" @click="goalOpen = false">Cancelar</button>
          <button class="primary-button" type="submit" :disabled="busy">Criar meta</button>
        </div>
      </form>
    </section>
  </div>

  <div v-if="contributionGoal" class="modal-backdrop" @click.self="contributionGoal = null">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contribution-modal-title">
      <div class="modal-heading">
        <div>
          <p class="eyebrow">UM PASSO DE CADA VEZ</p>
          <h2 id="contribution-modal-title">Adicionar à meta</h2>
          <p class="muted">{{ contributionGoal.title }}</p>
        </div>
        <button class="icon-button" aria-label="Fechar" @click="contributionGoal = null">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>
      <form class="modal-form" @submit.prevent="emit('save-contribution')">
        <label>
          Quanto deseja guardar?
          <div class="amount-input">
            <span>R$</span>
            <input
              v-model.number="contributionAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>
        </label>
        <div class="modal-actions">
          <button type="button" class="outline-button" @click="contributionGoal = null">Cancelar</button>
          <button class="primary-button" type="submit" :disabled="busy">Adicionar valor</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { arrowDownOutline, arrowUpOutline, closeOutline } from 'ionicons/icons';
import type { FinanceGoal, NewGoal, NewTransaction } from '@/types/finance';

defineProps<{
  busy: boolean;
  today: string;
}>();

const transactionOpen = defineModel<boolean>('transactionOpen', { required: true });
const goalOpen = defineModel<boolean>('goalOpen', { required: true });
const contributionGoal = defineModel<FinanceGoal | null>('contributionGoal', { required: true });
const contributionAmount = defineModel<number | null>('contributionAmount', { required: true });
const transactionForm = defineModel<NewTransaction>('transactionForm', { required: true });
const goalForm = defineModel<NewGoal>('goalForm', { required: true });
const emit = defineEmits<{
  'save-transaction': [];
  'save-goal': [];
  'save-contribution': [];
}>();

const categories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Salário', 'Extra', 'Outros'];
</script>
