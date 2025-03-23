# 🐾 Sistema de Gerenciamento de Pet Shop

Bem-vindo ao Sistema de Gerenciamento de Pet Shop, uma aplicação web completa para administração de pet shops, clínicas veterinárias e estabelecimentos similares.

## 📋 Funcionalidades

### 👥 Clientes
- Cadastro completo de clientes
- Busca e filtragem de clientes
- Edição e exclusão de registros
- Visualização de histórico de atendimentos

### 🐶 Pets
- Cadastro detalhado de pets com foto
- Vinculação com proprietário
- Registro de informações como raça, idade, peso
- Histórico médico e de serviços

### ✂️ Serviços
- Cadastro de serviços oferecidos
- Definição de preços
- Categorização de serviços
- Controle de disponibilidade

### 📅 Agendamentos
- Agendamento de serviços
- Visualização em calendário
- Filtros por data, cliente, pet e status
- Controle de status (Agendado, Concluído, Cancelado)

### 📦 Produtos
- Gerenciamento de estoque
- Cadastro de produtos com preço e descrição
- Controle de entrada e saída
- Alertas de estoque baixo

### 💰 Vendas
- Registro de vendas de produtos
- Vinculação com cliente
- Cálculo automático de valores
- Histórico de vendas

## 🚀 Tecnologias Utilizadas

- **Frontend**: React, Bootstrap, React Router
- **Backend**: JSON Server (simulação de API REST)
- **Bibliotecas**: Axios, FontAwesome, React Bootstrap
- **Ferramentas**: Vite, ESLint

## 💻 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para instalação

1. Clone o repositório:
```
git clone [URL_DO_REPOSITÓRIO]
cd trae-pet
```

2. Instale as dependências:
```
npm install
```

3. Inicie a aplicação (frontend + backend):
```
npm start
```

Este comando iniciará tanto o servidor de desenvolvimento Vite (frontend) quanto o JSON Server (backend simulado).

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📝 Estrutura do Projeto

```
pet-shop/
├── public/            # Arquivos públicos
├── src/               # Código fonte
│   ├── assets/        # Recursos estáticos
│   ├── components/    # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── App.jsx        # Componente principal
│   └── main.jsx       # Ponto de entrada
├── db.json            # Banco de dados simulado
└── package.json       # Dependências e scripts
```

## 🔧 Configuração

O arquivo `db.json` serve como banco de dados simulado e contém as seguintes coleções:

- `clientes`
- `pets`
- `servicos`
- `agendamentos`
- `produtos`
- `vendas`
- `imagensPets`

## 📱 Uso

1. Acesse a página inicial para visualizar o dashboard com estatísticas
2. Navegue entre as diferentes seções através do menu
3. Utilize os formulários para adicionar novos registros
4. Use as funcionalidades de busca e filtragem para encontrar informações
5. Gerencie agendamentos e acompanhe o status dos serviços

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença

Este projeto está licenciado sob a licença MIT.
