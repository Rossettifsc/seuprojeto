<template>
  <div v-if="goals.length" class="goal-list">
    <div v-for="(goal, index) in goals" :key="goal.id" class="goal-list-item">
      <span class="goal-symbol" :class="`goal-symbol-${index % 3}`">
        <ion-icon :icon="index % 2 ? airplaneOutline : flagOutline" />
      </span>
      <div class="goal-list-content">
        <div class="goal-list-title">
          <strong>{{ goal.title }}</strong>
          <span>{{ getGoalProgress(goal) }}%</span>
        </div>
        <div class="progress-track">
          <span :style="{ width: `${getGoalProgress(goal)}%` }"></span>
        </div>
        <span class="goal-list-caption">
          {{ formatCurrency(goal.current_amount) }} de {{ formatCurrency(goal.target_amount) }}
        </span>
      </div>
      <button
        class="goal-quick-add"
        title="Adicionar valor à meta"
        :aria-label="`Adicionar valor à meta ${goal.title}`"
        @click="emit('contribute', goal)"
      >
        <ion-icon :icon="addOutline" />
      </button>
    </div>
  </div>
  <div v-else class="goal-list-empty">Crie sua primeira meta e acompanhe seu progresso.</div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { addOutline, airplaneOutline, flagOutline } from 'ionicons/icons';
import type { FinanceGoal } from '@/types/finance';
import { formatCurrency, getGoalProgress } from '@/utils/financeFormatters';

defineProps<{ goals: FinanceGoal[] }>();
const emit = defineEmits<{ contribute: [goal: FinanceGoal] }>();
</script>
