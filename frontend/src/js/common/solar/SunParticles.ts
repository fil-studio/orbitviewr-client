import { AdditiveBlending, Color, Mesh, ShaderMaterial, SphereBufferGeometry } from "three";

import frag from '../../../glsl/lib/sun_particles/sunp.frag';
import vert from '../../../glsl/lib/sun_particles/sunp.vert';

const MAX = 1024;

const SEED = new SphereBufferGeometry(1, 32, 32);

export const P_MAT = new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
        amp: {
            value: 1
        },
        time: {
            value: 0
        },
        fresnelColor: {
            value: new Color(0xffffff)
        },
        fresnelWidth: {
            value: .08
        }
    },
    // visible: false,
    transparent: true,
    // alphaTest: .01,
    blending: AdditiveBlending,
    depthTest: true
});

export class SunParticles {
    // points:Points;
    mesh:Mesh;

    constructor(radius:number, amplitude:number) {
        P_MAT.uniforms.amp.value = amplitude;

        const mesh = new Mesh(
            SEED,
            P_MAT
        );

        mesh.scale.setScalar(radius);
        this.mesh = mesh;
    }

    update(time:number) {
        P_MAT.uniforms.time.value = time;
        this.mesh.rotation.y = time * .05;
        this.mesh.rotation.x = time * .06;
        this.mesh.rotation.z = -time * .04;
    }
}