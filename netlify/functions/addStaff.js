
import { Client } from "pg";

export async function handler(event, context) {
  const { name, locationId } = JSON.parse(event.body);
  if (!name || !locationId) {
    return { statusCode: 400, body: "Missing name or locationId" };
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      "INSERT INTO staff (name, location_id) VALUES ($1, $2) RETURNING *",
      [name.trim(), locationId]
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
