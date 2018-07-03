import React from "react";
import { formatTime } from "./Timer";


const Standings = ({ saves }) => {
  const buildColumn = (key, column) => {
    const items = column.map((save, idx) => {
      return (<div className="standing" key={`${idx}-${save}`}>{formatTime(save)}</div>);
    });
    const empty = 10 - column.length;
    new Array(empty).fill(1).forEach((item, idx) => {
      items.push(<div key={idx} className="standing">-</div>);
    });
    return (
      <div key={key} className="standing-column">
        <div className="column-name">{key}</div>
        {items}
      </div>
    );
  };

  const columns = [];
  for (const key in saves) {
    columns.push(buildColumn(key, saves[key]));
  }

  return (
    <div>
      <h3 className="center mt">Standings</h3>
      <div id="standings">
        {columns}
      </div>
    </div>
  );
};

export default Standings;
