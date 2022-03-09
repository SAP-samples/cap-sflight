const log = require("@ui5/logger").getLogger("builder:tasks:custBuildTask-manifest");

/**
 *
 * @public
 * @typedef {object} ManifestBundlerOptions
 * @property {string} projectName Project Name
 * @property {string} namespace Namespace
 */
/**
 * Task for myCustomBuildTask.
 *
 * @public
 * @alias module:@ui5/builder.tasks.myCustomBuildTask
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {ManifestBundlerOptions} parameters.options Options
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function({workspace, options = {}}) {
  log.info('modify manifest.json BEGIN')

  const stack = options.configuration.stack
  const postfix = stack === 'java' ? 'J' : 'N';
  
  const allResources = await workspace.byGlob("/**/manifest.json");
  let r = allResources[0];
  let s = await r.getString();

  s = s.replace('sap.fe.cap.travel', 'sap.fe.cap.travel' + postfix)
  s = s.replace('sap.fe.cap.travel.i18n.i18n', 'sap.fe.cap.travel' + postfix + '.i18n.i18n')
  s = s.replace('{{title}}', '{{title-' + stack + '}}')
  s = s.replace('{{description}}', '{{description-' + stack + '}}')
  s = s.replace('Process Travels', 'Process Travels (' + stack + ')')
  s = s.replace('Process travels', 'Process travels (' + stack + ')')

  r.setString(s);
  await workspace.write(r);

  log.info('modify manifest.json END')
  return;
};
