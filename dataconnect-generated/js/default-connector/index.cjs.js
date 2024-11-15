const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Global-Plus-Vision',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

