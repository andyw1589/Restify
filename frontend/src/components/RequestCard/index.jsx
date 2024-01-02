import styled from "styled-components";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { capitalizeFirstLetter } from "../../utils/helpers";
import { ReviewForm } from "../ReviewForm";

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const RequestCard = props => {
    const [request, setRequest] = useState(props.request);

    // this is so the viewCancellation toggle works
    // apparently toggling it doesn't change the "request" state so I have to do it like this
    useEffect(() => {
        setRequest(props.request);
    }, [props.request]);

    // cancel approved request
    const cancelRequest = () => {
        if (!window.confirm("Are you sure you want to canel this request? The host must approve your request for cancellation."))
            return;

        fetch(`http://localhost:8000/requests/${request.id}/cancel/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`,
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => { throw new Error(error); });
            }
        })
        .then(data => setRequest({ ...request, "status": "pending cancellation" }))
        .catch(alert);
    };

    // approve or deny requests
    const updateRequestStatus = newStatus => {
        const reqType = request.type === "property" ? "toproperty" : "tocancel";
        fetch(`http://localhost:8000/requests/${reqType}/${request.id}/update/`, {
            method: "PATCH",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                new_status: newStatus
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(error => { throw new Error(error); });
                }
            })
            .then(data => setRequest({ ...request, "status": newStatus }))
            .catch(alert);
    };

    return (
        <div className="card">
            <CardHeader className="card-header">
                <div>
                    <p className="mb-0">
                        {
                            props.requestMode === "incoming" ?
                                (
                                    request.type === "property" ?
                                    `${request.requester.first_name} ${request.requester.last_name} is requesting your property.` :
                                    `${request.requester.first_name} ${request.requester.last_name} wants to cancel a reservation.`
                                ) :
                                (
                                    request.type === "property" ?
                                    `You requested ${request.receiver.first_name} ${request.receiver.last_name}'s property.` :
                                    `You requested to cancel a reservation.`
                                )
                        }
                    </p>
                    <button className="btn btn-link px-0" type="button" data-bs-toggle="collapse"
                        data-bs-target={`#request-id-${request.id}`}>
                        Details
                    </button>
                </div>
                {/* buttons */}
                <div>
                    {
                        // incoming request
                        props.requestMode === "incoming" ?
                            <>
                                <button
                                    type="button"
                                    className="btn custom-btn"
                                    disabled={request.status !== "pending"}
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to approve this request?"))
                                            updateRequestStatus("approved")
                                    }}
                                >Approve</button>
                                <button
                                    type="button"
                                    className="btn custom-btn"
                                    disabled={request.status !== "pending"}
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to deny this request?"))
                                            updateRequestStatus("denied")
                                    }}
                                >Deny</button>
                                {
                                    // terminate only makes sense for incoming property requests
                                    request.type === "property" ?
                                    <button
                                    type="button"
                                    className="btn custom-btn"
                                    disabled={request.status !== "approved"}
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to terminate this request? The guest will no longer be able to go to this property."))
                                            updateRequestStatus("terminated")
                                    }}
                                    >Terminate</button> :
                                    null
                                }
                            </> :
                            // outgoing property request
                            request.type === "property" ?
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={request.status !== "approved"}
                                    onClick={cancelRequest}
                                >
                                    Cancel
                                </button> :
                                null
                    }
                </div>
            </CardHeader>
            <div id={`request-id-${request.id}`} className="collapse card-body">
                <ul>
                    {
                        request.status === "pending" || request.status === "pending cancellation" ?
                            <li>Status: <span className="text-warning">{capitalizeFirstLetter(request.status)}</span></li> :
                            request.status === "approved" || request.status === "completed" ?
                                <li>Status: <span className="text-success">{capitalizeFirstLetter(request.status)}</span></li> :
                                <li>Status: <span className="text-danger">{capitalizeFirstLetter(request.status)}</span></li>
                    }
                    {
                        request.type === "cancellation" ?
                        <>
                            <li>Property: <Link to={`../properties/${request.request.property.id}/`}>{request.request.property.title}</Link></li>
                            <li>Date: {`${request.request.start_date} - ${request.request.end_date}`}</li>
                        </> :
                        <>
                            <li>Property: <Link to={`../properties/${request.property.id}/`}>{request.property.title}</Link></li>
                            <li>Date: {`${request.start_date} - ${request.end_date}`}</li>
                        </>
                    }
                    {
                        request.type === "cancellation" ?
                            <li>Date cancelled: {request.created} </li> :
                            null
                    }
                </ul>
                {
                    props.requestMode === "finished" ?
                        <ReviewForm
                            completed={request.review_completed}
                            commentTo="property" 
                            commentToId={request.property.id}
                            propertyRequest={request.id}
                            onSuccess={() => setRequest({ ...request, "review_completed": true })}
                            titleId={`reviewtitle-${request.id}`}
                            bodyId={`reviewbody-${request.id}`}
                        /> :
                        null
                }
            </div>
        </div >
    );
};