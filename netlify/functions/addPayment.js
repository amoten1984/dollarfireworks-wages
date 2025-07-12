import { Client } from "pg";

export async function handler(event, context) {
  const { staffId, season, totalAmount, helpers } = JSON.parse(event.body);
  if (!staffId || !season || totalAmount == null || helpers == null) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      `
      INSERT INTO payments (staff_id, season, total_amount, helpers)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (staff_id, season)
      DO UPDATE SET total_amount = $3, helpers = $4
      RETURNING *;
      `,
      [staffId, season, totalAmount, helpers]
    );
    await client.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res.rows[0]),
    };
  } catch (error) {
    console.error("Database error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
