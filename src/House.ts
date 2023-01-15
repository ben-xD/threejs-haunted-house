import * as THREE from "three";
import DoorAlpha from "./assets/textures/door/alpha.jpg";
import DoorAmbientOcclusion from "./assets/textures/door/ambientOcclusion.jpg";
import DoorColor from "./assets/textures/door/color.jpg";
import DoorHeight from "./assets/textures/door/height.jpg";
import DoorMetalness from "./assets/textures/door/metalness.jpg";
import DoorNormal from "./assets/textures/door/normal.jpg";
import DoorRoughness from "./assets/textures/door/roughness.jpg";
import BricksAo from './assets/textures/bricks/ambientOcclusion.jpg';
import BricksColor from './assets/textures/bricks/color.jpg';
import BricksNormal from './assets/textures/bricks/normal.jpg';
import BricksRoughness from './assets/textures/bricks/roughness.jpg';
import GrassColor from './assets/textures/grass/color.jpg';
import GrassAo from './assets/textures/grass/ambientOcclusion.jpg';
import GrassNormal from './assets/textures/grass/normal.jpg';
import GrassRoughness from './assets/textures/grass/roughness.jpg';
import {EnvironmentHandler} from "./EnvironmentHandler";
import {Ghosts} from "./Ghosts";

export class House {
    private readonly group: THREE.Group;
    private readonly walls: THREE.Mesh;
    private ghosts: Ghosts;

    constructor(private textureLoader: THREE.TextureLoader, private environmentHandler: EnvironmentHandler, scene: THREE.Scene) {
        this.group = new THREE.Group();
        this.group.position.y = 0;

        this.addFloor();
        const [walls, wallHeight] = this.addWalls();
        this.walls = walls;
        this.addRoof(wallHeight);
        this.addDoor();
        this.addBushes();
        this.addGraves();
        this.addDoorLight(wallHeight);
        this.ghosts = new Ghosts();
        this.ghosts.addToScene(this.group);

        scene.add(this.group);
    }

    private addFloor() {
        // Default floor, in case there is no floor by anything else.
        const repeat = (textures: THREE.Texture[], repeatCount: number) => {
            for (const texture of textures) {
                texture.repeat.set(repeatCount,repeatCount);
                texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
            }
        }

        const map = this.textureLoader.load(GrassColor);
        const aoMap = this.textureLoader.load(GrassAo);
        const roughnessMap = this.textureLoader.load(GrassRoughness);
        const normalMap = this.textureLoader.load(GrassNormal);
        const repeatCount = 8;
        repeat([map, aoMap, roughnessMap, normalMap], repeatCount);

        const plane = new THREE.PlaneGeometry(100, 100);
        plane.setAttribute('uv2', new THREE.BufferAttribute(plane.attributes.uv.array, 2));
        const material = new THREE.MeshStandardMaterial({map, aoMap, roughnessMap, normalMap})
        const mesh = new THREE.Mesh(plane, material);
        mesh.rotation.x = -Math.PI * 0.5;
        mesh.position.y = 0;
        mesh.receiveShadow = true;
        this.group.add(mesh)
    }

    private addWalls(): [THREE.Mesh, number] {
        const aoMap = this.textureLoader.load(BricksAo);
        const colorMap = this.textureLoader.load(BricksColor);
        const normalMap = this.textureLoader.load(BricksNormal);
        const roughnessMap = this.textureLoader.load(BricksRoughness);

        const wallHeight = 2.5;
        const geometry = new THREE.BoxGeometry(4, wallHeight, 4);
        geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

        const walls = new THREE.Mesh(
            geometry,
            // physically-based rendering
            new THREE.MeshStandardMaterial({map: colorMap, aoMap, normalMap, roughnessMap}));
        geometry.computeBoundingBox();
        const lowest = geometry.boundingBox!.min.y;
        walls.position.y -= lowest;
        walls.castShadow = true;
        this.group.add(walls);

        return [walls, wallHeight];
    }

