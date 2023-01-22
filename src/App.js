import Drawflow from "drawflow";

import "./App.css";
import "./resources/beautify.css";
import { useEffect, useRef } from "react";

let editor = null;

function App() {
  const drawFlowElt = useRef(null);
  const lock = useRef(null);
  const unlock = useRef(null);

  useEffect(() => {
    editor = new Drawflow(drawFlowElt.current);
    editor.start();
  }, []);

  const allowDrop = (event) => {
    event.preventDefault();
  };

  const onDrop = () => {};

  const onClear = () => {
    editor.clearModuleSelected();
  };

  const onLock = () => {
    editor.editor_mode = "fixed";
    changeMode("lock");
  };

  const onUnlock = () => {
    editor.editor_mode = "edit";
    changeMode("unlock");
  };

  const onZoomIn = () => {
    editor.zoom_in();
  };

  const onZoomOut = () => {
    editor.zoom_out();
  };

  const onZoomReset = () => {
    editor.zoom_reset();
  };

  const changeMode = (option) => {
    if (option === "lock") {
      lock["style"].display = "none";
      unlock["style"].display = "block";
    } else {
      lock["style"].display = "block";
      unlock["style"].display = "none";
    }
  };

  return (
    <div className="App">
      <div className="wrapper">
        <div className="col"></div>
        <div className="col-right">
          <div className="menu">
            <ul>
              <li className="selected">Home</li>
            </ul>
          </div>
          <div
            id="drawflow"
            ref={drawFlowElt}
            onDrop={(event) => onDrop(event)}
            onDragOver={(event) => allowDrop(event)}
          ></div>
          <div className="btn-export">Export</div>
          <div className="btn-clear" onClick={() => onClear()}>
            Clear
          </div>
          <div className="btn-lock">
            <i
              id="lock"
              ref={lock}
              className="fas fa-lock"
              onClick={() => {
                onLock();
              }}
            ></i>
            <i
              id="unlock"
              ref={unlock}
              className="fas fa-lock-open"
              onClick={() => {
                onUnlock();
              }}
              style={{ display: "none" }}
            ></i>
          </div>
          <div className="bar-zoom">
            <i className="fas fa-search-minus" onClick={() => onZoomOut()}></i>
            <i className="fas fa-search" onClick={() => onZoomReset()}></i>
            <i className="fas fa-search-plus" onClick={() => onZoomIn()}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
