# Trocado

[![CI](https://github.com/CaioRCosta/trocado/actions/workflows/ci.yml/badge.svg)](https://github.com/CaioRCosta/trocado/actions/workflows/ci.yml)

Controle simples de receitas e despesas pessoais. Anote o que entra e o que sai, e veja para onde vai cada real.

**Em produção:** https://trocado-es2.vercel.app

## Integrantes

- Caio
- Luiz
- Felipe

## Sobre o sistema

O Trocado é uma aplicação web de página única para registrar a movimentação financeira do dia a dia. Funcionalidades:

- **Registrar transações**: receitas e despesas com descrição, valor em reais, data e categoria. O formulário valida os dados e mostra o erro ao lado de cada campo.
- **Saldo do período**: total que entrou, total que saiu e saldo, com destaque quando o saldo fica negativo.
- **Filtro por mês**: escolha um mês para ver só as transações, o saldo e o resumo daquele período.
- **Para onde foi o dinheiro**: despesas agrupadas por categoria, com total, percentual e barra proporcional.
- **Excluir transações** registradas por engano.
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
| [Vercel](https://vercel.com/) | Hospedagem e entrega contínua: cada push na `main` gera um novo deploy em produção. |

### Organização do código

```
src/
  domain/      regras de negócio puras (valores, validação, resumos, datas)
  storage/     leitura e gravação no localStorage
  hooks/       estado das transações sincronizado com o armazenamento
  components/  componentes React da interface
  App.tsx      tela principal
e2e/           testes end-to-end com Playwright
```

As regras de negócio ficam separadas da interface, em funções puras, o que facilita testá-las diretamente pela API pública de cada módulo.

## Uso de IA

O projeto foi desenvolvido com apoio do **Claude (Anthropic)**, usado como assistente de programação no app Claude. A IA contribuiu para:

- propor o tema, a arquitetura em camadas (domínio, armazenamento, hooks, componentes) e a escolha das ferramentas;
- escrever o código inicial dos módulos, componentes e estilos;
- escrever os testes de unidade e end-to-end, seguindo boas práticas (testes pela API pública, foco em comportamento, nomes descritivos, um comportamento por teste);
- configurar o Vitest, a cobertura, o Playwright e o workflow do GitHub Actions;
- revisar a interface por capturas de tela e corrigir problemas de layout encontrados.

Todo o código gerado foi revisado, executado e testado pelo grupo antes de cada commit. Decisões de produto e a validação final do funcionamento ficaram com os integrantes.

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
