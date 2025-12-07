import "dotenv/config";
import { Elysia, t } from "elysia";
import { PrismaClient } from "./generated/client.ts";
import { nanoid } from "nanoid";

const prisma = new PrismaClient({});
const app = new Elysia();

// Endpoint to create a shortened URL
app.post(
  "/shorten",
  async ({ body, set }) => {
    const shortCode = nanoid(8);

    try {
      const newUrl = await prisma.link.create({
        data: {
          shortCode: shortCode,
          longUrl: body.url
        }
      });
      set.status = 201;
      return {
        message: "Short URL created successfully",
        shortUrl: `${process.env.URL}${newUrl.shortCode}`,
        longUrl: newUrl.longUrl
    };
    } catch (error) {
      set.status = 500;
      console.error("Error creating short URL:", error);
      return { message: "An error occurred while creating the short URL." };
    }
  },

  // Validate the request body
  {
    body: t.Object({
      url: t.String({
        format: "url",
        maxLength: 2048,
        error: "Invalid URL format",
      }),
    }),
  }
)

// Endpoint to redirect to the original URL
app.get(
  "/:shortCode",
  async ({ params, set }) => {
    const link = await prisma.link.findUnique({
      where: {
        shortCode: params.shortCode,
      },
    });

    if (!link) {
      set.status = 404;
      return { message: "Short URL not found" };
    }
    set.status = 302;
    set.headers['Location'] = link.longUrl;
    return;
  },

  {
    params: t.Object({
      shortCode: t.String({
        minLength: 1,
        maxLength: 10,
        error: "Invalid short code",
      }),
    }),
  }
);

import { createServer } from "http";

const server = createServer(app.fetch);
server.listen(3000, () => {
  console.log(`URL Shortener service is running on http://localhost:3000`);
});