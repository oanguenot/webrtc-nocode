const tempCall = {};

export const createTempPeriod = (content, group, start) => {
  if (group in tempCall) {
    console.warn(`Period already exists for ${group}`);
    return;
  }

  tempCall[group] = {
    start,
    group,
    content,
    end: null,
  };
};

export const endTempPeriod = (group, end) => {
  if (!group in tempCall) {
    console.warn(`Can't find period for ${group}`);
    return null;
  }
  let period = { ...tempCall[group], end };
  delete tempCall[group];
  return period;
};
