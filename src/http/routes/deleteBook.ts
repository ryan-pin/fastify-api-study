import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../services/prisma";

export async function deleteBook(app: FastifyInstance){
    app.delete("/books/:bookId", async (request, reply) => {
        // validação do parametro da requisição
        const getBookParams = z.object({
            bookId: z.string().uuid(),
        })
        // extrai o id do livro da requisição    
        const { bookId } = getBookParams.parse(request.params);
        // deleta o livro no banco de dados
        const book = await prisma.book.findUnique({
            where: {
                id: bookId
            }
        })

        if (!book) {
            return reply.status(404).send("Livro não existe");
        }
        // se existir, deleta
        await prisma.book.delete({
            where: {
                id: bookId
            }
        })
        return reply.status(204).send("Livro deletado com sucesso");
    })
    
}