import "./App.css";
import "./resources/beautify.css";
import { useEffect, useRef, useState, useReducer, useCallback } from "react";
import AppContext from "./contexts/appContext";
import { appReducer, initialAppState, STATE } from "./reducers/appReducer";
import Properties from "./components/properties/Properties";
import {
  addObject,
  clearSelection,
  createConnection,
  createConnectionRemoved,
  removeConnection,
  removeObject,
  select,
} from "./actions/objectActions";
import { getInitialPosition } from "./modules/editor";
import { availableObjects, build } from "./modules/builder";
import { getListOfDevices, resetDevices } from "./actions/supervisonActions";
import MenuItems from "./components/Menu/MenuItems";
import EmptyState from "@atlaskit/empty-state";
import {
  AtlassianNavigation,
  CustomProductHome,
  PrimaryButton,
} from "@atlaskit/atlassian-navigation";
import {
  exportToFile,
  getFileHandle,
  importFromFile,
  load,
  loadPlaygroundFromStorage,
  resetPlaygroundFromStorage,
  run,
  saveEditorToStorage,
  savePosition,
  saveToExistingFile,
} from "./actions/playgroundActions";
import {
  Content,
  LeftSidebar,
  PageLayout,
  TopNavigation,
  Main,
  RightSidebar,
} from "@atlaskit/page-layout";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import Debug from "./components/Debugger/Debug";
import { AutoDismissFlag, FlagGroup } from "@atlaskit/flag";
import SuccessIcon from "@atlaskit/icon/glyph/check-circle";
import { token } from "@atlaskit/tokens";
import { G300 } from "@atlaskit/theme/colors";

let editor = null;
const Drawflow = window.Drawflow;
let mobile_item_selec = "";
let mobile_last_move = null;

function positionMobile(ev) {
  mobile_last_move = ev;
}

