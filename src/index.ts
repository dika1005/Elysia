import "dotenv/config";
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userController } from "./controllers/user.controller";
import { authController } from "./controllers/auth/auth.controller";

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Elysia API Documentation",
          description: "API documentation for Elysia application",
          version: "1.0.0",
        },
      },
    })
  )
  .get("/", () => "Hello Elysia")
  .use(userController)
  .use(authController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `📚 Swagger docs at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
