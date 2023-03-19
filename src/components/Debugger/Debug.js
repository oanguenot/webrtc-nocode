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
  height: "600px",
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
  const [isReset, setIsReset] = useStateWithCallbackLazy(true);
  const timelineRef = useRef();

  useEffect(() => {
    if (appState.nbTasks > 0) {
      setProgress(appState.tasksDone / appState.nbTasks);
    }
  }, [appState.nbTasks, appState.tasksDone]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (timelineRef && timelineRef.current && progress === 1) {
      appState.groups.forEach((latest) => {
        const group = timelineRef.current.groups.get(latest.id);
        // check if already exists - crash when duplicated
        if (!group) {
          timelineRef.current.groups.add(latest);
        }
      });

      appState.subGroups.forEach((latest) => {
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
      });

      appState.events.forEach((latest) => {
        const item = timelineRef.current.items.get(latest.id);
        if (!item || (item && item.length === 0)) {
          timelineRef.current.items.add(latest);
          timelineRef.current.timeline.fit();
        }
      });
    }
  }, [appState.groups, appState.subGroups, appState.events, progress]);

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
              {isStarted && progress !== 1 && (
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
              {progress === 1 && (
                <div className="debug-layout">
                  <div className="debug-double-columns">
                    <div className="timeline-area">
                      <p className="debug-iframes-title">Timeline</p>
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
