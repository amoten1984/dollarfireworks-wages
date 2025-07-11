
import { Client } from "pg";

export async function handler(event, context) {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM locations ORDER BY name ASC");
    await client.end();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}
