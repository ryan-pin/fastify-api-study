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
