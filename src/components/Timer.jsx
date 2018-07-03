import React from "react";


export const padZero = (time) => {
  let strTime = time.toString();
  if (strTime.length === 1) {
    strTime = `0${strTime}`;
  }
  return strTime;
}

export const formatTime = (seconds) => {
  const min = padZero(Math.floor(seconds / 60));
  const sec = padZero(seconds % 60);
  return `${min}:${sec}`;
}


const Timer = ({ seconds }) => {
  const time = formatTime(seconds);
  return (
    <div id="timer"><span role="img" aria-label="Time:">⏱</span> {time}</div>
  );
};


export default Timer;
