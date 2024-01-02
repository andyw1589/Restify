import { useState, useEffect } from "react";

import { capitalizeFirstLetter } from "../../utils/helpers";
import { RequestCard } from "../RequestCard";
import { RequestPageNavigator } from "../RequestPageNavigator";

export const RequestContainer = props => {
    const [requests, setRequests] = useState([]);
    const [canLoadMore, setCanLoadMore] = useState(false);

    // load the requests
    useEffect(() => {
        let url = `http://localhost:8000/requests/view/?mode=${props.requestMode}&`;
        if (props.viewCancellationRequests) url += "type=cancellation&"

        fetch(url + `page=${props.page}`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setRequests(data.results);
                setCanLoadMore(data.next !== null);
            });
    }, [props.requestMode, props.page, props.viewCancellationRequests]);

    return (
        <div id="requests-container" className="my-3">
            <h3>{capitalizeFirstLetter(props.requestMode)} Requests</h3>
            <div id={`${props.requestMode}-requests`}>
                {
                    requests.map(request => {
                    return <RequestCard request={request} key={request.id} requestMode={props.requestMode} />})
                }
            </div>
            <RequestPageNavigator page={props.page} setPage={props.setPage} canLoadMore={canLoadMore}/>
        </div>
    );
};