var camera, scene, renderer, controls,texture, mazeMesh;

var meshs = [];
var castle=[];

var raycaster=new THREE.Raycaster();

// var group = new THREE.Group();

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = 'block';

      instructions.style.display = '';

    }

  };

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

function init() {
  // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
  //FOV=how far you can see out your peripheral vision
  //aspect=how narrow or wide you fov is
  //near=nearest boundary you can see
  //far= farest boundary you can see
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  // camera.position.y=700;
  // camera.position.x=0;
  // camera.position.x=0;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x3d3d5c );
  // scene.fog = new THREE.Fog( 0xcccccc, 0, 750 );

// HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
  var light = new THREE.HemisphereLight( 0xffffff, 0.5 );
  light.position.set( 0, 0, 0 );
  scene.add( light );

  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );

  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true; break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

    }

  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  // var vertices;
  
  // var loader = new THREE.STLLoader();
	// 			loader.load( 'maze.stl', function ( geometry = new THREE.Geometry()) {
  //         var mazeContainerTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  //         mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.RepeatWrapping;
  //         mazeContainerTexture.repeat.set( 1, 1 );
	// 				// var mazeContainerMaterial = new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: true } );
  //         var mazeContainerMaterial = new THREE.MeshPhongMaterial( { map:mazeContainerTexture } );
  //         // var mazeContainerMaterial = new THREE.MeshPhongMaterial( { map:THREE.TextureLoader().load('stoneWall.jpg') } );
  //         
	// 				var mazecontainermesh = new THREE.Mesh( geometry, mazeContainerMaterial );
  //         // console.log("mazemesh",mazecontainermesh.position.x,mazecontainermesh.position.y,mazecontainermesh.position.z)
	// 				// mazecontainermesh.position.set(0,0,0);
	// 				mazecontainermesh.rotation.set(-Math.PI/2,0,0);
  //         // console.log("afterrotatemazemesh",mazecontainermesh.position.x,mazecontainermesh.position.y,mazecontainermesh.position.z)
  //         // console.log(mazecontainermesh.position)
	// 				// mesh.scale.set( 1000, 1000, 1000 );
	// 				// mesh.castShadow = true;
	// 				// mesh.receiveShadow = true;
  //         geometry.computeBoundingBox();
  //         // console.log(box)
  //         // console.log("hello",goemetry.faces)
  //         // console.log(geometry.attributes.position.array)
  //         // vertices=geometry.attributes.position.array
  //         console.log(geometry)
  //         console.log(geometry.faceVertexUvs)
  //         // console.log(geometry.boundingSphere)
	// 				scene.add( mazecontainermesh );
	// 			} );
  
  //THIS MAKES CASTLE LOOKING BUILDING IN THE MIDDLE OF THE WORLD
  var mazeContainerTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.RepeatWrapping;
  mazeContainerTexture.repeat.set( 3, 3 );
  var mazeContainerMaterial = new THREE.MeshPhongMaterial( { map:mazeContainerTexture } );
  mazeContainerMaterial.side = THREE.DoubleSide;
  
  // var frontRect = new THREE.BoxGeometry( 250, 600, 250 );
  // frontRect.translate(0,0,350);
  // var frontRectMesh=new THREE.Mesh(frontRect,mazeContainerMaterial);
  // frontRectMesh.scale.set(1.5,1.5,1.5);
  // makeStatic3dCubeorRect(frontRectMesh);
  // 
  // var rearRect= new THREE.BoxGeometry( 250, 1000, 250 );
  // var rearRectMesh=new THREE.Mesh(rearRect,mazeContainerMaterial);
  // rearRectMesh.scale.set(1.5,1.5,1.5);
  // makeStatic3dCubeorRect(rearRectMesh);

  // var sideRect2=new THREE.BoxGeometry( 250, 800, 250 );
  // sideRect2.rotateY(Math.PI/4);
  // sideRect2.translate(200,0,175);
  // var sideRect2Mesh=new THREE.Mesh(sideRect2,mazeContainerMaterial);
  // sideRect2Mesh.scale.set(1.5,1.5,1.5);
  // makeStatic3dCubeorRect(sideRect2Mesh);
  

  var sideRect1=new THREE.BoxGeometry( 250, 800, 250 );
  sideRect1.rotateY((Math.PI/4));
  sideRect1.translate(-200,0,175);
  var sideRect1Mesh=new THREE.Mesh(sideRect1,mazeContainerMaterial); 
  sideRect1Mesh.scale.set(1.5,1.5,1.5); 
  makeStatic3dCubeorRect(sideRect1Mesh);
  
  // var center=sideRect1.boundingBox.getCenter(new THREE.Vector3());
  // console.log(sideRect1Mesh.localToWorld(center));

  meshs.push(sideRect1Mesh);

  // meshs.push(frontRectMesh,rearRectMesh,sideRect1Mesh,sideRect2Mesh);
  
  // raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
  
  // THIS MAKES THE GROUND

  var groundgeometry = new THREE.PlaneGeometry( 5000, 5000, 99, 99 );
    groundgeometry.rotateX( - Math.PI / 2 );
  
    // for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
    // 
    //   geometry.vertices[ i ].y = 200 * Math.sin( i / 2 );
    // 
    // }
    var texture = new THREE.TextureLoader().load( "sand1.jpg" );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 50, 50 );
    material = new THREE.MeshBasicMaterial( {map: texture} );
    groundmesh = new THREE.Mesh( groundgeometry, material );
    meshs.push(groundmesh);

    
    //THIS MAKES THE DOOR MESH
    var mazeEnterancetexture = new THREE.TextureLoader().load( "mazeEnterance.png" );
    mazeEnterancetexture.wrapS = mazeEnterancetexture.wrapT = THREE.ClampToEdgeWrapping;
    var mazeEnterancegeometry = new THREE.PlaneGeometry( 100, 100, 100);
    //THESE TWO DO ESSENTIALLY THE SAME THING BUT USE PHONG IT HAS MORE VERSATILITY I THINK?
    var mazeEnterancematerial = new THREE.MeshPhongMaterial( {transparent: true,map: mazeEnterancetexture} );
    // var mazeEnterancematerial = new THREE.MeshLambertMaterial( {transparent: true,map: mazeEnterancetexture} );
    var mazeEnteranceMesh= new THREE.Mesh( mazeEnterancegeometry, mazeEnterancematerial );
    mazeEnteranceMesh.position.set(-48,0,937)
    meshs.push(mazeEnteranceMesh);

    

  // objects

  // var boxGeometry = new THREE.BoxGeometry( 20, 20, 20 );
  // 
  // for ( var i = 0, l = boxGeometry.faces.length; i < l; i ++ ) {
  // 
  //   var face = boxGeometry.faces[ i ];
  //   face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  // 
  // }
  // 
  // for ( var i = 0; i < 500; i ++ ) {
  // 
  //   var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
  //   boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  // 
  //   var box = new THREE.Mesh( boxGeometry, boxMaterial );
  //   box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
  //   box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
  //   box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
  // 
  //   scene.add( box );
  //   objects.push( box );
  // 
  // }
  // console.log(raycaster.intersectObjects( objects ));
  //
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  // console.log("camera",camera,"rotation",camera.rotation);
  // console.log("controls",controls.getObject(),"rotation",controls.getObject().rotation);
  // console.log(raycaster);
  // console.log(meshs);
  // var box=new THREE.BoxGeometry(10,30,25);
  // box.rotateY(Math.PI*(7/36));
  // box.translate(30,0,100);
  // console.log(box);
  // var boxMesh=new THREE.Mesh(box);
  // // boxMesh.position.x=30;
  // // boxMesh.position.z=100;
  // box.computeBoundingBox();
  // box.boundingBox.rotation=new THREE.Euler(0,Math.PI/4,0,'XYZ');
  // console.log(box.boundingBox.rotation);
  // var center=boxMesh.geometry.boundingBox.getCenter(new THREE.Vector3());
  // console.log(boxMesh);
  // console.log(center);
  // console.log(boxMesh.localToWorld(center));
  // var hbox = new THREE.BoxHelper( boxMesh, 0xffff00 );
  // scene.add( hbox );
  // scene.add(boxMesh);
  // var axesHelper = new THREE.AxesHelper(100);
  // scene.add( axesHelper );
  console.log(castle);
  addObjstoScene();
  

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function addObjstoScene(){
  for(i=0;i<meshs.length;i++){
    scene.add(meshs[i]);
  }
}

