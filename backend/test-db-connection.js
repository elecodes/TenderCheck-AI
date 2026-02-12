import { createClient } from "@libsql/client";

try {
  const db = createClient({
    url: ":memory:",
  });
  await db.execute("CREATE TABLE foo (id INT)");
  await db.execute("INSERT INTO foo VALUES (1)");
  const res = await db.execute("SELECT * FROM foo");
  console.log("Success:", res.rows);
} catch (e) {
  console.error("Error:", e);
}
