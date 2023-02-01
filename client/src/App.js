import "./App.css";
import React, { useCallback, useEffect, useState } from "react";
import { getAllShifts, calculateOverlapBetweenShifts, getRemainingSpotsRequest, getCoworkersRequest } from "./services/index";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const facilityIdNameMap = {
  100: "Facility A",
  101: "Facility B",
  102: "Facility C",
};

function App() {
  const [shifts, setShifts] = useState([]);
  const [selectedShiftIds, setSelectedShiftIds] = useState([]);
  const [overlapResult, setOverlapResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const fetchShifts = async () => {
    const shifts = await getAllShifts();
    if (shifts.length) {
      setShifts(shifts);
    }
  };


  const addSelectedShift = useCallback((selectedShiftId) => {
    setSelectedShiftIds((prev) => {
      setShowAlert(false);
      if (prev.includes(selectedShiftId)) {
        const update = [];
        for (const item of prev) {
          if (item !== selectedShiftId) {
            update.push(item);
          }
        }
        return update;
      } else if (prev.length === 2) {
        return [prev[1], selectedShiftId];
      } else {
        return [...prev, selectedShiftId];
      }
    });
  }, []);

  const calculateOverlap = useCallback(async () => {
    if (selectedShiftIds.length < 2) {
      setShowAlert(true);
    } else {
      const overlapResult = await calculateOverlapBetweenShifts(
        selectedShiftIds[0],
        selectedShiftIds[1]
      );

      if (overlapResult) {
        setOverlapResult(overlapResult);
      }
    }
  }, [selectedShiftIds]);

  const getRemainingSpots = useCallback(async () => {
    const remainSpots = await getRemainingSpotsRequest();
    console.log('-----> Remaining Spots', remainSpots)
  }, [])

  const getCoworkers = useCallback(async () => {
    const coworkers = await getCoworkersRequest();
    console.log("-----> Anne's coworkers", coworkers)
  }, [])

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <div className="App">
      <Container
        style={{
          paddingTop: 50,
        }}
      >
        <Stack gap={4}>
          {showAlert && (
            <Row>
              <Alert variant="danger">
                You need to select two shift to compare
              </Alert>
            </Row>
          )}
          <Row>
            <Col sm={8}>
              <h2>{`Overlap Minutes: ${
                overlapResult?.overlapMinutes ?? ""
              }`}</h2>
              <h2>{`Max Overlap Threshold: ${
                overlapResult?.maximumOverlapThresholdInMinutes ?? ""
              }`}</h2>
              <h2>{`Exceeds Overlap Threshold: ${
                overlapResult?.exceedsOverlapThreshold ?? ""
              }`}</h2>
            </Col>
            <Col sm={4}>
              <Button onClick={calculateOverlap} variant="primary">
                Submit
              </Button>
            </Col>
          </Row>
          <Row>
            {shifts.map((item, index) => (
              <Col key={index} xs={6} md={4}>
                <Card
                  style={{
                    width: "18rem",
                    backgroundColor: selectedShiftIds.includes(item.shift_id)
                      ? "grey"
                      : "white",
                    marginTop: 30,
                  }}
                  onClick={() => addSelectedShift(item.shift_id)}
                >
                  <Card.Body>
                    <Card.Title>
                      {facilityIdNameMap[item.facility_id]}
                    </Card.Title>
                    <Card.Text>{`Date: ${item.shift_date}`}</Card.Text>
                    <Card.Text>
                      {`Period: ${item.start_time} -  ${item.end_time}`}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row>
            <Col xs={6} md={4}>
              <Button onClick={getRemainingSpots} variant="primary">
                Get Remaining Spots
              </Button>
            </Col>
            <Col xs={6} md={4}>
              <Button onClick={getCoworkers} variant="primary">
                Get Co-workers
              </Button>
            </Col>
          </Row>
        </Stack>
      </Container>
    </div>
  );
}

export default App;
