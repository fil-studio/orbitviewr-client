import { addFiltersListener, applyFilters, FiltersListener, syncFilters } from "../../common/data/FiltersManager";
import { Page } from "./Page";


export class CustomizeOrbits extends Page implements FiltersListener {
	buttonApply:HTMLButtonElement;
	filters:NodeListOf<HTMLInputElement>;

	onLoaded(): void {
		this.filters = this.dom.querySelectorAll('.categories-filter input[type="checkbox"]');
		this.syncFilters();
		this.buttonApply = this.dom.querySelector('[data-button="filters-apply"]');
	}

	addEventListeners(): void {
		super.addEventListeners();

		addFiltersListener(this);

		this.buttonApply.addEventListener('click', () => {
			this.applyFilters();
		})
	}

	applyFilters(){
		applyFilters(this.filters);
	}

	syncFilters(): void {
		syncFilters(this.filters);
	}
}