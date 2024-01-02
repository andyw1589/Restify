import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import style from "./style.module.css";
import {PropertyInfoContainer} from "../../components/PropertyInfoContainer";
import {ContactInfoContainer} from "../../components/ContactInfoContainer";
import {PropertyReviewContainer} from "../../components/PropertyReviewContainer";
import {PropertyReservationContainer} from "../../components/PropertyReservationContainer";

export const Units = () => {
    const [property, setProperty] = useState({});
    const { id } = useParams();

    useEffect(()=>{
        getProperty(id).then(p => {
            setProperty(p)
        });
    },[id])

    const getProperty = async (propId)=>{
        let propertyResponse = await fetch(`http://localhost:8000/properties/${propId}/view/`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
        let propertyData = await propertyResponse.json()
        if (!propertyResponse.ok) {
            return {}
        } else {
            return propertyData
        }
    }


    return (<div className="d-flex justify-content-center">
        <div id={style["listing-container"]} className="d-flex justify-content-around m-5">
            <div id={style["listing-body"]} className="d-flex flex-column col-8">
                <PropertyInfoContainer property={property}/>
                <PropertyReviewContainer propertyInfo={property}/>
                <ContactInfoContainer hostInfo={property.host}/>
            </div>
            <div id="reservation-panel" className="col-3">
                <PropertyReservationContainer propertyInfo={property} />
            </div>
        </div>
    </div>)
}