const baseApiUrl = "http://localhost:3050/api";

export const getAllShifts = async () => {
  try {
    const response = await fetch(`${baseApiUrl}/shifts`);
    return response.json();
  } catch (error) {
    console.log("Error running getAllShifts", error);
  }
};

export const calculateOverlapBetweenShifts = async (shiftOneId, shiftTwoId) => {
  try {
    const response = await fetch(`${baseApiUrl}/overlap/`, {
      method: "POST", 
      mode: "cors", 
      cache: "no-cache", 
      credentials: "same-origin", 
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", 
      referrerPolicy: "no-referrer",
      body: JSON.stringify({ shiftOneId, shiftTwoId }),
    });
    return response.json();
  } catch (error) {
    console.log("Error running calculateOverlapBetweenShifts", error);
  }
};

export const getRemainingSpotsRequest = async () => {
  try {
    const response = await fetch(`${baseApiUrl}/remainingSpots`);
    return response.json();
  } catch (error) {
    console.log("Error running getRemainingSpotsRequest", error);
  }
};

export const getCoworkersRequest = async () => {
  try {
    const response = await fetch(`${baseApiUrl}/coworkers`);
    return response.json();
  } catch (error) {
    console.log("Error running getCoworkersRequest", error);
  }
};

