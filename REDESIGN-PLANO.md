# Redesign da Interface — Fases Pendentes

> Fase 1 (Fundação: primitivas Radix + Toast) já foi concluída.
> Este arquivo contém as fases 2–6 para referência nas próximas sessões.

---

## Fase 2 — Extrair estado + Barra de navegação

**Objetivo:** Simplificar App.tsx e adicionar navegação fixa no topo.

**Criar:**
- `src/hooks/useAppState.ts` — todos os 16 `useState` + handlers extraídos de App.tsx
- `src/ui/AppNavbar.tsx` + `.module.css` — barra com abas (Setup / Editor / Tracker), `position: sticky`, indicadores de status, aba desabilitada quando inacessível
- `src/hooks/index.ts`

**Modificar:**
- `src/App.tsx` — de ~670 linhas para ~80 linhas (hook + layout + navbar)
- `src/App.module.css` — `.hero` vira parte da navbar, remover `.footerNote`

**Navbar:**
- 3 abas: Setup (sempre ativa), Editor (requer padrão), Tracker (requer padrão)
- Estado visual: completada (check), ativa (highlight laranja), bloqueada (cinza)
- Substitui todos os botões "Voltar ao editor", "Ir para editor", "Modo acompanhamento"

**Dependência nova:** `@radix-ui/react-tabs` (já instalado)

---

## Fase 3 — Wizard do Setup (um passo por vez)

**Objetivo:** Trocar "3 sub-etapas visíveis de uma vez" por wizard com um passo de cada vez.

**Criar:**
- `src/ui/SetupWizard.tsx` + `.module.css` — sub-steps: Upload → Crop → Configure → Preview
- `src/ui/WizardProgress.tsx` + `.module.css` — barra de progresso com 4 pontos e labels

**Fluxo:**
1. **Upload** — drag-drop + "Abrir projeto salvo". Upload avança automaticamente para Crop
2. **Crop** — cropper + preview. Botões "Voltar" / "Continuar"
3. **Configurar** — título, resolução, paleta, limpeza. Botão "Criar meu padrão" (gera no worker, avança para Preview)
4. **Preview** — grid + paleta resumida. "Ir para editor" / "Ajustar configurações"

**Modificar:**
- `src/App.tsx` — substituir JSX de `step === 'setup'` por `<SetupWizard />`
- `src/ui/Upload.tsx` — ilustração de empty state (SVG de novelo), texto mais amigável
- `src/ui/Controls.tsx` — textos mais descritivos sob cada controle
- `src/App.module.css` — remover `.layoutSetup`, `.setupStep`, `.stepIndicator`, `.stepContent`, `.setupPreviewResult`

**Dependência nova:** `@radix-ui/react-progress` (já instalado)

---

## Fase 4 — Redesign do Editor

**Objetivo:** Canvas centralizado com toolbar flutuante e sidebar colapsável.

**Criar:**
- `src/ui/EditorLayout.tsx` + `.module.css` — layout 2 regiões: canvas (flex:1) + sidebar
- `src/ui/FloatingToolbar.tsx` + `.module.css` — toolbar horizontal sobre o canvas (tools, undo/redo, zoom, grid, cor ativa). Usa `@radix-ui/react-toggle-group`
- `src/ui/EditorSidebar.tsx` + `.module.css` — sidebar direita colapsável com seções: Paleta, Export, Projeto. Cada seção usa `@radix-ui/react-collapsible`
- `src/ui/ConfirmDialog.tsx` + `.module.css` — modal de confirmação (`@radix-ui/react-dialog`)

**Layout:**
```
┌──────────────────────────────────────┐
│ AppNavbar                            │
├──────────────────────────────────────┤
│ [FloatingToolbar................]    │
│ ┌──────────────────────┐  ┌────────┐│
│ │                      │  │Sidebar ││
│ │      Canvas          │  │Paleta  ││
│ │                      │  │Export  ││
│ │                      │  │Projeto ││
│ └──────────────────────┘  └────────┘│
└──────────────────────────────────────┘
```

