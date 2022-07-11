const log = require("@ui5/logger").getLogger("builder:tasks:custBuildTask-xsApp");

const path = require("path");
const {Resource} = require("@ui5/fs");
const fs = require('fs')

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
  log.info('add xs-app.json BEGIN')

  const postfix = options.configuration.stack === 'java' ? 'J' : 'N';
  
  const allResources = await workspace.byGlob("/**/manifest.json");
  let r = allResources[0];
  var aResourcePath = r.getPath();
  const newResourcePath = path.posix.join(path.posix.dirname(aResourcePath), "xs-app.json");

  var s = fs.readFileSync('xs-app.json', 'utf8')
  s = s.replace('sflight', 'sflight' + postfix)

  const myNewResource = new Resource({
    path: newResourcePath,
    string: s
  })
  await workspace.write(myNewResource);

  log.info('add xs-app.json END')
  return;
};
