import { useState, useEffect } from "react";
import Textfield from "@atlaskit/textfield";
import { updateProperty } from "../../actions/objectActions";
import InlineEdit from "@atlaskit/inline-edit";
import { css } from "@emotion/react";
import Select from "@atlaskit/select";
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
    if (property.type === "enum") {
      setValue(event);
    } else {
      setValue(event.target.value);
    }
  };

  let defaultValue = property.value;
  let valueDisplayed = property.value;
  if (property.type === "enum") {
    defaultValue = property.enum.find((item) => item.value === property.value);
    if (defaultValue) {
      valueDisplayed = defaultValue.label;
    }
  }

  return (
    <InlineEdit
      defaultValue={defaultValue}
      label={property.label}
      editView={({ errorMessage, ...fieldProps }) => {
        if (property.type !== "enum") {
          return (
            <Textfield
              {...fieldProps}
              autoFocus
              value={value || property.value}
              onChange={(event) => onChange(event)}
            />
          );
        } else {
          return (
            <Select
              inputId="single-select-example"
              className="single-select"
              classNamePrefix="react-select"
              options={property.enum}
              value={value || defaultValue}
              onChange={(event) => onChange(event)}
            />
          );
        }
      }}
      readView={() => (
        <div css={readViewContainerStyles}>
          {valueDisplayed || "Click to edit"}
        </div>
      )}
      onConfirm={async () => {
        const newValue =
          property.type !== "enum"
            ? value || property.value
            : (value && value.value) || property.value;

        await updateProperty(objectId, property.prop, newValue, dispatch);
        setValue(null);
      }}
    />
  );
}

export default Property;
