//const { ml5 } = require("build/ml5.min.js");
//const { GPUParticleSystem } = require("build/GPUParticleSystem.js");

let poses = [];

var camera, tick = 0,
    scene, renderer, clock = new THREE.Clock(true),
    controls, container, gui = new dat.GUI(),
    options, spawnerOptions, particleSystem;
    

init();

function init(){
    initPosenet();
    initSketch();
}

function initSketch(){
    initThreeJs();
    animate();
}


function initPosenet(){
    const video = document.createElement('video');
    const vidDiv = document.getElementById("video");
    video.setAttribute('width', 640);
    video.setAttribute('height', 480);
    video.autoplay = true;
    vidDiv.appendChild(video);
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(stream){
            video.srcObject = stream;
        })
        .catch(function(err){
            console.log("An error occurred!" + err);
        })
    const vidOptions = {
        flipHorizontal: true,
        minConfidence: 0.5
    }

    const poseNet = ml5.poseNet(video, vidOptions, modelReady);
    poseNet.on('pose', (results) => gotPose(results));
}

function gotPose(results) {
    poses = results;
    console.log("got poses!")
    // bodyTracked();
}

function modelReady(){
    console.log("Model Loaded!")
}

function bodyTracked(){
    const keypoints = poses[0].pose.keypoints;
    for(let i = 0; i <keypoints.length; i++) {
    }
}

function initThreeJs(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
    camera.position.set(0, 10, 200);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();


    createParticles();
    createBox();
    window.addEventListener("resize", resizeWindow, false);
}

function createParticles(){
    particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 5000
    });
    scene.add( particleSystem);
    particleOptionControl();
}

function particleOptionControl (){
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

function createBox() {
    let geo = new THREE.BoxGeometry(poses[0].pose.keypoints[0].position.x, 45, 45);
    let mat = new THREE.MeshBasicMaterial({color: 0x00ff00});

    let mesh = new THREE.Mesh(geo, mat);
  
    scene.add(mesh);
}

function animate() {

    requestAnimationFrame(animate);
    controls.update();

    var delta = clock.getDelta() * spawnerOptions.timeScale;
    tick += delta;

    if (tick < 0) tick = 0;

    if (delta > 0) {
        // options.position.x = Math.sin(tick * spawnerOptions.horizontalSpeed) * 20;
        options.position.x = poses[0].pose.keypoints[0].position.x
        options.position.y = Math.sin(tick * spawnerOptions.verticalSpeed) * 10;
        options.position.z = Math.sin(tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed) * 5;

        // console.log(`The x position is ${options.position.x}`);

        for (var x = 0; x < spawnerOptions.spawnRate * delta; x++) {
            particleSystem.spawnParticle(options);
        }
    }

    particleSystem.update(tick);

    renderer.render(scene, camera);

}

function resizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
}
