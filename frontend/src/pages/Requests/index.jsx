import styled from "styled-components";
import { useState, useEffect } from "react";

import { RequestContainer } from "../../components/RequestContainer";

const RequestSwitch = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
`;

export const Requests = () => {
    // outgoing, finished, incoming (hosts only)
    const [requestMode, setRequestMode] = useState("outgoing");
    const [viewCancellationRequests, setViewCancellationRequests] = useState(false);
    const [page, setPage] = useState(1);

    // if user is a host
    const [isHost, setIsHost] = useState(false);

    // check if user is a host
    useEffect(() => {
        document.title = "Requests";
        fetch("http://localhost:8000/accounts/view/", {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setIsHost(data.is_host);
            });
    }, []);

    const changeMode = newMode => {
        setPage(1);
        setRequestMode(newMode);
    };

    return (
        <main className="w-50 mx-auto mt-5">
            <h1>Reservation Requests</h1>
            <RequestSwitch>
                <button
                    onClick={() => {setViewCancellationRequests(!viewCancellationRequests); setPage(1);}}
                    type="button"
                    className="btn custom-btn"
                >
                    {
                        viewCancellationRequests ?
                        "View property requests" :
                        "View cancellation requests"
                    }
                </button>
                <button
                    onClick={() => changeMode("outgoing")}
                    type="button"
                    className="btn custom-btn"
                    disabled={requestMode === "outgoing"}
                >
                    Outgoing Requests
                </button>
                <button
                    onClick={() => changeMode("finished")}
                    type="button"
                    className="btn custom-btn"
                    disabled={requestMode === "finished"}
                >
                    Finished Requests
                </button>
                {
                    isHost ?
                    <button
                    onClick={() => changeMode("incoming")}
                    type="button"
                    className="btn custom-btn"
                    disabled={requestMode === "incoming"}
                    >
                        Incoming Requests
                    </button> :
                    null
                }
            </RequestSwitch>
            <RequestContainer requestMode={requestMode} viewCancellationRequests={viewCancellationRequests} page={page} setPage={setPage} />
        </main>
    );
};