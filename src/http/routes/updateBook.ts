import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../services/prisma";

export async function updateBook(app: FastifyInstance) {
  app.patch("/books/:bookId", async (request, reply) => {
    // validação do parametro da requisição
    const getBookParams = z.object({
      bookId: z.string().uuid(),
    });
    // validação do corpo da requisição
    const getBookBody = z.object({
      isFavorite: z.optional(z.boolean()),
      isReading: z.optional(z.boolean()),
      isFinished: z.optional(z.boolean()),
    });

    // extrai os dados do corpo da requisição
    const { bookId } = getBookParams.parse(request.params);   
    const { isFavorite, isReading, isFinished } = getBookBody.parse(request.body);

    const book = await prisma.book.update({
        where: {
            id: bookId
        }
    })
    
    // se nao encontrar pelo id, retorna 404
    if (!book) {
        return reply.status(404).send("Livro nao encontrado");
    }

    // atualiza o livro no banco de dados
    await prisma.book.update({
        where: {
            id: bookId
        },
        data: { //atualiza ou mantem o valor atual
            isFavorite: isFavorite || book?.isFavorite,
            isReading : isReading || book?.isReading,
            isFinished : isFinished || book?.isFinished,
        }
    })

    reply.send()
  });
}
