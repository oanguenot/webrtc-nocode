import "./App.css";
import "./resources/beautify.css";
import { useEffect, useRef, useState } from "react";
import Microphone from "./components/objects/Microphone";
import User from "./components/objects/User";
import Camera from "./components/objects/Camera";
import Turn from "./components/objects/Turn";
import MenuItem from "./components/MenuItem";

let editor = null;
const Drawflow = window.Drawflow;
let mobile_item_selec = "";
let mobile_last_move = null;

function positionMobile(ev) {
  mobile_last_move = ev;
}

function App() {
  const drawFlowElt = useRef(null);
  const lock = useRef(null);
  const unlock = useRef(null);

  const [menuItems, setMenuItems] = useState([
    "microphone",
    "camera",
    "user",
    "stun",
    "turn",
  ]);

  useEffect(() => {
    if (!editor) {
      editor = new Drawflow(drawFlowElt.current);
      editor.reroute = true;
      editor.start();
      addFlowEvents();

      let elements = document.getElementsByClassName("drag-drawflow");
      for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener("touchend", onDrop, false);
        elements[i].addEventListener("touchmove", positionMobile, false);
        elements[i].addEventListener("touchstart", onDrop, false);
      }
    }
  }, []);

  const addFlowEvents = () => {
    editor.on("nodeCreated", function (id) {
      console.log("Node created " + id);
    });

    editor.on("nodeRemoved", function (id) {
      console.log("Node removed " + id);
    });

    editor.on("nodeSelected", function (id) {
      console.log("Node selected " + id);
    });

    editor.on("moduleCreated", function (name) {
      console.log("Module Created " + name);
    });

    editor.on("moduleChanged", function (name) {
      console.log("Module Changed " + name);
    });

    editor.on("connectionCreated", function (connection) {
      console.log("Connection created");
      console.log(connection);
    });

    editor.on("connectionRemoved", function (connection) {
      console.log("Connection removed");
      console.log(connection);
    });

    editor.on("mouseMove", function (position) {
      //console.log("Position mouse x:" + position.x + " y:" + position.y);
    });

    editor.on("nodeMoved", function (id) {
      console.log("Node moved " + id);
    });

    editor.on("zoom", function (zoom) {
      console.log("Zoom level " + zoom);
    });

    editor.on("translate", function (position) {
      console.log("Translate x:" + position.x + " y:" + position.y);
    });

    editor.on("addReroute", function (id) {
      console.log("Reroute added " + id);
    });

    editor.on("removeReroute", function (id) {
      console.log("Reroute removed " + id);
    });
  };

  const addNodeToDrawFlow = (name, pos_x, pos_y) => {
    if (editor.editor_mode === "fixed") {
      return false;
    }
    pos_x =
      pos_x *
        (editor.precanvas.clientWidth /
          (editor.precanvas.clientWidth * editor.zoom)) -
      editor.precanvas.getBoundingClientRect().x *
        (editor.precanvas.clientWidth /
          (editor.precanvas.clientWidth * editor.zoom));
    pos_y =
      pos_y *
        (editor.precanvas.clientHeight /
          (editor.precanvas.clientHeight * editor.zoom)) -
      editor.precanvas.getBoundingClientRect().y *
        (editor.precanvas.clientHeight /
          (editor.precanvas.clientHeight * editor.zoom));

    let component = null;

    switch (name) {
      case "microphone":
        component = new Microphone();
        break;
      case "camera":
        component = new Camera();
        break;
      case "user":
        component = new User();
        break;
      case "turn":
        component = new Turn();
        break;
    }

    if (component) {
      editor.addNode(
        component.name,
        component.inputs,
        component.outputs,
        pos_x,
        pos_y,
        component.name,
        { component },
        component.render(),
        false
      );
    }
  };

  const allowDrop = (event) => {
    event.preventDefault();
  };

  const onDrop = (event) => {
    if (event.type === "touchend") {
      let parentdrawflow = document
        .elementFromPoint(
          mobile_last_move.touches[0].clientX,
          mobile_last_move.touches[0].clientY
        )
        .closest("#drawflow");
      if (parentdrawflow != null) {
        addNodeToDrawFlow(
          mobile_item_selec,
          mobile_last_move.touches[0].clientX,
          mobile_last_move.touches[0].clientY
        );
      }
      mobile_item_selec = "";
    } else {
      event.preventDefault();
      var data = event.dataTransfer.getData("node");
      addNodeToDrawFlow(data, event.clientX, event.clientY);
    }
  };

  const onDrag = (event) => {
    if (event.type === "touchstart") {
      mobile_item_selec = event.target
        .closest(".drag-drawflow")
        .getAttribute("data-node");
    } else {
      event.dataTransfer.setData(
        "node",
        event.target.getAttribute("data-node")
      );
    }
  };

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
    <div className="global">
      <div className="wrapper">
        <div className="col">
          {menuItems &&
            menuItems.map((menuItem, key) => {
              return new MenuItem({
                name: menuItem,
                icon: menuItem,
                onDrag: onDrag,
                key,
              });
            })}
        </div>
        <div className="col-right">
          <div className="menu">
            <ul>
              <li className="selected">Home</li>
              <li className="selected" onClick={() => onZoomIn()}>
                <i className="fas fa-search-plus" />
              </li>
              <li className="selected" onClick={() => onZoomOut()}>
                <i className="fas fa-search-minus" />
              </li>
              <li className="selected" onClick={() => onZoomReset()}>
                <i className="fas fa-search" />
              </li>
            </ul>
          </div>
          <div
            id="drawflow"
            ref={drawFlowElt}
            onDrop={(event) => onDrop(event)}
            onDragOver={(event) => allowDrop(event)}
          ></div>
          <div className="btn-lock">
            <i
              id="lock"
              ref={lock}
              className="fas fa-search"
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
        </div>
        <div className="col-properties">
          <div className="btn-export">Export</div>
          <div className="btn-clear" onClick={() => onClear()}>
            Clear
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
