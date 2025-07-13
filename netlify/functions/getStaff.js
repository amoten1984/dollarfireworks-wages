
import { Client } from "pg";

export async function handler(event, context) {
  const staffId = event.queryStringParameters.staffId;
  const locationId = event.queryStringParameters.locationId;  // optional now

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    let res;
    if (staffId) {
      res = await client.query(
        \`SELECT staff.*, locations.name as location_name
         FROM staff
         LEFT JOIN locations ON staff.location_id = locations.id
         WHERE staff.id = $1
         LIMIT 1\`, [staffId]);
    } else if (locationId) {
      res = await client.query(
        \`SELECT staff.*, locations.name as location_name
         FROM staff
         LEFT JOIN locations ON staff.location_id = locations.id
         WHERE staff.location_id = $1\`, [locationId]);
    } else {
      res = await client.query(
        \`SELECT staff.*, locations.name as location_name
         FROM staff
         LEFT JOIN locations ON staff.location_id = locations.id\`);
    }

    await client.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res.rows || []),
    };
  } catch (error) {
    console.error("Database error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
