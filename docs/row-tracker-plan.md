# Acompanhamento Linha a Linha para Tapestry Crochet

## Contexto

No tapestry crochet, o artesao trabalha linha por linha (de baixo para cima). Atualmente o grid do editor exibe todas as linhas igualmente, sem indicacao visual de qual linha esta sendo trabalhada. Esta feature adiciona um "row tracker" que destaca a linha atual, escurece as demais, e permite navegar entre linhas — facilitando o acompanhamento do padrao durante o trabalho manual.

## Comportamento

- **Direcao**: baixo para cima (ultima linha do grid = linha 1 do croche)
- **Visual**: linha atual com destaque (borda colorida) + linhas nao trabalhadas escurecidas (overlay semi-transparente)
- **Navegacao**: botoes anterior/proxima + teclas de seta (cima/baixo) + opcao de avancar automaticamente
- **Modo**: o tracker e ativado/desativado por um toggle — quando desativado, o grid volta ao comportamento normal

## Arquivos a Modificar

1. **`src/ui/PreviewGrid.tsx`** — arquivo principal, toda a logica do tracker
2. **`src/App.css`** — estilos para o tracker (barra de controle, botoes)

## Plano de Implementacao

### 1. Estado do Row Tracker no PreviewGrid

Adicionar estado local no `PreviewGrid` (mantem dentro do componente, sem poluir o App):

```typescript
const [trackerEnabled, setTrackerEnabled] = useState(false)
const [currentRow, setCurrentRow] = useState(0) // 0 = primeira linha de trabalho (ultima do grid)
```

`currentRow` e o indice logico de trabalho (0 = linha de baixo, vai incrementando para cima). A conversao para coordenada do grid: `gridY = height - 1 - currentRow`.

### 2. Renderizacao do Canvas com Overlay

No `useEffect` que renderiza o canvas (linhas 82-128 do PreviewGrid.tsx), apos desenhar celulas e grid, adicionar overlay:

- **Se tracker ativo**: desenhar retangulo semi-transparente escuro (`rgba(0,0,0,0.45)`) sobre todas as linhas **exceto** a linha atual
- **Linha atual**: desenhar borda de destaque (ex: `#f0a040`, 2px) ao redor da linha
- Adicionar `trackerEnabled` e `currentRow` nas dependencias do useEffect

### 3. Auto-scroll da Linha Atual

Quando `currentRow` mudar e o tracker estiver ativo, fazer scroll automatico do `.canvas-wrap` para que a linha atual fique visivel:

```typescript
useEffect(() => {
  if (!trackerEnabled || !canvasRef.current) return
  const gridY = height - 1 - currentRow
  const scrollTarget = gridY * zoom
  const wrap = canvasRef.current.parentElement
  if (wrap) {
    wrap.scrollTo({ top: Math.max(0, scrollTarget - wrap.clientHeight / 2), behavior: 'smooth' })
  }
}, [trackerEnabled, currentRow, height, zoom])
```

### 4. Navegacao por Teclado

Adicionar `useEffect` com event listener no `window` para teclas de seta (so quando tracker ativo):

- **ArrowUp** ou **ArrowRight**: `setCurrentRow(r => Math.min(height - 1, r + 1))` (avanca para cima)
- **ArrowDown** ou **ArrowLeft**: `setCurrentRow(r => Math.max(0, r - 1))` (volta para baixo)

### 5. Controles Visuais

Adicionar dentro da secao `preview-controls` (dentro do `<>` do PreviewGrid), um bloco de controles do tracker:

```
[x] Modo acompanhamento    [< Anterior] Linha 3 de 150 [Proxima >]
```

- **Toggle checkbox**: ativa/desativa o tracker
- **Botoes anterior/proxima**: navega entre linhas
- **Indicador**: "Linha X de Y"
- Quando desativado, os botoes e indicador ficam hidden

### 6. CSS

Adicionar em `App.css`:

```css
.row-tracker-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.row-tracker-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.row-tracker-nav button {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.row-indicator {
  font-size: 0.82rem;
  font-weight: 600;
  color: #4a3f35;
  min-width: 8ch;
  text-align: center;
}
```

## Verificacao

1. Rodar `npm run dev` e abrir no navegador
2. Importar uma imagem, gerar o padrao, ir para o editor
3. Ativar o toggle "Modo acompanhamento"
4. Verificar que a ultima linha do grid (linha 1 do croche) esta destacada com borda e as demais estao escurecidas
5. Clicar nos botoes anterior/proxima — a linha destacada deve mudar
6. Usar teclas de seta para navegar — mesmo comportamento
7. Verificar que o canvas faz scroll automatico para manter a linha atual visivel
8. Desativar o toggle — grid volta ao normal
9. Testar que as ferramentas de edicao (paint, fill, etc.) continuam funcionando normalmente com o tracker ativo
