import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import HomePage from '@/views/HomePage.vue';

describe('HomePage.vue', () => {
  test('opens the demo dashboard with finance indicators', async () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          IonContent: { template: '<main><slot /></main>' },
          IonIcon: true,
          IonPage: { template: '<div><slot /></div>' },
          IonToast: true,
          ApexChart: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Explorar demonstração');
    await wrapper.get('button.primary-button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Saldo do mês');
    expect(wrapper.text()).toContain('Receitas');
    expect(wrapper.text()).toContain('Despesas');
    expect(wrapper.text()).toContain('Metas financeiras');
  });
});
