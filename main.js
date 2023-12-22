import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import "./style.css";

// SCENE
const scene = new THREE.Scene();

// LIGHT
const light = new THREE.DirectionalLight(0xffffff, 3.5);
light.position.set(0, 15, 10);
light.castShadow = true;
light.shadow.mapSize.height = 512;
light.shadow.mapSize.width = 512;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;
scene.add(light);

// DEFINE CANVAS DIMENSIONS
const size = {
  height: window.innerHeight,
  width: window.innerWidth,
};

// CAMERA
const camera = new THREE.PerspectiveCamera(45, size.width / size.height);
camera.position.set(0, 0, 20);
scene.add(camera);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(2);
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = Math.PI * 2;

// RESIZE
window.addEventListener("resize", () => {
  // UPDATE DIMENSIONS
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  // UPDATE CAMERA
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});

// ANIMATION
const animation = async () => {
  let pmrem = new THREE.PMREMGenerator(renderer);
  let envmapTexture = await new RGBELoader()
    .setDataType(THREE.FloatType)
    .loadAsync("./public/old_room_2k.hdr");
  let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

  // SPHERE TEXTURES
  let textures = {
    bump: await new THREE.TextureLoader().loadAsync("./public/earthbump.jpg"),
    map: await new THREE.TextureLoader().loadAsync("./public/earthmap.jpg"),
    spec: await new THREE.TextureLoader().loadAsync("./public/earthspec.jpg"),
  };

  let mesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 32),
    new THREE.MeshStandardMaterial({
      roughness: 0.7,
      roughnessMap: textures.spec,
      bumpMap: textures.bump,
      map: textures.map,
      bumpScale: 0.6,
      sheen: 0.5,
      clearcoat: 0.5,
      envMap,
      envMapIntensity: 0.3,
    })
  );

  scene.add(mesh);

  // LOOP
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
};


animation();
