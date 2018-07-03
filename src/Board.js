import React, { Component } from "react";
import { get } from "lodash";
import BoardHeader from "./components/BoardHeader";
import Standings from "./components/Standings";
import "./styles/Board.css";


const getSaves = () => {
  let saves = sessionStorage.getItem("minesweeper");
  if (saves) {
    return JSON.parse(saves);
  }
  return {
    small: [],
    medium: [],
    large: [],
  };
};

const updateSaves = (saves) => {
  const strSaves = JSON.stringify(saves);
  sessionStorage.setItem("minesweeper", strSaves);
};

/*
Each Square should know its neighbors
nw, n, ne, e, se, s, sw, w
*/

class Board extends Component {
  static boardTypes = {
    small: {
      rows: 8,
      columns: 8,
      mineCount: 10,
    },
    medium: {
      rows: 16,
      columns: 16,
      mineCount: 40,
    },
    large: {
      rows: 16,
      columns: 30,
      mineCount: 99,
    },
  }

  constructor() {
    super();
    this.checked = 0;
    this.squares = {};
    this.mineCount = 0;

    this.state = {
      checked: 0,
      flags: 0,
      mapSize: "small",
      squares: {},
      win: false,
      paused: true,
      saves: getSaves(),
      seconds: 0,
    };

    this.changeMap = this.changeMap.bind(this);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.newBoard = this.newBoard.bind(this);
    this.pauseGame = this.pauseGame.bind(this);
    this.startTimer = this.startTimer.bind(this);
  }

  componentWillMount() {
    this.newBoard();
  }

  resetState() {
    this.setState({
      checked: 0,
      flags: 0,
      gameOver: false,
      mineCount: this.mineCount,
      paused: false,
      seconds: 0,
      squares: this.squares,
      win: false,
    });
  }

  newBoard() {
    this.mineCount = 0;
    this.squares = {};
    this.checked = 0;
    const board = Board.boardTypes[this.state.mapSize];
    (Array(board.rows).fill(1)).forEach((n, i) => {
      (Array(board.columns).fill(1)).forEach((nn, ii) => {
        if (!this.squares[i]) {
          this.squares[i] = {};
        }
        this.squares[i][ii] = {
          checked: false,
          count: 0,
          flagged: false,
          hasMine: false,
          x: i,
          y: ii,
        };
      });
    });
    this.placeMines(board);
    this.resetState();
  }

  startTimer() {
    this.setState({ paused: false });
    this.timer = setInterval(() => {
      let seconds = this.state.seconds;
      seconds += 1;
      this.setState({ seconds });
    }, 1000);
  }

  pauseGame() {
    clearInterval(this.timer);
    this.setState({ paused: true });
  }

  changeMap(mapSize) {
    return () => {
      this.setState({ mapSize }, this.newBoard);
    };
  }

  placeMines(board) {
    (Array(board.mineCount).fill(1)).forEach(() => {
      let found = false;
      while (!found) {
        const i = Math.floor(Math.random() * board.rows);
        const ii = Math.floor(Math.random() * board.columns);
        if (!this.squares[i][ii].hasMine) {
          this.squares[i][ii].hasMine = true;
          this.mineCount++;
          this.traverseNeighbors(i, ii, (square) => {
            square.count += 1;
          });
          found = true;
        }
      }
    });
  }

  traverseNeighbors(i, ii, fn) {
    /*
    [i - 1, i, i + 1], [ii - 1, ii, ii + 1]
    */
    ([Number(i) - 1, i, Number(i) + 1]).forEach((j) => {
      if (this.squares[j]) {
        ([Number(ii) - 1, ii, Number(ii) + 1]).forEach((jj) => {
          if (this.squares[j][jj]) {
            fn(this.squares[j][jj]);
          }
        });
      }
    });
  }