**Modificar:**
- `src/App.tsx` — substituir JSX de `step === 'editor'` por `<EditorLayout />`
- `src/ui/PreviewGrid.tsx` — remover controles de zoom/grid (vão para FloatingToolbar), receber como props
- `src/ui/PaletteView.tsx` — replace-color agora abre `ConfirmDialog`
- `src/ui/Export.tsx` — simplificar: apenas botões (Download JSON, Download Projeto, Copiar). Toast confirma ação
- `src/App.module.css` — remover `.layoutEditor`, `.column`

**Sidebar:** Aberta por padrão no desktop (>980px), fechada no mobile. Botão toggle.

**Dependências novas:** `@radix-ui/react-collapsible`, `@radix-ui/react-toggle-group`, `@radix-ui/react-dialog` (já instalados)

---

## Fase 5 — Tracker otimizado para mobile

**Objetivo:** Botões grandes, fullscreen, swipe, barra de progresso, modo escuro.

**Criar:**
- `src/ui/TrackerLayout.tsx` + `.module.css` — wrapper com modo normal e fullscreen (Fullscreen API)
- `src/ui/TrackerControls.tsx` + `.module.css` — zoom, grid toggle, dark mode toggle, fullscreen toggle
- `src/ui/TrackerNav.tsx` + `.module.css` — nav inferior com botões ≥48x48px, progress bar, porcentagem
- `src/hooks/useSwipeGesture.ts` — detecta swipe horizontal (threshold 50px). Swipe direita = avança, esquerda = recua

**Modificar:**
- `src/ui/RowTracker.tsx` — decompor em TrackerLayout + TrackerControls + TrackerNav. Dark mode via classe `.darkMode` que sobrescreve tokens localmente:
  ```css
  .darkMode { --color-bg-panel: #1a1a1a; --color-text-primary: #e8e0d8; }
  ```
- `src/ui/RowTracker.module.css` — adicionar variantes dark mode e botões touch-friendly

---

## Fase 6 — Polish: atalhos, empty states, visual

**Objetivo:** Detalhes finais de UX.

**Criar:**
- `src/hooks/useKeyboardShortcuts.ts` — Ctrl+Z (undo), Ctrl+Y (redo), P/E/B/I (tools), Ctrl+S (salvar), `[`/`]` (zoom), 1-9 (paleta)
- `src/ui/EmptyState.tsx` + `.module.css` — componente reutilizável com ilustração SVG + título + descrição
- `src/ui/icons.tsx` — consolidar todos os SVGs inline (PencilIcon, EraserIcon, etc.) + novos (SaveIcon, ExportIcon, FullscreenIcon, SunIcon, MoonIcon, etc.)

**Modificar:**
- `src/tokens.css` — aumentar fontes: `--fontSize-xs`: 0.65→0.75rem, `--fontSize-sm`: 0.75→0.8rem, `--fontSize-md`: 0.85→0.9rem
- `src/ui/FloatingToolbar.tsx` — labels de texto sob ícones (visível no desktop, oculto no mobile)
- `src/ui/Upload.tsx` — ilustração de empty state (novelo de lã SVG)
- `src/App.tsx` — montar `useKeyboardShortcuts()`

---

## Arquivos que NÃO mudam (em nenhuma fase)

- `src/core/**` — lógica de processamento de imagem, modelos, serialização
- `src/workers/**` — web worker de quantização
- `react-easy-crop` — continua sendo usado no Cropper

## Verificação (após cada fase)

1. `npm run dev` — app compila e abre no browser
2. Testar fluxo completo: upload → crop → gerar → editar → salvar → abrir → tracker
3. Testar responsividade: desktop (1280px+), tablet (768-980px), mobile (<480px)
4. `npm test` — testes existentes em `src/core/` continuam passando
5. Verificar acessibilidade: navegação por Tab, tooltips com foco, aria-labels

## Primitivas Radix criadas na Fase 1 (reutilizar nas fases seguintes)

Todas em `src/ui/primitives/`:
- `Tooltip` — `<Tooltip content="texto">children</Tooltip>`
- `Slider` — `<Slider min max step value onChange />`
- `Switch` — `<Switch checked onChange />`
- `Select` — `<Select value options onChange />` (options: `{label, value}[]`)
- `Toast` — `<ToastProvider>` + hook `useToast()` → `toast("mensagem", "success"|"error"|"default")`
- `ColorPicker` — `<ColorPicker color onChange size="sm"|"md" />`
