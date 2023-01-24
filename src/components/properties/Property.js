import { useState, useEffect } from "react";
import Textfield from "@atlaskit/textfield";
import { updateProperty } from "../../actions/objectActions";
import InlineEdit from "@atlaskit/inline-edit";
import { css } from "@emotion/react";
import {
  fontSize as getFontSize,
  gridSize as getGridSize,
} from "@atlaskit/theme/constants";

const fontSize = getFontSize();
const gridSize = getGridSize();

function Property({ objectId, property, dispatch }) {
  const [value, setValue] = useState(null);

  const readViewContainerStyles = css({
    display: "flex",
    maxWidth: "100%",
    minHeight: `${(gridSize * 2.5) / fontSize}em`,
    padding: `${gridSize}px ${gridSize - 2}px`,
    fontSize: `${fontSize}px`,
    lineHeight: `${(gridSize * 2.5) / fontSize}`,
    wordBreak: "break-word",
  });

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <InlineEdit
      defaultValue={property.value}
      label={property.label}
      editView={({ errorMessage, ...fieldProps }) => {
        return (
          <Textfield
            {...fieldProps}
            autoFocus
            value={value || property.value}
            onChange={(event) => onChange(event)}
          />
        );
      }}
      readView={() => (
        <div css={readViewContainerStyles}>
          {property.value || "Click to edit"}
        </div>
      )}
      onConfirm={async (newValue) => {
        await updateProperty(
          objectId,
          property.prop,
          value || property.value,
          dispatch
        );
        setValue(null);
      }}
    />
  );
}

export default Property;