<template>
  <div class="welcome-row">
    <div>
      <p class="eyebrow">{{ todayLabel }}</p>
      <h1>Olá, {{ firstName }} <span class="wave">✦</span></h1>
      <p class="muted">Aqui está o resumo das suas finanças.</p>
    </div>
    <button class="outline-button" @click="emit('navigate', 'transactions')">
      Ver transações <ion-icon :icon="arrowForwardOutline" />
    </button>
  </div>

  <section class="metrics-grid" aria-label="Resumo financeiro">
    <article class="metric-card balance-card">
      <div class="metric-top">
        <span>Saldo do mês</span><span class="metric-icon balance-icon"><ion-icon :icon="walletOutline" /></span>
      </div>
      <strong>{{ formatCurrency(monthBalance) }}</strong>
      <div class="metric-foot">
        <span class="balance-status"><span></span> {{ balanceMessage }}</span>
      </div>
    </article>
    <article class="metric-card">
      <div class="metric-top">
        <span>Receitas</span><span class="metric-icon income-icon"><ion-icon :icon="arrowDownOutline" /></span>
      </div>
      <strong>{{ formatCurrency(monthIncome) }}</strong>
      <div class="metric-foot"><span class="positive">↑</span> neste mês</div>
    </article>
    <article class="metric-card">
      <div class="metric-top">
        <span>Despesas</span><span class="metric-icon expense-icon"><ion-icon :icon="arrowUpOutline" /></span>
      </div>
      <strong>{{ formatCurrency(monthExpenses) }}</strong>
      <div class="metric-foot"><span class="neutral">↘</span> neste mês</div>
    </article>
    <article class="metric-card">
      <div class="metric-top">
        <span>Economia</span><span class="metric-icon savings-icon"><ion-icon :icon="leafOutline" /></span>
      </div>
      <strong>{{ savingsRate }}<small>%</small></strong>
      <div class="metric-foot">da sua renda mensal</div>
    </article>
  </section>

  <section class="charts-grid">
    <article class="panel trend-panel">
      <div class="panel-heading">
        <div>
          <h2>Fluxo financeiro</h2>
          <p>Receitas e despesas nos últimos 6 meses</p>
        </div>
        <span class="chart-legend">
          <i class="legend-income"></i> Receitas <i class="legend-expense"></i> Despesas
        </span>
      </div>
      <ApexChart type="area" height="250" :options="trendOptions" :series="trendSeries" />
    </article>
    <article class="panel category-panel">
      <div class="panel-heading">
        <div>
          <h2>Despesas por categoria</h2>
          <p>Distribuição deste mês</p>
        </div>
      </div>
      <div v-if="monthExpenses > 0" class="donut-wrap">
        <ApexChart type="donut" height="210" :options="categoryOptions" :series="categorySeries" />
        <div class="donut-center">
          <strong>{{ formatCurrency(monthExpenses) }}</strong
          ><span>no mês</span>
        </div>
      </div>
      <div v-else class="chart-empty">
        <span class="empty-icon"><ion-icon :icon="pieChartOutline" /></span>
        <span>Sem despesas neste mês</span>
      </div>
      <div class="category-legend">
        <div v-for="item in categoryBreakdown" :key="item.name">
          <span><i :style="{ background: item.color }"></i>{{ item.name }}</span>
          <strong>{{ formatCurrency(item.value) }}</strong>
        </div>
      </div>
    </article>
  </section>

  <section class="bottom-grid">
    <article class="panel transactions-panel">
      <div class="panel-heading">
        <div>
          <h2>Transações recentes</h2>
          <p>Suas movimentações mais recentes</p>
        </div>
        <button class="link-button" @click="emit('navigate', 'transactions')">
          Ver todas <ion-icon :icon="arrowForwardOutline" />
        </button>
      </div>
      <TransactionList :transactions="transactions.slice(0, 5)" @remove="emit('remove-transaction', $event)" />
    </article>
    <article class="panel goals-panel">
      <div class="panel-heading">
        <div>
          <h2>Metas financeiras</h2>
          <p>Passo a passo para chegar lá</p>
        </div>
        <button class="link-button" @click="emit('navigate', 'goals')">
          Ver todas <ion-icon :icon="arrowForwardOutline" />
        </button>
      </div>
      <GoalProgressList :goals="goals.slice(0, 2)" @contribute="emit('contribute-goal', $event)" />
      <button class="goal-add-button" @click="emit('new-goal')"><ion-icon :icon="addOutline" /> Criar uma meta</button>
    </article>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  addOutline,
  arrowDownOutline,
  arrowForwardOutline,
  arrowUpOutline,
  leafOutline,
  pieChartOutline,
  walletOutline,
} from 'ionicons/icons';
import type { ApexOptions } from 'apexcharts';
import type { FinanceGoal, FinanceTransaction } from '@/types/finance';
import { formatCurrency } from '@/utils/financeFormatters';
import GoalProgressList from '@/components/finance/GoalProgressList.vue';
import TransactionList from '@/components/finance/TransactionList.vue';

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'));

defineProps<{
  todayLabel: string;
  firstName: string;
  monthBalance: number;
  monthIncome: number;
  monthExpenses: number;
  savingsRate: number;
  balanceMessage: string;
  trendOptions: ApexOptions;
  trendSeries: ApexOptions['series'];
  categoryOptions: ApexOptions;
  categorySeries: number[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  transactions: FinanceTransaction[];
  goals: FinanceGoal[];
}>();

const emit = defineEmits<{
  navigate: [section: 'transactions' | 'goals'];
  'remove-transaction': [transactionId: string];
  'new-goal': [];
  'contribute-goal': [goal: FinanceGoal];
}>();
</script>
