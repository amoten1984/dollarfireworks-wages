
import { Client } from "pg";

export async function handler(event, context) {
  const { staffId, workDate, hoursWorked } = JSON.parse(event.body);
  if (!staffId || !workDate || !hoursWorked) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_tNd31KzYaoOr@ep-wild-tooth-aebujiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      "INSERT INTO attendance (staff_id, work_date, hours_worked) VALUES ($1, $2, $3) RETURNING *",
      [staffId, workDate, hoursWorked]
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
