const { Elysia, t } = require("elysia");
const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid")

const prisma = new PrismaClient();
const app = new Elysia();

app.post(
  "/shorten",
  async ({ body, set }) => {
    const shortCode = nanoid(8);

    try {
      const newUrl = await prisma.url.create({
        data: {
          shortCode: shortCode,
          longUrl: body.longUrl
        }
      });
      set.status = 201;
      return { shortUrl: `http://localhost:3000/${newUrl.shortCode}` };
    } catch (error) {
      console.log(error);
    }
  },
)