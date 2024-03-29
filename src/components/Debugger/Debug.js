import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../contexts/appContext";
import { SimpleTag as Tag } from "@atlaskit/tag";

import "./Debug.css";
import { Content, Main } from "@atlaskit/page-layout";
import PageHeader from "@atlaskit/page-header";
import ProgressBar from "@atlaskit/progress-bar";
import Button, { ButtonGroup } from "@atlaskit/button";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { stringify } from "../../modules/helper";
import { useWindowSize } from "../../modules/hooks";
import {
  addAPICallToGraph,
  addSeries,
  createDataSeries,
  createGraph,
  destroyGraph,
  setStartTime,
} from "../graph/graph";
import { reset, run } from "../../actions/DebugActions";
import { PLAY_STATE } from "../../reducers/appReducer";

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
  const [progress, setProgress] = useStateWithCallbackLazy(0);
  const [isStarted, setIsStarted] = useStateWithCallbackLazy(false);
  const [isReset, setIsReset] = useStateWithCallbackLazy(true);
  const size = useWindowSize();

  useEffect(() => {
    return () => {
      destroyGraph();
    };
  }, []);

  useEffect(() => {
    if (appState.playState === PLAY_STATE.ENDED) {
      setProgress(1);
    } else if (appState.nbTasks > 0) {
      setProgress(appState.tasksDone / appState.nbTasks);
    } else {
      setProgress(0);
    }
  }, [appState.nbTasks, appState.tasksDone, appState.playState]);

  useEffect(() => {
    if (appState.graph) {
      const data = appState.graph;
      Object.keys(data).forEach((peerId) => {
        let canvas = document.querySelector(`#canvas-${peerId}`);
        createGraph(peerId, canvas);
        //startTimeline(peerId);
        const series = data[peerId];
        Object.keys(series).forEach((set) =>
          addSeries(peerId, set, series[set])
        );
      });
    }
    //return () => destroyGraph();
  }, [appState.graph]);

  useEffect(() => {
    addAPICallToGraph(appState.graphAPI);
  }, [appState.graphAPI]);

  const onStart = async () => {
    if (isStarted && !isReset) {
      await onReset();
    }
    setIsStarted(true, () => {
      setIsReset(false, () => {
        setStartTime(new Date());
        run(appState.objects, dispatch);
      });
    });
  };

  const onReset = () => {
    return new Promise((resolve) => {
      setIsStarted(false, () => {
        setProgress(0, () => {
          reset(dispatch);
          //createGraph(canvasRef.current);
          setIsReset(true, () => {
            resolve();
          });
        });
      });
    });
  };

  const actionsContent = (
    <ButtonGroup>
      <Button onClick={() => onReset()}>Reset</Button>
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
            <Content testId="content">
              <div
                style={{
                  height: (size.height || window.innerHeight) - 224,
                  width: size.width || window.innerWidth,
                }}
              >
                <div>
                  {appState.graph &&
                    Object.keys(appState.graph).map((peerId, index) => (
                      <div key={index} className="graph">
                        <p className="debug-iframes-title">{peerId}</p>
                        <canvas
                          className="canvasGraph"
                          id={`canvas-${peerId}`}
                        />
                      </div>
                    ))}
                </div>
                <div className="debug-columns">
                  <p className="debug-iframes-title">IFrames</p>
                  <div id="frames" className="iframes-sidebar"></div>
                </div>
                <div className="debug-messages">
                  <p className="debug-iframes-title">Logs</p>
                  {appState.tickets.map((ticket, key1) => (
                    <div key={key1}>
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
                              <Tag text={log.name} color="greenLight"></Tag>{" "}
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
                                <span>{stringify(log.details.value)}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Content>
          </>
        </div>
      </Main>
    </>
  );
}

export default Debug;
