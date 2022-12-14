/**
 * Solar Particles
 * 
 * This class creates a fixed buffer of instanced quads.
 * This buffer will be feed by orbit elements data and
 * visualize accordingly
 */

import { FboUtils } from "@jocabola/gfx";
import { BufferAttribute, BufferGeometry, Color, InstancedMesh, NormalBlending, Object3D, PerspectiveCamera, Points, ShaderMaterial, Vector3, WebGLMultipleRenderTargets, WebGLRenderer } from "three";
import { GPU_SIM_SIZES, VISUAL_SETTINGS } from "../core/Globals";
import { COMP_SP_NORMAL } from "../gfx/ShaderLib";
import { GPUSim, SimQuality } from "./GPUSim";
import { OrbitElements } from "./SolarSystem";


import { Random } from "@jocabola/math";
import p_frag from '../../../glsl/sim/particles.frag';
import p_vert from '../../../glsl/sim/particles.vert';

import { gsap } from 'gsap/gsap-core';
import { CategoryColorMap } from "../data/Categories";


const MAT = new ShaderMaterial({
    vertexShader: p_vert,
    fragmentShader: p_frag,
    transparent: true,
    vertexColors: true,
    uniforms: {
        computedPosition: {
            value: null
        },
        opacity: {
            value: 1
        }
    },
    // blending: NormalBlending
});

export class SolarParticles {
    private _data:Array<OrbitElements> = [];
    mesh:InstancedMesh;
    points:Points;
    maps:WebGLMultipleRenderTargets;
    sim:GPUSim;
    quality:SimQuality;

    constructor(){}

    init(renderer:WebGLRenderer){
        this.sim = new GPUSim(renderer);
        this.quality = this.sim.qualitySettings;
        MAT.uniforms.computedPosition.value = this.sim.texture;

        this.points = new Points(this.createPointsGeo(), MAT);

        this.maps = new WebGLMultipleRenderTargets(512, 512, 3);
        this.maps.texture[0].name = 'normal';
        this.maps.texture[1].name = 'alpha';
        this.maps.texture[2].name = 'diffuse';
        FboUtils.renderToFbo(this.maps, renderer, COMP_SP_NORMAL);
        renderer.setRenderTarget(null);
    }

    private createPointsGeo():BufferGeometry {
        const count = VISUAL_SETTINGS[VISUAL_SETTINGS.current];

        const geo = new BufferGeometry();
        const pos = [];
        const color = [];
        const col = new Color();

        for(let i=0; i<count; i++) {
            color.push(col.r, col.g, col.b);
            pos.push(
                Random.randf(-500, 500),
                Random.randf(-500, 500),
                Random.randf(-500, 500)
            )
        }

        const siz = GPU_SIM_SIZES[VISUAL_SETTINGS.current];
        const w = siz.width;
        const h = siz.height;

        const simUV = [];

        for(let i=0; i<w; i++){
            for(let j=0; j<h; j++){
                simUV.push(i/(w-1), j/(h-1));
            }
        }

        geo.setAttribute(
            'position',
            new BufferAttribute(
                new Float32Array(pos),
                3
            )
        );

        geo.setAttribute(
            'color',
            new BufferAttribute(
                new Float32Array(color),
                3
            )
        );

        geo.setAttribute(
            'simUV',
            new BufferAttribute(
                new Float32Array(simUV),
                2
            )
        );

        return geo;
    }

    /**
     * Updates the associated data
     */
    set data(value:Array<OrbitElements>) {
        const MAX = VISUAL_SETTINGS[VISUAL_SETTINGS.current];
        if(this.quality != VISUAL_SETTINGS.current){
            this.quality = VISUAL_SETTINGS.current as SimQuality;
            this.points.geometry.dispose();
            this.points.geometry = this.createPointsGeo();
        }
        this._data = value;
        const count = Math.min(MAX, this._data.length);

        this.sim.data = value;

        const color = this.points.geometry.attributes.color;
        const arr = color.array as Float32Array;

        for(let i=0; i<count; i++) {
            const el = this._data[i];
            const col = CategoryColorMap[el.category];
            arr[i*3] = col.r;
            arr[i*3 + 1] = col.g;
            arr[i*3 + 2] = col.b;
        }

        // this.mesh.instanceColor.needsUpdate = true;
        color.needsUpdate = true;
    }

    /**
     * Sets state of particles (opacity)
     */
    set highlighted(value:boolean) {
        const u = MAT.uniforms;
        gsap.killTweensOf(u.opacity);
        gsap.to(u.opacity, {value: value ? 1 : .2, duration: 2});
    }

    /**
     * 
     * @param d - MJD of the simulation
     * @param camera - Camera rendering the simulation
     */
    update(d:number, camera:PerspectiveCamera) {
        this.sim.render(d);
    }
}

