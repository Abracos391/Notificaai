# Deploy no Render - Notificaai

## ✅ Projeto Pronto para Render

O projeto Notificaai está **100% pronto** para fazer deploy no Render com pnpm!

## 🚀 Como Fazer Deploy em 3 Passos

### Passo 1: Push no GitHub
```bash
git add .
git commit -m "Notificaai ready for Render deployment"
git push origin main
```

### Passo 2: Criar Web Service no Render

1. Acesse https://render.com
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório GitHub `Notificaai`
4. Preencha assim:
   - **Name:** `notificaai`
   - **Runtime:** `Node`
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Free (ou pago)

5. Clique em **Create Web Service**

### Passo 3: Adicionar Variáveis de Ambiente

No Render Dashboard, vá para **Environment** e adicione:

```
DATABASE_URL=seu_banco_de_dados
JWT_SECRET=sua_chave_secreta
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=seu_nome
VITE_APP_TITLE=Notificaai
VITE_APP_LOGO=https://seu-logo
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave
VITE_FRONTEND_FORGE_API_KEY=sua_chave
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_id
```

## ✨ Pronto!

Render vai fazer automaticamente:
- ✅ Clone do repositório
- ✅ Instalar pnpm
- ✅ Instalar dependências
- ✅ Build da aplicação
- ✅ Iniciar servidor

Seu site estará online em poucos minutos! 🎉

## 📋 Checklist

- [ ] Push no GitHub
- [ ] Criou Web Service no Render
- [ ] Adicionou todas as variáveis de ambiente
- [ ] DATABASE_URL está correto
- [ ] Deploy completado

## 💡 Dicas

- Se der erro, verifique o **Build Log** no Render
- Todas as variáveis de ambiente são obrigatórias
- O `pnpm-lock.yaml` está incluído no projeto

Sucesso! 🚀
