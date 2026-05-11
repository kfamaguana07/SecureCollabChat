const { parentPort, workerData } = require('worker_threads');
const bcrypt = require('bcrypt');

(async () => {
  try {
    if (workerData.mode === 'compare') {
      const result = await bcrypt.compare(workerData.password, workerData.hash);
      parentPort.postMessage({ success: true, result });
      return;
    }

    if (workerData.mode === 'hash') {
      const result = await bcrypt.hash(workerData.password, workerData.rounds);
      parentPort.postMessage({ success: true, result });
      return;
    }

    parentPort.postMessage({ success: false, error: 'Modo de autenticacion no soportado.' });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
