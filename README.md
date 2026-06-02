# Guia Morada

Diretório moderno de **imobiliárias** e **corretores** construído com [Astro](https://astro.build) e Tailwind CSS.

## Funcionalidades

- Página inicial com busca, categorias e destaques
- Listagem de imobiliárias com filtros (cidade, especialidade, busca)
- Listagem de corretores com filtros
- Páginas de detalhe com contato via WhatsApp
- Formulário de cadastro (demonstrativo)
- Design responsivo e otimizado para SEO

## Importar dados do Excel

```bash
npm run import:imobiliarias
# ou com caminho customizado:
npm run import:imobiliarias -- /caminho/para/planilha.xlsx
```

Gera JSON por cidade em `src/data/generated/` com URLs no formato:
- `/imobiliarias-em-sao-paulo`
- `/imobiliarias-no-rio-de-janeiro`

Cidades homônimas em estados diferentes recebem sufixo de UF (ex: `imobiliarias-em-cascavel-pr`).

## Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Estrutura

```
src/
├── components/     # Componentes reutilizáveis (cards, header, hero...)
├── data/           # Dados mock de imobiliárias e corretores
├── layouts/        # Layout base
├── pages/          # Rotas do site
├── styles/         # Estilos globais e tema Tailwind
└── types/          # Tipos TypeScript
```

## Próximos passos

- Integrar backend/API para cadastros reais
- Content Collections ou CMS headless para gestão de dados
- Sistema de avaliações e autenticação
- Busca full-text e paginação
