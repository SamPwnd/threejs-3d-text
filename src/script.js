import * as THREE from 'three'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import gsap from 'gsap';

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/9.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()

// Meshes outside fontloader
const donuts = []
let text

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Lesgoski',
            {
                font: font,
                size: 0.5,
                height: 0.3,
                curveSegments: 16,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 6
            }
        )
        textGeometry.center()

        const material = new THREE.MeshMatcapMaterial()
        material.matcap = matcapTexture
        text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)

        for (let i = 0; i < 300; i++) {
            const donut = new THREE.Mesh(donutGeometry, material)
        
            // Generazione di un angolo casuale e un raggio casuale
            const radius = 2 + Math.random() * 7            // Raggio casuale (tra 2 e 9) (distanza dal centro)
            const theta = Math.random() * Math.PI * 2       // Angolo theta casuale (0 a 2π) (rotazione attorno all'asse y)
            const phi = Math.acos((Math.random() * 2) - 1)  // Angolo phi casuale (0 a π) (dall'alto al basso)
        
            // Coordinate sferiche convertite in coordinate cartesiane
            const x = radius * Math.sin(phi) * Math.cos(theta) 
            const y = radius * Math.sin(phi) * Math.sin(theta) 
            const z = radius * Math.cos(phi)                   
        
            donut.position.set(x, y, z)
        
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI
        
            const scale = Math.random()
            donut.scale.set(scale, scale, scale)
        
            scene.add(donut)
            donuts.push(donut)
        }
        
    }
)

/**
 * Sizes
 */
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 3
scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0,
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()

let targetRotationZ = 0; // Obiettivo di rotazione
let rotationSpeed = 0.005; // Velocità di rotazione
const maxRotation = 0.5; // Limite di rotazione
const minRotation = -0.5; // Limite di rotazione

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // animate camera
    const parallaxX = - cursor.x * 12
    const parallaxY =  cursor.y * 12
    gsap.to(camera.position, {x: parallaxX, duration: 1.5});
    gsap.to(camera.position, {y: parallaxY, duration: 1.5});
    camera.lookAt(0,0,0)

    // Rotate donuts
    donuts.forEach((donut) => {
        donut.rotation.x += 0.0009 
        donut.rotation.y += 0.0012 
    })

    // Rotate text
    if(text) {
        targetRotationZ += rotationSpeed
        if (targetRotationZ >= maxRotation || targetRotationZ <= minRotation) {
            rotationSpeed *= -1;
        }

        text.rotation.z += (targetRotationZ - text.rotation.z) * 0.01; // Lerping
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()