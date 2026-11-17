# DevHouse

API REST para cadastro e reserva de casas, desenvolvida como projeto de estudo para praticar a construção de backends com **Node.js**, **Express** e **MongoDB**. Aplicação criada durante o desenrolar do "Curso completo de APIs Nodejs, Express + MongoDB, SQL.

O projeto simula o backend de uma plataforma de hospedagens: usuários podem iniciar uma sessão informando o e-mail, cadastrar imóveis com imagens, consultar imóveis disponíveis e criar ou cancelar reservas.

## Como funciona

O servidor HTTP é criado pelo Express e executado na porta `3333`. O Mongoose é responsável pela conexão com o MongoDB e pela persistência dos modelos:

- **Usuário:** identificado por e-mail.
- **Casa:** possui imagem, descrição, preço, localização, status de disponibilidade e usuário proprietário.
- **Reserva:** relaciona um usuário a uma casa e registra a data informada.

As imagens enviadas no cadastro ou na atualização de casas são armazenadas localmente na pasta `backend/uploads` e ficam acessíveis pelo caminho `/files/<nome-do-arquivo>`.

O projeto utiliza `user_id` no cabeçalho das requisições que dependem de um usuário. Esse mecanismo é didático e não representa uma autenticação completa com senha, sessão ou token.

