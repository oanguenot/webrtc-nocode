export const saveData = (key, data, forSession = false) => {
  try {
    const stringifiedData = JSON.stringify(data);
    if (forSession) {
      window.sessionStorage.setItem(key, stringifiedData);
    } else {
      window.localStorage.setItem(key, stringifiedData);
    }
    console.log(
      `[${forSession ? "session" : "local"} storage] store key ${key}`,
      data
    );
  } catch (err) {
    console.warn(
      `[${forSession ? "session" : "local"} storage] can't store key ${key}`,
      err
    );
  }
};

export const loadData = (key, fromSession = false) => {
  try {
    let stringifiedData = null;
    if (fromSession) {
      stringifiedData = window.sessionStorage.getItem(key);
    } else {
      stringifiedData = window.localStorage.getItem(key);
    }
    const data = JSON.parse(stringifiedData);
    console.log(
      `[${fromSession ? "session" : "local"} storage] loaded key ${key}`,
      data
    );
    return data;
  } catch (err) {
    console.warn(
      `[${fromSession ? "session" : "local"} storage] can't load key ${key}`,
      err
    );
    return null;
  }
};

export const clearData = (key) => {
  try {
    console.log(`[storage] remove data for key ${key}`);
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] can't clear data for key ${key}`, err);
  }
};
