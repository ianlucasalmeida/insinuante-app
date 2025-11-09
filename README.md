# 🛍️ Insinuante E-Commerce App (Protótipo)

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![json-server](https://img.shields.io/badge/json--server-CC8099?style=for-the-badge&logo=json&logoColor=white)

## 📖 Descrição

**Insinuante** é um protótipo robusto e completo de um aplicativo de e-commerce B2C, construído com **React Native (Expo)** e **TypeScript**. O projeto simula uma loja virtual (no estilo Magazine Luiza) com um fluxo de usuário completo, desde a criação da conta (com busca de CEP) até um checkout de pagamento simulado.

O app possui uma identidade visual vibrante (focada em tons de vermelho e laranja) e agrega produtos de duas APIs públicas (Platzi Fake Store e Fake Store API).

O diferencial deste projeto é a simulação de um backend completo usando `json-server`, permitindo um desenvolvimento *full-stack* simulado sem a necessidade de um banco de dados complexo. Ele gerencia usuários, carrinhos, pedidos e endereços, tornando-o um protótipo de alta fidelidade pronto para ser acoplado a uma API real.

## ✨ Recursos Implementados

### 👤 Autenticação e Usuário
* **Cadastro Completo:** Formulário com `Nome`, `Email`, `CPF`, `Telefone` e `Data de Nascimento`.
* **Busca de Endereço (ViaCEP):** Ao digitar o CEP, o app busca e preenche automaticamente os campos de endereço (`Rua`, `Bairro`, `Cidade`, `UF`).
* **Criação de Usuário e Endereço:** O cadastro salva os dados em `POST /users` e o endereço em `POST /addresses` simultaneamente.
* **Login & Sessão:** Autenticação de usuário e persistência de sessão usando `AsyncStorage`.
* **Edição de Perfil:** Tela de "Meus Dados Pessoais" que permite ao usuário atualizar (`PUT /users/:id`) suas informações.

### 🏠 Home e Descoberta de Produtos
* **Feed Agregado:** A Home exibe um feed de produtos mesclados de duas APIs públicas (Platzi e Fake Store).
* **Barra de Busca com Debounce:** Uma barra de busca que filtra produtos pelo nome. A busca é "debounced" (atrasada) para evitar re-renderizações a cada tecla e não perder o foco.
* **Filtro por Loja:** Botões para filtrar produtos ("Todas", "Loja 1 - Platzi", "Loja 2 - Fake API").
* **Tela de Detalhes:** Exibição detalhada de cada produto.

### 🛒 Carrinho de Compras
* **Adição Inteligente:** O app verifica se o item (da mesma loja) já está no carrinho. Se sim, aumenta a quantidade (`PUT`). Se não, adiciona (`POST`).
* **Controle de Quantidade:** Botões de `+` e `-` na tela do carrinho para alterar a quantidade ou remover o item.
* **Layout Robusto:** O layout do carrinho é limpo e não "quebra" ou sobrepõe itens.

### 💳 Fluxo de Pagamento e Pedidos
* **Simulação de Pagamento (Estilo Stripe):** O "Finalizar Compra" leva a uma tela de Checkout dedicada.
* **Seleção de Método:** O usuário pode alternar entre "Cartão de Crédito" e "PIX".
* **Formulário de Cartão:** Simulação de um formulário de pagamento com campos de cartão.
* **Simulação de PIX:** Exibe um QR Code falso.
* **Criação de Pedido:** Ao "Pagar", o app cria o pedido (`POST /orders`), salva o método de pagamento e limpa o carrinho (`DELETE /carts`).
* **Histórico de Pedidos:** Uma aba "Meus Pedidos" que busca e exibe todos os pedidos anteriores do usuário (`GET /orders?userId=...`).
* **Tela de Sucesso:** Confirmação visual após a conclusão do pedido.

### 🏛️ Arquitetura
* **Navegação:** Roteamento baseado em arquivos com **Expo Router**.
* **Gerenciamento de Estado Global:** `React.Context` (`AuthContext`) é usado para gerenciar a sessão do usuário.
* **Backend Simulado:** `json-server` serve como uma API REST completa.
* **Execução Paralela:** O script `npm run dev` usa `concurrently` para iniciar o backend e o frontend com um único comando.

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia | Propósito |
| --- | --- | --- |
| **Frontend** | React Native | Estrutura principal do app. |
| | Expo (SDK 54) | Gerenciamento do build e bibliotecas nativas. |
| | Expo Router | Navegação e roteamento baseados em arquivos. |
| | TypeScript | Tipagem estática para robustez do código. |
| | Axios | Requisições HTTP para todas as APIs. |
| | AsyncStorage | Armazenamento local da sessão do usuário. |
| **Backend (Simulado)** | `json-server` | Simulação de uma API REST completa. |
| | `concurrently` | Execução paralela dos servidores de frontend e backend. |
| **APIs Externas** | Platzi Fake Store | Fonte de dados de produtos 1. |
| | Fake Store API | Fonte de dados de produtos 2. |
| | ViaCEP | API pública para busca de endereço por CEP. |

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
* Node.js (versão LTS)
* Git
* Um dispositivo (físico ou emulador) com o app **Expo Go** instalado.
* `npm` (ou `yarn`)

### 2. Instalação
Clone o repositório e instale as dependências:

```bash
git clone <url-do-seu-repositorio>
cd insinuante-app
npm install
3. Configuração do Ambiente (Obrigatório!)
O app precisa saber o IP da sua máquina para se conectar ao json-server.

Encontre seu IP (no Fedora/Linux):

Bash

ip a
(Procure por algo como inet 192.168.0.103 na sua conexão wlp... ou eth...)

Abra o firewall (no Fedora): O json-server roda na porta 3001. Você precisa permitir conexões nela:

Bash

sudo firewall-cmd --add-port=3001/tcp
Atualize o IP no Código: Abra o projeto no seu editor e substitua http://SEU.IP.AQUI:3001 em TODOS os arquivos abaixo pelo seu IP (ex: http://192.168.0.103:3001):

context/AuthContext.tsx

app/checkout.tsx

app/configuracoes.tsx

app/enderecos.tsx

app/produto.tsx

app/(tabs)/carrinho.tsx

app/(tabs)/pedidos.tsx

4. Executando o App
Este projeto usa concurrently para iniciar o backend e o frontend juntos.

Bash

npm run dev
O seu terminal irá:

Iniciar o json-server na porta 3001 (lendo o db.json).

Iniciar o expo start.

Escaneie o QR Code exibido com o app Expo Go no seu celular.

📂 Estrutura do Projeto (Simplificada)
/insinuante-app
├── api/
│   └── publicApi.ts        # Funções para buscar (Platzi, Fake Store)
├── app/
│   ├── (auth)/             # Telas de Login, Cadastro, Recuperar
│   │   ├── _layout.tsx
│   │   ├── cadastro.tsx
│   │   └── login.tsx
│   ├── (tabs)/             # Telas principais com navegação em abas
│   │   ├── _layout.tsx     # O layout das abas (Home, Carrinho, Pedidos, Perfil)
│   │   ├── index.tsx       # A Tela Home (com busca e filtros)
│   │   ├── carrinho.tsx
│   │   ├── pedidos.tsx
│   │   └── perfil.tsx
│   ├── _layout.tsx         # Layout Raiz (Controlador de Autenticação)
│   ├── checkout.tsx        # Tela de Pagamento (PIX/Cartão)
│   ├── configuracoes.tsx   # Tela de "Meus Dados Pessoais"
│   ├── enderecos.tsx       # Tela "Meus Endereços"
│   ├── pedido-concluido.tsx
│   └── produto.tsx
├── constants/
│   └── Colors.ts           # Paleta de cores (Vermelho/Laranja)
├── context/
│   └── AuthContext.tsx     # Cérebro do login e sessão do usuário
├── db.json                 # O "banco de dados" do json-server
└── package.json            # Scripts e dependências (incluindo "npm run dev")
