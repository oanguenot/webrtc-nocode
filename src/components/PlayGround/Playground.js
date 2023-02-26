import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../contexts/appContext";
import { LeftSidebar, Main, RightSidebar } from "@atlaskit/page-layout";
import { STATE } from "../../reducers/appReducer";
import MenuItems from "../Menu/MenuItems";
import EmptyState from "@atlaskit/empty-state";
import Properties from "../properties/Properties";
import {
  load,
  loadPlaygroundFromStorage,
  saveEditorToStorage,
  savePosition,
} from "../../actions/playgroundActions";
import {
  addObject,
  clearSelection,
  createConnection,
  createConnectionRemoved,
  removeConnection,
  removeObject,
  select,
} from "../../actions/objectActions";
import {
  createAndStartNewEditor,
  getEditor,
  getInitialPosition,
} from "../../modules/editor";
import { availableObjects, build } from "../../modules/builder";

import "./Playground.css";
import Problems from "../Problems/Problems";

let mobile_item_selec = "";
let mobile_last_move = null;

function positionMobile(ev) {
  mobile_last_move = ev;
}

function Playground({ dispatch }) {
  const appState = useContext(AppContext);
  const drawFlowElt = useRef(null);
  const lock = useRef(null);
  const unlock = useRef(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (!getEditor()) {
      createAndStartNewEditor(drawFlowElt.current);
      const items = availableObjects();
      setMenuItems(items);
      addFlowEvents();
      loadFromStorage();

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
      const objects = getEditor().getNodesFromName(appState.lastAdded.name);

      const objectFound = objects.find(
        (object) => object.id === appState.lastAdded.id
      );

      if (!objectFound) {
        getEditor().addNode(
          appState.lastAdded.getPropertyValueFor("name"),
          appState.lastAdded.inputs,
          appState.lastAdded.outputs,
          appState.lastAdded.x,
          appState.lastAdded.y,
          appState.lastAdded.getPropertyValueFor("name"),
          { id: appState.lastAdded.id },
          appState.lastAdded.render(),
          false
        );

        saveEditorToStorage(getEditor().export());
      }
    }
  }, [appState.lastAdded]);

  useEffect(() => {
    if (appState.link) {
      if (appState.link.action === "delete") {
        getEditor().removeSingleConnection(
          appState.link.connection.output_id,
          appState.link.connection.input_id,
          appState.link.connection.output_class,
          appState.link.connection.input_class
        );
        createConnectionRemoved(dispatch);
        saveEditorToStorage(getEditor().export());
      }
    }
  }, [appState.link]);

  const loadFromStorage = () => {
    console.log("[app] load playground from storage...");
    const { nodes, objects, x, y } = loadPlaygroundFromStorage();
    if (nodes && objects) {
      getEditor().import(nodes);
      getEditor().canvas_x = x || 0;
      getEditor().canvas_y = y || 0;
      getEditor().precanvas.style.transform =
        "translate(" +
        (x || 0) +
        "px, " +
        (y || 0) +
        "px) scale(" +
        getEditor().zoom +
        ")";

      load(objects, dispatch);
    }
  };

  const addFlowEvents = () => {
    const editor = getEditor();

    editor.on("nodeCreated", function (id) {
      console.log("Node created " + id);
    });

    editor.on("nodeRemoved", async function (id) {
      await removeObject(id, dispatch);
      saveEditorToStorage(getEditor().export());
    });

    editor.on("nodeSelected", async function (id) {
      const uuid = getEditor().getNodeFromId(id).data.id;
      await select(uuid, dispatch);
    });

    editor.on("nodeUnselected", async function () {
      await clearSelection(dispatch);
    });

    editor.on("moduleCreated", function (name) {
      console.log("Module Created " + name);
    });

    editor.on("moduleChanged", function (name) {
      console.log("Module Changed " + name);
    });

    editor.on("connectionCreated", async function (connection) {
      console.log("Connection created", connection);

      const fromNode = getEditor().getNodeFromId(connection.output_id);
      const toNode = getEditor().getNodeFromId(connection.input_id);

      const nbOutputs =
        fromNode.outputs[connection.output_class].connections.length;
      const nbInputs = toNode.inputs[connection.input_class].connections.length;

      if (nbInputs > 1 || nbOutputs > 1) {
        console.log("connection removed - too many connections");
        editor.removeSingleConnection(
          connection.output_id,
          connection.input_id,
          connection.output_class,
          connection.input_class
        );
        saveEditorToStorage(editor.export());
        return;
      }

      const fromId = editor.getNodeFromId(connection.output_id).data.id;
      const toId = editor.getNodeFromId(connection.input_id).data.id;

      saveEditorToStorage(editor.export());
      await createConnection(fromId, toId, connection, dispatch);
    });

    editor.on("connectionStart", function (connection) {
      console.log("Connection started");
      console.log(connection);
    });

    editor.on("connectionCancel", function (connection) {
      console.log("Connection canceled");
      console.log(connection);
    });

    editor.on("connectionEnd", function (connection) {
      console.log("Connection ended");
      console.log(connection);
    });

    editor.on("connectionRemoved", async function (connection) {
      console.log("Connection removed");
      const fromId = editor.getNodeFromId(connection.output_id).data.id;
      const toId = editor.getNodeFromId(connection.input_id).data.id;
      console.log(connection);
      saveEditorToStorage(editor.export());
      await removeConnection(fromId, toId, connection, dispatch);
    });

    editor.on("connectionSelected", function (connection) {
      console.log("Connection selected");
      console.log(connection);
    });

    editor.on("mouseUp", function (position) {
      savePosition(editor.canvas_x, editor.canvas_y);
    });

    editor.on("nodeMoved", function (id) {
      console.log("Node moved " + id);
      saveEditorToStorage(editor.export());
    });

    editor.on("zoom", function (zoom) {
      console.log("Zoom level " + zoom);
    });

    editor.on("translate", function (position) {});

    editor.on("addReroute", function (id) {
      console.log("Reroute added " + id);
    });

    editor.on("removeReroute", function (id) {
      console.log("Reroute removed " + id);
    });
  };

  const allowDrop = (event) => {
    event.preventDefault();
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

  const addNodeToDrawFlow = async (name, posX, posY) => {
    if (getEditor().editor_mode === "fixed") {
      return false;
    }

    const { x, y } = getInitialPosition(getEditor(), posX, posY);

    const component = build(name, x, y);

    if (component) {
      await addObject(component, dispatch);
    } else {
      console.log(`[app] can't add component ${name}`);
    }
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

      const data = event.dataTransfer.getData("node");
      addNodeToDrawFlow(data, event.clientX, event.clientY);
    }
  };

  const onLock = () => {
    getEditor().editor_mode = "fixed";
    changeMode("lock");
  };

  const onUnlock = () => {
    getEditor().editor_mode = "edit";
    changeMode("unlock");
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
    <>
      <LeftSidebar
        isFixed={false}
        width={250}
        id="project-navigation"
        skipLinkTitle="Project Navigation"
        testId="left-sidebar"
        className="pageLayout"
      >
        {appState.state === STATE.READY && (
          <MenuItems items={menuItems || []} onDrag={onDrag} />
        )}
        {appState.state !== STATE.READY && (
          <EmptyState
            header="Loading..."
            description="Please wait some seconds while retrieving the devices"
          />
        )}
      </LeftSidebar>
      <Main id="main-content" skipLinkTitle="Main Content">
        <div
          id="drawflow"
          ref={drawFlowElt}
          onDrop={(event) => onDrop(event)}
          onDragOver={(event) => allowDrop(event)}
          style={{ height: "85%" }}
        ></div>
        <Problems style={{ height: "15%" }} />
      </Main>
      <RightSidebar id="right-sidebar" width={250}>
        <Properties dispatch={dispatch} />
      </RightSidebar>
    </>
  );
}

export default Playground;
