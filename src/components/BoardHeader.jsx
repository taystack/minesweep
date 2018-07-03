import React from "react";
import Timer from "./Timer";


const BoardHeader = ({
  changeBoard,
  flags,
  gameOver,
  mapSize,
  mineCount,
  newGame,
  pause,
  paused,
  resume,
  seconds
}) => {
  return (
    <div id="board-header">
      <h1>MineSweeper</h1>
      <div id="board-sizes" className="center">
        <button className={mapSize === "small" ? "active" : ""} onClick={changeBoard("small")}>SMALL</button>
        <button className={mapSize === "medium" ? "active" : ""} onClick={changeBoard("medium")}>MEDIUM</button>
        <button className={mapSize === "large" ? "active" : ""} onClick={changeBoard("large")}>LARGE</button>
      </div>
      <div className="center mt">
        <div>
          <span role="img" aria-label="Flags:">🚩</span> {flags}/{mineCount}
        </div>
        <Timer seconds={seconds} />
      </div>
      {gameOver && <button onClick={newGame}>New Game</button>}
      {!gameOver && !paused && <button onClick={pause}>Pause</button>}
      {!gameOver && paused && <button onClick={resume}>Resume</button>}
    </div>
  );
};


export default BoardHeader;
