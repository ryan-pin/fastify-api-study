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

app.listen({ port: 8080, host: "0.0.0.0" }).then((address) => {
  console.log(`Server is running at ${address}`);
});