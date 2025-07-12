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
      `
      SELECT
        s.id,
        s.name AS staff_name,
        l.name AS location_name
      FROM
        staff s
      LEFT JOIN
        locations l ON s.location_id = l.id
      WHERE
        s.id = $1
      `,
      [staffId]
    );
    await client.end();

    if (res.rows.length === 0) {
      return { statusCode: 404, body: "Staff not found" };
    }

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
