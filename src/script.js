import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import { CubeTextureLoader, DirectionalLight } from 'three'



// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture 
const cubeTextureLoader = new THREE.CubeTextureLoader()

// Update all materials
const updateAllMaterials = () => {
    scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
        //    child.material.envMap = environmentMap
           child.material.envMapIntensity = 5
           child.castShadow = true
           child.receiveShadow = true
        }
    })
}
const animateDecorations = () => {
    const elapsedTime = clock.getElapsedTime()
    scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.name.startsWith('Icosphere')){
            child.rotation.y += 0.007
            child.position.x += Math.cos(elapsedTime * 2) * 0.02
            child.position.y += Math.sin(elapsedTime * 4) * 0.02
            // child.position.x += Math.cos(elapsedTime * -2) * 0.02
        }
    })
}
const animateTree = () => {
     scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.name.startsWith('Tree')){
            child.rotation.y -= 0.01
        }
    })
}
const animateLogo = () => {
     scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.name.startsWith('Cyli')){
            child.rotation.z -= 0.05
        }
    })
}


// Environment Map
const environmentMap = cubeTextureLoader.load([
    'textures/environmentMaps/1/px.jpg',
    'textures/environmentMaps/1/nx.jpg',
    'textures/environmentMaps/1/py.jpg',
    'textures/environmentMaps/1/ny.jpg',
    'textures/environmentMaps/1/pz.jpg',
    'textures/environmentMaps/1/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap


/**
 * Models
 */
let mixer = null
const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/ChristmasTrain/glTF/ChristmasTrain3.gltf',(gltf)=>
{
    console.log(gltf.scene)
    // console.log('success')

    mixer = new THREE.AnimationMixer(gltf.scene)
    // for(const animation of gltf.animations){
    //     const action = mixer.clipAction(animation)
    //     action.play()
    // }
        // for(const animation of gltf.animations){
    const action = mixer.clipAction(gltf.animations[0])
    action.setLoop(THREE.LoopRepeat ,1);
    action.play()
    mixer.addEventListener( 'finished', ( /*event*/ ) => {
        console.log('finish');
        const action = mixer.clipAction(gltf.animations[1])
        action.setLoop(THREE.LoopRepeat ,1);
        action.play()           
    } );
    
    scene.add(gltf.scene)
    updateAllMaterials(gltf.scene)
    animateDecorations(gltf.scene)

    scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.name.startsWith('Cyli')){
            child.scale.y -= 0.99
        }
    })


},
()=>{console.log('...')},()=>{console.log('error')})





//Floor 
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 4)
// gui.add(ambientLight, 'intensity').min(0).max(10).step(0.001).name('ambientLight')
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(18, 43, 27)
directionalLight.castShadow = true
directionalLight.shadow.camera.far =520
directionalLight.shadow.mapSize.set(5024, 1024)
gui.add(directionalLight, 'intensity').min(0).max(100).step(0.001).name('directionalLight')
gui.add(directionalLight.position, 'x').min(-5).max(100).step(0.001).name('positionX')
gui.add(directionalLight.position, 'y').min(0).max(100).step(0.001).name('positionY')
gui.add(directionalLight.position, 'z').min(-5).max(100).step(0.001).name('positionZ')

// scene.add(directionalLight)
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)



// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 300)
camera.position.set(0, 50, 60)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 20, 0)
controls.enableDamping = true


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMapping = THREE.ACESFilmicToneMapping

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    
    // Update controls
    controls.update()


    //animate meshes
    animateDecorations()
    // animateTree()
    animateLogo()


    // Update mixer
    if(mixer !== null){
        mixer.update(deltaTime)    
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()