# Trocado

[![CI](https://github.com/CaioRCosta/trocado/actions/workflows/ci.yml/badge.svg)](https://github.com/CaioRCosta/trocado/actions/workflows/ci.yml)

Controle simples de receitas e despesas pessoais. Anote o que entra e o que sai, e veja para onde vai cada real.

**Em produção:** https://trocado-es2.vercel.app

## Integrantes

- Caio Rodrigues Costa
- Luiz Felipe Lima Costa
- Felipe Dias de Souza Martins

## Sobre o sistema

O Trocado é uma aplicação web de página única para registrar a movimentação financeira do dia a dia, organizada como um painel. Funcionalidades:

- **Registrar transações**: receitas e despesas com descrição, valor em reais, data e categoria, numa janela aberta pelo botão "Nova transação". O formulário valida os dados e mostra o erro ao lado de cada campo.
- **Resumo do mês**: saldo em destaque, total que entrou e que saiu e uso do orçamento, na faixa do topo.
- **Navegação por mês**: o painel abre no mês atual; as setas levam ao mês anterior ou ao próximo, e há a opção de ver todos os meses.
- **Gráficos**: saldo acumulado dia a dia no mês e entradas x saídas dos últimos 6 meses, com tooltip (também pelo teclado) e os dados em tabela.
- **Orçamento por categoria**: limite mensal para cada categoria, com barra de uso e avisos de "perto do limite", "limite atingido" e "estourou".
- **Comparação com o mês anterior**: quanto se gastou a mais ou a menos no total e em cada categoria.
- **Contas fixas**: transações marcadas para "repetir todo mês" aparecem como pendentes no mês seguinte e são lançadas com um clique.
- **Para onde foi o dinheiro**: na visão de todos os meses, despesas agrupadas por categoria, com total e percentual.
- **Editar transações**: o formulário abre preenchido com os dados da transação escolhida.
- **Excluir transações** registradas por engano, com confirmação antes de apagar.
- **Buscar** por descrição ou categoria, sem diferenciar maiúsculas nem acentos.
- **Exportar em CSV** as transações listadas, no padrão brasileiro (separador `;` e vírgula decimal), pronto para abrir no Excel ou no Google Planilhas.
- **Persistência local**: os dados ficam salvos no `localStorage` do navegador e continuam lá depois de recarregar a página.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem de todo o código, com tipagem estática. |
| [React](https://react.dev/) | Biblioteca de componentes da interface. |
| [Vite](https://vite.dev/) | Servidor de desenvolvimento e build de produção. |
| [Vitest](https://vitest.dev/) | Execução dos testes de unidade, em ambiente `jsdom`. |
| [Testing Library](https://testing-library.com/) | Testes de componentes pela perspectiva do usuário (rótulos, papéis e textos). |
| [Cobertura V8 (`@vitest/coverage-v8`)](https://vitest.dev/guide/coverage) | Medição da cobertura de testes, com limite mínimo de 80% configurado. |
| [Playwright](https://playwright.dev/) | Testes end-to-end no navegador, rodando sobre o build de produção. |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter) | Análise estática do código. |
| [GitHub Actions](https://docs.github.com/pt/actions) | Integração contínua: lint, tipos, testes, cobertura e e2e em Linux, macOS e Windows a cada commit. |
| [Fontsource](https://fontsource.org/) | Fonte Nunito embutida no próprio site, sem depender de serviços externos. |
| SVG próprio | Gráficos desenhados com SVG e React, sem biblioteca de gráficos, com paleta validada para daltonismo. |
| [Vercel](https://vercel.com/) | Hospedagem e entrega contínua: cada push na `main` gera um novo deploy em produção. |

### Organização do código

```
src/
  domain/      regras de negócio puras (valores, validação, resumos, meses, gráficos,
               orçamento, comparação, recorrência, busca, CSV, datas)
  storage/     leitura e gravação no localStorage (transações e orçamentos)
  hooks/       estado das transações e dos orçamentos sincronizado com o armazenamento
  components/  componentes React da interface
    charts/    gráficos em SVG, escala dos eixos e ajuste à largura da tela
  App.tsx      tela principal
  download.ts  download de arquivos gerados no navegador
e2e/           testes end-to-end com Playwright
```

As regras de negócio ficam separadas da interface, em funções puras, o que facilita testá-las diretamente pela API pública de cada módulo.

## Execução dos testes

Pré-requisito: [Node.js](https://nodejs.org/) 20 ou superior.

```bash
# instalar dependências
npm install

# testes de unidade
npm test

# testes de unidade com relatório de cobertura (falha se ficar abaixo de 80%)
npm run coverage
# o relatório em HTML fica em coverage/index.html

# testes end-to-end (na primeira vez, instale o navegador)
npx playwright install chromium
npm run test:e2e
```

Outros comandos úteis:

```bash
npm run dev        # servidor de desenvolvimento em http://localhost:5173
npm run build      # build de produção em dist/
npm run lint       # análise estática
npm run typecheck  # verificação de tipos
```
### Uso de IA

O projeto contou com o apoio da inteligência artificial (Claude, da Anthropic) em etapas específicas do desenvolvimento. A IA contribuiu para:
- corrigir bugs e problemas encontrados durante a etapa de desenvolvimento;
- auxiliar no desenvolvimento do frontend;
- ajuda para entender bibliotecas específicas de teste;


Todas as demais decisões de design, implementação, escrita, revisão e validação final do código foram integralmente realizadas pelos alunos.
