import { Client } from "pg";

export async function handler(event, context) {
  const locationId = event.queryStringParameters.locationId;
  if (!locationId) {
    return { statusCode: 400, body: "Missing locationId" };
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
    s.name AS name,  -- <--- change this line back to 'name'
    l.name AS location_name
  FROM
    staff s
  LEFT JOIN
    locations l ON s.location_id = l.id
  WHERE
    s.location_id = $1
  `,
  [locationId]
);

    await client.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error("Database error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
