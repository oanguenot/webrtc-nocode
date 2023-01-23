import "./App.css";
import "./resources/beautify.css";
import { useEffect, useRef, useState, useReducer } from "react";
import AppContext from "./contexts/appContext";
import { appReducer, initialAppState } from "./reducers/appReducer";
import Microphone from "./components/objects/Microphone";
import User from "./components/objects/User";
import Camera from "./components/objects/Camera";
import Turn from "./components/objects/Turn";
import MenuItem from "./components/MenuItem";
import Properties from "./components/properties/Properties";
import { addObject, clearSelection, select } from "./actions/objectActions";
import { getInitialPosition } from "./utils/editor";

let editor = null;
const Drawflow = window.Drawflow;
let mobile_item_selec = "";
let mobile_last_move = null;

function positionMobile(ev) {
  mobile_last_move = ev;
}

function App() {
  const [appState, dispatch] = useReducer(appReducer, initialAppState);
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
  const [objects, setObjects] = useState(appState.objects);

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

  useEffect(() => {
    if (appState.lastAdded) {
      const objects = editor.getNodesFromName(appState.lastAdded.name);

      const objectFound = objects.find(
        (object) => object.id === appState.lastAdded.id
      );

      if (!objectFound) {
        editor.addNode(
          appState.lastAdded.properties["name"].value,
          appState.lastAdded.inputs,
          appState.lastAdded.outputs,
          appState.lastAdded.x,
          appState.lastAdded.y,
          appState.lastAdded.properties["name"].value,
          { id: appState.lastAdded.id },
          appState.lastAdded.render(),
          false
        );
      }
    }
  }, [appState.objects, appState.lastAdded]);

  useEffect(() => {
    setObjects(appState.objects);
  }, [appState.objects]);

  const addFlowEvents = () => {
    editor.on("nodeCreated", function (id) {
      console.log("Node created " + id);
    });

    editor.on("nodeRemoved", function (id) {
      console.log("Node removed " + id);
    });

    editor.on("nodeSelected", async function (id) {
      const uuid = editor.getNodeFromId(id).data.id;
      await select(uuid, dispatch);
    });

    editor.on("nodeUnselected", async function (id) {
      await clearSelection(dispatch);
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

  const addNodeToDrawFlow = async (name, posX, posY) => {
    if (editor.editor_mode === "fixed") {
      return false;
    }

    const { x, y } = getInitialPosition(editor, posX, posY);
    let component = null;

    switch (name) {
      case "microphone":
        component = new Microphone(x, y);
        break;
      case "camera":
        component = new Camera(x, y);
        break;
      case "user":
        component = new User(x, y);
        break;
      case "turn":
        component = new Turn(x, y);
        break;
    }

    await addObject(component, dispatch);
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
    <AppContext.Provider value={appState}>
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
          </div>
          <div className="col-properties">
            <div className="btn-export">Export</div>
            <div className="btn-clear" onClick={() => onClear()}>
              Clear
            </div>
            <div className="properties-editor">
              <Properties />
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
