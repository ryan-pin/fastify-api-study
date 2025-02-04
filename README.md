# API REST com Fastify e TypeScript 

## 🎯 Objetivo

Este documento tem como objetivo demonstrar como criar uma **API REST** simples utilizando **Fastify** e **TypeScript**. A proposta é criar uma aplicação robusta, eficiente e bem estruturada.

## 🔥 Tecnologias

As principais tecnologias utilizadas neste projeto são:

- 🐺 **Fastify**: Framework para criar servidores web de forma rápida e eficiente.
- 💻 **Prisma**: ORM para facilitar a conexão com bancos de dados.
- 🦄 **PostgreSQL**: Banco de dados relacional utilizado para armazenar os dados.
- 🧑‍💻 **Node.js**: Plataforma para executar o código JavaScript/TypeScript.
- 🧩 **Zod**: Biblioteca para validação de dados.
- 📖 **Swagger**: Ferramenta para documentar a API.

---

### Iniciando o Projeto

1️⃣ **Criando o `package.json`** 📄

Execute o comando abaixo para gerar o arquivo `package.json` com as configurações padrão:

```bash
npm init -y
```

2️⃣ **Instalando as Dependências** 💅

Instale as dependências necessárias para o projeto:

```bash
npm install -D typescript
npm install -D @types/node
npm install zod
npm install fastify

```

3️⃣ **Adicionando Scripts no `package.json`** 💻

Adicione os seguintes scripts no arquivo `package.json` para facilitar a execução:

```json
"scripts": {
  "build": "tsc -p tsconfig.json",   // Para compilar o projeto usando o TypeScript
  "dev": "ts-node src/http/server.ts"  // Para rodar o servidor diretamente com o TypeScript
}
```

4️⃣ **Inicializando o TypeScript (tsc)** 🌟

Execute o comando abaixo para criar o arquivo `tsconfig.json`:

```bash
npx tsc --init
```

Em seguida, no arquivo `tsconfig.json`, adicione ou ajuste as configurações para garantir que a compilação do TypeScript funcione corretamente:

```json
/* Language and Environment */
"target": "ES2022",                                 
"lib": ["ES2023"],
...
/* Modules */
"module": "Node16",
...
```

5️⃣ **Criando Estrutura de Pastas** 📂

Crie a estrutura de pastas conforme abaixo para organizar o código:

```txt
├── src/
│   ├── http/
│   │   └── server.ts
├── .gitignore
├── package.json
└── tsconfig.json
```

6️⃣ **Testando a API** 🎉

Crie o arquivo `server.ts` dentro da pasta `http` com o seguinte código para iniciar o servidor:

```ts
import fastify from "fastify";

const app = fastify();

app.get("/", async (request, reply) => {
  return "Hello World!";
});

app.listen({ port: 8080, host: "0.0.0.0" }).then((address) => {
  console.log(`Server is running at ${address}`);
});
```

Execute o comando para rodar a api
```bash
npm run dev 
```

---

### ✨ Configurando o Swagger

1️⃣ **Instalando o Swagger** 📚

Para documentar a API, instale as dependências necessárias:

```bash
npm install @fastify/swagger @fastify/swagger-ui
```

2️⃣ **Configurando o Swagger no `server.ts`** 🖥️

Adicione o seguinte código no `server.ts` para configurar o Swagger e permitir o acesso à documentação da API:

```ts
[...]
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui'; 

// Registrando o Swagger como uma rota do Fastify
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'API Fastify',
      description: 'Documentação da API usando Swagger',
      version: '1.0.0',
    },
    host: 'localhost:8080',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  }
});

// Rota para acessar a documentação do Swagger
fastify.register(swaggerUi, {
  routePrefix: '/docs', // URL da documentação
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});
[...]

```

Agora sua API está documentada pelo swagger e acessível pela URL `http://localhost:8080/docs`. 🌐

---
## Prisma

O Prisma é um ORM moderno e eficiente para Node.js e TypeScript, projetado para facilitar a comunicação entre a sua aplicação e o banco de dados. Ele simplifica as operações de CRUD (criação, leitura, atualização e exclusão), tornando-as mais fáceis e tipadas. Para aproveitar ainda mais o Prisma, você pode instalar uma extensão no VS Code, o que facilita o desenvolvimento.

### Iniciando o Prisma

Primeiro, para instalar o prisma, execute o comando no terminal

```bash
npm install --save-dev prisma
npm install @prisma/client
```

Em seguida, execute o seguinte comando para inicializar o Prisma com suporte ao banco de dados PostgreSQL:

```bash
npx prisma init --datasource-provider postgresql
```

### Configuração do Banco de Dados


Apos rodar o comando acima, sera gerado o arquivo `.env`, configure a URL de conexão com o banco de dados

