import "./App.css";
import "./resources/beautify.css";
import { useEffect, useState, useReducer, useCallback } from "react";
import AppContext from "./contexts/appContext";
import { appReducer, initialAppState } from "./reducers/appReducer";
import { getEditor } from "./modules/editor";
import { getListOfDevices, resetDevices } from "./actions/supervisonActions";
import {
  AtlassianNavigation,
  CustomProductHome,
  PrimaryButton,
} from "@atlaskit/atlassian-navigation";
import {
  checkDevicesInNodes,
  checkFileConcistency,
  exportToFile,
  getFileHandle,
  importFromFile,
  load,
  resetPlayground,
  resetPlaygroundFromStorage,
  run,
  saveEditorToStorage,
  saveToExistingFile,
} from "./actions/playgroundActions";
import { Content, PageLayout, TopNavigation } from "@atlaskit/page-layout";
import Tabs, { TabList, TabPanel } from "@atlaskit/tabs";
import Debug from "./components/Debugger/Debug";
import { AutoDismissFlag, FlagGroup } from "@atlaskit/flag";
import SuccessIcon from "@atlaskit/icon/glyph/check-circle";
import { token } from "@atlaskit/tokens";
import { G300 } from "@atlaskit/theme/colors";
import Playground from "./components/PlayGround/Playground";
import { ButtonGroup } from "@atlaskit/button";

function App() {
  const [appState, dispatch] = useReducer(appReducer, initialAppState);
  const [selected, setSelected] = useState(0);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    getListOfDevices(dispatch);
  }, []);

  useEffect(() => {
    if (appState.loadedCheckDevices) {
      checkDevicesInNodes(appState.devices, appState.objects, dispatch);
    }
  }, [appState.loadedCheckDevices]);

  const addFlag = (fileName) => {
    const newFlagId = flags.length + 1;
    const newFlags = flags.slice();
    newFlags.splice(0, 0, { newFlagId, fileName });
    setFlags(newFlags);
  };

  const handleDismiss = () => {
    setFlags(flags.slice(1));
  };

  const onClear = () => {
    getEditor().clearModuleSelected();
    resetPlaygroundFromStorage();
    resetPlayground(dispatch);
  };

  const onExport = async (forceSave = false) => {
    // Export Nodes
    const JSON_exportedNodes = getEditor().export();

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

    checkFileConcistency(imported);

    if (imported.nodes) {
      getEditor().import(imported.nodes);
      saveEditorToStorage(getEditor().export());
    }

    if (imported.objects) {
      load(imported.objects, dispatch);
    }
  };

  const renderProductHome = () => (
    <CustomProductHome href="#" siteTitle="WebRTC Playground" />
  );

  const renderProfile = () => (
    <ButtonGroup>
      <PrimaryButton
        isHighlighted={selected === 0}
        onClick={() => handleUpdate(0)}
      >
        Editor
      </PrimaryButton>
      <PrimaryButton
        isHighlighted={selected === 1}
        appearance="warning"
        onClick={() => handleUpdate(1)}
      >
        Play
      </PrimaryButton>
    </ButtonGroup>
  );

  const handleUpdate = useCallback(
    (index) => setSelected(index),
    [setSelected]
  );

  const onZoomIn = () => {
    getEditor().zoom_in();
  };

  const onZoomOut = () => {
    getEditor().zoom_out();
  };

  const onZoomReset = () => {
    getEditor().zoom_reset();
  };

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
              /*<PrimaryButton onClick={() => onZoomIn()}>+</PrimaryButton>,
              <PrimaryButton onClick={() => onZoomOut()}>-</PrimaryButton>,
              <PrimaryButton onClick={() => onZoomReset()}>100%</PrimaryButton>,*/
              <PrimaryButton onClick={() => onImport()}>Import</PrimaryButton>,
              <PrimaryButton onClick={() => onExport(false)}>
                Export
              </PrimaryButton>,
              <PrimaryButton onClick={() => onExport(true)}>
                Save
              </PrimaryButton>,
              <PrimaryButton onClick={() => onClear()}>Reset</PrimaryButton>,
            ]}
            renderProductHome={renderProductHome}
            renderProfile={renderProfile}
          />
        </TopNavigation>
        <Content testId="content" className="content">
          <Tabs onChange={handleUpdate} selected={selected} id="controlled">
            <TabList></TabList>
            <TabPanel>
              <Playground dispatch={dispatch} />
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
