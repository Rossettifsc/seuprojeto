<template>
  <ion-page>
    <ion-content :fullscreen="true" class="finance-content">
      <FinanceAuth
        v-if="!userId"
        v-model:auth-email="authEmail"
        v-model:auth-password="authPassword"
        v-model:is-sign-up="isSignUp"
        :configured="isSupabaseConfigured"
        :busy="busy"
        :is-dark="isDark"
        @authenticate="authenticate"
        @enter-demo="enterDemo"
        @toggle-theme="toggleTheme"
      />

      <div v-else class="app-layout">
        <FinanceNavigation
          :active-section="activeSection"
          :section-title="sectionTitle"
          :goals-count="goals.length"
          :user-initial="userInitial"
          :display-name="displayName"
          :is-demo="isDemo"
          :is-dark="isDark"
          @navigate="activeSection = $event"
          @toggle-theme="toggleTheme"
          @new-transaction="openTransactionModal"
          @sign-out="signOut"
        >
          <div v-if="isDemo && showDemoBanner" class="demo-banner">
            <ion-icon :icon="informationCircleOutline" />
            <span>Os dados desta demonstração ficam salvos neste dispositivo.</span>
            <button aria-label="Fechar aviso" @click="showDemoBanner = false">
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <OverviewSection
            v-if="activeSection === 'overview'"
            :today-label="todayLabel"
            :first-name="firstName"
            :month-balance="monthBalance"
            :month-income="monthIncome"
            :month-expenses="monthExpenses"
            :savings-rate="savingsRate"
            :balance-message="balanceMessage"
            :trend-options="trendOptions"
            :trend-series="trendSeries"
            :category-options="categoryOptions"
            :category-series="categorySeries"
            :category-breakdown="categoryBreakdown"
            :transactions="transactions"
            :goals="goals"
            @navigate="activeSection = $event"
            @remove-transaction="removeTransactionAction"
            @new-goal="openGoalModal"
            @contribute-goal="openContributionModal"
          />

          <TransactionsSection
            v-else-if="activeSection === 'transactions'"
            v-model:filter="transactionFilter"
            :transactions="filteredTransactions"
            @new-transaction="openTransactionModal"
            @remove-transaction="removeTransactionAction"
          />

          <GoalsSection v-else :goals="goals" @new-goal="openGoalModal" @contribute="openContributionModal" />
        </FinanceNavigation>
      </div>
    </ion-content>

    <FinanceDialogs
      v-model:transaction-open="transactionModalOpen"
      v-model:goal-open="goalModalOpen"
      v-model:contribution-goal="contributionGoal"
      v-model:contribution-amount="contributionAmount"
      v-model:transaction-form="transactionForm"
      v-model:goal-form="goalForm"
      :busy="busy"
      :today="today"
      @save-transaction="saveTransaction"
      @save-goal="saveGoal"
      @save-contribution="saveContribution"
    />

    <div v-if="toastOpen" class="app-toast" :class="toastColor" role="status">
      <ion-icon :icon="toastColor === 'success' ? checkmarkCircleOutline : alertCircleOutline" />
      <span>{{ toastMessage }}</span>
      <button aria-label="Fechar notificação" @click="toastOpen = false">
        <ion-icon :icon="closeOutline" />
      </button>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { alertCircleOutline, checkmarkCircleOutline, closeOutline, informationCircleOutline } from 'ionicons/icons';
import FinanceAuth from '@/components/finance/FinanceAuth.vue';
import FinanceDialogs from '@/components/finance/FinanceDialogs.vue';
import FinanceNavigation from '@/components/finance/FinanceNavigation.vue';
import GoalsSection from '@/components/finance/GoalsSection.vue';
import OverviewSection from '@/components/finance/OverviewSection.vue';
import TransactionsSection from '@/components/finance/TransactionsSection.vue';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useFinanceDashboard } from '@/composables/useFinanceDashboard';

const {
  activeSection,
  authEmail,
  authPassword,
  authenticate,
  balanceMessage,
  busy,
  categoryBreakdown,
  categoryOptions,
  categorySeries,
  contributionAmount,
  contributionGoal,
  displayName,
  enterDemo,
  filteredTransactions,
  firstName,
  goalForm,
  goalModalOpen,
  goals,
  isDark,
  isDemo,
  isSignUp,
  monthBalance,
  monthExpenses,
  monthIncome,
  openContributionModal,
  openGoalModal,
  openTransactionModal,
  removeTransactionAction,
  saveContribution,
  saveGoal,
  saveTransaction,
  savingsRate,
  sectionTitle,
  showDemoBanner,
  signOut,
  today,
  todayLabel,
  toastColor,
  toastMessage,
  toastOpen,
  toggleTheme,
  transactionFilter,
  transactionForm,
  transactionModalOpen,
  transactions,
  trendOptions,
  trendSeries,
  userId,
  userInitial,
} = useFinanceDashboard();
</script>
