import moment from "moment";

export function transformDateTime(createAt) {
  const date = moment(createAt);
  return date.calendar(null, {
    sameDay: "D MMM YYYY",
    lastDay: "D MMM YYYY",
    lastWeek: "D MMM YYYY",
    sameElse: "D MMM YYYY",
  });
}

export function calcTime(time) {
  let timeString = "";
  if (Math.floor(time / 3600) > 0) {
    timeString = timeString + (Math.floor(time / 3600) + " hours ")
  }
  if( (time % 3600) / 60 > 0 ){
    timeString = timeString + (Math.floor((time % 3600) / 60) + " minutes ")
  }
  if( (time % 3600) % 60 > 0 ){
    timeString = timeString + ((time % 3600) % 60) + " seconds"
  }
  return timeString;
}

export function calcTimeBrief(time) {
  let timeString = "";
  if (Math.floor(time / 3600) > 0) {
    timeString = timeString + (Math.floor(time / 3600) + " hours ")
  }
  if( (time % 3600) / 60 > 0 ){
    timeString = timeString + (Math.floor((time % 3600) / 60) + " minutes ")
  }
  return timeString;
}
