<template>
  <div class="welcome-row page-title-row">
    <div>
      <p class="eyebrow">SEU FUTURO FINANCEIRO</p>
      <h1>Metas financeiras</h1>
      <p class="muted">Transforme seus planos em conquistas.</p>
    </div>
    <button class="primary-button" @click="emit('new-goal')"><ion-icon :icon="addOutline" /> Nova meta</button>
  </div>

  <div v-if="goals.length" class="goals-grid">
    <article v-for="(goal, index) in goals" :key="goal.id" class="panel goal-card">
      <div class="goal-card-top">
        <span class="goal-symbol" :class="`goal-symbol-${index % 3}`">
          <ion-icon :icon="index % 2 ? airplaneOutline : flagOutline" />
        </span>
        <button
          class="icon-button"
          :aria-label="`Adicionar valor à meta ${goal.title}`"
          title="Adicionar valor"
          @click="emit('contribute', goal)"
        >
          <ion-icon :icon="addOutline" />
        </button>
      </div>
      <h2>{{ goal.title }}</h2>
      <p class="muted">Meta até {{ formatDate(goal.due_date) }}</p>
      <div class="goal-amounts">
        <strong>{{ formatCurrency(goal.current_amount) }}</strong>
        <span>de {{ formatCurrency(goal.target_amount) }}</span>
      </div>
      <div class="progress-track"><span :style="{ width: `${getGoalProgress(goal)}%` }"></span></div>
      <div class="goal-card-footer">
        <span>{{ getGoalProgress(goal) }}% concluído</span>
        <button class="link-button" @click="emit('contribute', goal)">
          Adicionar valor <ion-icon :icon="arrowForwardOutline" />
        </button>
      </div>
    </article>
  </div>
  <section v-else class="panel empty-goals">
    <span class="empty-icon"><ion-icon :icon="flagOutline" /></span>
    <h2>Seu próximo objetivo começa aqui</h2>
    <p class="muted">Crie uma meta para acompanhar seu progresso e realizar seus planos.</p>
    <button class="primary-button" @click="emit('new-goal')">
      <ion-icon :icon="addOutline" /> Criar primeira meta
    </button>
  </section>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { addOutline, airplaneOutline, arrowForwardOutline, flagOutline } from 'ionicons/icons';
import type { FinanceGoal } from '@/types/finance';
import { formatCurrency, formatDate, getGoalProgress } from '@/utils/financeFormatters';

defineProps<{ goals: FinanceGoal[] }>();
const emit = defineEmits<{
  'new-goal': [];
  contribute: [goal: FinanceGoal];
}>();
</script>
