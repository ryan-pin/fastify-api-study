import { FastifyInstance } from "fastify";
import { prisma } from "../services/prisma";

export async function getBook(app: FastifyInstance){
    app.get("/books", async (request, reply) => {
        const books = await prisma.book.findMany();
        return reply.status(200).send(books); 
    })
}