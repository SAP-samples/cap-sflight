// Lower highwater mark to get more frequent updates on the request
require('stream').Readable.setDefaultHighWaterMark(false, 1 << 7)

const http = require('http')
const { spawn } = require('child_process')

const server = http.createServer((req, res) => {
  if (req.url !== '/start') {
    res.writeHead(404)
    return res.end()
  }
  if(req.method !== 'GET') {
    res.writeHead(200)
    return res.end()
  }
  try {
    const jest = spawn('npx', ['jest', '--forceExit'], { cmd: __dirname, stdio: 'pipe' })
    res.writeHead(200)
    res.on('close', () => jest.kill())
    jest.stdout.pipe(res)
    jest.stderr.pipe(res)
    jest.on('exit', code => {
      if (code) {
        res.write(`Process exited with code ${code}`)
      }
      res.end()
    })
  } catch (e) {
    console.error(e)
    res.end(e)
  }
})

const port = process.env.PORT || 4005
server.listen(port, (err) => {
  if (err) {
    console.error(err)
    return process.exit(1)
  }
  console.log(`listening on port: ${port}`)
})