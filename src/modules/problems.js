export const checkNodesProblems = (nodes) => {
  const problems = [];

  console.log("nodes", nodes);

  nodes.forEach((node) => {
    const properties = node.properties;
    const propsNotFilled = properties.filter((prop) => prop.value === "none");
    propsNotFilled.forEach((problem) => {
      problems.push(`Missing property ${problem.prop} in node ${node.id}`);
    });
  });
  console.log(">>>problems", problems);
  return problems;
};
