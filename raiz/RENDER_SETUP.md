# Guia de Deploy no Render - Notificaai

## ⚠️ Problema Identificado

O Render está tentando usar `yarn` como package manager, mas o projeto foi criado com `pnpm`. Isso causa conflito.

## ✅ Solução Recomendada (Mais Simples)

### Opção 1: Usar Vercel ao invés do Render (RECOMENDADO)

O Vercel tem suporte nativo a pnpm e é mais fácil:

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em "Add New" → "Project"
4. Selecione o repositório `Notificaai`
5. Vercel vai detectar automaticamente que é um projeto pnpm
6. Adicione as variáveis de ambiente (veja abaixo)
7. Clique em "Deploy"

**Pronto!** Vercel vai fazer tudo automaticamente.

---

### Opção 2: Converter para Yarn (Se preferir manter Render)

Se quer continuar com Render, converta para Yarn:

**No seu computador local:**

```bash
# 1. Remova pnpm-lock.yaml
rm pnpm-lock.yaml

# 2. Instale com npm (que gera package-lock.json)
npm install

# 3. Faça commit e push
git add .
git commit -m "Convert to npm for Render compatibility"
git push origin main
```

Depois no Render:
1. Vá para **Settings** → **Build & Deploy**
2. Deixe **Build Command** como: `yarn` (padrão)
3. Deixe **Start Command** como: `yarn start`
4. Clique em **Save Changes**
5. Faça um **Redeploy**

---

## 📋 Variáveis de Ambiente Necessárias

Adicione estas variáveis em qualquer plataforma (Render ou Vercel):

```
DATABASE_URL=seu_banco_de_dados_aqui
JWT_SECRET=sua_chave_secreta_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=seu_nome
VITE_APP_TITLE=Notificaai
VITE_APP_LOGO=https://seu-logo-url
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

---

## 🚀 Checklist Final

- [ ] Escolheu Vercel ou converteu para Yarn
- [ ] Adicionou todas as variáveis de ambiente
- [ ] DATABASE_URL está correto
- [ ] Fez push no GitHub
- [ ] Deployment foi bem-sucedido

---

## 💡 Por que Vercel é melhor para este projeto?

- ✅ Suporte nativo a pnpm
- ✅ Deploys mais rápidos
- ✅ Melhor integração com Node.js
- ✅ Sem problemas de package manager
- ✅ Grátis para projetos pequenos

---

## 📞 Suporte

Se tiver dúvidas:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs/troubleshooting-deploys