```ts
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nomedobanco?schema=public"
```

### Criando Modelos no Prisma
Depois de executar o comando no terminal, sera criado uma pasta `📂prisma` com o arquivo `schema.prisma` onde sera possivel criar seus modelos do banco

```ts
[...]

model Book{
  id        String     @id @db.Uuid @default(uuid())
  title     String
  author    String
  description String? @db.Text
  IsFavorite Boolean @default(false)
  IsReading Boolean @default(false)
  IsFinished Boolean @default(false)
}
```
### Como fazer relação entre modelos
no arquivo `schema.prisma`, as relações são feitas pela sintaxe `@relation`, como nessa relação 1:N
```ts
model Author {
  id        String   @id @db.Uuid @default(uuid())
  name      String
  books     Book[]   @relation("AuthorBooks") //um autor pode ter varios livros
}

model Book {
  id        String   @id @db.Uuid @default(uuid())
  title     String
  authorId  String
  author    Author   @relation(fields: [authorId], references: [id], name: "AuthorBooks")
}

```

Com os modelos criados, faça uma migração com o comando abaixo, depois de executar a migração, de um nome e ela sera concluida, gerando a migração e os arquivos .sql

```bash
npx prisma migrate dev
```

---

Para modularizar a aplicação, criamos duas pastas dentro de `📂http`: `📂routes`, que contém todas as rotas da API, e `📂service`, onde fica o arquivo `prisma.ts`, que será reutilizado nas rotas.

```
├── prisma/
├── src/
│   ├── http/
│   │   ├── service/
│   │   ├── routes/
│   │   └── server.ts
├── .env
├── package.json
├── package-lock.json
└── tsconfig.json
```

O arquivo `prisma.ts` se conecta ao banco com o Prisma:

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```


## Criando rotas personalizadas

Na pasta `📂routes`, dentro do arquivo `createBook.ts`, criamos a rota para criar um livro, utilizando o Zod para validar o objeto. Para garantir que o Swagger documente corretamente o endpoint, passamos o schema diretamente no código.

### Create

```ts
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../services/prisma";

export async function createBook(app: FastifyInstance) {
    app.post("/books", {
        schema: { // Configuração do Swagger
            description: "Cria um novo livro",
            tags: ["Livros"], // Categoria no Swagger
            body: {
                type: "object",
                required: ["title", "author", "description"],
                properties: {
                    title: { type: "string", description: "Título do livro" },
                    author: { type: "string", description: "Autor do livro" },
                    description: { type: "string", description: "Descrição do livro" }
                }
            },
            response: {
                201: {
                    description: "Livro criado com sucesso",
                    type: "object",
                    properties: {
                        bookId: { type: "string", description: "ID do livro criado" }
                    }
                }
            }
        }
    }, async (request, reply) => {
        // Validação do corpo da requisição
        const createBookBody = z.object({
            title: z.string(),
            author: z.string(),
            description: z.string(),
        });

        // Extração e validação dos dados
        const { title, author, description } = createBookBody.parse(request.body);

        // Criação do livro no banco de dados
        const book = await prisma.book.create({
            data: { 
                title, 
                author, 
                description 
            },
        });

        // Retorno da resposta
        return reply.status(201).send({ bookId: book.id });
})}

```
Então volte ao arquivo `server.ts` para registrar a criação da rota com `app.register()`
```ts
[...]

app.get("/",  () => {
    return "servidor ok";
})

app.register(createBook) // <--
app.register(getBook)
app.register(updateBook)
app.register(deleteBook)

app.listen({port: 8080}).then(() => {
    console.log("Server is running on port 8080");
})
...

```

### GET

Igualmente para a função get, criamos um arquivo `getBooks.ts` dentro de routes, junto do schema para a documentação do swagger
```ts
import { FastifyInstance } from "fastify";
import { prisma } from "../services/prisma";
import z from "zod";

export async function getBook(app: FastifyInstance) {
    app.get("/books", {
        schema: {
            description: "Retorna todos os livros cadastrados",
            tags: ["Livros"],
            response: {
                200: {
                    description: "Lista de livros",
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", format: "uuid" },
                            title: { type: "string" },
                            author: { type: "string" },
                            description: { type: "string" }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const books = await prisma.book.findMany();
        return reply.status(200).send(books);
    });

    app.get("/books/:bookId", {
        // o schema é para a documentação do swagger
        schema: {
            description: "Retorna um livro pelo ID",
            tags: ["Livros"],
            params: {
                type: "object",
                properties: {
                    bookId: { type: "string", format: "uuid", description: "ID do livro" }
                },
                required: ["bookId"]
            },
            response: {
                200: {
                    description: "Detalhes do livro",
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        author: { type: "string" },
                        description: { type: "string" }
                    }
                },
                404: {
                    description: "Livro não encontrado",
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                }
            }
        } //aqui começa a criação do endpoint
    }, async (request, reply) => {
        const getBookParams = z.object({
            bookId: z.string().uuid(),
        });

        const { bookId } = getBookParams.parse(request.params);

        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });

        if (!book) {
            return reply.status(404).send({ message: "Livro não existe" });
        }

        return reply.status(200).send(book);
    });
}

