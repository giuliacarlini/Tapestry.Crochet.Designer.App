# Tapestry Crochet Designer App (MVP - Fase 1)

Aplicacao web (Vite + React + TypeScript) para criar e editar padroes de tapestry crochet.

## Funcionalidades

- Fluxo em 2 etapas:
  - Etapa 1 (Setup): upload, crop/zoom, resolucao predefinida e numero de cores.
  - Etapa 2 (Editor): pintura por celula, borracha, balde de tinta (flood fill), seletor de cor (conta-gotas), selecao rapida de cor e color picker, paleta interativa, undo/redo e export.
- Resolucao por preset: `50x50`, `80x80`, `100x100`, `120x120`, `150x150`.
- Quantizacao por Median Cut com intervalo de `2` a `12` cores.
- Processamento pesado em Web Worker.
- Salvar projeto em arquivo `.tcdp.json` para continuar edicao depois.
- Abrir projeto salvo e retomar diretamente no editor.

## Como rodar

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Testes:

```bash
npm run test
```

## Fluxo de uso

1. Na Etapa 1, selecione imagem, crop, resolucao e quantidade de cores.
2. Clique em `Gerar preview` e revise o resultado na propria Etapa 1.
3. Clique em `Ir para editor`.
4. Na Etapa 2, edite celulas e paleta.
5. Use `Salvar projeto` para gerar um arquivo `.tcdp.json`.
6. Para continuar depois, use `Abrir projeto` e carregue esse arquivo.

## Formato do pattern (export JSON)

```json
{
  "width": 100,
  "height": 100,
  "palette": [
    { "id": 0, "hex": "#AABBCC" }
  ],
  "cells": [0, 1, 2],
  "metadata": {
    "title": "Opcional",
    "createdAt": "2026-02-27T20:00:00.000Z"
  }
}
```

Regras:

- `palette` com tamanho entre 2 e 12, ids sequenciais iniciando em 0.
- `cells` com tamanho `width * height`.
- cada valor de `cells` entre `0` e `palette.length - 1`.

## Formato de projeto (.tcdp.json)

O projeto salvo inclui:

- `version` (schema versionado),
- `metadata` (nome, datas),
- `settings` (resolucao, paletteSize, cleanIsolated, titulo),
- `pattern` completo editado.

## Estrutura

- `src/core/image` - resize, quantizacao, limpeza e crop.
- `src/core/pattern` - modelo e serializacao do pattern.
- `src/core/project` - modelo e serializacao de projeto salvo.
- `src/workers` - worker de quantizacao e cliente.
- `src/ui` - componentes de Setup e Editor.

## Testes incluidos

- `serialize/deserialize Pattern`.
- `serialize/deserialize Project`.
- `quantizacao` com tamanhos dinamicos.
