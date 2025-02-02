import { FastifyInstance } from "fastify";
import { prisma } from "../services/prisma";
import z from "zod";

export async function getBook(app: FastifyInstance){
    app.get("/books", async (request, reply) => {
        // busca todos os livros no banco de dados
        const books = await prisma.book.findMany();
        return reply.status(200).send(books); 
    })

    app.get("/books/:bookId", async (request, reply) => {
        // validação do parametro da requisição
        const getBookParams = z.object({
            bookId: z.string().uuid(),
        })
        // extrai o id do livro da requisição    
        const { bookId } = getBookParams.parse(request.params);
        // busca o livro no banco de dados
        const book = await prisma.book.findUnique({
            where: {
                id: bookId
            }
        })

        return reply.status(200).send(book);
    })
}