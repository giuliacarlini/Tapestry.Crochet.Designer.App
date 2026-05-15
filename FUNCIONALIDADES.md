# Tapestry Crochet Designer App — Funcionalidades

Aplicação web para transformar imagens em padrões de crochê tapestry, com editor interativo e rastreador de linhas para acompanhar o trabalho manual.

---

## Fluxo de Trabalho

O app opera em 3 etapas sequenciais:

| Etapa | Nome | Objetivo |
|-------|------|----------|
| 1 | **Setup** | Upload, recorte e configuração da imagem → geração do padrão |
| 2 | **Editor** | Edição manual do padrão gerado (pintura, cores, paleta) |
| 3 | **Tracker** | Acompanhamento linha-a-linha durante a execução do crochê |

---

## Etapa 1 — Setup

### 1.1 Upload de Imagem

- Zona de drag-and-drop ou clique para selecionar arquivo
- Formatos aceitos: **PNG** e **JPEG**
- Feedback visual de status (arrastando, carregando, erro)
- Converte arquivo para blob URL interno

### 1.2 Recorte de Imagem

- Recorte interativo com proporção fixa **1:1** (quadrado)
- Zoom de **1x a 4x** com slider
- Visualização em tempo real da área selecionada

### 1.3 Controles de Geração

| Controle | Descrição | Valores |
|----------|-----------|---------|
| Título | Nome opcional do padrão | 0–80 caracteres |
| Resolução | Dimensão do grid em pixels | 50×50, 80×80, 100×100, 120×120, 150×150 |
| Tamanho da paleta | Quantidade de cores | 2–12 cores (padrão: 12) |
| Limpar pixels isolados | Pós-processamento para remover ruído | Liga/Desliga |

- Botão **Gerar** inicia o processamento em Web Worker (não bloqueia a interface)
- Indicador visual quando as configurações mudaram após a última geração

### 1.4 Preview do Padrão

- Grid renderizado em canvas com o resultado da quantização
- Paleta de cores gerada com contagem de uso por cor
- Possibilidade de regenerar com configurações diferentes

---

## Etapa 2 — Editor

### 2.1 Canvas de Edição (PreviewGrid)

- Renderização baseada em **canvas 2D** para performance
- Zoom: **2x a 8x** de magnificação
- Toggle de linhas de grade (grid on/off)
- Edição interativa com 4 ferramentas

### 2.2 Ferramentas de Edição

| Ferramenta | Ícone | Ação |
|------------|-------|------|
| **Lápis** (Paint) | ✏️ | Pinta células individuais com a cor ativa |
| **Borracha** (Erase) | 🧹 | Apaga células (pinta com a cor de fundo — índice 0) |
| **Balde** (Fill) | 🪣 | Preenche região conectada de mesma cor (flood fill 4-direcional) |
| **Conta-gotas** (Picker) | 💧 | Seleciona a cor de uma célula existente |

- Suporte a pintura contínua (arrastar o mouse)
- Acumulação de células em um stroke antes de registrar no histórico

### 2.3 Histórico (Undo/Redo)

- **Desfazer** e **Refazer** com snapshots completos do padrão
- Pilhas ilimitadas (limitadas apenas pela memória do navegador)
- Botões na toolbar com estado desabilitado quando a pilha está vazia

### 2.4 Paleta de Cores

- Exibe todas as cores com: ID, código hex, contagem de células
- **Edição de cor**: clique na cor para abrir color picker ou digitar hex manualmente
- **Substituir cor**: substitui todas as células de uma cor por outra
- **Seleção rápida**: chips de cor na toolbar para troca rápida
- **Swatch ativo**: mostra cor selecionada com código hex; clique abre color picker nativo
- Modo compacto no editor / modo expandido no setup

---

## Etapa 3 — Rastreador de Linhas (Row Tracker)

### 3.1 Visualização

- Exibe **uma linha por vez** (de 1 até a altura do padrão)
- Linha ativa destacada com borda laranja
- Linhas não-ativas escurecidas com overlay semi-transparente
- Números de linha na lateral esquerda com indicadores de direção:
  - → para linhas ímpares (esquerda → direita)
  - ← para linhas pares (direita → esquerda)

### 3.2 Contagem de Pontos

- Em zoom ≥ 8x, exibe a **contagem de pontos consecutivos** da mesma cor
- Agrupa células consecutivas e mostra a contagem uma vez por grupo
- Cor do texto se adapta ao fundo (escuro em fundos claros, branco em fundos escuros)

