import { useContext, useEffect, useState } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";
import { SimpleTag as Tag } from "@atlaskit/tag";

import "./Debug.css";
import { Main } from "@atlaskit/page-layout";
import PageHeader from "@atlaskit/page-header";
import ProgressBar from "@atlaskit/progress-bar";
import Button, { ButtonGroup } from "@atlaskit/button";
import { run } from "../../actions/playgroundActions";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { PLAY_STATE } from "../../reducers/appReducer";
import { stringify } from "../../modules/helper";

const getColorFromTag = (tag) => {
  switch (tag) {
    case "playground":
      return "blue";
    case "call":
      return "yellow";
    case "signal":
      return "tealLight";
    case "ssrc":
      return "redLight";
    case "name":
      return "greenLight";
    default:
      return "grey";
  }
};

function Debug({ dispatch }) {
  const appState = useContext(AppContext);
  const [progress, setProgress] = useState(0);
  const [isStarted, setIsStarted] = useStateWithCallbackLazy(false);
  const [isReset, setIsReset] = useStateWithCallbackLazy(true);

  useEffect(() => {
    if (appState.nbTasks > 0) {
      setProgress(appState.tasksDone / appState.nbTasks);
    }
  }, [appState.nbTasks, appState.tasksDone]);

  const onStart = () => {
    setIsStarted(true, () => {
      setIsReset(false, () => {
        run(appState.objects, dispatch);
      });
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
    if (progress === 0 && !isStarted) {
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
          {isReset && (
            <div className="debug-empty-area">
              <EmptyState
                header="No Results"
                description="Run the playground to have results"
              />
            </div>
          )}
          {!isReset && (
            <>
              {(appState.playState === PLAY_STATE.RUNNING ||
                appState.playState === PLAY_STATE.IDLE) && (
                <div className="debug-progress">
                  <p className="debug-progress-title">
                    Progress: {getProgressStatus()}
                  </p>
                  <ProgressBar
                    value={progress}
                    appearance={progress === 1 ? "success" : "default"}
                  />
                  <div className="debug-columns">
                    <p className="debug-iframes-title">IFrames</p>
                    <div id="frames" className="iframes-sidebar"></div>
                  </div>
                </div>
              )}
              {(appState.playState === PLAY_STATE.ENDED ||
                appState.playState === PLAY_STATE.FAILED) && (
                <div className="debug-layout">
                  <div className="debug-double-columns">
                    <div className="details-area">
                      <p className="debug-iframes-title">Details</p>
                      <div className="debug-actions">
                        {appState.tickets.map((ticket, key1) => (
                          <div className="debug-ticket" key={key1}>
                            <p>{ticket.ua.pname}</p>
                            <ul key={key1}>
                              {ticket.call.events.map((log, key2) => (
                                <li key={key2}>
                                  <div>
                                    <Tag text={log.at}></Tag>{" "}
                                    <Tag
                                      text={log.category}
                                      color={getColorFromTag(log.category)}
                                    ></Tag>{" "}
                                    <Tag
                                      text={log.name}
                                      color="greenLight"
                                    ></Tag>{" "}
                                    {log.ssrc && (
                                      <Tag
                                        text={log.ssrc}
                                        color={getColorFromTag("ssrc")}
                                      ></Tag>
                                    )}
                                    <span
                                      style={{
                                        color: "#999",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {log.details.message}{" "}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      marginLeft: "190px",
                                      fontSize: "12px",
                                      padding: "4px",
                                    }}
                                  >
                                    {log.details.value && (
                                      <span>
                                        {stringify(log.details.value)}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Main>
    </>
  );
}

export default Debug;
