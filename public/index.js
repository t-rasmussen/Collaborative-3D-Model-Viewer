import * as THREE from './master/build/three.module.js';

import { OrbitControls } from './master/examples/jsm/controls/OrbitControls.js';

import { OBJLoader } from './master/examples/jsm/loaders/OBJLoader.js';

import Actor from './actor.js';
import ObjectPiece from './object_piece.js';
import Message from './message.js';


let marginX = 0;
let marginY = 150;
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
let head;
let objectPieces = [];


let controls;

const socket = io();

 //show prompt, where the user gets to type in a room name

 let role = "Chad"
 role = prompt("Please, enter your name", role);

 //if room value was not input in prompt, then choose default room name 'room1' 
 if(!role){
     role = 'Designer';
 }

let otherActor = new Actor("other");
let actor = new Actor(role);

socket.on("cameraPose", (role, data) => {
  head.position.x = data.position.x;
  head.position.y = data.position.y;
  head.position.z = data.position.z;
 
  head.rotation.x = data.rotation._x;
  head.rotation.y = data.rotation._y;
  head.rotation.z = data.rotation._z;
})

socket.on("selectedObject", (role, data) => {
  for ( var i = 0; i < scene.children.length; i++ ) {
    if(scene.children[i].name){
      if(scene.children[i].name == data.name){
        if(otherActor.SelectedObject){
          otherActor.SelectedObject.Object.material.color.set(timberColor);
        }
        otherActor.SelectedObject = new ObjectPiece(scene.children[i]);
        let rgb = otherActor.Color;
        otherActor.SelectedObject.Object.material.color.set(new THREE.Color("rgb("+rgb[0]+","+ rgb[1]+","+rgb[2]+")")); 
      }
    }
  }
})

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
      scene.background = new THREE.Color( 'lightgray' );
		  camera = new THREE.PerspectiveCamera( 75, viewWidth/viewHeight, 0.1, 1000 );

			const canvas = document.querySelector('#c');
      renderer = new THREE.WebGLRenderer({canvas});
			renderer.setSize( viewWidth, viewHeight );
	//		document.body.appendChild( renderer.domElement );

      var geometry = new THREE.BoxGeometry(1,1,1);
      let rgb = otherActor.Color;
      var c = new THREE.Color("rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")");
			var material = new THREE.MeshStandardMaterial( { color: c} );
      head = new THREE.Mesh( geometry, material );
      head.name = "head";
      scene.add(head);


      var planeGeometry = new THREE.PlaneGeometry(20,20,32);
      var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
      var plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.rotation.x = THREE.Math.degToRad( 90 ); 

      loadObjModels();
  
      var light = new THREE.PointLight( 0xffffff, 1, 100 );
      light.position.set( 5, 5, 5 );

      var ambient = new THREE.AmbientLight( 0xADD8E6, 0.3 );
      scene.add(ambient);

      //scene.add( cube );
      //scene.add( cube2 );
      scene.add( light );

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

        socket.emit("cameraPose", role,
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
       
        document.getElementById('metaInfo').innerHTML = actor.SelectedObject.Object.name;
        socket.emit("selectedObject", role, {
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
        let v = Math.floor(Math.random() * 5);
        if(v == 0){
          objPiece.FabricationStatus = "waiting";
        }
        else if(v == 1){
          objPiece.FabricationStatus = "fabricated";
        }
        else if(v == 2){
          objPiece.FabricationStatus = "shipped";
        }
        else if(v == 3){
          objPiece.FabricationStatus = "onsite";
        }
        else if(v == 4){
          objPiece.FabricationStatus = "assembled";
        }

        objectPieces.push(objPiece);
        scene.add( object.children[0] );  
      },
      // called when loading is in progresses
      function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );

      }
    );

  }
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
