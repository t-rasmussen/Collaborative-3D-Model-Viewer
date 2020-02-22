import * as THREE from './master/build/three.module.js';

import { OrbitControls } from './master/examples/jsm/controls/OrbitControls.js';

import { OBJLoader } from './master/examples/jsm/loaders/OBJLoader.js';

import Actor from './actor.js';


let margin = 50;
let viewWidth = window.innerWidth - margin;
let viewHeight = window.innerHeight - margin;
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


let controls;

const socket = io();

 //show prompt, where the user gets to type in a room name

 let role = "Chad"
 role = prompt("Please, enter your name", role);

 //if room value was not input in prompt, then choose default room name 'room1' 
 if(!role){
     role = 'designer';
 }

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
        if(actor.SelectedObject){
          actor.SelectedObject.material.color.set(timberColor);
        }
        actor.SelectedObject = scene.children[i];
        let rgb = actor.Color;
        actor.SelectedObject.material.color.set(new THREE.Color("rgb("+rgb[0]+","+ rgb[1]+","+rgb[2]+")")); 
      }
    }
  }
})

function main() {

      scene = new THREE.Scene();
      scene.background = new THREE.Color( 'lightgray' );
		  camera = new THREE.PerspectiveCamera( 75, viewWidth/viewHeight, 0.1, 1000 );

			const canvas = document.querySelector('#c');
      renderer = new THREE.WebGLRenderer({canvas});
			renderer.setSize( viewWidth, viewHeight );
	//		document.body.appendChild( renderer.domElement );

      var geometry = new THREE.BoxGeometry(1,1,1);
      let rgb = actor.Color;
      var c = new THREE.Color("rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")");
			var material = new THREE.MeshStandardMaterial( { color: c} );
      head = new THREE.Mesh( geometry, material );
      head.name = "head";
      scene.add(head);
      
     /* var geometry2 = new THREE.BoxGeometry(1,1,1);
      var material2 = new THREE.MeshStandardMaterial( { color: baseColor } );
      var cube2 = new THREE.Mesh( geometry2, material2 );
      cube2.name = "cube2";*/
      //cube2.position.y = 0.5;
      //cube2.position.x = 5;*/

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
      if(intersects[i].object.name.startsWith('cube')){
        intersection = true;
      }
    }

    if(intersection){
      //reset color on previously selected object
      for ( var i = 0; i < scene.children.length; i++ ) {
        if(scene.children[i].name){
          if(scene.children[i].name.startsWith('cube')){
            if(actor.SelectedObject){
              if(scene.children[i].name != actor.SelectedObject.name){
                scene.children[i].material.color.set(timberColor); 
              }
            }
            else{
              scene.children[i].material.color.set(timberColor); 
            }       
          }
        }
      }
    }

    for ( var i = 0; i < intersects.length; i++ ) {
      if(intersects[i].object.name.startsWith('cube')){
        intersects[ i ].object.material.color.set(highlightColor);
        document.getElementById('metaInfo').innerHTML = intersects[ i ].object.name;
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
  viewWidth = window.innerWidth - margin;
  viewHeight = window.innerHeight - margin;
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

  mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1; // ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -( event.touches[0].clientY / window.innerHeight ) * 2 + 1; //- ( event.clientY / window.innerHeight ) * 2 + 1;
  
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
        object.children[0].name = "cube"+i;
        object.children[0].material = new THREE.MeshStandardMaterial( { color: timberColor } );
        console.log(object)
        console.log(object.children[0])
        //objects.push( object.children[0] );
        scene.add( object.children[0] );

        //console.log("children of Zollinger " + object.children.length)
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
