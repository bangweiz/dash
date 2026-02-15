/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { Dashboard } from "../views/Dashboard";
import { docsetService } from "../services/docsetService";

const app = new Hono();

app.get("/", async (c) => {
  const docsets = await docsetService.getDocsets();
  return c.html((<Dashboard docsets={docsets} />).toString());
});

app.get("/dashboard", async (c) => {
  return c.redirect("/");
});

export default app;
