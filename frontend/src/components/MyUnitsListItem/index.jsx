import {Link} from "react-router-dom";
import style from "./style.module.css"
import styled from "styled-components";
import {useEffect, useState} from "react";

const PlaceholderImgDiv = styled.div`
        background-color: #DDDDDD;
        width: 225px;
        height: 150px;
    `;

export const MyUnitsListItem = (props) => {
    const deleteHandler = () => {
        fetch(`http://localhost:8000/properties/${props.id}/delete/`, {
            method: "DELETE",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        }).then(res => {
            if (res.status === 204){
                window.location.reload();
            }
            else{
                alert("Error: Failed to delete property!")
            }
        })
    }

    return (
        <div>
            <div className={`card m-3 d-flex flex-row ${style["card-flex"]}`}>
                {
                    props.imgsrc !== undefined ?
                    <img src={props.imgsrc.image} className={`object-fit-cover ${style["card-img-size"]}`}
                     alt="Rental property" /> :
                     <PlaceholderImgDiv></PlaceholderImgDiv>
                }
                <div className="card-body position-relative">
                    <h5 className="card-title">{props.title}</h5>
                    <div className="card-text">
                        {
                            parseFloat(props.rating) !== 0 ?
                                <div>{parseFloat(props.rating).toFixed(1)}★</div> :
                                <div>No ratings yet</div>
                        }
                        {
                            props.distance !== null ?
                                <div>{parseFloat(props.distance).toFixed(2)}km away</div> :
                                <div></div>
                        }
                        <div>${props.price}/night</div>
                    </div>
                    <Link to={`../properties/${props.id}/`} className="stretched-link" />
                </div>
                <div className={"d-flex flex-column justify-content-evenly mx-3"}>
                    <button className={"btn custom-btn"}>
                        <Link to={`./${props.id}/edit/`} className="text-white">Edit Property</Link>
                    </button>
                    <button className={"btn custom-btn-danger text-white"} data-bs-toggle="modal" data-bs-target={`#confirmationModal${props.id}`}>
                        Delete Property
                    </button>
                </div>

                {/* Modal */}
                <div className="modal fade" id={`confirmationModal${props.id}`} tabIndex="-1" aria-labelledby={`confirmationModal${props.id}label`}
                     aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <button type="button" className="btn-close close-modal"
                                    data-bs-dismiss="modal" aria-label="Close"></button>
                            <div className="modal-body m-3 d-flex flex-column align-items-center">
                                <h2 className={"text-center"}>Are you sure you want to delete this property?</h2>
                                <div className={"text-center"}>Warning: This action cannot be reversed!</div>
                                <h5 className="card-title m-3">{props.title}</h5>
                                {
                                    props.imgsrc !== undefined ?
                                        <img src={props.imgsrc.image} className={`object-fit-cover ${style["card-img-size"]}`}
                                             alt="Rental property" /> :
                                        <PlaceholderImgDiv></PlaceholderImgDiv>
                                }
                                <div className={"mt-3"}>
                                    <button className={"btn btn-secondary m-3"} data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                                    <button className={"btn btn-danger m-3"} onClick={deleteHandler}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}