function makeStatic3dCubeorRect(mesh){
  // mesh.geometry.computeBoundingBox();
  // var center=mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
  
  var vector1=mesh.geometry.vertices[0];
  var vector2=mesh.geometry.vertices[1];
  var vector3=mesh.geometry.vertices[4];
  var vector4=mesh.geometry.vertices[5];
  verts=[vector1,vector2,vector3,vector4];
  sides=makeSides(verts);
  var object=new Static3dCubeorRect(mesh,sides);
  // if(rotationX!=0 || rotationY!=0 || rotationZ!=0){
  //   object.isRotated=true;
  //   object.Xrotation=rotationX;
  //   object.Yrotation=rotationY;
  //   object.Zrotation=rotationZ;
  // }
  // object.vert1=vector1;
  // object.vert2=vector2;
  // object.vert3=vector3;
  // object.vert4=vector4;
  // object.x1Boundary=vector1.x;
  // object.x2Boundary=vector2.x;
  // object.z1Boundary=0;
  // object.z2Boundary=0;
  // object.x3Boundary=0;
  // object.x4Boundary=0;
  // object.z3Boundary=0;
  // object.z4Boundary=0;
  
  // boundaries=findOrigVertices(object);
  // object.xBoundary=
  // object.zBoundary=
  castle.push(object);
  // console.log(castle);
}

