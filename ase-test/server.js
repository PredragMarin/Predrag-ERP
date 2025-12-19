const express = require("express");
const cors = require("cors");
const odbc = require("odbc");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// (opcijski) health check
app.get("/", (req, res) => res.send("OK"));

app.post("/run-query", async (req, res) => {
  const { sql } = req.body || {};

  if (!sql) {
    return res.status(400).json({ error: "sql je obavezan" });
  }

  // u test modu dopuštamo samo SELECT
  if (!/^select\b/i.test(String(sql).trim())) {
    return res.status(400).json({ error: "Dopušten je samo SELECT." });
  }

  let conn;
  try {
    // DSN već sadrži sve parametre (uključivo login, ako si ga spremio u DSN)
    const connStr = "DSN=Test_64";
    conn = await odbc.connect(connStr);

    const rows = await conn.query(sql);
    res.json({ rows });
  } catch (err) {
    console.error("ODBC ERROR:", err);
    res.status(500).json({
      error: "DB connect/query failed",
      message: err?.message || String(err),
      odbcErrors: err?.odbcErrors || null
    });
  } finally {
    if (conn) {
      try { await conn.close(); } catch {}
    }
  }
});

app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});
