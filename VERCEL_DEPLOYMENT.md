# Deploy Frontend no Vercel

## 1. **Conectar Repositório no Vercel**

1. Acesse [vercel.com](https://vercel.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Selecione seu repositório GitHub (`OHackthon/FrontEnd`)
5. Clique em **"Import"**

---

## 2. **Configurar Environment Variables no Vercel**

Depois de importar o projeto:

1. Na página do projeto, vá em **Settings** → **Environment Variables**
2. Clique em **"Add Environment Variable"**
3. Adicione a variável:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://hackathon-backend-48f7.onrender.com/api/` |

---

## 3. **Configuração Automática**

O `vercel.json` que criei já configura:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "envPrefix": "VITE_"
}
```

- **Build Command**: Executa `npm run build` para gerar a build de produção
- **Output Directory**: Vercel serve arquivos da pasta `dist`
- **envPrefix**: Reconhece variáveis que começam com `VITE_`

---

## 4. **Deploy**

Após adicionar a variável `VITE_API_BASE_URL`:

1. Vercel vai **redeploy automaticamente**
2. Você verá o progresso na aba **Deployments**
3. Quando terminar, clique na URL para acessar seu frontend

---

## 5. **Atualizar Backend CORS (Importante)**

Seu backend precisa aceitar requisições do Vercel:

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Selecione **hackathon-backend**
3. Vá em **Environment**
4. Procure por **ALLOWED_HOSTS**
6. Atualize para incluir seu domínio do Vercel. Exemplo:
```
*.onrender.com,localhost,127.0.0.1,seu-frontend.vercel.app
```
(Você descobrirá a URL exata do Vercel após o deploy)

6. Clique em **Save** (Render vai redeploy)

---

## 6. **Testar Conexão**

1. Abra seu frontend no Vercel
2. Tente fazer login ou acessar dados
3. Verifique no console (F12) se há erros de CORS

Se tudo funcionar ✅, você está pronto!

---

## Resumo Rápido:

| Etapa | Local | Produção |
|-------|-------|----------|
| Frontend | `npm run dev` | Vercel |
| API Base URL | `http://localhost:8000/api/` | `https://hackathon-backend-48f7.onrender.com/api/` |
| Environment | `.env.local` | Vercel Dashboard |
| Database | Neon PostgreSQL | Neon PostgreSQL |

