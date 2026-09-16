module.exports = (d) => {
  if (d.kind === 'element' && (d.elements || d.foreignKeys)) {
    // return console.log ('unfold struct', d.parent.name, d.name)
    // add flattened elements for structs
    for (let e in d.elements) {
      let name = d.name+'_'+e
      let flat = d.parent.elements[name] = {
        __proto__: d.elements[e], key: d.key,
        ... d.elements[e] // REVISIT: remove that for productive code
      }
      _add_derived (flat,'name',name)
    }
    // structs stay in model, bot become non-enumerable elements
    if (!d.isAssociation) _add_derived (d.parent.elements, d.name, d)
    // the flattended elements became keys -> structs associations aren't
    delete d.key
    // console.log (d.parent.name, d.name, d)
  }
}

const _add_derived = (o,p,v,enumerable=false) => {
  Object.defineProperty (o,p, { value:v, enumerable, writable:true, configurable:true })
  return v
}

;()=>{

  let payload1 ={
    struct_a: 6,
    struct_b: 6
  }

  let payload2 ={
    struct: { a: 6, b: 6 }
  }

  let payload3 ={
    struct: { a: 6, b: 6 },
    struct_a: 7,
    struct_b: 8
  }

}
