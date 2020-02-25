import * as THREE from './master/build/three.module.js';

import { OrbitControls } from './master/examples/jsm/controls/OrbitControls.js';

import { OBJLoader } from './master/examples/jsm/loaders/OBJLoader.js';

import Actor from './actor.js';
import ObjectPiece from './object_piece.js';
import Message from './message.js';


let marginX = 0;
let marginY = 80;
let viewWidth = window.innerWidth - marginX;
let viewHeight = window.innerHeight - marginY;
let camera;
let renderer;
let scene;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
mouse.x = undefined;
mouse.y = undefined;
let objects = [];
let baseColor = 0x0000ff; 
let highlightColor = 0xff0000;
let timberColor = 0xc19a6b;
let objectPieces = [];


let controls;

const socket = io();

 //show prompt, where the user gets to type in a room name

 let room = "room1"
 room = prompt("Join a communication room ", room);

 //if room value was not input in prompt, then choose default room name 'room1' 
if(!room){
     room = 'room1';
}

let name = "Nicky"
name = prompt("Weclome back ", name);
//if name value was not input in prompt, then choose default name 'Nicky' 
if(!name){
    name = 'Nicky';
}

socket.emit("join", room, name);

let actor = new Actor(name, "red", 0);

let otherPeers = {};

let head;
let head2;

socket.on("cameraPose", (id, data) => {
  if(otherPeers[id]){
    let head = otherPeers[id].HeadObject;
    head.position.x = data.position.x;
    head.position.y = data.position.y;
    head.position.z = data.position.z;
  
    head.rotation.x = data.rotation._x;
    head.rotation.y = data.rotation._y;
    head.rotation.z = data.rotation._z;
  }
})

socket.on("selectedObject", (id, data) => {
  if(otherPeers[id]){
    for ( var i = 0; i < scene.children.length; i++ ) {
      if(scene.children[i].name){
        if(scene.children[i].name == data.name){
          let otherPeer = otherPeers[id];
          if(otherPeer.SelectedObject){
            otherPeer.SelectedObject.Object.material.color.set(timberColor);
          }
          otherPeer.SelectedObject = new ObjectPiece(scene.children[i]);
          let rgb = otherPeer.Color;
          otherPeer.SelectedObject.Object.material.color.set(new THREE.Color("rgb("+rgb[0]+","+ rgb[1]+","+rgb[2]+")"));
        }
      }
    }
  }
})


socket.on("thisPeerCreated", (peer) => {
  console.log("peer " + peer.name  + " created room " + room);
  actor.Color =  peer.color;
  actor.Id = peer.id;
})

socket.on("thisPeerJoined", (data) => {
  actor.Color =  data.peer.color;
  actor.Id = data.peer.id;
  
  let peers = data.peers;
  peers.forEach((peer) => {
    createPeer(peer);
  });
});

socket.on("otherPeerJoined", (peer) => {
  console.log("peer " + peer.name  + " joined room " + room);
  createPeer(peer);
})

socket.on("otherPeerLeft", (peer) => {
  console.log("peer " + peer.name  + " left room " + room);

  console.log("delete head object " + otherPeers[peer.id].HeadObject.name);
  let selectedObject = scene.getObjectByName(otherPeers[peer.id].HeadObject.name);
  scene.remove(selectedObject);
  delete otherPeers[peer.id];

})

socket.on("full", (room) => {
  console.log("room is full");
  alert("Room " + room + " is occupied by 6 people. Please connet to a different room");
});

function createPeer(peer){
  let otherActor = new Actor(peer.name, peer.color, peer.id);
  
  let geometry = new THREE.BoxGeometry(1,1,1);
  let rgb = otherActor.Color;
  let color = new THREE.Color("rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")");
  let material = new THREE.MeshStandardMaterial( { color: color} );
  let head = new THREE.Mesh( geometry, material);
  head.name = "head"+otherActor.Id;
  head.position.x = 1000;
  
  otherActor.HeadObject = head;
  scene.add(head);
  
  otherPeers[otherActor.Id] = otherActor;
}


let allBtn = document.getElementById("allBtn");
allBtn.addEventListener('click', () => {
  showAll();
});

let waitingBtn = document.getElementById("waitingBtn");
waitingBtn.addEventListener('click', () => {
  showAllWaiting();
});

let fabricatedBtn = document.getElementById("fabricatedBtn");
fabricatedBtn.addEventListener('click', () => {
  showAllFabricated();
});

let shippedBtn = document.getElementById("shippedBtn");
shippedBtn.addEventListener('click', () => {
  showAllShipped();
});

let onsiteBtn = document.getElementById("onsiteBtn");
onsiteBtn.addEventListener('click', () => {
  showAllOnsite();
});

let assembledBtn = document.getElementById("assembledBtn");
assembledBtn.addEventListener('click', () => {
  showAllAssembled();
});

