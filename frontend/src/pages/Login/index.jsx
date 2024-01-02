import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import style from './style.module.css';

import wave from "../../assets/wave.svg";
import logo from "../../assets/logo.svg";

import { FormTextField } from "../../components/FormTextField";

export const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({
        username: "",
        password: ""
    });

    useEffect(() => { document.title = "Login" }, []);
    const navigate = useNavigate();

    // validators
    const validateUsername = value => {
        setUsername(value);
        if (value === "") {
            setErrors({...errors, username: "Please enter something."});
            return false;
        }
        setErrors({...errors, username: ""});
        return true;
    }

    const validatePassword = value => {
        setPassword(value);
        if (value === "") {
            setErrors({...errors, password: "Please enter something."});
            return false;
        }
        setErrors({...errors, password: ""});
        return true;
    }

    const login = event => {
        event.preventDefault();
        
        let ok = validateUsername(username);
        ok &&= validatePassword(password);
        
        if (!ok) return;

        // send the post request
        fetch("http://localhost:8000/accounts/api/token/", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => setErrors({...errors, "username": data.detail}));
            } 
            // success
            return response.json().then(data => {
                alert(`Successfully logged in!`);
                localStorage.setItem("restify_access", data.access);
                localStorage.setItem("restify_refresh", data.refresh);
                navigate("/index/");
            });
        });
    };

    return (
        <main id={style.main}>
            <div id={style.grid}>
                <div id={style.logotext} className="mx-5">
                    <img src={logo} width="75%" alt="logo" />
                    <h1>Restify</h1>
                    <h4>Welcome back.</h4>
                </div>
                <div className="card" id={style.formcontainer}>
                    <div className="card-body">
                        <form onSubmit={login} id={style.loginform}>
                            <FormTextField
                                label="Username"
                                id="username"
                                onChange={event => validateUsername(event.target.value)}
                                error={errors.username}
                                type="text"
                                divClass="mb-3 w-100"
                                inputClass="form-control"
                                placeholder="bobsmith1337"
                                required={true}
                            />
                            <FormTextField
                                label="Password"
                                id="password"
                                onChange={event => validatePassword(event.target.value)}
                                error={errors.password}
                                type="password"
                                divClass="mb-3 w-100"
                                inputClass="form-control w-100"
                                placeholder=""
                                required={true}
                            />
                            <input type="submit" className="btn btn-lg custom-btn btn-block w-100 mt-3" value="Login" />
                            <button onClick={() => navigate("/register/")} className="btn btn-lg custom-btn btn-block w-100 mt-4">Create an account</button>
                        </form>
                    </div>
                </div>
            </div>
            <img src={wave} alt="wave" id={style.wave} />
        </main>
    );
};