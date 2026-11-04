# Trocado

[![CI](https://github.com/CaioRCosta/trocado/actions/workflows/ci.yml/badge.svg)](https://github.com/CaioRCosta/trocado/actions/workflows/ci.yml)

Controle simples de receitas e despesas pessoais. Anote o que entra e o que sai, e veja para onde vai cada real.

> Projeto em desenvolvimento para a disciplina Engenharia de Software 2.

## Integrantes

- Caio
- Luiz
- Felipe

## Sobre o sistema

O Trocado é uma aplicação web para registrar receitas e despesas, acompanhar o saldo, filtrar por mês e ver as despesas agrupadas por categoria. Os dados ficam salvos no navegador.

## Tecnologias

TypeScript, React e Vite na aplicação; Vitest para testes de unidade, com cobertura medida pelo V8; GitHub Actions para integração contínua em Linux, macOS e Windows.

## Execução dos testes

Pré-requisito: [Node.js](https://nodejs.org/) 20 ou superior.

```bash
npm install
npm test           # testes de unidade
npm run coverage   # testes com relatório de cobertura (mínimo de 80%)
```