function App() {
  const [appState, dispatch] = useReducer(appReducer, initialAppState);
  const [selected, setSelected] = useState(0);
  const [flags, setFlags] = useState([]);
  const drawFlowElt = useRef(null);
  const lock = useRef(null);
  const unlock = useRef(null);

  const [menuItems, setMenuItems] = useState([]);

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

      const items = availableObjects();
      setMenuItems(items);
      getListOfDevices(dispatch);
      loadFromStorage();
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

        saveEditorToStorage(editor.export());
      }
    }
  }, [appState.lastAdded]);

  useEffect(() => {
    if (appState.link) {
      if (appState.link.action === "delete") {
        editor.removeSingleConnection(
          appState.link.connection.output_id,
          appState.link.connection.input_id,
          appState.link.connection.output_class,
          appState.link.connection.input_class
        );
        createConnectionRemoved(dispatch);
        saveEditorToStorage(editor.export());
      }
    }
  }, [appState.link]);

  const addFlag = (fileName) => {
    const newFlagId = flags.length + 1;
    const newFlags = flags.slice();
    newFlags.splice(0, 0, { newFlagId, fileName });

    setFlags(newFlags);
  };

  const handleDismiss = () => {
    setFlags(flags.slice(1));
  };

  const addFlowEvents = () => {
    editor.on("nodeCreated", function (id) {
      console.log("Node created " + id);
    });

    editor.on("nodeRemoved", function (id) {
      removeObject(id, dispatch);
      saveEditorToStorage(editor.export());
    });

    editor.on("nodeSelected", async function (id) {
      const uuid = editor.getNodeFromId(id).data.id;
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

      const fromNode = editor.getNodeFromId(connection.output_id);
      const toNode = editor.getNodeFromId(connection.input_id);

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

  const addNodeToDrawFlow = async (name, posX, posY) => {
    if (editor.editor_mode === "fixed") {
      return false;
    }

    const { x, y } = getInitialPosition(editor, posX, posY);

    const component = build(name, x, y);

    if (component) {
      await addObject(component, dispatch);
    } else {
      console.log(`[app] can't add component ${name}`);
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
    resetPlaygroundFromStorage();
    resetDevices(dispatch);
    getListOfDevices(dispatch);
  };

  const onRunPlayground = () => {
    run(appState.objects, dispatch);
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

  const onExport = async (forceSave = false) => {
    // Export Nodes
    const JSON_exportedNodes = editor.export();

    // Export data Model
    const JSON_exportedModel = appState.objects;

    // Create exported data
    const exported = {
      nodes: JSON_exportedNodes,
      objects: JSON_exportedModel,
    };

    let hasSucceededToSave = false;
    if (forceSave) {
      hasSucceededToSave = await saveToExistingFile(exported);
    }

    if (!hasSucceededToSave) {
      await exportToFile(exported);
    }

    addFlag(getFileHandle().name);
  };

  const onImport = async () => {
    const imported = await importFromFile();

    if (imported.nodes) {
      editor.import(imported.nodes);
      saveEditorToStorage(editor.export());
    }

    if (imported.objects) {
      load(imported.objects, dispatch);
    }
  };

  const loadFromStorage = () => {
    console.log("[app] load playground from storage...");
    const { nodes, objects, x, y } = loadPlaygroundFromStorage();
    if (nodes && objects) {
      editor.import(nodes);
      editor.canvas_x = x || 0;
      editor.canvas_y = y || 0;
      editor.precanvas.style.transform =
        "translate(" +
        (x || 0) +
        "px, " +
        (y || 0) +
        "px) scale(" +
        editor.zoom +
        ")";

      load(objects, dispatch);
    }
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

  const renderProductHome = () => (
    <CustomProductHome href="#" siteTitle="WebRTC Playground" />
  );

  const handleUpdate = useCallback(
    (index) => setSelected(index),
    [setSelected]
  );

  return (
    <AppContext.Provider value={appState}>
      <PageLayout className="pageLayout">
        <TopNavigation
          testId="topNavigation"
          id="product-navigation"
          skipLinkTitle="Product Navigation"
          height={55}
          isFixed={true}
        >
          <AtlassianNavigation
            label="WebRTC Playground"
            primaryItems={[
              <PrimaryButton onClick={() => onZoomIn()}>+</PrimaryButton>,
              <PrimaryButton onClick={() => onZoomOut()}>-</PrimaryButton>,
              <PrimaryButton onClick={() => onZoomReset()}>100%</PrimaryButton>,
              <PrimaryButton onClick={() => onImport()}>Import</PrimaryButton>,
              <PrimaryButton onClick={() => onExport(false)}>
                Export
              </PrimaryButton>,
              <PrimaryButton onClick={() => onExport(true)}>
                Save
              </PrimaryButton>,
              <PrimaryButton onClick={() => onClear()}>Reset</PrimaryButton>,
              <PrimaryButton onClick={() => onRunPlayground()}>
                Run
              </PrimaryButton>,
              <PrimaryButton
                isHighlighted={selected === 0}
                onClick={() => handleUpdate(0)}
              >
                Editor
              </PrimaryButton>,
              <PrimaryButton
                isHighlighted={selected === 1}
                appearance="warning"
                onClick={() => handleUpdate(1)}
              >
                Debug
              </PrimaryButton>,
            ]}
            renderProductHome={renderProductHome}
          />
        </TopNavigation>
        <Content testId="content" className="content">
          <Tabs onChange={handleUpdate} selected={selected} id="controlled">
            <TabList></TabList>
            <TabPanel>
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
                ></div>
              </Main>
              <RightSidebar id="right-sidebar" width={250}>
                <Properties dispatch={dispatch} />
              </RightSidebar>
            </TabPanel>
            <TabPanel>
              <Debug dispatch={dispatch} />
            </TabPanel>
          </Tabs>
        </Content>
        <FlagGroup onDismissed={handleDismiss}>
          {flags.map(({ flagId, fileName }, key) => {
            return (
              <div key={key}>
                <AutoDismissFlag
                  id={flagId}
                  icon={
                    <SuccessIcon
                      primaryColor={token("color.icon.success", G300)}
                      label="Success"
                      size="medium"
                    />
                  }
                  key={flagId}
                  title={`Saved to ${fileName}`}
                />
              </div>
            );
          })}
        </FlagGroup>
      </PageLayout>
    </AppContext.Provider>
  );
}

export default App;
