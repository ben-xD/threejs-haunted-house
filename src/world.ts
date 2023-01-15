import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {House} from "./House";
import {EnvironmentHandler} from "./EnvironmentHandler";
import {Group} from "three";

export class World {
    private renderer: THREE.WebGLRenderer
    private readonly scene: THREE.Scene;
    private clock: THREE.Clock
    private readonly camera: THREE.PerspectiveCamera;

    // Not always needed, but potentially used for the future or for debugging.
    private width: number;
    private height: number;

    private scale: number;
    private fogColor: string = '#262837';
    private house: House;

    constructor(private environmentHandler: EnvironmentHandler, private canvas?: HTMLCanvasElement) {
        this.scale = 3;
        const textureLoader = new THREE.TextureLoader()
        this.height = window.innerHeight
        this.width = window.innerWidth;
        this.setupResizeListener();
        this.setupFullscreenListeners();

        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        environmentHandler.addAxisHelper(this.scene);
        this.renderer = new THREE.WebGLRenderer({canvas: canvas});
        this.renderer.setSize(this.width, this.height);
        // To avoid using higher pixel ratios which would reduce performance
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this.renderer.setClearColor(this.fogColor)
        // https://threejs.org/docs/index.html#api/en/constants/Renderer
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.enabled = true;
        this.camera = this.createCamera();

        this.addLights();

        this.house = new House(textureLoader, this.environmentHandler, this.scene);

        this.addFog();

        this.addOrbitControls();
        this.tick();
    }

    private createCamera = (): THREE.PerspectiveCamera => {
        const camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
        camera.position.x = 6;
        camera.position.y = 3;
        camera.position.z = 6;
        this.scene.add(camera);
        return camera;
    }

    private addLights = () => {
        const lightFolder = this.environmentHandler.addFolder("Lights");

        const moonLight = new THREE.DirectionalLight(0xffffff, 0.12);
        moonLight.position.set(4, 4, 4)
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(256, 256);
        moonLight.shadow.camera.far = 14;
        this.environmentHandler.addDirectionalLightHelper(this.scene, moonLight);
        {
            const folder = lightFolder.addFolder('Directional Light');
            folder.add(moonLight, 'intensity').min(0).max(1).step(0.01);
            folder.add(moonLight.position, 'x').min(-5).max(+5).step(0.01);
            folder.add(moonLight.position, 'y').min(-5).max(+5).step(0.01);
            folder.add(moonLight.position, 'z').min(-5).max(+5).step(0.01);
            folder.add(moonLight.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01);
            folder.add(moonLight.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01);
            folder.add(moonLight.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01);
            this.scene.add(moonLight);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
        this.scene.add(ambientLight);
        {
            const folder = lightFolder.addFolder('Ambient Light');
            folder.add(ambientLight, 'intensity').min(0).max(1).step(0.01);
        }
    }

    tick = () => {
        this.environmentHandler.beginStats();
        this.renderer.render(this.scene, this.camera);
        // Using THREE.Clock for animation

        // mesh.rotation.y += 1 * clock.getDelta();
        // // Can't use delta time here because the value is always close to 0,
        // // and therefore the position will be set to 0 all the time.
        // mesh.position.y = Math.sin(clock.getElapsedTime());
        // // camera.lookAt(mesh.position);
        const elapsedTime = this.clock.getElapsedTime();

        this.house.tick(elapsedTime);
        this.environmentHandler.endStats();
        requestAnimationFrame(this.tick);
    }

    close = () => {
        this.environmentHandler.close();
    }

    private addOrbitControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        // Limits the camera so tombstones and house fill the frame.
        controls.maxDistance = 13;
        // Limits the lowest angle of the camera to just above the grass.
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.enableDamping = true;
    }

    private setupResizeListener() {
        window.addEventListener('resize', (event) => {
            this.height = window.innerHeight
            this.width = window.innerWidth
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        })
    }

    private setupFullscreenListeners() {
        const toggle = () => {
            try {
                if (!document.fullscreenElement) {
                    this.canvas?.requestFullscreen()
                } else {
                    document.exitFullscreen()
                }
            } catch (e) {
                console.error({e})
            }

        }
        window.addEventListener('keyup', (event) => {
            console.log(event.code)
            if (event.code == "KeyF") {
                toggle();
            }
        })

        window.addEventListener('dblclick', toggle);
    }

    // private addFloor() {
    //     // Default floor, in case there is no floor by anything else.
    //     const plane = new THREE.PlaneGeometry(20, 20);
    //     const material = new THREE.MeshStandardMaterial({color: '#a9c388'})
    //     const mesh = new THREE.Mesh(plane, material);
    //     mesh.rotation.x = -Math.PI * 0.5;
    //     mesh.position.y = 0;
    //     this.scene.add(mesh)
    // }

    private addFog() {
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.05);
    }
}