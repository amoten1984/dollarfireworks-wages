import { Client } from "pg";

export async function handler(event, context) {
  console.log("Incoming request body:", event.body);

  let staffId, season, totalAmount, helpers;
  try {
    const body = JSON.parse(event.body);
    staffId = body.staffId;
    season = body.season;
    totalAmount = body.totalAmount;
    helpers = body.helpers;
  } catch (parseError) {
    console.error("Failed to parse JSON:", parseError);
    return { statusCode: 400, body: "Invalid JSON" };
  }

  console.log("Parsed fields:", { staffId, season, totalAmount, helpers });

  if (!staffId || !season || totalAmount == null || helpers == null) {
    console.log("Missing required fields");
    return { statusCode: 400, body: "Missing required fields" };
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL ✅");

    const query = `
      INSERT INTO payments (staff_id, season, total_amount, helpers)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (staff_id, season)
      DO UPDATE SET total_amount = $3, helpers = $4
      RETURNING *;
    `;

    const values = [staffId, season, totalAmount, helpers];
    console.log("Executing query:", query);
    console.log("With values:", values);

    const res = await client.query(query, values);
    console.log("Query successful, result:", res.rows[0]);

    await client.end();
    console.log("PostgreSQL connection closed 🔒");

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res.rows[0]),
    };
  } catch (error) {
    console.error("Database error:", error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
}