function main() {

      scene = new THREE.Scene();
      scene.background = new THREE.Color( 'white' );
      camera = new THREE.PerspectiveCamera( 50, viewWidth/viewHeight, 0.1, 1000 );
      camera.position.x = 25;
      camera.position.y = 30;
      camera.position.z = 25;


			const canvas = document.querySelector('#c');
      renderer = new THREE.WebGLRenderer({canvas});
			renderer.setSize( viewWidth, viewHeight );
	//		document.body.appendChild( renderer.domElement );


      var planeGeometry = new THREE.PlaneGeometry(20,20,32);
      var planeMaterial = new THREE.MeshBasicMaterial( {color: new THREE.Color("rgb(240, 240, 240)"), side: THREE.DoubleSide} );
      var plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.rotation.x = THREE.Math.degToRad( 90 ); 

      loadObjModels();
  
      var light = new THREE.PointLight( 0xffffff, 1, 100 );
      light.position.set( 5, 5, 5 );

      var light2 = new THREE.PointLight( 0xffffff, 1, 100 );
      light2.position.set( -5, -5, -5 );

      var ambient = new THREE.AmbientLight( 0xADD8E6, 0.3 );
      scene.add(ambient);

      //scene.add( cube );
      //scene.add( cube2 );
      scene.add( light );
      scene.add( light2 );

      scene.add(plane);

      camera.position.z = 5;
      
      controls = new OrbitControls( camera, renderer.domElement );
      controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
			controls.dampingFactor = 0.05;

			controls.screenSpacePanning = false;

			controls.minDistance = 5;
			controls.maxDistance = 100;

			controls.maxPolarAngle = Math.PI / 2;

			var animate = function () {
				requestAnimationFrame( animate );

        
        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

       // raycast();

        socket.emit("cameraPose", room, actor.Id,
        {
          position:camera.position,
          rotation:camera.rotation
        });

				renderer.render( scene, camera );
			};

			animate();
}

main();

let intersection = false;
function select(){
  // update the picking ray with the camera and mouse position
  if(mouse.x){
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );
    

    for ( var i = 0; i < intersects.length; i++ ) {
      console.log("intersected with " + intersects[i].object.name);
      if(intersects[i].object.name.startsWith('timber')){
        if(actor.SelectedObject){
          actor.SelectedObject.Object.material.color.set(timberColor);
        }

        actor.SelectedObject = new ObjectPiece(intersects[i].object);
        let rgb = actor.Color;
        actor.SelectedObject.Object.material.color.set(new THREE.Color("rgb("+rgb[0]+","+ rgb[1]+","+rgb[2]+")")); 
       
        document.getElementById('metaInfo').innerHTML = actor.SelectedObject.Object.name +" element";
        socket.emit("selectedObject", room, actor.Id, {
          name: intersects[ i ].object.name
        })
        break;
      }
    }

  }
}


window.addEventListener('resize', onWindowResize, false );

window.addEventListener('touchstart', onTouchStart, false );

window.addEventListener('click', onMouseClick, false );

function onWindowResize(){
  console.log("window resize");
  viewWidth = window.innerWidth - marginX;
  viewHeight = window.innerHeight - marginY;
  camera.aspect = viewWidth / viewHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( viewWidth, viewHeight );
}

function onMouseClick( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x =  ( event.clientX / viewWidth ) * 2 - 1;
  mouse.y =- ( event.clientY / viewHeight ) * 2 + 1;
  
  select();
}

function onTouchStart( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

  mouse.x = ( event.touches[0].clientX / viewWidth ) * 2 - 1; // ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -( event.touches[0].clientY / viewHeight ) * 2 + 1; //- ( event.clientY / window.innerHeight ) * 2 + 1;
  
  select();
}

function loadObjModels(){
  var loader = new OBJLoader();

  let count = 97
  for(let i = 0; i < count; i++){
    // load a resource
    loader.load(
      // resource URL
      './models/OBJ/'+i+'.obj',
      // called when resource is loaded
      function ( object ) {
        object.children[0].name = "timber"+i;
        object.children[0].material = new THREE.MeshStandardMaterial( { color: timberColor } );
        //objects.push( object.children[0] );
       // console.log(object.children[0].uuid);¨
        let objPiece = new ObjectPiece(object.children[0]);
        let split = 97.0/5.0;

       
        if(i < split*1){
          console.log("waiting");
          objPiece.FabricationStatus = "waiting";
        }
        else if(i < split*2){
          console.log("fabricated");
          objPiece.FabricationStatus = "fabricated";
        }
        else if(i < split*3){
          console.log("shipped");
          objPiece.FabricationStatus = "shipped";
        }
        else if(i < split*4){
          objPiece.FabricationStatus = "onsite";
        }
        else if(i < split*5){
          objPiece.FabricationStatus = "assembled";
        }


        objectPieces.push(objPiece);
        scene.add( object.children[0] );  
      },
      // called when loading is in progresses
      function ( xhr ) {

       // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );

      }
    );

  }
}

function showAll(){
  objectPieces.forEach((objPiece) => {
    objPiece.Object.visible = true;
  });
}

function showAllWaiting(){
  objectPieces.forEach((objPiece) => {
    if(objPiece.FabricationStatus == "waiting"){
      objPiece.Object.visible = true;
      console.log("waiting is visible")
    }
    else{
      objPiece.Object.visible = false;
    }
  });
}

function showAllFabricated(){
  objectPieces.forEach((objPiece) => {
    if(objPiece.FabricationStatus == "fabricated"){
      objPiece.Object.visible = true;
    }
    else{
      objPiece.Object.visible = false;
    }
  });
}

function showAllShipped(){
  objectPieces.forEach((objPiece) => {
    if(objPiece.FabricationStatus == "shipped"){
      objPiece.Object.visible = true;
    }
    else{
      objPiece.Object.visible = false;
    }
  });
}

function showAllOnsite(){
  objectPieces.forEach((objPiece) => {
    if(objPiece.FabricationStatus == "onsite"){
      objPiece.Object.visible = true;
    }
    else{
      objPiece.Object.visible = false;
    }
  });
}

function showAllAssembled(){
  objectPieces.forEach((objPiece) => {
    if(objPiece.FabricationStatus == "assembled"){
      objPiece.Object.visible = true;
    }
    else{
      objPiece.Object.visible = false;
    }
  });
}
