import style from "./style.module.css";

export const PropertyInfoContainer = ({property}) => {

    return (<>
        {
            property.title !== undefined ? <h1>{property.title}</h1> :
                <div className={"placeholder-glow"}><h1 className={"placeholder"}>Placeholder Property Title</h1></div>
        }
        {
            property.num_ratings !== undefined && property.rating !== undefined ?
                <a href="#reviews"
                   className="mb-1 text-dark"><span>{parseFloat(property.rating).toFixed(2)}★ • </span>
                    <span>{property.num_ratings} reviews</span></a> :
                <div className={"placeholder-glow"}><span className={"placeholder"}>0.00 ★ • 000 reviews</span></div>

        }

        {/* Modal triggers on image click */}
        {
            property.propertyimage_set !== undefined ? <>
                    <div id={style["image-container"]} className="py-2">
                        <img src={property.propertyimage_set[0].image} className={`d-block w-100 ${style["main-img"]}`} alt="Property"/>
                        <div className="stretched-link" data-bs-toggle="modal" data-bs-target="#exampleModal"></div>
                    </div>
                    {/* Modal */}
                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel"
                         aria-hidden="true">
                        <div className="modal-dialog modal-fullscreen">
                            <div className="modal-content">
                                <button type="button" className="btn-close close-modal"
                                        data-bs-dismiss="modal" aria-label="Close"></button>
                                <div className="modal-body">
                                    <div className={`d-flex flex-column m-auto ${style["property-pictures"]}`}>
                                        {
                                            property.propertyimage_set.map((image)=>{
                                                return <img key={image.id} src={image.image} className="d-block pb-3" alt="Property"/>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                :
                <div className={"placeholder-glow py-2"}>
                    <div className={"placeholder w-100"} style={{aspectRatio: 1.5}}></div>
                </div>
        }
        {
            property.bedrooms !== undefined ?
                <div className="py-4 border-bottom">
                    <h3 className="pb-1">About this property</h3>
                    <div className={style["features-container"]}>
                        <div className="d-flex align-items-center py-1">
                            <span className="material-icons-outlined me-1">home</span>
                            <span>Entire House</span>
                        </div>
                        <div className="d-flex align-items-center py-1">
                            <span className="material-icons-outlined me-1">bed</span>
                            <span> {property.bedrooms} bedrooms</span>
                        </div>
                        <div className="d-flex align-items-center py-1">
                            <span className="material-icons-outlined me-1">people</span>
                            <span>Max {property.guest_limit} guests</span>
                        </div>
                        <div className="d-flex align-items-center py-1">
                            <span className="material-icons-outlined me-1">bathtub</span>
                            <span>{property.bathrooms} bathrooms</span>
                        </div>
                    </div>
                </div> :
                <div className="py-4 border-bottom placeholder-glow">
                    <h3 className="pb-1 placeholder">About this property</h3>
                    <div className={style["features-container"]}>
                        <div className="me-1 my-1 placeholder">icon Entire House</div>
                        <div className="m-1 placeholder">icon 00 bedrooms</div>
                        <div className="m-1 placeholder">icon Max 00 guests</div>
                        <div className="m-1 placeholder">icon 0 bathrooms</div>
                    </div>
                </div>
        }
        {
            property.description !== undefined ?
                <div className="py-4 border-bottom">
                    <h3>Property Description</h3>
                    <div>{property.description}</div>
                </div> :
                <div className="py-4 border-bottom placeholder-glow">
                    <h3 className="placeholder">Property Description</h3>
                    <div className="placeholder w-100" style={{aspectRatio: 3}}></div>
                </div>
        }
        {
            property.longitude !== undefined && property.latitude !== undefined?
                <div className="py-4 border-bottom">
                    <h3 className="mb-3">Property Location</h3>
                    <iframe
                        title={"property-location-map"}
                        src={`https://maps.google.com/maps?q=${property.latitude},+${property.longitude}&t=&z=13&ie=UTF8&output=embed`}
                        width="100%" height="400" allowFullScreen></iframe>
                </div> :
                <></>
        }
    </>)
}