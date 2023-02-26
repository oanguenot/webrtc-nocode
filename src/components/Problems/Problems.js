import { useContext, useEffect, useState } from "react";
import AppContext from "../../contexts/appContext";
import WarningIcon from "@atlaskit/icon/glyph/warning";
import { Y200 } from "@atlaskit/theme/colors";
import { token } from "@atlaskit/tokens";

import "./Problems.css";

function Problems() {
  const appState = useContext(AppContext);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    setProblems(appState.problems);
  }, [appState.problems]);

  return (
    <div className="problems-area">
      <p className="problem-title">
        Problems {problems.length > 0 ? `(${problems.length})` : ""}
      </p>
      {problems.length > 0 && (
        <ul className="problems-list">
          {problems.map((problem, key) => (
            <li key={key}>
              <WarningIcon
                label="Warning"
                primaryColor={token("color.background.warning.bold", Y200)}
              />
              <span className="problem-label">{problem.label}</span>
              <span className="problem-node">- {problem.node}</span>
            </li>
          ))}
        </ul>
      )}
      {problems.length === 0 && (
        <p className="problem-node">No problem detected. Scenario can be run</p>
      )}
    </div>
  );
}

export default Problems;
