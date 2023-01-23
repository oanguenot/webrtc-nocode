import { useState, useContext, useEffect } from "react";
import AppContext from "../../contexts/appContext";
import { css, jsx } from "@emotion/react";
import InlineEdit from "@atlaskit/inline-edit";
import Textfield from "@atlaskit/textfield";
import EmptyState from "@atlaskit/empty-state";
import {
  fontSize as getFontSize,
  gridSize as getGridSize,
} from "@atlaskit/theme/constants";
import "./Properties.css";

const fontSize = getFontSize();
const gridSize = getGridSize();

function Properties({ node }) {
  const appState = useContext(AppContext);
  const [editValue, setEditValue] = useState("User 1");
  const [selected, setSelected] = useState(appState.selected);

  useEffect(() => {
    setSelected(appState.selected);
  }, [appState.selected]);

  const readViewContainerStyles = css({
    display: "flex",
    maxWidth: "100%",
    minHeight: `${(gridSize * 2.5) / fontSize}em`,
    padding: `${gridSize}px ${gridSize - 2}px`,
    fontSize: `${fontSize}px`,
    lineHeight: `${(gridSize * 2.5) / fontSize}`,
    wordBreak: "break-word",
  });

  return (
    <div>
      {!selected && (
        <EmptyState
          header="No info!"
          description="Check your node, something is wrong"
        />
      )}
      {selected &&
        selected.info.map((info, key) => (
          <div key={key}>
            {info.key}: {info.value}
          </div>
        ))}

      {node && selected.properties && (
        <InlineEdit
          defaultValue={editValue}
          label="Name"
          editView={({ errorMessage, ...fieldProps }) => (
            <Textfield {...fieldProps} autoFocus />
          )}
          readView={() => (
            <div css={readViewContainerStyles} data-testid="read-view">
              {editValue || "Click to edit the name"}
            </div>
          )}
          onConfirm={(value) => setEditValue(value)}
        />
      )}
    </div>
  );
}

export default Properties;
