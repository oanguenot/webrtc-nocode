import { useContext, useEffect, useRef, useState } from "react";
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
import Timeline from "react-vis-timeline-2";
import { PLAY_STATE } from "../../reducers/appReducer";

let timeline = null;

let startDate = new Date();
startDate.setHours(startDate.getHours() + 1);

const options = {
  width: "100%",
  height: "300px",
  editable: false,
  min: Date.now(),
  max: startDate.getTime(),
};

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
  const timelineRef = useRef();

  useEffect(() => {
    if (appState.nbTasks > 0) {
      setProgress((1 * appState.tasksDone) / appState.nbTasks);
    }
  }, [appState.nbTasks, appState.tasksDone]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (appState.groups) {
      const latest = appState.groups[appState.groups.length - 1];
      if (latest) {
        const group = timelineRef.current.groups.get(latest.id);
        // check if already exists - crash when duplicated
        if (!group) {
          timelineRef.current.groups.add(latest);
        }
      }
    }
  }, [appState.groups]);

  useEffect(() => {
    if (appState.subGroups) {
      const latest = appState.subGroups[appState.subGroups.length - 1];
      if (latest) {
        const group = timelineRef.current.groups.get(latest.groupId);
        if (group) {
          if (!group.nestedGroups.includes(latest.id)) {
            group.nestedGroups.push(latest.id);
            timelineRef.current.groups.add({
              id: latest.id,
              content: latest.content,
            });
            timelineRef.current.groups.update(group);
          }
        }
      }
    }
  }, [appState.subGroups]);

  useEffect(() => {
    if (appState.events) {
      const latest = appState.events[appState.events.length - 1];
      if (latest) {
        const item = timelineRef.current.items.get(latest.id);
        if (!item || (item && item.length === 0)) {
          timelineRef.current.items.add(latest);
          timelineRef.current.timeline.fit();
        }
      }
    }
  }, [appState.events]);

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
            {1 === 2 && (
              <div className="debug-area">
                <EmptyState
                  header="No Results"
                  description="Run the playground to have results"
                />
              </div>
            )}
            {1 === 1 && (
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
                      {(appState.playState !== PLAY_STATE.ENDED ||
                        appState.playState !== PLAY_STATE.FAILED) && (
                        <EmptyState
                          header="Timeline in progress"
                          description="Please wait until the end of the test to see the result"
                        />
                      )}
                      <Timeline ref={timelineRef} options={options} />
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
