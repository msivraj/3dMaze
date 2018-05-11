const express = require('express')
const app = express()
var path = require('path');

//app.get('/', (req, res) => res.send('Hello World!'))
// app.get('/', function(req, res) {
//   console.log(path.join(__dirname))
//     res.sendFile(path.join(__dirname));
// });
app.use(express.static('.'))


app.listen(8080, () => console.log('Example app listening on port 3000!'))


// const express = require('express')
// const app = express()
// 
// app.get('/', (req, res) => res.send('Hello World!'))
// 
// app.listen(8080, () => console.log('Example app listening on port 3000!'))