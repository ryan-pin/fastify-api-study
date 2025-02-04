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
