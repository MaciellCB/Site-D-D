(function () {
  const isLocal = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1';

  const serverUrl = isLocal
    ? 'http://localhost:3000'
    : 'https://dandd-chan.onrender.com';

  window.APP_CONFIG = {
    serverUrl,
    apiUrl: `${serverUrl}/api`
  };
})();
