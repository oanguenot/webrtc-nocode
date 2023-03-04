const tempCall = {};

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
  if (!id in tempCall) {
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
