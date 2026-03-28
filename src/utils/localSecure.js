export const setSafeItem = (key, value) => {
  try {
    const json = JSON.stringify(value);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    localStorage.setItem(key, encoded);
  } catch (error) {
    console.error("setSafeItem error:", error);
  }
};

export const getSafeItem = (key) => {
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;

    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch (error) {
    console.error("getSafeItem error:", error);
    return null;
  }
};

export const removeSafeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("removeSafeItem error:", error);
  }
};