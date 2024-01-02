import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import style from './style.module.css';

import wave from "../../assets/wave.svg";
import logo from "../../assets/logo.svg";

import { FormTextField } from "../../components/FormTextField";

export const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [errors, setErrors] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        password2: ""
    });

    useEffect(() => { document.title = "Register" }, []);
    const navigate = useNavigate();

    // a bunch of validators
    const validateFirstName = value => {
        setFirstName(value);
        if (value.match(/^[a-zA-Z]+$/g) == null) {
            setErrors({ ...errors, first_name: "Name must contain only letters." });
            return false;
        };
        setErrors({ ...errors, first_name: "" });
        return true;
    }

    const validateLastName = value => {
        setLastName(value);
        if (value.match(/^[a-zA-Z]+$/g) == null) {
            setErrors({ ...errors, last_name: "Name must contain only letters." });
            return false;
        };
        setErrors({ ...errors, last_name: "" });
        return true;
    }

    const validateUsername = value => {
        setUsername(value);
        if (value.match(/^[\w]+$/g) == null) {
            setErrors({ ...errors, username: "Username must be alphanumeric." });
            return false;
        }
        setErrors({ ...errors, username: "" });
        return true;
    }

    const validateEmail = value => {
        setEmail(value);
        if ((value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/g) == null) || (value.match(/\s/g) != null)) {
            setErrors({ ...errors, email: "Please enter a valid email." });
            return false;
        }
        setErrors({ ...errors, email: "" });
        return true;
    }

    const validatePhoneNumber = value => {
        setPhoneNumber(value);
        if ((value.length !== 10) || (value.match(/[^0-9]/g) != null)) {
            setErrors({ ...errors, phone_number: "Phone number must be 10 digits." });
            return false;
        }
        setErrors({ ...errors, phone_number: "" });
        return true;
    }

    const validatePassword = value => {
        setPassword(value);
        if (value.length < 8) {
            setErrors({ ...errors, password: "Password must be at least 8 characters long." });
            return false;
        }
        setErrors({ ...errors, password: "" });
        return true;
    }

    const validatePassword2 = value => {
        setPassword2(value);
        if (value !== password) {
            setErrors({ ...errors, password2: "Passwords must match." });
            return false;
        }
        setErrors({ ...errors, password2: "" });
        return true;
    }

    // update password 2's warning whenever password2 or password changes
    useEffect(() => setErrors(e => ({ ...e, password2: password2 !== password ? "Passwords must match." : "" })), [password, password2]);

    const register = event => {
        event.preventDefault();

        // every validator must run, cannot have default short-circuiting behaviour
        let ok = validateFirstName(firstName);
        ok &&= validateLastName(lastName);
        ok &&= validateUsername(username);
        ok &&= validateEmail(email);
        ok &&= validatePhoneNumber(phoneNumber);
        ok &&= validatePassword(password);
        ok &&= validatePassword2(password2);

        if (!ok) return;

        // send the post request
        fetch("http://localhost:8000/accounts/register/", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                phone_number: phoneNumber,
                password: password,
                password2: password2,
                first_name: firstName,
                last_name: lastName
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    // "data" contains error messages that need to be read
                    console.log({...errors, ...data});
                    setErrors({...errors, ...data}); }
                );
            } 
            // success
            return response.json().then(data => {
                alert("Account has been created!");
                navigate("/login/");
            });
        });
    };

    return (
        <main id={style.main}>
            <div id={style.grid}>
                <div id={style.logotext} className="mx-5">
                    <img src={logo} width="75%" alt="logo" />
                    <h1>Restify</h1>
                    <h4>Your vacation starts here 🏖️</h4>
                </div>
                <div className="card" id={style.formcontainer}>
                    <div className="card-body">
                        <form onSubmit={register} id={style.loginform}>
                            <div id={style.namefields}>
                                <FormTextField
                                    label="First Name"
                                    id="first-name"
                                    onChange={event => validateFirstName(event.target.value)}
                                    error={errors.first_name}
                                    type="text"
                                    divClass="mb-3 w-100 pe-2"
                                    inputClass="form-control"
                                    placeholder="Bob"
                                    required={true}
                                />
                                <FormTextField
                                    label="Last Name"
                                    id="last-name"
                                    onChange={event => validateLastName(event.target.value)}
                                    error={errors.last_name}
                                    type="text"
                                    divClass="mb-3 w-100 ps-2"
                                    inputClass="form-control"
                                    placeholder="Smith"
                                    required={true}
                                />
                            </div>
                            <div id={style.otherfields}>
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
                                    label="Email"
                                    id="email"
                                    onChange={event => validateEmail(event.target.value)}
                                    error={errors.email}
                                    type="email"
                                    divClass="mb-3 w-100"
                                    inputClass="form-control"
                                    placeholder="example@email.com"
                                    required={true}
                                />
                                <FormTextField
                                    label="Phone Number"
                                    id="phone-number"
                                    onChange={event => validatePhoneNumber(event.target.value)}
                                    error={errors.phone_number}
                                    type="text"
                                    divClass="mb-3 w-100"
                                    inputClass="form-control"
                                    placeholder="9999999999"
                                    required={true}
                                />
                                <FormTextField
                                    label="Password"
                                    id="password"
                                    onChange={event => validatePassword(event.target.value)}
                                    error={errors.password}
                                    type="password"
                                    divClass="mb-3 w-100"
                                    inputClass="form-control"
                                    placeholder=""
                                    required={true}
                                />
                                <FormTextField
                                    label="Confirm Password"
                                    id="password2"
                                    onChange={event => validatePassword2(event.target.value)}
                                    error={errors.password2}
                                    type="password"
                                    divClass="mb-3 w-100"
                                    inputClass="form-control"
                                    placeholder=""
                                    required={true}
                                />
                            </div>
                            <input type="submit" className="btn btn-lg custom-btn btn-block w-100 mt-3" value="Register" />
                            <button onClick={() => navigate("/login/")} className="btn btn-lg custom-btn btn-block w-100 mt-4">Already have an account?</button>
                        </form>
                    </div>
                </div>
            </div>
            <img src={wave} alt="wave" id={style.wave} />
        </main>
    );
};