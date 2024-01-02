import style from "./style.module.css";
import {useCallback, useState} from "react";

import { SelectField } from "../../components/SelectField";
import {InputField} from "../../components/InputField";
import {PropertyListContainer} from "../../components/PropertyListContainer";

const filterDefaults = {
    check_in: "",
    check_out: "",
    min_price: "",
    max_price: "",
    sort_by: "",
    location: "Toronto",
    num_guests: "2"
}

export const Index = () => {
    const [filter, setFilter] = useState(filterDefaults);
    const [query, setQuery] = useState(filterDefaults);

    const updateFilter = (e, filterParam) => {
        let updatedFilter = {...filter};
        updatedFilter[filterParam] = e.target.value;
        setFilter(updatedFilter);
    }

    const search = useCallback(() => {
        setQuery(filter);
    },[filter])

    return (
        <main>
            <div id={style["filters-container"]}>
                <InputField
                    divId={style["filter-location-container"]}
                    labelClass={style["filter-label-text"]}
                    id={"filter-location"}
                    defaultValue={"Toronto"}
                    label="Location"
                    inputClass={style["filter-input"]+" w-100"}
                    type="text"
                    placeholder="Where would you like to go?"
                    error={""}
                    onBlur={(e) => updateFilter(e, "location")}
                />
                <InputField
                    divId={style["filter-check-in-container"]}
                    labelClass={style["filter-label-text"]}
                    id={"filter-check-in-main"}
                    label="Check In"
                    value={filter.check_in}
                    inputClass={style["filter-input"]}
                    type={"date"}
                    inputMin={"2023-01-01"}
                    inputMax={"2025-01-01"}
                    error={""}
                    onChange={(e) => updateFilter(e, "check_in")}
                />
                <InputField
                    divId={style["filter-check-out-container"]}
                    labelClass={style["filter-label-text"]}
                    id={"filter-check-out-main"}
                    label="Check Out"
                    value={filter.check_out}
                    inputClass={style["filter-input"]}
                    type={"date"}
                    inputMin={"2023-01-01"}
                    inputMax={"2025-01-01"}
                    error={""}
                    onChange={(e) => updateFilter(e, "check_out")}
                />
                <SelectField
                    divId={style["filter-guests-container"]}
                    labelClass={style["filter-label-text"]}
                    label="Number of Guests"
                    value={filter.num_guests}
                    id={style["filter-num-guests-main"]}
                    selectClass={style["filter-input"]+" filter-select"}
                    options={[["1","1"],["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7", "7"], ["8","8+"]]}
                    onChange={(e) => updateFilter(e, "num_guests")}
                />
                <div>
                    <div id={style["filter-sort-text"]} className={style["filter-label-text"]}>Filter and Sort</div>
                    <button type="button" id={style["filter-btn"]}
                            className={style["filter-input"]+" d-flex align-items-center px-3"}
                            data-bs-toggle="modal"
                            data-bs-target="#filtersModal">
                        <span className="material-icons-outlined">tune</span>
                    </button>
                </div>
                <div className="d-flex align-items-end">
                    <button className={style["filter-input"]} onClick={search}>Search</button>
                </div>
                <div className="modal fade" id="filtersModal" tabIndex="-1" aria-labelledby="filtersModalLabel"
                     aria-hidden="true">
                    <div className="modal-dialog modal-fullscreen-md-down">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="filtersModalLabel">Filter and Sort</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <InputField
                                    divClass={style["modal-container"]}
                                    labelClass={style["filter-label-text"]}
                                    id={"filter-check-in-modal"}
                                    label="Check In"
                                    value={filter.check_in}
                                    inputClass={style["filter-input"]}
                                    type={"date"}
                                    inputMin={"2023-01-01"}
                                    inputMax={"2025-01-01"}
                                    error={""}
                                    onChange={(e) => updateFilter(e, "check_in")}
                                />
                                <InputField
                                    divClass={style["modal-container"]}
                                    labelClass={style["filter-label-text"]}
                                    id={"filter-check-out-modal"}
                                    label="Check Out"
                                    value={filter.check_out}
                                    inputClass={style["filter-input"]}
                                    type={"date"}
                                    inputMin={"2023-01-01"}
                                    inputMax={"2025-01-01"}
                                    error={""}
                                    onChange={(e) => updateFilter(e, "check_out")}
                                />
                                <InputField
                                    divClass={style["modal-container"]}
                                    labelClass={style["filter-label-text"]}
                                    id={"filter-minimum-price"}
                                    label="Minimum Price"
                                    inputClass={style["filter-input"]}
                                    type={"number"}
                                    inputMin={"0"}
                                    step={"100"}
                                    error={""}
                                    onBlur={(e) => updateFilter(e, "min_price")}
                                />
                                <InputField
                                    divClass={style["modal-container"]}
                                    labelClass={style["filter-label-text"]}
                                    id={"filter-maximum-price"}
                                    label="Maximum Price"
                                    inputClass={style["filter-input"]}
                                    type={"number"}
                                    inputMin={"0"}
                                    step={"100"}
                                    error={""}
                                    onBlur={(e) => updateFilter(e, "max_price")}
                                />
                                <SelectField
                                    divClass={style["modal-container"]}
                                    labelClass={style["filter-label-text"]}
                                    id={"filter-num-guests-modal"}
                                    label="Number of Guests"
                                    value={filter.num_guests}
                                    selectClass={style["filter-input"]+" filter-select"}
                                    options={[["1","1"],["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7", "7"], ["8","8+"]]}
                                    onChange={(e) => updateFilter(e, "num_guests")}
                                />
                                <SelectField
                                    divClass={style["modal-container"]}
                                    labelClass={style["filter-label-text"]}
                                    id={"filter-sort"}
                                    label="Sort By"
                                    selectClass={style["filter-input"]+" filter-select"}
                                    options={[
                                        ["","Recommended"],
                                        ["distance","Distance"],
                                        ["rating","Rating"],
                                        ["price_lowest","Price: Lowest First"],
                                        ["price_highest","Price: Highest First"],
                                    ]}
                                    onChange={(e) => updateFilter(e, "sort_by")}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn custom-btn-shape btn-secondary"
                                        data-bs-dismiss="modal">Close
                                </button>
                                <button id="modal-save" className="btn custom-btn" data-bs-dismiss="modal" onClick={search}>Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PropertyListContainer
                query={query}
            />
        </main>
    );
};