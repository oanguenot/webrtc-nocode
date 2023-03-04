const tempCall = {};
const tempGroups = {};

export const createTempPeriod = (content, group, start) => {
  const id = `${group}-${content}`;
  console.log(">>> create", id, start);
  if (id in tempCall) {
    console.warn(`Period already exists for ${id}`);
    return;
  }

  tempCall[id] = {
    start,
    group,
    content,
    end: null,
  };
};

export const endTempPeriod = (content, group, end) => {
  const id = `${group}-${content}`;
  console.log(">>> end", id, end);
  if (!(id in tempCall)) {
    console.warn(`Can't find period for ${id}`);
    return null;
  }
  let period = { ...tempCall[id], end };
  delete tempCall[id];
  return period;
};

export const hasPeriodFor = (content, group) => {
  const id = `${group}-${content}`;
  return id in tempCall;
};

export const createTempGroup = (content, id) => {
  if (!(id in tempGroups)) {
    tempGroups[id] = {
      id,
      content,
      nestedGroups: [],
    };
  }
};

export const addSubGroupInTempGroup = (subGroup, group) => {
  if (!(group in tempGroups)) {
    console.warn(`Can't find group for ${group}`);
    return;
  }

  const existingGroup = tempGroups[group];
  const nestedGroups = existingGroup.nestedGroups;
  if (!nestedGroups.includes(subGroup)) {
    nestedGroups.push(subGroup);
  }
};

export const getGroups = () => {
  return tempGroups;
};
