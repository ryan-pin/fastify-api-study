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