const key=JSON.parse(process.argv[4].replace(/^.*/, ""));
const credentials=key.credentials /* new cfcli? */ || key;
console.log(process.argv[3]);
console.log(Object.keys(credentials).map(k => {
    if (credentials[k].match(/\n/s))
        return (`  ${k}: |\n${credentials[k]}`).replace(/\n/gs,"\n    ")
    else
        return `  ${k}: "${credentials[k]}"`
}).join("\n"))