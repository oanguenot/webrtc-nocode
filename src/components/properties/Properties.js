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
import { updateProperty } from "../../actions/objectActions";

const fontSize = getFontSize();
const gridSize = getGridSize();

function Properties({ dispatch }) {
  const appState = useContext(AppContext);
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

  const getInfo = () => {
    return selected.info.map((info, key) => (
      <div key={key}>
        {info.key}: {info.value}
      </div>
    ));
  };

  const getProperties = () => {
    return selected.properties.map((property, key) => (
      <InlineEdit
        key={key}
        defaultValue={property.value}
        label={property.label}
        editView={({ errorMessage, ...fieldProps }) => (
          <Textfield {...fieldProps} autoFocus />
        )}
        readView={() => (
          <div css={readViewContainerStyles} data-testid="read-view">
            {property.value || "Click to edit"}
          </div>
        )}
        onConfirm={(value) =>
          updateProperty(selected.id, property.prop, value, dispatch)
        }
      />
    ));
  };

  return (
    <div>
      {!selected && (
        <EmptyState
          header="No info!"
          description="Check your node, something is wrong"
        />
      )}
      {selected && selected.info && getInfo()}

      {selected && selected.properties && getProperties()}
    </div>
  );
}

export default Properties;
