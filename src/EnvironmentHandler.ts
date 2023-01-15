import * as dat from "dat.gui";
import Stats from "stats.js";
import * as THREE from "three";

export abstract class EnvironmentHandler {

    abstract addFolder(name: string): dat.GUI;

    abstract beginStats(): void;
    abstract addAxisHelper(scene: THREE.Scene): void;

    abstract endStats(): void;

    abstract close(): void;

    abstract addDirectionalLightHelper(scene: THREE.Scene, light: THREE.DirectionalLight): void;

    abstract addPointLightHelper(group: THREE.Group, doorLight: THREE.PointLight): void;
}

export class DebugHandler extends EnvironmentHandler {
    private gui: dat.GUI;
    private stats: Stats;

    constructor(body: HTMLElement) {
        super();
        this.gui = new dat.GUI();
        this.stats = this.createStats(body);
    }

    addFolder(name: string): dat.GUI {
        return this.gui.addFolder(name);
    }

    createStats(body: HTMLElement): Stats {
        const stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        body.appendChild(stats.dom);
        return stats;
    }

    beginStats(): void {
        this.stats.begin();
    }

    endStats(): void {
        this.stats.end();
    }

    close(): void {
        this.gui.destroy();
    }

    addAxisHelper(scene: THREE.Scene): void {
        const axesHelper = new THREE.AxesHelper(1);
        axesHelper.position.set(-8, 1, -8)
        scene.add(axesHelper);
    }

    addDirectionalLightHelper(scene: THREE.Scene, light: THREE.DirectionalLight): void {
        const helper = new THREE.DirectionalLightHelper(light, 0.5);
        scene.add(helper);
    }

    addPointLightHelper(group: THREE.Group, doorLight: THREE.PointLight): void {
        const doorLightHelper = new THREE.PointLightHelper(doorLight, 0.5);
        group.add(doorLightHelper);
    }
}

export class ProductionHandler extends EnvironmentHandler {
    private gui: dat.GUI;

    constructor() {
        super();
        this.gui = new dat.GUI();
        this.gui.hide();
    }

    addFolder(name: string): dat.GUI {
        return this.gui.addFolder(name);
    }

    beginStats(): void {
    }

    endStats(): void {
    }

    close(): void {
        this.gui.destroy();
    }

    addAxisHelper(scene: THREE.Scene): void {
    }

    addDirectionalLightHelper(scene: THREE.Scene, light: THREE.DirectionalLight): void {
    }

    addPointLightHelper(group: THREE.Group, doorLight: THREE.PointLight): void {
    }
}