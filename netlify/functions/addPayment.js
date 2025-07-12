import { Client } from "pg";

export async function handler(event, context) {
  const { staffId, season, totalAmount, helpers } = JSON.parse(event.body);

  // Validate inputs
  if (!staffId || !season) {
    return { statusCode: 400, body: "Missing staffId or season" };
  }

  // Ensure helpers and totalAmount are treated as numbers (optional, but good practice)
  const amount = Number(totalAmount);
  const helpersCount = Number(helpers);

  if (isNaN(amount) || isNaN(helpersCount)) {
    return { statusCode: 400, body: "Invalid numeric values for totalAmount or helpers" };
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
      [staffId, season, amount, helpersCount]
    );

    await client.end();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res.rows[0]),
    };
  } catch (error) {
    console.error("Database error in addPayment.js:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
