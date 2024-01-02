import style from "./style.module.css"
import placeholder from "../../assets/avatar.png"
import {useEffect, useState} from "react";

export const ContactInfoContainer = ({hostInfo}) => {
    const [host, setHost] = useState({});

    useEffect(()=>{
        if (hostInfo !== undefined){
            setHost(hostInfo);
        }
    },[hostInfo])

    return (
        <div className="pb-4">
            <h3>Contact the Host</h3>
            <div className="d-flex align-items-center my-3 flex-wrap">
                <div className="d-flex align-items-center flex-shrink-0">
                    <img src={host.avatar !== null ? host.avatar : placeholder} className={style["avatar"]} alt={"User avatar"}/>
                    <div className="ms-3">
                        <div>Hosted by {host.first_name} {host.last_name} • {host.num_ratings} reviews</div>
                        <div>Member since {host.year_joined}</div>
                    </div>
                </div>
                <button id="show-contact" className="btn custom-btn flex-shrink-0 ms-auto me-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                    Show contact info
                </button>
            </div>
            <div className="collapse" id="collapseExample">
                <div className="card card-body">
                    <div className="d-flex align-items-center mb-2">
                        <span className="material-icons-outlined me-2">markunread</span>
                        <a className="text-body" href={`mailto:${host.email}`}>{host.email}</a>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                        <span className="material-icons-outlined me-2">local_phone</span>
                        <a className="text-body" href={`tel:${host.phone_number}`}>{host.phone_number}</a>
                    </div>
                </div>
            </div>
        </div>
    )
}