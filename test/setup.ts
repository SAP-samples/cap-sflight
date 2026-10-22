// for mocha
process.env.CDS_TYPESCRIPT = "true"
// disables cds-ui5-plugin as otherwise it would not let mocha tests terminate
process.env.CDS_PLUGIN_UI5_ACTIVE="false"
// disables the MCP endpoints (srv/mcp.cds), as jest can't load @cap-js/mcp's
// ESM-only dependencies
process.env.CDS_PROTOCOLS_MCP="false"

// for jest
module.exports = async () => {}
