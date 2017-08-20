var jstiller = jstiller || {};
jstiller.components = jstiller.components || {};

jstiller.components.cookie = (function (dependency) {
  /**
   * Returns an expire date
   * 
   * @param {string|date} deliveredExpires
   * @return {string}
   */
  function setExpire(deliveredExpires) {
    var estimatedExpires = '';

    if (deliveredExpires === false) {
      throw new Error();
    }

    if (typeof deliveredExpires === 'string') {
      estimatedExpires = 'expires='.concat(deliveredExpires, ';');
    } else if (typeof deliveredExpires === 'object' && deliveredExpires instanceof Date) {
      estimatedExpires = 'expires='.concat(deliveredExpires.toUTCString(), ';');
    } else {
      throw new TypeError();
    }

    return estimatedExpires;
  }

  /**
   * Sets a new cookie
   * 
   * @param {string} deliveredKey
   * @param {string} deliveredValue
   * @param {object} deliveredSettings
   * @return {object}
   */
  function setItem(deliveredKey, deliveredValue, deliveredSettings) {
    var defaultSettings = {
        path: '/',
        secure: true,
        expires: 0,
        maxAge: 0,
        httpOnly: true,
      },
      estimatedSettings = deliveredSettings ? dependency.window.Object.assign(defaultSettings, deliveredSettings) : defaultSettings,
      estimatedCookie = '';

    if (deliveredKey === false || /^(?:expires|max-age|path|domain|secure)$/i.test(deliveredKey)) {
      throw new Error();
    }

    estimatedCookie = encodeURIComponent(deliveredKey).concat('=', encodeURIComponent(deliveredValue), ';',
      (estimatedSettings.expires ? setExpire(estimatedSettings.expires) : ''),
      (estimatedSettings.domain ? ''.concat('domain=', estimatedSettings.domain, ';') : ''),
      (estimatedSettings.path ? ''.concat('path=', estimatedSettings.path, ';') : ''),
      (estimatedSettings.secure ? ''.concat('secure=', estimatedSettings.secure, ';') : ''),
      (estimatedSettings.maxAge ? ''.concat('max-age=', estimatedSettings.maxAge, ';') : ''));

    dependency.document.cookie = estimatedCookie;

    return this;
  }

  /**
   * Return the value of the delivered key
   * 
   * @param {string} deliveredKey
   * @return {string|object}
   */
  function getItem(deliveredKey) {
    if (deliveredKey === false || hasOwnProperty(deliveredKey) === false) {
      return null;
    }

    return decodeURIComponent(dependency.document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*'.concat(
      encodeURIComponent(deliveredKey).replace(/[-.+*]/g, '\\$&'),
      '\\s*\\=\\s*([^;]*).*$)|^.*$')), '$1')) || null;
  }

  /**
   * Removes the delivered key
   * 
   * @param {string} deliveredKey
   * @param {object} deliveredSettings
   * @return {object}
   */
  function removeItem(deliveredKey, deliveredSettings) {
    var defaultSettings = {
        domain: '',
        path: '/',
      },
      estimatedSettings = deliveredSettings ? dependency.window.Object.assign(defaultSettings, deliveredSettings) : defaultSettings;

    if (deliveredKey === false || hasOwnProperty(deliveredKey) === false) {
      throw new Error('missing key');
    }

    dependency.document.cookie = encodeURIComponent(deliveredKey).concat(
      '=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      (estimatedSettings.domain ? ''.concat('; domain=', estimatedSettings.domain) : ''),
      (estimatedSettings.path ? ''.concat('; path=', estimatedSettings.path) : ''));

    return this;
  }

  /**
   * Returns the key of the delivered index
   * 
   * @param {number} deliveredIndex
   * @return {object}
   */
  function key(deliveredIndex) {
    var receivedKeys = dependency.document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/),
      estimatedKeySize = receivedKeys.length,
      index = 0;
    for (index < estimatedKeySize; index += 1) {
      receivedKeys[index] = decodeURIComponent(receivedKeys[index]);
    }

    return receivedKeys[deliveredIndex];
  }

  /**
   * Returns the number of cookies
   * 
   * @return {number}
   */
  function length() {
    return (dependency.document.cookie.match(/=/g) ? dependency.document.cookie.match(/=/g).length : 0);
  }

  /**
   * Return if an key is set
   * 
   * @param {string} deliveredKey
   * @return {boolean}
   */
  function hasOwnProperty(deliveredKey) {
    return (new RegExp('(?:^|;\\s*)'.concat(encodeURIComponent(deliveredKey).replace(/[-.+*]/g, '\\$&'), '\\s*\\=')).test(dependency.document.cookie));
  }

  /**
   * Deletes all cookie entries
   * 
   * @return {object}
   */
  function clear() {
    dependency.document.cookie.replace(/\s/g, '').split(';').forEach(function (receivedKV) {
      var estimatedKey = receivedKV.split('=')[0];
      removeItem(estimatedKey);
    });

    return this;
  }

  return {
    setItem: setItem,
    getItem: getItem,
    removeItem: removeItem,
    key: key,
    length: length,
    hasOwnProperty: hasOwnProperty,
    clear: clear,
  };
}({
  document: document,
  window: window,
}));

jstiller.modules = jstiller.modules || {};
jstiller.modules.storage = (function (dependency) {
  /**
   * Checks if the requested mode is supported
   *
   * @param {string} deliveredMode 
   */
  function supports(deliveredMode) {
    if (deliveredMode === 'cookie') {
      if (dependency.navigator.cookieEnabled) {
        return true;
      }

      return false;
    } else if (deliveredMode === 'localStorage') {
      if (dependency.window.localStorage) {
        return true;
      }

      return false;
    } else if (deliveredMode === 'sessionStorage') {
      if (dependency.window.sessionStorage) {
        return true;
      }

      return false;
    }

    return false;
  }

  /**
   * interface for cookies similar to localStorage or sessionStorage
   *
   * @return {object}
   */
  function cookie() {
    if (supports('cookie')) {
      return dependency.cookie;
    }

    return {
      setItem: function () {},
      getItem: function () {},
      removeItem: function () {},
      key: function () {},
      length: 0,
      hasOwnProperty: function () {},
    };
  }

  /**
   * @return {object}
   */
  function localStorage() {
    if (supports('localStorage')) {
      return dependency.window.localStorage;
    }

    return cookie();
  }

  /**
   * @return {object}
   */
  function sessionStorage() {
    if (supports('sessionStorage')) {
      return dependency.window.sessionStorage;
    }

    return cookie();
  }

  return {
    supports: supports,
    cookie: cookie,
    localStorage: localStorage,
    sessionStorage: sessionStorage,
  };
}({
  cookie: jstiller.components.cookie,
  window: window,
  navigator: navigator,
}));
