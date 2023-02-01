const config = require("./config");

// Express Application setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { getDateTime, getOverlapBetweenTwoShifts } = require("./utils");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const { Pool } = require("pg");

const pgClient = new Pool({
  user: config.pgUser,
  host: config.pgHost,
  database: config.pgDatabase,
  password: config.pgPassword,
  port: config.pgPort,
});

// Express route definition
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/shifts", async (req, res) => {
  try {
    const allShifts = await pgClient.query(
      "SELECT * FROM public.question_one_shifts"
    );
    res.send(200, allShifts.rows);
  } catch (error) {
    console.log("Error occured while executing get all shifts", error);
  }
});

app.post("/overlap", async (req, res) => {
  // Validation
  if (!req.body.shiftOneId || !req.body.shiftTwoId) {
    res.send(400, {
      message: "You need to provide values for both shiftOneId and shiftTwoId",
    });

    return;
  }

  try {
    const shiftOneId = req.body.shiftOneId;
    const shiftTwoId = req.body.shiftTwoId;

    const shiftOneQuery = await pgClient.query(
      `SELECT * FROM public.question_one_shifts WHERE shift_id = ${shiftOneId}`
    );

    const shiftTwoQuery = await pgClient.query(
      `SELECT * FROM public.question_one_shifts WHERE shift_id = ${shiftTwoId}`
    );

    if (shiftOneQuery.rows[0] && shiftTwoQuery.rows[0]) {
      const shiftOne = shiftOneQuery.rows[0];
      const shiftTwo = shiftTwoQuery.rows[0];

      let maximumOverlapThresholdInMinutes = 0;

      if (shiftOne.facility_id == shiftTwo.facility_id) {
        maximumOverlapThresholdInMinutes = 30;
      }

      const shiftOneStartTime = getDateTime(
        new Date(shiftOne.shift_date),
        shiftOne.start_time
      );
      const shiftOneEndTime = getDateTime(
        new Date(shiftOne.shift_date),
        shiftOne.end_time
      );
      const shiftTwoStartTime = getDateTime(
        new Date(shiftOne.shift_date),
        shiftTwo.start_time
      );
      const shiftTwoEndTime = getDateTime(
        new Date(shiftOne.shift_date),
        shiftTwo.end_time
      );

      const overlapMinutes = getOverlapBetweenTwoShifts(
        shiftOneStartTime,
        shiftOneEndTime,
        shiftTwoStartTime,
        shiftTwoEndTime
      );

      res.send(200, {
        overlapMinutes,
        maximumOverlapThresholdInMinutes,
        exceedsOverlapThreshold:
          maximumOverlapThresholdInMinutes < overlapMinutes,
      });
    } else {
      throw new Error("Cound now find one or both of the provided shift_ids");
    }
  } catch (error) {
    console.log("Error occured while executing overlap calculation", error);
    res.send(500, {
      message: "There was error calculating overlaps for the provided shifts",
    });
  }
});

app.get("/remainingSpots", async (req, res) => {
  try {
    const query = `
SELECT j.job_id, j.facility_id, j.nurse_type_needed as nurse_type, j.total_number_nurses_needed - nhjb.hired_count as remaining_spots from jobs as j
INNER JOIN (SELECT job_id, COUNT(nurse_id) as hired_count from nurse_hired_jobs GROUP BY job_id) nhjb
ON j.job_id = nhjb.job_id
ORDER BY j.facility_id ASC,  j.nurse_type_needed ASC`;
    const remainingSpots = await pgClient.query(query);
    res.send(200, remainingSpots.rows);
  } catch (error) {
    console.log("Error occured while executing get remainingSpots", error);
  }
});

app.get("/coworkers", async (req, res) => {
  try {
    const query = `
SELECT DISTINCT nurse_name FROM nurse_hired_jobs
INNER JOIN jobs ON jobs.job_id = nurse_hired_jobs.job_id
INNER JOIN nurses on nurse_hired_jobs.nurse_id = nurses.nurse_id
WHERE nurses.nurse_name != 'Anne' and jobs.facility_id = (SELECT facility_id FROM nurse_hired_jobs
INNER JOIN jobs ON jobs.job_id = nurse_hired_jobs.job_id
INNER JOIN nurses on nurse_hired_jobs.nurse_id = nurses.nurse_id
WHERE nurse_name='Anne');
`;
    const coworkers = await pgClient.query(query);
    res.send(200, coworkers.rows);
  } catch (error) {
    console.log("Error occured while executing get coworkers", error);
  }
});

app.listen(5050, (err) => {
  console.log("Listening");
});
