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
