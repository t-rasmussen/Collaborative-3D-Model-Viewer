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


let ryanRole;
let nickyRole;
let troelsRole;
let connections = [];
let colors = ["red", "blue", "yellow", "orange", "green", "violet"]

io.on('connection', (socket) => {
    console.log("socket with id ", socket.id , "connected")

    socket.on('join', (room, name) => {
      /*  if(role == "Ryan"){
            ryanRole = "Ryan"
        }
        else if(role == "Nicky"){
            nickyRole = "Nicky"
        }
        else if(role == "Troels"){
            troelsRole = "Troels";
        }*/

        let roomOfClients = io.nsps['/'].adapter.rooms[room];
        let numClients;
        if(!roomOfClients){
            numClients = 0;
            connections[room] = [];
        }
        else{
            numClients = roomOfClients.length;
        }

        if(numClients === 0){
            socket.join(room)
            console.log("Peer created " + room);
            let color = colors[0];
            let peer = {
                name: name,
                color:color,
                socketId : socket.id
            }
            socket.emit('peerCreated', peer);
            connections[room].push(peer);
        }
        else if(numClients > 0 && numClients < 6){
            socket.join(room);
            console.log("Peer joined " + room);     
           
            if(colors.length > connections[room].length){
                color = colors[connections[room].length]; 
            }
            else{
                color = "red";
            }
            let peer = {
                name: name,
                color:color,
                socketId : socket.id
            }
            socket.emit('joined', {
                peer:peer,
                peers: connections[room]    
            })   
            socket.broadcast.to(room).emit('peerJoined', peer);
            connections[room].push(peer);
        }
        else {
            socket.emit('full', room);
        }

       /* connections.push(role);
        console.log([ryanRole, nickyRole, troelsRole]);
        socket.emit('joined', {
            peers: [ryanRole, nickyRole, troelsRole]
        })*/

        
       // socket.broadcast.emit("peerJoined", role);
    });

    socket.on('disconnect', (reason) => {
        console.log("socket with id " + socket.id + " disconnected");
        //delete disconnected socket from each room it is part of by running through from dictionary with rooms 
        for(let room in connections) {
            let peers = connections[room];
            let i = 0;
            let deleteIndices = [];
            let peer;
            peers.forEach(p => {
                if(p.socketId === socket.id){
                    peer = p;
                    deleteIndices.push(i);
                }
                i++;
            })

            deleteIndices.forEach(i => {
                peers.splice(i, 1)
            })

            if(peers.length === 0){
                //if array is empty, delete key
                delete connections[room]; 
            }

            //send updated peers list to all peers in the room-all
            if(deleteIndices.length > 0){
                socket.broadcast.to(room).emit('peerLeft', peer);
            }

            console.log("connections after socket disconnected " + peers);   
        }
    })

    socket.on("cameraPose", (room, name, data)=>{
        //console.log(data);
        socket.broadcast.to(room).emit("cameraPose", name, data);
    })

    socket.on("selectedObject", (room, name, data)=>{
        //console.log(data);
        socket.broadcast.to(room).emit("selectedObject", name, data);
    })


});

