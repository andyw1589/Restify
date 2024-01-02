import { Header } from "../../components/Header";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

export const AuthLayout = () => {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState([]);
    const [user, setUser] = useState(null);

    // update page uses this to update everything
    const updateUserData = useCallback(() => {
        fetch("http://localhost:8000/accounts/view/", {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(setUser);
    }, []);

    useEffect(() => {
        if (localStorage.getItem("restify_access") == null) navigate("/login/");

        // get name
        fetch("http://localhost:8000/accounts/view/", {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(setUser);

        // get first three notifications for dropdown menu
        fetch("http://localhost:8000/notifications/view/", {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setNotifs(data.results.splice(0, 3));
            });
    }, [navigate]);

    return user === null ?
        <h1>loading</h1> :
        (
            <>
                <Header
                    name={`${user.first_name} ${user.last_name}`}
                    notifs={notifs}
                    userId={user.id}
                />
                {/* pass in the current user */}
                <Outlet context={[user, updateUserData]} />
            </>
        );
};