import { Link } from "react-router-dom";

import style from "./style.module.css";
import logo from "../../assets/logo.svg";

import { getNotifContentFromData } from "../../utils/helpers";

const logout = () => {
    // remove tokens
    localStorage.removeItem("restify_access");
    localStorage.removeItem("restify_refresh");
}

export const Header = props => {
    return (
        <header className="w-100 bg-light mb-4" id={style.header}>
            <nav className="bg-light px-3 py-2">
                <div id={style.navlinks}>
                    <Link to="/index/"><img src={logo} width="50px" alt="logo"/></Link>
                    <Link id={style.brand} to="/index/">Restify</Link>
                    <Link to="/properties/">My Properties</Link>
                    <Link to="/requests/">Requests</Link>
                </div>
                <div id={style.navdropdowns}>
                    <div className="dropdown" id={style.notifs}>
                        <button type="button" className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                            Notifications
                        </button>
                        <ul className="dropdown-menu">
                            {
                                props.notifs.map(notif => {
                                    const {header} = getNotifContentFromData(notif);
                                    return <li key={notif.id}><Link className="dropdown-item" to="/notifications/">{header}</Link></li>
                                })
                            }
                            <li><Link className="dropdown-item text-primary" to="/notifications/">View All</Link></li>
                        </ul>
                    </div>

                    <div className="dropdown" id={style.user}>
                        <button type="button" className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                            {props.name}
                        </button>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/login/" onClick={logout}>Log Out</Link></li>
                            <li><Link className="dropdown-item" to={`/accounts/${props.userId}/`}>View Profile</Link></li>
                            <li><Link className="dropdown-item" to="/accounts/edit/">Edit Profile</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};