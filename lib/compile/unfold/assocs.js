module.exports = (d) => {
  if (d.kind === 'element' && !d.on && d.keys) {
    // return console.log ('unfold assoc:', d.parent.name, d.name)
    // Managed Associations become unmanaged ones
    d.on = d.keys.reduce((on,k) => {
      return on.concat([ {ref:[ d.name, ...k.ref ]}, '=', {ref:[ k.as||k.ref[0] ]} ])
    }, [])
    Object.defineProperty (d, 'keys', {value:d.keys, configurable:true, enumerable:false})
  }
}
