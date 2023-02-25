import { useContext, useEffect, useState } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";
import { SimpleTag as Tag } from "@atlaskit/tag";

import "./Debug.css";
import {
  Content,
  LeftSidebar,
  Main,
  PageLayout,
  RightSidebar,
} from "@atlaskit/page-layout";
import PageHeader from "@atlaskit/page-header";
import ProgressBar from "@atlaskit/progress-bar";
import Button, { ButtonGroup } from "@atlaskit/button";
import { run } from "../../actions/playgroundActions";
import { useStateWithCallbackLazy } from "use-state-with-callback";

const getColorFromTag = (tag) => {
  switch (tag) {
    case "play":
      return "blue";
    case "peer":
      return "yellow";
    default:
      return "standard";
  }
};

function Debug({ dispatch }) {
  const appState = useContext(AppContext);
  const [progress, setProgress] = useState(0);
  const [isStarted, setIsStarted] = useStateWithCallbackLazy(false);

  useEffect(() => {
    if (appState.nbTasks > 0) {
      setProgress((1 * appState.tasksDone) / appState.nbTasks);
    }
  }, [appState.nbTasks, appState.tasksDone]);

  const onStart = () => {
    setIsStarted(true, () => {
      run(appState.objects, dispatch);
    });
  };

  const onReset = () => {
    setIsStarted(false);
    setProgress(0);
  };

  const actionsContent = (
    <ButtonGroup>
      <Button onClick={() => onReset()}>Reset</Button>
      <Button appearance="subtle">Stop</Button>
      <Button appearance="primary" onClick={() => onStart()}>
        Run
      </Button>
    </ButtonGroup>
  );

  const getProgressStatus = () => {
    if (progress === 0) {
      return "Not started";
    } else if (progress === 1) {
      return "Finished!";
    } else {
      return "Running...";
    }
  };

  return (
    <>
      <Main id="debug-main-content" skipLinkTitle="Debug Content">
        <div className="debug-main">
          <PageHeader actions={actionsContent}></PageHeader>
          <div className="debug-main-area">
            {!isStarted && (
              <div className="debug-area">
                <EmptyState
                  header="No Debug!"
                  description="Run the playground to have results"
                />
              </div>
            )}
            {isStarted && (
              <>
                <div className="debug-progress">
                  <p className="debug-progress-title">
                    Progress: {getProgressStatus()}
                  </p>
                  <ProgressBar
                    value={progress}
                    appearance={progress === 1 ? "success" : "default"}
                  />
                </div>
                <div className="debug-layout">
                  <div className="debug-double-columns">
                    <p className="debug-iframes-title">Details</p>
                    <ul className="debug-actions">
                      {appState.debug.map((log, key) => (
                        <li key={key}>
                          <Tag text={log.timestamp}></Tag>{" "}
                          <Tag
                            text={log.tag}
                            color={getColorFromTag(log.tag)}
                          ></Tag>{" "}
                          {log.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="debug-columns">
                    <p className="debug-iframes-title">IFrames</p>
                    <div id="frames" className="iframes-sidebar"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Main>
    </>
  );
}

export default Debug;
