<template>
  <main class="auth-screen">
    <div class="auth-card">
      <div class="brand-mark"><ion-icon :icon="walletOutline" /></div>
      <p class="eyebrow">SEU DINHEIRO, MAIS CLARO</p>
      <h1>{{ isSignUp ? 'Crie sua conta' : 'Bem-vinda de volta' }}</h1>
      <p class="auth-copy">
        {{ isSignUp ? 'Comece a cuidar melhor do seu dinheiro.' : 'Entre para acompanhar suas finanças.' }}
      </p>

      <form v-if="configured" class="auth-form" @submit.prevent="emit('authenticate')">
        <label>
          E-mail
          <input v-model.trim="authEmail" type="email" placeholder="voce@email.com" required />
        </label>
        <label>
          Senha
          <input v-model="authPassword" type="password" placeholder="No mínimo 6 caracteres" minlength="6" required />
        </label>
        <button class="primary-button full-width" type="submit" :disabled="busy">
          {{ busy ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar' }}
        </button>
        <button class="text-button full-width" type="button" @click="isSignUp = !isSignUp">
          {{ isSignUp ? 'Já tenho uma conta' : 'Ainda não tenho uma conta' }}
        </button>
      </form>

      <div v-else class="demo-info">
        <ion-icon :icon="sparklesOutline" />
        <span>Experimente o app com dados de demonstração. Configure o Supabase para ativar contas reais.</span>
      </div>
      <button v-if="!configured" class="primary-button full-width" @click="emit('enter-demo')">
        Explorar demonstração <ion-icon :icon="arrowForwardOutline" />
      </button>
      <button
        class="theme-button auth-theme"
        :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
        @click="emit('toggle-theme')"
      >
        <ion-icon :icon="isDark ? sunnyOutline : moonOutline" />
      </button>
      <p v-if="configured" class="auth-footnote">Seus dados ficam protegidos e associados somente à sua conta.</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { arrowForwardOutline, moonOutline, sparklesOutline, sunnyOutline, walletOutline } from 'ionicons/icons';

defineProps<{
  configured: boolean;
  busy: boolean;
  isDark: boolean;
}>();

const authEmail = defineModel<string>('authEmail', { required: true });
const authPassword = defineModel<string>('authPassword', { required: true });
const isSignUp = defineModel<boolean>('isSignUp', { required: true });
const emit = defineEmits<{
  authenticate: [];
  'enter-demo': [];
  'toggle-theme': [];
}>();
</script>
