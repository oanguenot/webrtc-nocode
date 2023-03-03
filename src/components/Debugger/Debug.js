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
//import { Timeline } from "vis-timeline/esnext";

let timeline = null;

const getColorFromTag = (tag) => {
  switch (tag) {
    case "play":
      return "blue";
    case "peer":
      return "yellow";
    case "action":
      return "tealLight";
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

  useEffect(() => {
    const container = document.querySelector("#timeline");
    const items = new window.vis.DataSet();

    var options = {
      showCurrentTime: true,
      editable: false,
    };

    // Create a Timeline
    timeline = new window.vis.Timeline(container, items, options);
  },[]);

  useEffect(() => {
    if(appState.timeline) {
      const items = new window.vis.DataSet();
      const event = appState.timeline;
      //appState.timeline.forEach((event, index) => {
      let elt = null;
      if(event.type === "marker") {
        timeline.addCustomTime(event.timestamp, event.timestamp)
        timeline.setCustomTimeMarker(event.message, event.timestamp);
      } else {
        console.log(">>>ADD other")
        elt = {
          start: event.timestamp,
          content: event.message,
        }
        items.add(elt)
      }
      //});

      timeline.setItems(items);
    }

  }, [appState.timeline]);

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
          <div className="debug-main-area">
            {1===2 && (
              <div className="debug-area">
                <EmptyState
                  header="No Results"
                  description="Run the playground to have results"
                />
              </div>
            )}
            {1===1 && (
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
                    <div className="timeline-area">
                      <p className="debug-iframes-title">Timeline</p>
                      <div id="timeline" />
                    </div>
                    <div className="details-area">
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
