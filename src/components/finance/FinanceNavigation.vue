<template>
  <aside class="sidebar">
    <a class="brand" href="#" @click.prevent="emit('navigate', 'overview')">
      <span class="brand-mark small"><ion-icon :icon="walletOutline" /></span>
      <span>saldo<span class="brand-dot">.</span></span>
    </a>
    <p class="nav-label">MENU</p>
    <nav class="side-nav" aria-label="Navegação principal">
      <button :class="{ active: activeSection === 'overview' }" @click="emit('navigate', 'overview')">
        <ion-icon :icon="gridOutline" /> Visão geral
      </button>
      <button :class="{ active: activeSection === 'transactions' }" @click="emit('navigate', 'transactions')">
        <ion-icon :icon="swapHorizontalOutline" /> Transações
      </button>
      <button :class="{ active: activeSection === 'goals' }" @click="emit('navigate', 'goals')">
        <ion-icon :icon="flagOutline" /> Metas financeiras
        <span v-if="goalsCount" class="nav-count">{{ goalsCount }}</span>
      </button>
    </nav>
    <div class="sidebar-bottom">
      <div class="profile-avatar">{{ userInitial }}</div>
      <div class="profile-copy">
        <strong>{{ displayName }}</strong>
        <span>{{ isDemo ? 'Modo demonstração' : 'Conta pessoal' }}</span>
      </div>
      <button class="icon-button logout-button" aria-label="Sair" title="Sair" @click="emit('sign-out')">
        <ion-icon :icon="logOutOutline" />
      </button>
    </div>
  </aside>

  <section class="workspace">
    <header class="topbar">
      <div class="mobile-brand">
        <span class="brand-mark small"><ion-icon :icon="walletOutline" /></span>
        <strong>saldo<span class="brand-dot">.</span></strong>
      </div>
      <div class="breadcrumb"><span>Finanças</span><ion-icon :icon="chevronForwardOutline" /> {{ sectionTitle }}</div>
      <div class="topbar-actions">
        <span v-if="isDemo" class="demo-badge"><span></span> Demonstração</span>
        <button
          class="theme-button"
          :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
          :title="isDark ? 'Modo claro' : 'Modo escuro'"
          @click="emit('toggle-theme')"
        >
          <ion-icon :icon="isDark ? sunnyOutline : moonOutline" />
        </button>
        <button class="primary-button add-button" @click="emit('new-transaction')">
          <ion-icon :icon="addOutline" /> Nova transação
        </button>
      </div>
    </header>

    <div class="page-content">
      <slot />
    </div>

    <nav class="mobile-nav" aria-label="Navegação móvel">
      <button :class="{ active: activeSection === 'overview' }" @click="emit('navigate', 'overview')">
        <ion-icon :icon="gridOutline" /><span>Início</span>
      </button>
      <button :class="{ active: activeSection === 'transactions' }" @click="emit('navigate', 'transactions')">
        <ion-icon :icon="swapHorizontalOutline" /><span>Transações</span>
      </button>
      <button :class="{ active: activeSection === 'goals' }" @click="emit('navigate', 'goals')">
        <ion-icon :icon="flagOutline" /><span>Metas</span>
      </button>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  addOutline,
  chevronForwardOutline,
  flagOutline,
  gridOutline,
  logOutOutline,
  moonOutline,
  sunnyOutline,
  swapHorizontalOutline,
  walletOutline,
} from 'ionicons/icons';

defineProps<{
  activeSection: 'overview' | 'transactions' | 'goals';
  sectionTitle: string;
  goalsCount: number;
  userInitial: string;
  displayName: string;
  isDemo: boolean;
  isDark: boolean;
}>();

const emit = defineEmits<{
  navigate: [section: 'overview' | 'transactions' | 'goals'];
  'toggle-theme': [];
  'new-transaction': [];
  'sign-out': [];
}>();
</script>
