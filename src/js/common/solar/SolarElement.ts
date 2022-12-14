import { Box3, BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, Object3D, Vector3 } from "three";
import { isPortrait } from "../../production/utils/Helpers";
import { initMaterial } from "../gfx/ShaderLib";
import { EllipticalPath } from "./EllipticalPath";
import { PlanetOptions, PLANET_GEO } from "./Planet";
import { calculateOrbitByType, OrbitElements, OrbitType } from "./SolarSystem";

export interface InteractiveObject extends Object3D {
	selected:boolean;
	target:Object3D;
	lockedDistance:number;
	lockedOffset:Vector3;
	closeUp: boolean;
}


const L_DUMMY = initMaterial(new LineBasicMaterial({
    color: 0xff0000
}));

/* const lockedPosition = {
	portrait: {
		distance: .03,
		offset: new Vector3(0, -.0055, 0)
	},
	landscape: {
		distance: .03,
		offset: new Vector3(.01, 0, 0)
	}
} */

export class SolarElement extends Object3D implements InteractiveObject {
    parent:Object3D = new Object3D();
    mesh:Mesh;
    data:OrbitElements;
    orbitPath:EllipticalPath;
    private _selected:boolean = false;
    material:MeshPhongMaterial;
    target:Object3D;
	type: string;
    category: string;
    closeUp: boolean = false;

    lockedPosition = {
        portrait: {
            distance: .03,
            offset: new Vector3(0, -100, 0)
        },
        landscape: {
            distance: .03,
            offset: new Vector3(.01, 0, 0)
        }
    }
  
    sunLine:Line;

    constructor(id:string, _data:OrbitElements, opts:PlanetOptions={}) {
        super();

        this.data = _data;
        this.type = id;
        this.name = id;
        this.category = _data.category;

        let scl = .001;        

        this.scale.multiplyScalar(scl);

        const lineGeo = new BufferGeometry();
        const pos = new Float32Array([0,0,0,10,10,10]);
        lineGeo.setAttribute('position', new BufferAttribute(pos, 3));
        this.sunLine = new Line(lineGeo, L_DUMMY);        
        
        this.orbitPath = new EllipticalPath(_data, scl*.8);
        

        this.mesh = new Mesh(PLANET_GEO, this.initMaterial(opts));
        this.mesh.visible = false;
        this.parent.add(this.mesh);
        this.add(this.parent);
        this.target = this;

        const min = this.boundingBox.min;
        const max = this.boundingBox.max;
        const center = max.clone().sub(min);
        
        this.lockedPosition.landscape.distance = max.length() * 2;
        this.lockedPosition.landscape.offset.set(0,max.length()+center.y,0);
        this.lockedPosition.portrait.distance = max.length() * 2;
        this.lockedPosition.portrait.offset.set(0,-max.length()-1000,0);
    }

    initMaterial(opts:PlanetOptions = {}){

        this.material = initMaterial(new MeshPhongMaterial({
            color: opts.color ? opts.color : 0xffffff,
            shininess: 0
        })) as MeshPhongMaterial;

        return this.material;
    }

    get boundingBox(): Box3 {
        return this.orbitPath.boundingBox;
    }

    get lockedDistance():number {
        const t = isPortrait() ? this.lockedPosition.portrait : this.lockedPosition.landscape;
        return t.distance;
    }

    get lockedOffset():Vector3 {
        const t = isPortrait() ? this.lockedPosition.portrait : this.lockedPosition.landscape;
        return t.offset;
    }

    update(d:number) {
        calculateOrbitByType(this.data, d, OrbitType.Elliptical, this.position);

        // const pos = this.sunLine.geometry.attributes.position;
        // const arr = pos.array as Float32Array;
        // arr[3] = this.position.x;
        // arr[4] = this.position.y;
        // arr[5] = this.position.z;
        
        // pos.needsUpdate = true;

        // this.mesh.updateMatrixWorld();
        // this.material.update();
        this.orbitPath.update(d, this.position, this.scale.x);

        this.orbitPath.ellipse.visible = this.visible;
    }

    set selected(value:boolean) {
        this._selected = value;
        this.orbitPath.selected = value;
        // this.material.selected = value;
    }

    get selected():boolean {
        return this._selected;
    }
    
}


