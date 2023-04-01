import { KEYS } from "./model";

export const checkNodesProblems = (nodes) => {
  const problems = [];

  nodes.forEach((node) => {
    const properties = node.properties;
    const nodeType = node.getInfoValueFor(KEYS.NODE);
    const propsNotFilled = properties.filter((prop) => prop.value === "none");
    const name = node.getPropertyValueFor(KEYS.NAME);
    propsNotFilled.forEach((problem) => {
      problems.push({
        label: `Expected property ${problem.prop} to have a value`,
        node: `${name ? name : `${nodeType}.${name || node.id}`}`,
      });
    });
  });
  return problems;
};
