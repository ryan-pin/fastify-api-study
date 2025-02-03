import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../services/prisma";

export async function createBook(app: FastifyInstance){
    app.post("/books", async (request, reply) => {

        // validação do corpo da requisição
        const createBookBody = z.object({
            title: z.string(),
            author: z.string(),
            description: z.string(),
        })

        // extrai os dados do corpo da requisição
        const { title, author, description } = createBookBody.parse(request.body);
    
        // criação do livro no banco de dados
        const book = await prisma.book.create({
            data: {
                title,
                author,
                description
            }
        })
        
        // apos a criação do livro, retornamos o id do livro
        return reply.status(201).send({ bookId: book.id });
    }) 
}