import { Client } from "pg";

export async function handler(event, context) {
  const staffId = event.queryStringParameters.staffId;
  if (!staffId) {
    return { statusCode: 400, body: "Missing staffId" };
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const res = await client.query(
      "SELECT * FROM payments WHERE staff_id = $1 ORDER BY id DESC LIMIT 1",
      [staffId]
    );

    await client.end();

    const payment = res.rows[0] || null;

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(payment ? {
        ...payment,
        helpers: payment.helpers ?? 0  // Ensure helpers defaults to 0 if null
      } : {}),
    };
  } catch (error) {
    console.error("Database error:", error);
    await client.end();
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
