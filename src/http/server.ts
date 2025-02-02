import fastify from "fastify";

const app = fastify();

app.listen({port: 8080}).then(() => {
    console.log("Server is running on port 8080");
})