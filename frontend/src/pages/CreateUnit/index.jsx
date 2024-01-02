import {ImageUploadContainer} from "../../components/ImageUploadContainer";
import {useEffect, useState} from "react";

export const CreateUnit = () => {
    const [imageList, setImageList] = useState({});
    const [numImgs, setNumImgs] = useState(3);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (Object.keys(imageList).length < 3){
            alert("Please attach at least three images!");
            return
        }

        let requestBody = {
            title: e.target.name.value,
            address: e.target.address.value,
            base_price: e.target.base_price.value,
            bedrooms: e.target.bedrooms.value,
            bathrooms: e.target.bathrooms.value,
            guest_limit: e.target.guest_limit.value,
            description: e.target.description.value,
        }

        let locationResponse = await fetch("https://geocode.maps.co/search?q=" + requestBody.address, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!locationResponse.ok) {
            alert("Unable to retrieve property location data");
            return
        }

        let locationData = await locationResponse.json()
        if (locationData.length > 0) {
            requestBody.latitude = parseFloat(locationData[0].lat).toFixed(10) ;
            requestBody.longitude = parseFloat(locationData[0].lon).toFixed(10);
        }
        else{
            requestBody.latitude = 0;
            requestBody.longitude = 0;
        }

        let propResponse = await fetch(`http://localhost:8000/properties/create/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            },
            body: JSON.stringify(requestBody)
        })
        let propData = await propResponse.json()
        if (!propResponse.ok) {
            alert(`Unable to create property ${JSON.stringify(propData)}`);
            return
        }

        // yes I'm sending one request for each photo
        // this is a todo for never.
        for (let key in imageList){
            const formData = new FormData();
            formData.append('image', imageList[key], imageList[key].name);

            let photoUpload = await fetch(`http://localhost:8000/properties/${propData.id}/images/add/`, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                },
                body: formData,
            })
            console.log(photoUpload)
            if (!photoUpload.ok) {
                alert("Unable to upload property photos");
                return
            }
        }

    };

    return (
        <div className="py-5 d-flex justify-content-center">
            <div className="col-md-8 py-3 py-md-0">
                <h1>Create a new property</h1>
                <hr className={"my-4"}/>
                <h2>Property Photos</h2>
                <div>
                    <div className="d-flex flex-wrap">
                        {
                            Array.from({length: numImgs}).map((_, index) => {
                                return <ImageUploadContainer key={index} index={index} imageListSetter={setImageList} />
                            })
                        }
                    </div>
                    <button onClick={()=>{setNumImgs((prev) => prev + 1)}} className={"restify-clear-btn"}>Add another photo</button>
                </div>
                <hr className={"my-4"}/>
                <h2>Availability and Pricing Rules</h2>
                <div className="list-group my-3">
                    <li className="list-group-item pb-3">
                        <div className="fst-italic">Delisted from 2023-01-01 to 2023-02-01</div>
                        <input type="submit" className="btn btn-small btn-danger" value="Delete" />
                        <div className="fst-italic">Price adjusted to $100.00 nightly from 2023-03-01 to
                            2023-04-01
                        </div>
                        <input type="submit" className="btn btn-small btn-danger" value="Delete" />
                    </li>
                    <li className="list-group-item">
                        <div className="row">
                            <div className="col-6">
                                <div className="row p-3">
                                    <h4 className="row px-3">Delist</h4>
                                    <div className="row px-3">
                                        <div className="filter-label-text px-0">Start</div>
                                        <input id="delist-start" className="filter-input" type="date" min="2023-01-01"
                                               max="2025-01-01" />
                                        <div className="filter-label-text pt-3 px-0">End</div>
                                        <input id="delist-end" className="filter-input" type="date" min="2023-01-01"
                                               max="2025-01-01" />
                                        <input type="submit" className="mt-4 col-12 btn btn-lg custom-btn"
                                               value="Add" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3">
                                    <h4>Price Adjustment</h4>
                                    <label htmlFor="price-adjust">Price (Nightly)</label>
                                    <div className="row">
                                        <div className="input-group">
                                            <span className="input-group-text">$</span>
                                            <input type="text" id="price-adjust" className="form-control"
                                                   aria-label="Amount (to the nearest dollar)" required />
                                            <span className="input-group-text">.00</span>
                                        </div>
                                    </div>
                                    <div className="row p-3">
                                        <div className="filter-label-text px-0">Start</div>
                                        <input id="price-adjust-end" className="filter-input" type="date"
                                               min="2023-01-01" max="2025-01-01" />
                                        <div className="filter-label-text pt-3 px-0">End</div>
                                        <input id="price-adjust-end" className="filter-input" type="date"
                                               min="2023-01-01" max="2025-01-01" />
                                        <input type="submit" className="mt-4 col-12 btn btn-lg custom-btn"
                                               value="Add" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                </div>
                <hr className={"my-4"}/>
                <h2>Property Details</h2>
                <form className="row justify-content-center" onSubmit={handleFormSubmit}>
                    <div className="col">
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" className="form-control"
                                       placeholder="Property Title" required />
                            </div>
                        </div>
                        <div className="row py-3">
                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <input type="text" id="address" className="form-control"
                                       placeholder="123 Avenue" required />
                            </div>
                        </div>
                        <label htmlFor="base_price">Price (Nightly)</label>
                        <div className="row">
                            <div className="input-group mb-3">
                                <span className="input-group-text">$</span>
                                <input type="text" id="base_price" className="form-control"
                                       aria-label="Amount (to the nearest dollar)" required />
                                    <span className="input-group-text">.00</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <div className="input-group">
                                    <textarea id="description" className="form-control" required></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="row py-3">
                            <div className="col-4 form-group">
                                <label htmlFor="bedrooms">Bedroom Count</label>
                                <div className="input-group">
                                    <input type="number" id="bedrooms" className="form-control" min="1" max="10"
                                           required />
                                </div>
                            </div>
                            <div className="col-4 form-group">
                                <label htmlFor="bathrooms">Bathroom Count</label>
                                <div className="input-group">
                                    <input type="number" id="bathrooms" className="form-control" min="1" max="10"
                                           required />
                                </div>
                            </div>
                            <div className="col-4 form-group">
                                <label htmlFor="guest_limit">Max Guests</label>
                                <div className="input-group">
                                    <input type="number" id="guest_limit" className="form-control" min="1" max="10"
                                           required />
                                </div>
                            </div>
                        </div>
                        <input type="submit" className="col-12 btn btn-lg custom-btn" value="Create Property" />
                    </div>
                </form>
            </div>
        </div>
    )
}