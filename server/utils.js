const getDateTime = (date, time) => {
  const timeSplit = time.split(":");
  return date.setHours(parseInt(timeSplit[0]), parseInt(timeSplit[1]));
};

const getOverlapBetweenTwoShifts = (start1, end1, start2, end2) => {
  const overlapInMilliseconds = Math.max(
    0,
    Math.min(end1, end2) - Math.max(start1, start2) + 1
  );
  return Math.floor((overlapInMilliseconds / 1000 / 60) << 0);
};

module.exports = {
    getDateTime, 
    getOverlapBetweenTwoShifts
}