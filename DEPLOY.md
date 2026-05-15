# O que falta para publicar na web

O app está funcionalmente completo (Setup → Editor → Tracker funcionam). O redesign (Fases 2-6 do REDESIGN-PLANO.md) é uma melhoria de UX, não um bloqueador para publicação.

---

## 1. Corrigir `index.html`

| Problema | Atual | Correto |
|----------|-------|---------|
| Idioma | `lang="en"` | `lang="pt-BR"` |
| Título | `tapestry-crochet-designer-app` | `Tapestry Crochet Designer` |
| Favicon | `vite.svg` (placeholder) | ícone real ou remover |
| Meta description | ausente | adicionar para SEO/compartilhamento |

## 2. Deploy no Vercel

Plataforma escolhida: **Vercel**. Zero configuração extra no código.

1. Empurrar o repo para o GitHub
2. Entrar em vercel.com → "Add New Project" → importar o repo
3. Vercel detecta Vite automaticamente (build: `npm run build`, output: `dist`)
4. Clicar em Deploy

## 3. Verificar que o build passa

```bash
npm run build    # deve concluir sem erros TypeScript
npm run preview  # testar localmente em http://localhost:4173
```

---

## Escopo: apenas publicar o que existe

- Fases 2-6 do redesign — melhorias de UX, não bloqueadores
- Backend / banco de dados — fora do escopo agora, mas suportado pelo Vercel (ver abaixo)
- React Router / 404.html — não necessário, app é SPA sem rotas

---

## Referência futura: Backend + Banco de dados no Vercel

O Vercel suporta backend serverless e storage nativamente. Para adicionar depois:

### Storage nativo do Vercel

| Serviço | Uso ideal |
|---------|-----------|
| **Vercel Postgres** (via Neon) | Salvar projetos na nuvem, histórico de padrões |
| **Vercel KV** (Redis) | Sessões, cache, dados temporários |
| **Vercel Blob** | Armazenar arquivos `.tcdp.json` na nuvem |

### Backend com Serverless Functions

Criar arquivos em `/api/` na raiz do projeto — Vercel detecta automaticamente.

```
/api/
  projects.ts   → GET /api/projects, POST /api/projects
  export.ts     → POST /api/export
```

Cada arquivo exporta um handler:

```ts
// api/projects.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ projects: [] })
}
```

### Autenticação de usuários

Recomendação: **Clerk** ou **Supabase Auth** integrados ao Vercel. Ambos têm tier gratuito.

### Casos de uso concretos para este app

| Funcionalidade | Solução |
|----------------|---------|
| Salvar projetos na nuvem | Vercel Blob + Postgres + auth |
| Compartilhar padrão por link | Vercel Postgres + API route |
| Analytics de uso | Vercel Analytics (plug-and-play, grátis) |
| Auth de usuário | Clerk (mais simples) ou Supabase (mais completo) |

---

## Verificação final

1. `npm run build` sem erros
2. `npm run preview` — testar o fluxo completo: upload → crop → gerar → editar → tracker
3. Deploy → verificar no celular (tracker é usado no mobile)