### 3.3 Navegação

- Botões **Anterior** / **Próximo** (desabilitados nos limites)
- Atalhos de teclado:
  - **↑** ou **→**: próxima linha
  - **↓** ou **←**: linha anterior
- Auto-scroll para manter a linha ativa centralizada

### 3.4 Configurações do Tracker

- Zoom: **2x a 24x**
- Toggle de linhas de grade
- Progresso salvo no **localStorage** por padrão (persiste entre sessões)

---

## Gerenciamento de Projetos

### Salvar Projeto

- Formato: `.tcdp.json` (Tapestry Crochet Designer Project)
- Inclui: versão do schema, metadados, configurações e padrão completo
- Permite retomar o trabalho posteriormente

### Abrir Projeto

- Carrega arquivo `.tcdp.json` salvo anteriormente
- Restaura todas as configurações, paleta e padrão editado
- Validação completa da estrutura ao carregar

### Exportar Padrão

- Formato: `.json` (apenas o padrão, sem metadados de projeto)
- Nome do arquivo derivado do título (slugificado automaticamente)
- Preview do JSON em textarea antes do download

---

## Processamento de Imagem (Pipeline)

O processamento ocorre em um **Web Worker** dedicado para não bloquear a interface:

```
1. Carregar imagem (URL → HTMLImageElement)
       ↓
2. Extrair região recortada (crop area → ImageData RGBA)
       ↓
3. Redimensionar (bilinear interpolation → resolução alvo)
       ↓
4. Quantizar cores (Median Cut → paleta + mapeamento de células)
       ↓
5. [Opcional] Limpar pixels isolados (2 passes de limpeza)
       ↓
6. Criar padrão (validação + normalização)
       ↓
7. Encapsular em projeto (versão + metadados + settings)
```

### Algoritmos Utilizados

| Etapa | Algoritmo | Descrição |
|-------|-----------|-----------|
| Redimensionamento | Interpolação bilinear | Escalonamento suave com média ponderada dos 4 pixels mais próximos |
| Quantização | Median Cut | Divisão recursiva do espaço de cor pelo canal dominante |
| Mapeamento de cor | Distância euclidiana | Cada pixel é associado à cor de paleta mais próxima (RGB) |
| Limpeza fase 1 | Detecção de pixels isolados | Remove pixels sem vizinhos da mesma cor (8-conectividade) |
| Limpeza fase 2 | Componentes conectados + análise de borda | Mescla ilhas ≤2 pixels na cor dominante da borda (≥60%) |
| Flood fill | DFS com pilha | Preenchimento iterativo 4-direcional de regiões conectadas |

---

## Formatos de Arquivo

### Projeto (`.tcdp.json`)

```json
{
  "version": 1,
  "metadata": {
    "name": "Meu Projeto",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  },
  "settings": {
    "width": 100,
    "height": 100,
    "paletteSize": 8,
    "cleanIsolated": true,
    "title": "Meu Padrão"
  },
  "pattern": { "..." }
}
```

### Padrão (`.json`)

```json
{
  "width": 100,
  "height": 100,
  "palette": [
    { "id": 0, "hex": "#FFFFFF" },
    { "id": 1, "hex": "#000000" }
  ],
  "cells": [0, 1, 0, 1, "..."],
  "metadata": {
    "title": "Meu Padrão",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Atalhos de Teclado

| Atalho | Contexto | Ação |
|--------|----------|------|
| **↑** ou **→** | Tracker | Avançar para próxima linha |
| **↓** ou **←** | Tracker | Voltar para linha anterior |

---

## Restrições e Limites

| Parâmetro | Mínimo | Máximo | Padrão |
|-----------|--------|--------|--------|
| Resolução | 50×50 | 150×150 | 150×150 |
| Paleta de cores | 2 | 12 | 12 |
| Título | 0 chars | 80 chars | — |
| Zoom (Editor) | 2x | 8x | — |
| Zoom (Tracker) | 2x | 24x | — |
| Zoom (Cropper) | 1x | 4x | — |

---

## Stack Técnico

- **React 18** + **TypeScript 5.6**
- **Vite** (bundler)
- **CSS Modules** (estilização)
- **Web Workers** (processamento de imagem em background)
- **Canvas 2D API** (renderização do grid)
- **react-easy-crop** (recorte de imagem)
- **localStorage** (persistência do progresso no tracker)
- Interface em **Português Brasileiro**
