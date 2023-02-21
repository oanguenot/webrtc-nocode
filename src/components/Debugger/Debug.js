import { useContext } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";
import { SimpleTag as Tag } from "@atlaskit/tag";

import "./Debug.css";

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

  return (
    <div className="debug-area">
      <div id="frames"></div>
      {!appState.debug.length && (
        <EmptyState
          header="No Debug!"
          description="Run the playground to have results"
        />
      )}
      {!!appState.debug.length && (
        <div>
          <ul>
            {appState.debug.map((log, key) => (
              <li key={key}>
                <Tag text={log.timestamp}></Tag>{" "}
                <Tag text={log.tag} color={getColorFromTag(log.tag)}></Tag>{" "}
                {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Debug;
