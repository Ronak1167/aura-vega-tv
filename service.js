const {onStartService, onStopService} = require('./src/headless/ContentPersonalizationHeadlessService');

module.exports = {
  onStart: onStartService,
  onStop: onStopService,
};