function makeSides(vertsIn){
  sides=[];
  for(i=0;i<vertsIn.length;i++){
    var vert1;
    var vert2;
    if(i+1==vertsIn.length){
      vert1=vertsIn[vertsIn.length-1];
      vert2=vertsIn[0];
    }else{
      vert1=vertsIn[i];
      vert2=vertsIn[i+1];
    }
    var side=new rectorsquareside(vert1,vert2);
    sides.push(side);
  }
  // console.log(sides);
  return sides;
}
//FINISH WRITING THIS METHOD AND MAKE SURE THAT MAKESIDES METHOD WORKS
function isInsideBuilding(playerPos,count){
  var triangleArea=0;
  var isInside=false;
  // playerPos=controls.getObject().position;
  // console.log(playerPos);
  for(i=0;i<castle.length;i++){
    // rect=castle[i];
    triangleArea=0;
    for (j=0;j<castle[i].sides.length;j++){
      side=castle[i].sides[j]
      // rectSides=rect.sides;
      // h=Math.sqrt((castle[i].sides[j].halfx-playerPos.x)**2 + (castle[i].sides[j].halfz-playerPos.z)**2);
      // console.log(h);

      // b=arrayIn[i].sides[j].length
      // area=.5*castle[i].sides[j].base*h
      //PLAYERPOS is 1 VECT1 is 2 and VECT2 is 3
      // var area=0;
      var area=.5*(playerPos.x*(side.vert1.z-side.vert2.z) + side.vert1.x*(side.vert2.z-playerPos.z) + side.vert2.x*(playerPos.z-side.vert1.z));      
      triangleArea=triangleArea+Math.abs(area);
      
      // if (count%200==0){
      //   console.log("Playerpos",playerPos,"area: ",area,"vert1: ",side.vert1,"vert2: ",side.vert2,"\n");
      // }
    }
    // if (count%50==0){
    //   console.log("Tirarea: ",triangleArea,"Squarearea: ",castle[i].area,"playerPos: ", playerPos, castle[i].mesh, "i: ",i);
    //   // console.log(playerPos);
    //   if(triangleArea==castle[i].area){
    //     console.log("you are inside the box");
    //     break;
    //   }else{
    //     console.log("you are outside the box");
    //   }
    // }
    
    if(triangleArea==castle[i].area){
      console.log("you are inside the box");
      break;
    }else{
      console.log("you are outside the box");
    }
  }
}


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}
var count=0;
function animate() {
  

  requestAnimationFrame( animate );

  if ( controlsEnabled === true ) {
    playerPos=controls.getObject().position;
    // console.log(playerPos);
  //   if (count%25==0){
  // console.log(controls.getObject().position)
  // // console.log("camerarotation",camera.rotation);
  // // console.log("controlsrotation",controls.getObject().rotation);
  // // console.log
  //   }
  
    // raycaster.ray.origin.copy( controls.getObject().position );
    // raycaster.ray.origin.y -= 10;
    // raycaster.set(camera.position,camera.position.normalize());
    // var intersections = raycaster.intersectObjects( objects );
    // // console.log(intersections)
    // // console.log(raycaster.intersectObjects( objects ));
    // var onObject = intersections.length > 0;
    // console.log(onObject)
    isInsideBuilding(playerPos,count);
    count++;
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 5 * delta;
    velocity.z -= velocity.z * 5 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveLeft ) - Number( moveRight );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    // if ( onObject === true ) {
    // 
    //   velocity.y = Math.max( 0, velocity.y );
    //   canJump = true;
    // 
    // }

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

    prevTime = time;
    // for(i=0;i<objects.length;i++){
    //   objects[i].computeBoundingBox();
    //   // objects[i].center();
    //   var collision = objects[i].boundingBox.containsPoint(controls.getObject().position);
    //   if(collision){
    //     // console.log("collided");
    //   }
    //   }
      // console.log(collision);
    
    // mazeMesh.geometry.computeBoundingBox();
    // // mazeMesh.geometry.center()
    // var collision = mazeMesh.geometry.boundingBox.containsPoint(controls.getObject().position);
    // console.log(collision);
    
    // isInsideBuilding();

  }

  renderer.render( scene, camera );

}


