  traverseOrthogonals(square) {
    const l = get(this.squares, [square.x, square.y - 1], false);
    const r = get(this.squares, [square.x, square.y + 1], false);
    const t = get(this.squares, [square.x - 1, square.y], false);
    const b = get(this.squares, [square.x + 1, square.y], false);

    if (l) this.checkAndTraverse(l);
    if (r) this.checkAndTraverse(r);
    if (t) this.checkAndTraverse(t);
    if (b) this.checkAndTraverse(b);
  }

  checkAndTraverse(square) {
    if (square.hasMine || square.checked) {
      return;
    }
    square.checked = true;
    this.checked += 1;
    if (square.count) {
      return;
    }
    this.traverseOrthogonals(square);
  }

  saveWin() {
    let mapSaves = this.state.saves[this.state.mapSize];
    mapSaves.push(this.state.seconds);
    mapSaves.sort((lhs, rhs) => (lhs > rhs));
    if (mapSaves.length > 10) {
      mapSaves.pop();
    }
    const saves = {
      ...this.state.saves,
      [this.state.mapSize]: mapSaves,
    };
    debugger;
    this.setState({ saves }, () => {
      updateSaves(this.state.saves);
    });
  }

  checkWin() {
    const board = Board.boardTypes[this.state.mapSize];
    const safeSquares = board.rows * board.columns - board.mineCount;
    if (this.state.checked === safeSquares) {
      this.setState({ gameOver: true, win: true });
      clearInterval(this.timer);
      this.saveWin();
    }
  }

  handleSquareClick(i, ii, square) {
    return (event) => {
      if (square.hasFlag || this.state.gameOver) return;
      if (square.hasMine) {
        this.squares[i][ii].bombed = true;
        this.setState({ gameOver: true, squares: this.squares });
        clearInterval(this.timer);
        return;
      }

      if (this.checked === 0) {
        this.startTimer();
      }

      this.checkAndTraverse(square);
      this.setState({
        squares: this.squares,
        checked: this.checked,
      }, this.checkWin);
    }
  }

  placeFlag(x, y) {
    return (event) => {
      event.preventDefault();
      if (this.squares[x][y].checked) return;
      let flags = this.state.flags;
      if (this.squares[x][y].hasFlag) {
        flags -= 1;
        this.squares[x][y].hasFlag = false;
      } else {
        flags += 1;
        this.squares[x][y].hasFlag = true;
      }
      this.setState({ squares: this.squares, flags });
    }
  }

  drawSquares(i, squares) {
    return Object.keys(squares).map((ii) => {
      let number;
      if (squares[ii].hasMine && this.state.gameOver) number = "💣";
      let cls = "";
      if (squares[ii].bombed) {
        cls += " bombed";
      }
      if (squares[ii].checked) {
        cls = " checked";
        const count = squares[ii].count;
        number = count ? count : "";
      }
      if (squares[ii].hasFlag) {
        number = "🚩";
      }
      return (
        <div
          key={ii}
          onClick={this.handleSquareClick(i, ii, squares[ii])}
          onContextMenu={this.placeFlag(i , ii)}
          className={`Square ${cls} mine-${number}`}
        >{number}</div>
      )
    });
  }

  drawMap() {
    return Object.keys(this.state.squares).map((i) => {
      const squares = this.drawSquares(i, this.state.squares[i]);
      return (
        <div className="Row" key={i}>
          {squares}
        </div>
      );
    });
  }

  render() {
    const map = this.drawMap();
    return (
      <div>
        <BoardHeader
          changeBoard={this.changeMap}
          seconds={this.state.seconds}
          newGame={this.newBoard}
          gameOver={this.state.gameOver}
          flags={this.state.flags}
          mineCount={this.state.mineCount}
          pause={this.pauseGame}
          paused={this.state.paused}
          resume={this.startTimer}
          mapSize={this.state.mapSize}
        />
        <div className="Board" id="Board">
          {map}
        </div>
        <Standings saves={this.state.saves} />
      </div>
    );
  }
}

export default Board;
