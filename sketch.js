var camera, tick = 0,
    scene, renderer, clock = new THREE.Clock(true),
    controls, container, gui = new dat.GUI(),
    options, spawnerOptions, particleSystem;

// let kinectron = null;

let liveData = false;
let recordedData;
let sentTime = Date.now();
let currentFrame = 0;

let joints = [];

init();

function init(){
    if(liveData){
        initKinectron();
        initSketch();
    }else{
        fetchJSONFile("skeleton_recording.json", getData);
    }
}

function getData(data) {
    recordedData = data;
    console.log("got data")
    // debugger;
    initSketch();
}

function initSketch(){
    initThreeJs();
    animate();
}

function loopRecordedData() {
    // send data every 20 seconds
    if (Date.now() > sentTime + 20) {
      bodyTracked(recordedData[currentFrame]);
      sentTime = Date.now();
  
      if (currentFrame < Object.keys(recordedData).length - 1) {
        currentFrame++;
      } else {
        currentFrame = 0;
      }
    }
  }

function initKinectron() {
    const kinectronServerIPAddress = '192.168.1.4';
    const kinectron = new Kinectron(kinectronServerIPAddress);
    kinectron.setKinectType("windows");
    kinectron.makeConnection();
    kinectron.startTrackedBodies(bodyTracked);
  }

function bodyTracked(body){
    joints = body.joints;
}


function initThreeJs(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(28, window.innerWidth/window.innerHeight, 1, 1000);
    // camera.position.set(0, 10, 200);
    camera.position.z = 100;
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();


    createParticles();
    // createBox();
    window.addEventListener("resize", resizeWindow, false);
}

function createParticles(){
    particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 5000
    });
    particleSystem2 = new THREE.GPUParticleSystem({
        maxParticles: 5000
    });
    scene.add( particleSystem);
    scene.add( particleSystem2);
    particleOption();
    particleOption2();

}

function particleOption (){
    options = {
        position: new THREE.Vector3(),
        positionRandomness: .3,
        velocity: new THREE.Vector3(),
        velocityRandomness: .5,
        color: 0xaa88ff,
        colorRandomness: .2,
        turbulence: .5,
        lifetime: 2,
        size: 5,
        sizeRandomness: 1
    };

    spawnerOptions = {
        spawnRate: 15000,
        horizontalSpeed: 1.5,
        verticalSpeed: 1.33,
        timeScale: 1
    };
    /*
    gui.add(options, "velocityRandomness", 0, 3);
    gui.add(options, "positionRandomness", 0, 3);
    gui.add(options, "size", 1, 20);
    gui.add(options, "sizeRandomness", 0, 25);
    gui.add(options, "colorRandomness", 0, 1);
    gui.add(options, "lifetime", .1, 10);
    gui.add(options, "turbulence", 0, 1);

    gui.add(spawnerOptions, "spawnRate", 10, 30000);
    gui.add(spawnerOptions, "timeScale", -1, 1);
    */
}

function particleOption2 (){
    options2 = {
        position: new THREE.Vector3(),
        positionRandomness: .3,
        velocity: new THREE.Vector3(),
        velocityRandomness: .5,
        color: 0xaa88ff,
        colorRandomness: .2,
        turbulence: .5,
        lifetime: 2,
        size: 5,
        sizeRandomness: 1
    };

    spawnerOptions2 = {
        spawnRate: 15000,
        horizontalSpeed: 1.5,
        verticalSpeed: 1.33,
        timeScale: 1
    };
}


function createBox() {
    let posX = (joints.cameraX * -1) / 50;
    let posY = (joints.cameraY * -1) / 50;
    let posZ = (joints.cameraZ * -1) / 50;

    let geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    let mat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    
    let mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

}

function particleOptionControl(){

    let distWrist = dist(joints[6].cameraX,joints[6].cameraY,joints[6].cameraZ, joints[10].cameraX, joints[10].cameraY, joints[10].cameraZ)
    // console.log(distWrist);
    if(distWrist < 0.4) {
        spawnerOptions.timeScale = -0.2;
        spawnerOptions2.timeScale = -0.2;
        options.lifetime = 10
        options2.lifetime = 10
    }
    if(distWrist < 1.2 && distWrist > 0.4) {
        spawnerOptions.timeScale = 0.4;
        spawnerOptions2.timeScale = 0.4;
        options.lifetime = 5
        options2.lifetime = 5
    }
    if(distWrist > 1.2) {
        spawnerOptions.timeScale = -0.3;
        spawnerOptions2.timeScale = -0.3;
        options.lifetime = 10
        options2.lifetime = 10
    }

    options.size = distWrist * 10;
    options2.colorRandomness = distWrist


    var delta = clock.getDelta() * spawnerOptions.timeScale;
    tick += delta;

    if (tick < 0) tick = 0;

    if (delta > 0) {
        //wrist left = 6
        //wrist right = 10
        // options.position.x = Math.sin(tick * spawnerOptions.horizontalSpeed) * 20;
        // options.position.y = Math.sin(tick * spawnerOptions.verticalSpeed) * 10;
        // options.position.z = Math.sin(tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed) * 5;

        // options2.position.x = Math.sin(tick * spawnerOptions2.horizontalSpeed) * 30;
        // options2.position.y = Math.sin(tick * spawnerOptions2.verticalSpeed) * 5;
        // options2.position.z = Math.sin(tick * spawnerOptions2.horizontalSpeed + spawnerOptions2.verticalSpeed) * 5;

        options.position.x = joints[6].cameraX * 20;
        options.position.y = joints[6].cameraY * 20;
        options.position.z = joints[6].cameraZ * 20;

        options2.position.x = joints[10].cameraX * 20;
        options2.position.y = joints[10].cameraY * 20;
        options2.position.z = joints[10].cameraZ * 20;

        // let oriX = joints[3].cameraX;
        // let oriY = joints[3].cameraY;
        // let oriZ = joints[3].cameraZ;
        // let newVel = new Vector3(oriX, oriY, oriZ);

        // options.velocity = newVel;

        for (var x = 0; x < spawnerOptions.spawnRate * delta; x++) {
            particleSystem.spawnParticle(options);
        }
        for (var x = 0; x < spawnerOptions2.spawnRate * delta; x++) {
            particleSystem2.spawnParticle(options2);
        }
    }

    particleSystem.update(tick);
    particleSystem2.update(tick);
}

function animate() {
    if (!liveData) loopRecordedData();

    requestAnimationFrame(animate);
    controls.update();

    particleOptionControl();

    renderer.render(scene, camera);

}

function resizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
        }
      }
    };
    httpRequest.open("GET", path);
    httpRequest.send();
  }

  function dist(x0,y0,z0,x1,y1,z1){

    deltaX = x1 - x0;
    deltaY = y1 - y0;
    deltaZ = z1 - z0;
    
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    
    return distance;
    }
