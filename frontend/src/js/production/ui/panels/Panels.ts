import { Panel } from "./Panel";
import { TimePickerPanel } from "./TimePickerPanel";

export class Panels {
	dom: HTMLElement;
	panels: Array<Panel> = [];
	constructor(dom: HTMLElement = null){
		if(!!!dom) return;

		this.dom = dom;

		this.createPanels();
		this.addListeners();

	}

	createPanels(){

		const panels = this.dom.querySelectorAll('[data-panel]');

		for(const item of panels){

			const id = item.getAttribute('data-panel');
			if(!!!item) continue;

			let panel = null
			if(id === 'time-picker') {
				panel = new TimePickerPanel(id);
			} else panel = new Panel(id);

			this.panels.push(panel);

		}

	}

	addListeners(){

		document.addEventListener('keydown', (e) => {			

			if(e.key != 'Escape') return;

			const activePanel = this.panels.find(x => x.active);
			
			if(!activePanel) return;

			e.preventDefault();
			activePanel.togglePanel();

		})


	}

	update(){	
		for(const p of this.panels) p.update();
	}
}