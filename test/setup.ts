// for mocha
process.env.CDS_TYPESCRIPT = "true"
// disables cds-ui5-plugin as otherwise it would not let mocha tests terminate
process.env.CDS_PLUGIN_UI5_ACTIVE="false"

// for jest
module.exports = async () => {}
