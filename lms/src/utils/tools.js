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