```

e registramos no `server.ts`
```ts
...

app.register(createBook) 
app.register(getBook) // <- aqui
...
```
Agora criamos o endpoint de update com o arquivo `updateBooks.ts`

### Update

```ts
import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../services/prisma";

export async function updateBook(app: FastifyInstance) {
  app.patch("/books/:bookId", {
    schema: {
      description: "Atualiza informações de um livro pelo ID",
      tags: ["Livros"],
      params: {
        type: "object",
        properties: {
          bookId: { type: "string", format: "uuid", description: "ID do livro" }
        },
        required: ["bookId"]
      },
      body: {
        type: "object",
        properties: {
          isFavorite: { type: "boolean", description: "Marcar como favorito" },
          isReading: { type: "boolean", description: "Marcar como em leitura" },
          isFinished: { type: "boolean", description: "Marcar como finalizado" }
        }
      },
      response: {
        200: {
          description: "Livro atualizado com sucesso",
          type: "object",
          properties: {
            message: { type: "string" }
          }
        },
        404: {
          description: "Livro não encontrado",
          type: "object",
          properties: {
            message: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    // Validação do parâmetro da requisição
    const getBookParams = z.object({
      bookId: z.string().uuid(),
    });

    // Validação do corpo da requisição
    const getBookBody = z.object({
      isFavorite: z.optional(z.boolean()),
      isReading: z.optional(z.boolean()),
      isFinished: z.optional(z.boolean()),
    });

    // Extrai os dados do corpo da requisição
    const { bookId } = getBookParams.parse(request.params);
    const { isFavorite, isReading, isFinished } = getBookBody.parse(request.body);

    // Busca o livro no banco de dados
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    // Se não encontrar o livro, retorna 404
    if (!book) {
      return reply.status(404).send({ message: "Livro não encontrado" });
    }

    // Atualiza o livro no banco de dados
    await prisma.book.update({
      where: { id: bookId },
      data: {
        isFavorite: isFavorite ?? book.isFavorite,
        isReading: isReading ?? book.isReading,
        isFinished: isFinished ?? book.isFinished,
      }
    });

    reply.status(200).send({ message: "Livro atualizado com sucesso" });
  });
}

```
e para terminar o crud, vamos fazer o `delete`, criando tambem um arquivo dentro da pasta routes

### Delete

```ts
import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../services/prisma";

export async function deleteBook(app: FastifyInstance) {
    app.delete("/books/:bookId", {
        schema: {
            description: "Deleta um livro pelo ID",
            tags: ["Livros"],
            params: {
                type: "object",
                properties: {
                    bookId: { type: "string", format: "uuid", description: "ID do livro" }
                },
                required: ["bookId"]
            },
            response: {
                204: {
                    description: "Livro deletado com sucesso"
                },
                404: {
                    description: "Livro não encontrado",
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const getBookParams = z.object({
            bookId: z.string().uuid(),
        });

        const { bookId } = getBookParams.parse(request.params);

        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });

        if (!book) {
            return reply.status(404).send({ message: "Livro não existe" });
        }

        await prisma.book.delete({
            where: { id: bookId }
        });

        return reply.status(204).send();
    });
}

```

finalizando com todas as importações dentro do `server.ts`, assim temos uma api rest com fastify documentada com o swagger

```ts
import fastify from "fastify";
import { createBook } from "./routes/createBooks";
import { getBook } from "./routes/getBooks";
import { updateBook } from "./routes/updateBook";
import { deleteBook } from "./routes/deleteBook";

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const app = fastify();

// Configuração do Swagger
app.register(swagger, {
    swagger: {
      info: {
        title: 'API Fastify',
        description: 'Documentação da API usando Swagger',
        version: '1.0.0',
      },
      host: 'localhost:8080',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    }
  });
  
  app.register(swaggerUi, {
    routePrefix: '/docs', // URL da documentação
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

app.get("/",  () => {
    return "servidor ok";
})

app.register(createBook)
app.register(getBook)
app.register(updateBook)
app.register(deleteBook)

app.listen({port: 8080}).then(() => {
    console.log("Server is running on port 8080");
})
```

## Referencias
- [FastFy](https://fastify.dev)
- [Zod](https://zod.dev)
- [Prisma](https://www.prisma.io/orm)
- [Swagger](https://swagger.io) 
- [Video referencia](https://www.youtube.com/watch?v=E6mZSJFozvM)
