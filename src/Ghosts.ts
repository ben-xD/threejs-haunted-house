import * as THREE from "three";
import {PointLight} from "three";

export class Ghosts {
    private group = new THREE.Group();
    private ghosts: PointLight[];
    private pointLightPositionParameters: number[];

    constructor() {
        const [pointLights, positionParameters] = this.createPointLights();
        this.ghosts = pointLights;
        this.pointLightPositionParameters = positionParameters;
    }

    addToScene(group: THREE.Group) {
        group.add(this.group);
    }

    private createPointLights(): [PointLight[], number[]] {
        const ghosts: PointLight[] = [];

        ghosts.push(new PointLight('#ff00ff', 2, 3));
        ghosts.push(new PointLight('#00ffff', 2, 3));
        ghosts.push(new PointLight('#00ff00', 2, 3));

        for (const ghost of ghosts) {
            ghost.castShadow = true;
            ghost.shadow.mapSize.set(256, 256);
            ghost.shadow.camera.far = 5;
        }

        this.group.add(...ghosts);
        const positionParameters: number[] = Array.from({length: ghosts.length}, () => Math.random());
        return [ghosts, positionParameters];
    }

    tick(elapsedTime: number) {
        for (let i = 0; i < this.ghosts.length; i++) {
            const ghost = this.ghosts[i];
            const parameter = elapsedTime * this.pointLightPositionParameters[i];
            ghost.position.set(Math.sin(parameter) * 5, Math.sin(elapsedTime * 3) + Math.cos(elapsedTime * 5), Math.cos(parameter) * 5);
        }
    }
}
