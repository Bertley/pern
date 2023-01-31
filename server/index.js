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

app.listen(5050, (err) => {
  console.log("Listening");
});
