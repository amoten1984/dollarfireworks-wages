import { Client } from "pg";

export async function handler(event, context) {
  const staffId = event.queryStringParameters.staffId;
  if (!staffId) {
    console.error("Missing staffId in request");
    return { statusCode: 400, body: "Missing staffId" };
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const sql = "SELECT id, staff_id, season, total_amount AS total_payment, helpers FROM payments WHERE staff_id = $1 ORDER BY id DESC LIMIT 1";

    console.log("Running SQL:", sql, "with staffId:", staffId);

    const res = await client.query(sql, [staffId]);

    console.log("Query result:", res.rows);

    await client.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res.rows[0] || {}),
    };
  } catch (error) {
    console.error("Database error:", error.message, error.stack);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error", details: error.message }) };
  }
}
