// for mocha
process.env.CDS_TYPESCRIPT = "true";

// for jest
module.exports = async () => {
    process.env.CDS_TYPESCRIPT = "true";
};
