import {useEffect, useState} from "react";
import {PropertyCard} from "../../components/PropertyCard";
import {MyUnitsListItem} from "../../components/MyUnitsListItem";

export const MyUnits = () => {
    const [myUnits, setMyUnits] = useState([]);
    const [userId, setUserId] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(()=>{
        fetch(`http://localhost:8000/accounts/view/`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        }).then(resp => {
            if (!resp.ok) {
                alert(`Unable to retrieve user info ${JSON.stringify(resp)}`);
                return
            }
            return resp.json()
        }).then(data => {
                setUserId(data.id)
                fetch(`http://localhost:8000/accounts/${data.id}/properties/view/`, {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                    }
                }).then(resp => {
                    if (!resp.ok) {
                        alert(`Unable to retrieve user properties: ${JSON.stringify(resp)}`);
                        return
                    }
                    return resp.json()
                }).then(data => {
                    console.log(data);
                    setMyUnits(data.results);
                });
            }
        )
    },[])


    return (
        <div className="mx-2 my-2">
            <h1>My Units</h1>
            <a href="createunit/" className="btn custom-btn">Create Property</a>
            <div id="properties-container" className="row g-0 justify-content-around border-top my-2">
                {
                    myUnits.map((property) => {
                        return <MyUnitsListItem
                            key={property.id}
                            id={property.id}
                            imgsrc={property.propertyimage_set[0]}
                            title={property.title}
                            rating={property.rating}
                            distance={property.distance}
                            price={property.base_price}
                        />
                    })
                }
            </div>
        </div>
    )
}