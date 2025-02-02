import fastify from "fastify";
import { createBook } from "./routes/createBooks";
import { getBook } from "./routes/getBooks";
import { updateBook } from "./routes/updateBook";

const app = fastify();

app.get("/", async (request, reply) => {
    return 'Hello World!';
})

app.register(createBook)
app.register(getBook)
app.register(updateBook)

app.listen({port: 8080}).then(() => {
    console.log("Server is running on port 8080");
})