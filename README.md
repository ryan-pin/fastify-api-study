# API Rest com FastiFy e Typescript

## Objetivo

O objetivo deste documento é apresentar um exemplo simples de como funciona uma api com rest com FastiFy. 

## Tecnologias

Nesse projeto para acesso e envio de dados vamos utilizar algumas tecnologias

- FastiFy
- Prisma (para conexão com o banco)
- Postgres
- Node.js
- Zod (para validação dos objetos)
- Swagger (documentação da api)

## Iniciando o projeto

Para criar o package.json

```bash
npm init -y
```
Instalando as dependencias de desenvolvimento

```bash
npm install --save-dev typescript

npm install --save-dev @types/node

npm install --save-dev tsx

npm install zod
```
Para criar o tsconfig.json

```bash
tsc --init
```
### Configurar o swagger
```bash
npm install @fastify/swagger @fastify/swagger-ui
```
Depois de instalar o swagger, no arquivo `server.js`, adicione a configuração do swagger (não esqueça as importações do swagger e swaggerUi)
```js

// Configuração do Swagger
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

fastify.register(swaggerUi, {
  routePrefix: '/docs', // URL da documentação
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});
```


Apos isso, abra o `tsconfig.json` e faça essas alterações, essas mudanças sao para um codigo mais moderno e eficiente no Node.js 16+

```json
 /* Language and Environment */
    "target": "ES2022",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    "lib": [
      "ES2023"
    ],...

    /* Modules */
    "module": "Node16", 
    ...
```
Crie uma pasta 'src' e dentro da src uma pasta 'http', entao crie o arquivo `server.ts`



Faça essa alteração no `package.json` para gerar um script para rodar a api
```json
  "scripts": {
    "dev": "tsx watch src/http/server.ts"
  },
```

## Prisma

O Prisma é um ORM moderno e eficiente para Node.js e TypeScript. Ele facilita a comunicação entre sua aplicação e o banco de dados, permitindo realizar operações de CRUD de maneira mais simples e tipada. (Se quiser, existe uma extensão do vscode para o prisma)

```bash
npm install --save-dev prisma

npm install @prisma/client
```
Para conectar com o banco

```bash
npx prisma init --datasource-provider postgresql
```

Depois de instalar as dependencias, você pode testar a api no arquivo `server.ts`
```typescript
import fastify from "fastify";

const app = fastify();

app.get("/", async (request, reply) => {
    return 'Hello World!';
})

app.listen({port: 8080}).then(() => {
    console.log("Server is running on port 8080");
})
```
entao rode a api com 
```bash
npm run dev
```
Depois de rodar o comando abaixo, sera criado uma pasta Prisma com o schema e modelos e um .env, va para a .env e coloque as informações do seu banco como, usuario, senha, porta e nome do banco
```bash
npx prisma init --datasource-provider postgresql
```
```ts
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nomedobanco?schema=public"
```
Apos isso, dentro da pasta 📂prisma e dentro do arquivo `schema.prisma` você pode criar seus modelos que serao utilizados, com os modelos ja criados, para fazer uma migração utilize o comando abaixo, entao de um nome para a migração e ela sera efetivada
```ts
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
```bash
npx prisma migrate dev
```
Para modularizar ainda mais a aplicação, criamos 2 pastas dentro da pasta '📂http', a pasta '📂routes' que ira guardar todas as rotas da api e a pasta '📂service', dentro da pasta service criamos o arquivo `prisma.ts`, que sera reutilizado dentro das rotas

```
├── prisma/
├── src/
│   ├── http/
│   │   ├── service/
│   │   └── routes/
├── server.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```
arquivo - prisma.ts
```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```
Dentro da pasta '📂routes' e do arquivo `createBook.ts` vamos criar nossa rota para criação de um livro, usando o zod para validar o objeto 

para que o swagger documente corretamente o endpoint, precisamos passar o schema dentro do codigo

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
Então volta ao arquivo `server.ts` e registre a criação da rota com `app.register()`
```ts
...

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


## Referencias
- [FastFy](https://fastify.dev)
- [Zod](https://zod.dev)
- [Prisma](https://www.prisma.io/orm)
- [Swagger](https://swagger.io) 
- [Video referencia](https://www.youtube.com/watch?v=E6mZSJFozvM)