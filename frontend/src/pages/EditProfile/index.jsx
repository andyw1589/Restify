import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import style from './style.module.css';

import { FormTextField } from "../../components/FormTextField";

export const EditProfile = () => {
    const [currentUser, updateUserData] = useOutletContext();

    // prefill with current info
    const [firstName, setFirstName] = useState(currentUser.first_name);
    const [lastName, setLastName] = useState(currentUser.last_name);
    const [email, setEmail] = useState(currentUser.email);
    const [phoneNumber, setPhoneNumber] = useState(currentUser.phone_number);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [errors, setErrors] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        password2: ""
    });

    useEffect(() => { document.title = "Edit Profile" }, []);
    const navigate = useNavigate();

    // a bunch of validators
    const validateFirstName = value => {
        setFirstName(value);
        if (value !== "" && value.match(/^[a-zA-Z]+$/g) == null) {
            setErrors({ ...errors, first_name: "Name must contain only letters." });
            return false;
        };
        setErrors({ ...errors, first_name: "" });
        return true;
    }

    const validateLastName = value => {
        setLastName(value);
        if (value !== "" && value.match(/^[a-zA-Z]+$/g) == null) {
            setErrors({ ...errors, last_name: "Name must contain only letters." });
            return false;
        };
        setErrors({ ...errors, last_name: "" });
        return true;
    }

    const validateEmail = value => {
        setEmail(value);
        if (value !== "" && ((value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/g) == null) || (value.match(/\s/g) != null))) {
            setErrors({ ...errors, email: "Please enter a valid email." });
            return false;
        }
        setErrors({ ...errors, email: "" });
        return true;
    }

    const validatePhoneNumber = value => {
        setPhoneNumber(value);
        if (value !== "" && ((value.length !== 10) || (value.match(/[^0-9]/g) != null))) {
            setErrors({ ...errors, phone_number: "Phone number must be 10 digits." });
            return false;
        }
        setErrors({ ...errors, phone_number: "" });
        return true;
    }

    const validatePassword = value => {
        setPassword(value);
        if (value !== "" && value.length < 8) {
            setErrors({ ...errors, password: "Password must be at least 8 characters long." });
            return false;
        }
        setErrors({ ...errors, password: "" });
        return true;
    }

    const validatePassword2 = value => {
        setPassword2(value);
        if (value !== "" && value !== password) {
            setErrors({ ...errors, password2: "Passwords must match." });
            return false;
        }
        setErrors({ ...errors, password2: "" });
        return true;
    }

    // update password 2's warning whenever password2 or password changes
    useEffect(() => setErrors(e => ({ ...e, password2: password2 !== password ? "Passwords must match." : "" })), [password, password2]);

    const updateProfile = event => {
        event.preventDefault();

        // every validator must run, cannot have default short-circuiting behaviour
        let ok = validateFirstName(firstName);
        ok &&= validateLastName(lastName);
        ok &&= validateEmail(email);
        ok &&= validatePhoneNumber(phoneNumber);
        ok &&= validatePassword(password);
        ok &&= validatePassword2(password2);

        if (!ok) return;

        let data = new FormData();
        data.append("email", email);
        data.append("phone_number", phoneNumber);
        data.append("password", password);
        data.append("password2", password2);
        data.append("first_name", firstName);
        data.append("last_name", lastName);
        data.append("avatar", avatar);

        // send the post request
        fetch("http://localhost:8000/accounts/update/", {
            method: "PATCH",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            },
            body: data
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        // "data" contains error messages that need to be read
                        console.log({ ...errors, ...data });
                        setErrors({ ...errors, ...data });
                    }
                    );
                }
                // success
                return response.json().then(() => {
                    updateUserData();
                    navigate(`/accounts/${currentUser.id}/`);
                });
            });
    };
    
    return (
        <main id={style.main}>
            <div className="card mx-auto" id={style.formcontainer}>
                <div className="card-body">
                    <h1 className="px-2">Edit Profile</h1>
                    <form onSubmit={updateProfile} id={style.editform}>
                        <div id={style.avatarfield}>
                            <label htmlFor="avatar">Avatar</label>
                            <img
                                src={avatar === null ?
                                    currentUser.avatar :
                                    URL.createObjectURL(avatar)}
                                alt="avatar"
                                className="img-fluid rounded-circle"
                            />
                            <input
                                type="file"
                                id="avatar"
                                alt="avatar"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={event => {
                                    if (event.target.files && event.target.files[0])
                                        setAvatar(event.target.files[0]);
                                }}
                            />
                        </div>
                        <div id={style.namefields}>
                            <FormTextField
                                label="First Name"
                                id="first-name"
                                onChange={event => validateFirstName(event.target.value)}
                                error={errors.first_name}
                                type="text"
                                divClass="mb-3 w-100 pe-2"
                                inputClass="form-control"
                                placeholder={firstName}
                                required={false}
                            />
                            <FormTextField
                                label="Last Name"
                                id="last-name"
                                onChange={event => validateLastName(event.target.value)}
                                error={errors.last_name}
                                type="text"
                                divClass="mb-3 w-100 ps-2"
                                inputClass="form-control"
                                placeholder={lastName}
                                required={false}
                            />
                        </div>
                        <div id={style.otherfields}>
                            <FormTextField
                                label="Email"
                                id="email"
                                onChange={event => validateEmail(event.target.value)}
                                error={errors.email}
                                type="email"
                                divClass="mb-3 w-100"
                                inputClass="form-control"
                                placeholder={email}
                                required={false}
                            />
                            <FormTextField
                                label="Phone Number"
                                id="phone-number"
                                onChange={event => validatePhoneNumber(event.target.value)}
                                error={errors.phone_number}
                                type="text"
                                divClass="mb-3 w-100"
                                inputClass="form-control"
                                placeholder={phoneNumber}
                                required={false}
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
                                required={false}
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
                                required={false}
                            />
                        </div>
                        <input type="submit" className="btn btn-lg custom-btn btn-block w-100 mt-3" value="Update" />
                    </form>
                </div>
            </div>
        </main>
    );
};