// var container;
// var camera, scene, renderer;
// var mouseX = 0, mouseY = 0;
// var windowHalfX = window.innerWidth / 2;
// var windowHalfY = window.innerHeight / 2;
// 
// init();
// animate();
// 
// function init() {
//   container = document.createElement('div');
//   document.body.appendChild(container);
// 
//   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
//   camera.position.z = 100;
// 
//   // scene
//   scene = new THREE.Scene();
// 
//   var ambient = new THREE.AmbientLight(0xbbbbbb);
//   scene.add(ambient);
// 
//   var directionalLight = new THREE.DirectionalLight(0xdddddd);
//   directionalLight.position.set(0, 0, 1);
//   scene.add(directionalLight);
// 
//   // texture
//   var manager = new THREE.LoadingManager();
//   manager.onProgress = function(item, loaded, total) {
// 
//     console.log(item, loaded, total);
// 
//   };
// 
//   var texture = new THREE.Texture();
// 
//   var onProgress = function(xhr) {
//     if (xhr.lengthComputable) {
//       var percentComplete = xhr.loaded / xhr.total * 100;
//       console.log(Math.round(percentComplete, 2) + '% downloaded');
//     }
//   };
// 
//   var onError = function(xhr) {};
// 
//   var loader = new THREE.ImageLoader(manager);
//    loader.load('stoneWall.jpg', function(image) {
// 
//     texture.image = image;
//     texture.needsUpdate = true;
// 
//   });
// 
//   // model
//   // var loader = new THREE.STLLoader(manager);
//   // 				loader.load( 'maze.stl', function ( object ) {
//   //           object.traverse(function(child){
//   //             if (child instanceof THREE.Mesh){
//   //               child.material.map=texture
//   //             }
//   // 				} );
//   var loader = new THREE.OBJLoader(manager);
//   loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/286022/Bulbasaur.obj', function(object) {
//   
//     object.traverse(function(child) {
//   
//       if (child instanceof THREE.Mesh) {
//   
//         child.material.map = texture;
//   
//       }
//   
//     });
// 
//     // console.log(object.getAttribute('position'));
//     console.log(object)
//     object.scale.x = 45;
//     object.scale.y = 45;
//     object.scale.z = 45;
//     object.rotation.y = 3;
//     object.position.y = -10.5;
//     scene.add(object);
// 
//   }, onProgress, onError);
// 
//   renderer = new THREE.WebGLRenderer({ alpha: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   container.appendChild(renderer.domElement);
// 
//   document.addEventListener('mousemove', onDocumentMouseMove, false);
// 
//   window.addEventListener('resize', onWindowResize, false);
// 
// }
// 
// function onWindowResize() {
// 
//   windowHalfX = window.innerWidth / 2;
//   windowHalfY = window.innerHeight / 2;
// 
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// 
//   renderer.setSize(window.innerWidth, window.innerHeight);
// 
// }
// 
// function onDocumentMouseMove(event) {
// 
//   mouseX = (event.clientX - windowHalfX) / 2;
//   mouseY = (event.clientY - windowHalfY) / 2;
// 
// }
// 
// //
// 
// function animate() {
// 
//   requestAnimationFrame(animate);
//   render();
// 
// }
// 
// function render() {
// 
//   camera.position.x += (mouseX - camera.position.x) * .05;
//   camera.position.y += (-mouseY - camera.position.y) * .05;
// 
//   camera.lookAt(scene.position);
// 
//   renderer.render(scene, camera);
// 
// }