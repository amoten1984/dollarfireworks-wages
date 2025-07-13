// 📄 updatePaymentSeasonAndAttendance.js

const db = require("./_db");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const staffId = body.staffId;
    const season = body.season;
    const records = body.records || body.attendance || [];

    if (!staffId || !season || !records.length) {
      return { statusCode: 400, body: "Missing data" };
    }

    // Update payment season for this staff's most recent payment
    await db.query(
      `UPDATE payments SET season = $1 WHERE staff_id = $2`,
      [season, staffId]
    );

    // Insert all attendance records
    for (const record of records) {
      await db.query(
        `INSERT INTO attendance (id, staff_id, work_date, hours_worked)
         VALUES (uuid_generate_v4(), $1, $2, $3)`,
        [staffId, record.date, record.hours]
      );
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error("Error in updatePaymentSeasonAndAttendance:", err);
    return { statusCode: 500, body: "Internal server error" };
  }
};
