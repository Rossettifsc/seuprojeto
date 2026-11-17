# Identificação

- **Nome:** Elisa Rossetti
- **Turma:** 3º info

# Saldo — finanças pessoais

Aplicativo mobile-first feito com Ionic Vue, Supabase e ApexCharts. Permite cadastrar receitas e despesas, acompanhar indicadores e gráficos, criar metas e registrar valores guardados. O modo escuro fica salvo no dispositivo.

## Como o código está organizado

Consulte o [guia de arquitetura e apresentação](./docs/ARQUITETURA.md) para entender o papel de cada parte e explicar os principais fluxos.

## Executar

```bash
npm install
npm run dev
```

Sem credenciais, use **Explorar demonstração**: os dados de exemplo e novos registros ficam no armazenamento local deste navegador.

## Conectar ao Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No SQL Editor do projeto, execute [`supabase/schema.sql`](./supabase/schema.sql). O script cria as tabelas, políticas de acesso por usuário e a função de contribuição para metas.
3. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores de **Project URL** e **anon/public key** do projeto.
4. Reinicie `npm run dev`. A tela de entrada permitirá criar conta e entrar; se a confirmação de e-mail estiver ativa, confirme o endereço antes de entrar.

Nunca use a chave `service_role` no aplicativo. A chave anon/public é apropriada para o cliente somente com as políticas RLS do esquema habilitadas.

## Validação

```bash
npm run build
npm run test:unit
npm run test:e2e
```
