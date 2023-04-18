import { useState } from "react";
import Textfield from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import { updateProperty } from "../../actions/objectActions";
import InlineEdit from "@atlaskit/inline-edit";
import { css } from "@emotion/react";
import Select from "@atlaskit/select";
import Tag from '@atlaskit/tag';
import Group from '@atlaskit/tag-group';
import {
  fontSize as getFontSize,
  gridSize as getGridSize,
} from "@atlaskit/theme/constants";
import { KEY_TYPE } from "../../modules/model";

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
  if (property.type === KEY_TYPE.ENUM) {
    defaultValue = property.enum.find((item) => item.value === property.value);
    if (defaultValue) {
      valueDisplayed = defaultValue.label;
    }
  }

  return (
    <InlineEdit
      defaultValue={defaultValue}
      label={property.label}
      editView={({ errorMessage, ...fieldProps }, ref) => {
        if (property.type === KEY_TYPE.TEXT) {
          return (
            <Textfield
              {...fieldProps}
              autoFocus
              value={value || property.value}
              onChange={(event) => onChange(event)}
            />
          );
        } else if (property.type === KEY_TYPE.ENUM || property.type === KEY_TYPE.SELECT) {
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
        } else {
          return (
            <TextArea
              {...fieldProps}
              autoFocus
              value={value || property.value}
              ref={ref}
              onChange={(event) => onChange(event)}
            />
          );
        }
      }}
      readView={() => (
        <div css={readViewContainerStyles}>
          {!valueDisplayed && ("Click to edit")}

          {valueDisplayed && property.type === KEY_TYPE.SELECT && (
            <div style={{ padding: `${gridSize / 2}px` }}>
              <Group>
                {valueDisplayed &&
                  valueDisplayed.map((option, key) => (
                    <Tag text={option.label} key={option.value} />
                  ))}
              </Group>
            </div>
            )}

          {valueDisplayed && property.type !== KEY_TYPE.SELECT && (valueDisplayed)}
        </div>
      )}
      onConfirm={async () => {
        const newValue =
          property.type !== "enum"
            ? value || property.value
            : (value && value.value) || property.value;

        const label =
          property.type === "enum"
            ? property.enum.find((item) => item.value === newValue).label
            : "";

        await updateProperty(
          objectId,
          property.prop,
          newValue,
          property.type === "enum" ? (value && value.label) || label : null,
          dispatch
        );
        setValue(null);
      }}
    />
  );
}

export default Property;
