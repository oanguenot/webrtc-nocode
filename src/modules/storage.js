export const saveData = (key, data) => {
  try {
    console.log(`[storage] store data for key ${key}`, data);
    const stringifiedData = JSON.stringify(data);
    window.localStorage.setItem(key, stringifiedData);
  } catch(err) {
    console.warn(`[storage] can't store data for key ${key}`, err);
  }
}

export const loadData = (key) => {
  try {
    const stringifiedData = window.localStorage.getItem(key);
    const data = JSON.parse(stringifiedData);
    console.log(`[storage] loaded data for key ${key}`, data);
    return data;
  } catch (err) {
    console.warn(`[storage] can't load data for key ${key}`, err);
    return null;
  }
}

export const clearData = (key) => {
  try {
    console.log(`[storage] remove data for key ${key}`);
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] can't clear data for key ${key}`, err);
  }
}
