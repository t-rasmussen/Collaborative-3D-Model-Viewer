const express = require('express')
const path = require('path')
const socket = require('socket.io')
const fs = require('fs')
const PORT = process.env.PORT || 6100
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

/*app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'jade');*/

app.get('/app', (req, resp) => {
    resp.sendFile('index.html', {root: path.join(__dirname, 'public')})
})

var server = app.listen(PORT, () =>{
    console.log("server is  listening on port " + PORT)
})

var io = socket(server, {wsEngine:'ws'})

io.on('connection', (socket) => {
    console.log("socket with id ", socket.id , "connected")

    socket.on("cameraPose", (role, data)=>{
        //console.log(data);
        socket.broadcast.emit("cameraPose", role, data);
    })

    socket.on("selectedObject", (role, data)=>{
        //console.log(data);
        socket.broadcast.emit("selectedObject", role, data);
    })
});