## Tecnologias e dependências

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Multer](https://github.com/expressjs/multer) para upload de imagens
- [Zod](https://zod.dev/) para validação de dados
- CORS para permitir requisições de outras origens
- Nodemon para reiniciar o servidor durante o desenvolvimento

## Como compilar e executar

### Pré-requisitos

1. Node.js e npm instalados.
2. Uma instância do MongoDB disponível, local ou em um serviço como o MongoDB Atlas.
3. Acesso à string de conexão configurada em `backend/src/app.js`.

### Instalação

Na raiz do repositório, instale as dependências do backend:

```bash
cd backend
npm install
```

Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3333
```

> Atualmente, a conexão com o MongoDB está definida diretamente no código. Para executar o projeto com segurança em outro ambiente, substitua essa configuração por uma variável de ambiente e nunca publique credenciais no repositório.

## Endpoints

Todos os endpoints retornam JSON, exceto quando indicado. Os campos enviados como `price` e `status` são convertidos a partir de valores recebidos pela requisição.

### Sessão

| Método | Rota        | Descrição                               | Corpo                                |
| ------ | ----------- | --------------------------------------- | ------------------------------------ |
| `POST` | `/sessions` | Cria ou recupera um usuário pelo e-mail | `{ "email": "usuario@exemplo.com" }` |

O e-mail é validado com Zod. Em caso de formato inválido, a API retorna `400`.

### Casas

| Método   | Rota                  | Descrição                                 | Requisitos                                                       |
| -------- | --------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| `POST`   | `/houses`             | Cadastra uma casa                         | `multipart/form-data`, cabeçalho `user_id` e arquivo `thumbnail` |
| `GET`    | `/houses?status=true` | Lista casas filtradas por disponibilidade | Query string `status`                                            |
| `PUT`    | `/houses/:house_id`   | Atualiza uma casa do usuário              | `multipart/form-data`, cabeçalho `user_id` e arquivo `thumbnail` |
| `DELETE` | `/houses`             | Exclui uma casa                           | JSON `{ "house_id": "..." }` e cabeçalho `user_id`               |

Os campos usados no cadastro e na atualização são:

```text
thumbnail   arquivo da imagem
description descrição da casa
price       preço
location    localização
status      true ou false
```

As respostas das casas incluem o campo virtual `thumbnail_url`, por exemplo:

```text
http://localhost:3333/files/nome-da-imagem.webp
```

### Dashboard

| Método | Rota         | Descrição                               | Requisito           |
| ------ | ------------ | --------------------------------------- | ------------------- |
| `GET`  | `/dashboard` | Lista as casas cadastradas pelo usuário | Cabeçalho `user_id` |

### Reservas

| Método   | Rota                        | Descrição                    | Corpo/Requisito                           |
| -------- | --------------------------- | ---------------------------- | ----------------------------------------- |
| `POST`   | `/houses/:house_id/reserve` | Solicita uma reserva         | Cabeçalho `user_id` e `{ "date": "..." }` |
| `GET`    | `/reserves`                 | Lista as reservas do usuário | Cabeçalho `user_id`                       |
| `DELETE` | `/reserves`                 | Cancela uma reserva          | JSON `{ "reserve_id": "..." }`            |

## Exemplo de uso

O fluxo básico para testar a API é:

1. Criar uma sessão:

```bash
curl -X POST http://localhost:3333/sessions \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com"}'
```

2. Copiar o `_id` retornado e usá-lo como `user_id`.
3. Cadastrar uma casa usando `multipart/form-data`:

```bash
curl -X POST http://localhost:3333/houses \
  -H "user_id: ID_DO_USUARIO" \
  -F "thumbnail=@/caminho/para/imagem.webp" \
  -F "description=Casa próxima ao centro" \
  -F "price=1200" \
  -F "location=Teixeira PB" \
  -F "status=true"
```

4. Consultar casas disponíveis:

```bash
curl "http://localhost:3333/houses?status=true"
```

5. Criar uma reserva:

```bash
curl -X POST http://localhost:3333/houses/ID_DA_CASA/reserve \
  -H "Content-Type: application/json" \
  -H "user_id: ID_DO_USUARIO" \
  -d '{"date":"2026-12-20"}'
```

Também existem exemplos de requisições do Postman em `backend/src/postman/collections/devhouse`, quando essa pasta estiver disponível no ambiente local.

## Estrutura do código

```text
backend/
├── package.json              # Dependências e scripts
├── src/
│   ├── app.js                # Express, middlewares, MongoDB e arquivos estáticos
│   ├── server.js             # Inicialização do servidor na porta 3333
│   ├── routes.js             # Definição das rotas
│   ├── config/upload.js      # Configuração do armazenamento de imagens
│   ├── controllers/          # Regras das requisições
│   ├── models/               # Schemas e modelos do Mongoose
│   └── postman/              # Exemplos locais de requisições
└── uploads/                  # Imagens enviadas durante a execução
```

## Conhecimentos desenvolvidos

- Criação de uma API REST com Express.
- Organização de rotas, controladores e modelos.
- Persistência de dados no MongoDB por meio do Mongoose.
- Relacionamento entre documentos usando referências do MongoDB.
- Upload e disponibilização de arquivos com Multer e Express.
- Validação de entrada com Zod.
- Uso de cabeçalhos, parâmetros de rota, query strings e diferentes formatos de corpo.
- Testes manuais de endpoints com cURL e Postman.
- **Git e GitHub:** uso básico das ferramentas de versionamento e colaboração, comuns no mercado.

## Limitações conhecidas

- Não há autenticação real nem autorização baseada em token; o usuário é identificado pelo `user_id` enviado no cabeçalho.
- A string de conexão do MongoDB ainda está no código da aplicação e deve ser movida para uma variável de ambiente antes de qualquer implantação.
- O upload é local e não possui validação explícita de tamanho, extensão ou tipo MIME.
- Não há tratamento global padronizado para erros de banco, arquivos ausentes ou identificadores inválidos.
- Não há testes automatizados configurados; o script `npm test` ainda é apenas um placeholder.
- A API não possui paginação, documentação OpenAPI/Swagger, logs estruturados ou versionamento de rotas.
- O cancelamento de reservas não verifica se a reserva pertence ao usuário solicitante.
- Os arquivos enviados não são removidos automaticamente quando uma casa é atualizada ou excluída.

## Ideias de evolução

- Usar variáveis de ambiente com `dotenv` e adicionar um `.env.example`.
- Implementar autenticação com JWT e middleware de autorização.
- Corrigir e centralizar o tratamento de erros e validações.
- Adicionar validação de arquivos, limites de upload e armazenamento em serviço externo.
- Garantir que somente o proprietário possa editar ou excluir casas e que somente o dono possa cancelar reservas.
- Validar existência de usuários, casas e reservas antes de criar relacionamentos.
- Criar testes unitários e de integração com cobertura dos principais fluxos.
- Adicionar documentação OpenAPI/Swagger e uma coleção Postman versionada.
- Implementar paginação, filtros adicionais e ordenação na listagem de casas.
- Adicionar estados de reserva, prevenção de conflitos de datas e índices no MongoDB.
- Configurar CI no GitHub Actions para lint, testes e validações de segurança.
