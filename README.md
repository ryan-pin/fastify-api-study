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

Apos isso, abra o tsconfig.json e faça essas alterações

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
Crie uma pasta 'src' e dentro da src uma pasta 'http', entao crie o arquivo 'server.ts'



Faça essa alteração no package.json para gerar um script para rodar a api
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

Depois de instalar as dependencias, você pode testar a api no arquivo 'server.ts'
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
Apos isso, dentro da pasta 'prisma' e dentro do arquivo 'schema.prisma' você pode criar seus modelos que serao utilizados, com os modelos ja criados, para fazer uma migração utilize o comando abaixo, entao de um nome para a migração e ela sera efetivada
```ts
model Book{
  id        String     @id @db.Uuid @default(uuid())
  title     String
  author    String
  description String? @db.Text
  IsFavorite Boolean @default(false)
  IsReading Boolean @default(false)
  IsFavorite Boolean @default(false)
}
```
```bash
npx prisma migrate dev
```
Para modularizar ainda mais a aplicação, criamos 2 pastas dentro da pasta 'http', a pasta 'routes' que ira guardar todas as rotas da api e a pasta 'service', dentro da pasta service criamos o arquivo prisma.ts, que sera reutilizado dentro das rotas
```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```
Dentro da pasta 'routes' e do arquivo 'createBook.ts' vamos criar nossa rota para criação de um livro, usando o zod para validar o objeto 

```ts
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../services/prisma";

export function createBook(app: FastifyInstance){
    app.post("/books", async (request, reply) => {

        // validação do corpo da requisição
        const createBookBody = z.object({
            title: z.string(),
            author: z.string(),
            desciption: z.string(),
        })

        // extrai os dados do corpo da requisição
        const { title, author, desciption } = createBookBody.parse(request.body);
    
        // criação do livro no banco de dados
        const book = await prisma.book.create({
            data: {
                title,
                author,
                desciption
            }
        })
        
        // apos a criação do livro, retornamos o id do livro
        return reply.status(201).send({ bookId: book.id });
    }) 
}
```
Entao volta ao arquivo 'server.ts' e registre a criação da rota
```ts
import fastify from "fastify";
import { createBook } from "./routes/createBooks";

const app = fastify();

app.get("/", async (request, reply) => {
    return 'Hello World!';
})

app.register(createBook) // <-- aqui

app.listen({port: 8080}).then(() => {
    console.log("Server is running on port 8080");
})
```
