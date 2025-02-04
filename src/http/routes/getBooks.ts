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
