import { useContext, useState } from "react";
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

  const onStart = () => {
    run(appState.objects, dispatch);
  };

  const actionsContent = (
    <ButtonGroup>
      <Button>Reset</Button>
      <Button appearance="subtle">Stop</Button>
      <Button appearance="primary" onClick={() => onStart()}>
        Run
      </Button>
    </ButtonGroup>
  );

  return (
    <>
      <Main id="debug-main-content" skipLinkTitle="Debug Content">
        <div className="debug-main">
          <PageHeader actions={actionsContent}></PageHeader>
          <span>Progress</span>
          <ProgressBar value={progress} />
          <div className="debug-area">
            {!appState.debug.length && (
              <EmptyState
                header="No Debug!"
                description="Run the playground to have results"
              />
            )}
            {!!appState.debug.length && (
              <>
                <ul>
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
              </>
            )}
          </div>
        </div>
      </Main>
      <RightSidebar
        isFixed={false}
        width={400}
        id="right-sidebar"
        skipLinkTitle="Project Navigation"
      >
        <div id="frames" className="iframes-sidebar"></div>
      </RightSidebar>
    </>
  );
}

export default Debug;
