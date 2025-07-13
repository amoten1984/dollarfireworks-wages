import { Client } from "pg";

export async function handler(event, context) {
  const staffId = event.queryStringParameters.staffId;
  const locationId = event.queryStringParameters.locationId;

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    let res;
    let responseBody;

    if (staffId) {
      res = await client.query(
        `SELECT staff.*, locations.name as location_name
         FROM staff
         LEFT JOIN locations ON staff.location_id = locations.id
         WHERE staff.id = $1
         LIMIT 1`, [staffId]);
      responseBody = res.rows[0] || {};  // ✅ Return object if querying by staffId
    } else if (locationId) {
      res = await client.query(
        `SELECT staff.*, locations.name as location_name
         FROM staff
         LEFT JOIN locations ON staff.location_id = locations.id
         WHERE staff.location_id = $1`, [locationId]);
      responseBody = res.rows || [];
    } else {
      res = await client.query(
        `SELECT staff.*, locations.name as location_name
         FROM staff
         LEFT JOIN locations ON staff.location_id = locations.id`);
      responseBody = res.rows || [];
    }

    await client.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error("Database error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
