import {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./style.css";
import style from "../PropertyInfoContainer/style.module.css";

const addDays = function(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}

export const PropertyReservationContainer = ({propertyInfo}) => {
    const [property, setProperty] = useState({});
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const onChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    useEffect(()=>{
        if (propertyInfo !== undefined){
            setProperty(propertyInfo);
        }
    }, [propertyInfo])

    return(
        <div className="card">
            <div className="card-body">
                <h2 className="mb-1">From ${property.base_price}/night</h2>
                <a href="#reviews"
                   className="d-block mb-4 text-dark"><span>{parseFloat(property.rating).toFixed(2)}★ • </span><span>{property.num_ratings} reviews</span></a>
                <div className={"reservation-datepicker"}>
                    <DatePicker selected={startDate}
                                excludeDates={[addDays(new Date(), 1), addDays(new Date(), 5)]}
                                minDate={new Date()}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={onChange}
                                selectsRange
                                inline />
                </div>
                <div className="form-floating">
                    <select id="reservation-num-guests" className="form-control" defaultValue={"2"}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8+</option>
                    </select>
                    <label htmlFor="reservation-num-guests">Number of Guests</label>
                </div>
                <div id="price-container" className="my-3"></div>
                <button type="button" className="btn custom-btn" data-bs-toggle="modal" data-bs-target="#reservationModal">Reserve Now</button>

                {/* Modal */}
                <div className="modal fade" id="reservationModal" tabIndex="-1" aria-labelledby="reservationModalLabel"
                     aria-hidden="true">
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <button type="button" className="btn-close close-modal"
                                    data-bs-dismiss="modal" aria-label="Close"></button>
                            <div className="modal-body">
                                <div>stuff would go here</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}