    private addRoof(wallHeight: number) {
        const geometry = new THREE.ConeGeometry(3.5, 1, 4);
        const roof = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: '#b35f45'}));
        geometry.computeBoundingBox();
        const lowest = geometry.boundingBox!.min.y;
        roof.position.y = wallHeight - lowest;
        roof.rotation.y = Math.PI / 4;

        this.group.add(roof);
    }

    private addDoor() {
        const alpha = this.textureLoader.load(DoorAlpha);
        const ambientOcclusion = this.textureLoader.load(DoorAmbientOcclusion);
        const color = this.textureLoader.load(DoorColor);
        const height = this.textureLoader.load(DoorHeight);
        const metalness = this.textureLoader.load(DoorMetalness);
        const normal = this.textureLoader.load(DoorNormal);
        const roughness = this.textureLoader.load(DoorRoughness);
        const doorScale = 1.8;
        const geometry = new THREE.PlaneGeometry(doorScale, 1.2 * doorScale, 100, 100);
        const material = new THREE.MeshStandardMaterial({
            map: color,
            alphaMap: alpha,
            aoMap: ambientOcclusion, metalnessMap: metalness, transparent: true,
            roughnessMap: roughness, normalMap: normal, displacementMap: height,
            displacementScale: 0.1
        })
        geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
        const door = new THREE.Mesh(geometry, material);
        geometry.computeBoundingBox();
        const lowest = geometry.boundingBox!.min.y;
        geometry.translate(0, -lowest - 0.1, 0);

        const highest = this.walls.geometry.boundingBox!.max.z;

        door.position.x = 0;
        door.position.y = 0;
        door.position.z = highest + 0.001;

        this.group.add(door);
    }

    // TODO delete this
    private addBushes() {
        const bushGroup = new THREE.Group();
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshStandardMaterial({color: '#89c854'});
        geometry.computeBoundingBox();
        const highestZWall = this.walls.geometry.boundingBox!.max.z;

        const bush1 = new THREE.Mesh(geometry, material);
        bush1.scale.set(0.5, 0.5, 0.5);

        const bush2 = new THREE.Mesh(geometry, material);
        bush2.scale.set(0.25, 0.25, 0.25);
        bush2.position.set(0.5, 0, 0);

        bushGroup.position.set(1.15, 0, highestZWall + 0.25);
        bushGroup.add(bush1, bush2);

        const bushGroup2 = bushGroup.clone();
        bushGroup2.rotation.set(0, 3 * Math.PI / 4, 0);
        bushGroup2.position.set(-2, 0, highestZWall + 0.25);

        this.group.add(bushGroup, bushGroup2);
    }

    private addGraves() {
        const gravesGroup = new THREE.Group();

        const geometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
        const originalGrave = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: '#b2b6b1'}));
        originalGrave.castShadow = true;
        geometry.computeBoundingBox();
        const lowest = geometry.boundingBox!.min.y;
        geometry.translate(0, -lowest, 0);

        const totalGraveCount = 50;
        const graves: THREE.Mesh[] = [];
        for (let i = 0; i < totalGraveCount; i++) {
            // Random number between 0 and pi
            const angle = Math.random() * Math.PI * 2;
            const averageRadius = 5;
            const radiusNoise = 5;
            const radius = averageRadius + Math.random() * radiusNoise;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const grave = originalGrave.clone();
            grave.position.set(x, -0.1, z);
            this.setRandomRotation(grave, 0.4);
            graves.push(grave)
        }

        gravesGroup.add(...graves);
        this.group.add(gravesGroup);
    }

    private setRandomRotation(grave: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>, maxRotationInRadians: number) {
        const x = maxRotationInRadians * (Math.random() - 0.5);
        const y = maxRotationInRadians * (Math.random() - 0.5);
        const z = maxRotationInRadians * (Math.random() - 0.5);
        grave.rotation.set(x, y, z);
    }

    private addDoorLight(wallHeight: number) {
        const doorLight = new THREE.PointLight('#ff7d46', 2, 7);
        this.environmentHandler.addPointLightHelper(this.group, doorLight);
        doorLight.castShadow = true;
        doorLight.shadow.mapSize.set(256, 256);
        doorLight.shadow.camera.far = 5;

        const highestZWall = this.walls.geometry.boundingBox!.max.z;
        doorLight.position.set(0, wallHeight, highestZWall + 0.2);

        this.environmentHandler.addPointLightHelper(this.group, doorLight);
        this.group.add(doorLight);
    }

    tick(elapsedTime: number) {
        this.ghosts.tick(elapsedTime);
    }
}