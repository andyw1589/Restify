import { useEffect, useState } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";

import placeholder from "../../assets/avatar.png";
import { ReviewStar } from "../../components/ReviewStar";
import { UserPropertyReviewContainer } from "../../components/UserPropertyReviewContainer";
import { UserReviewContainer } from "../../components/UserReviewContainer";
import { ReviewForm } from "../../components/ReviewForm";

export const User = () => {
    let { id } = useParams();
    const [user, setUser] = useState(null);
    const [currentUser] = useOutletContext();  // this is the logged in user!
    const [reviewCompleted, setReviewCompleted] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/accounts/${id}/view/`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setUser(data);
                document.title = `${data.first_name} ${data.last_name}`;
            });

        // see if the current user has already reviewed this person
        fetch(`http://localhost:8000/accounts/${id}/reviewedby/${currentUser.id}/`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setReviewCompleted(data.result);
            });
    }, [id, currentUser]);

    return user === null ?
        <main>
            <h1>loading....</h1>
        </main> : (
            <main>
                <div className="container p-5">
                    <div className="row">
                        <div className="col-md me-1">
                            <div className="row justify-content-center" id="profile-avatar">
                                <div className="col-6 text-center">
                                    <img src={user.avatar ? user.avatar : placeholder} alt="avatar" className="img-fluid rounded-circle" />
                                </div>
                            </div>
                            <div className="row pt-5" id="profile-info">
                                <div className="card col">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item justify-content-center">
                                            <h1 className="text-center">{user.first_name} {user.last_name}</h1>
                                            <p className="text-center">Email: {user.email}</p>
                                            <p className="text-center">Phone Number: {user.phone_number}</p>
                                            {
                                                user.id === currentUser.id ?
                                                    <div className="mt-4 mb-3 text-center">
                                                        <Link to="../accounts/edit/" className="custom-btn">Edit profile</Link>
                                                    </div> :
                                                    null
                                            }
                                        </li>
                                        {
                                            // only hosts can see user ratings and reviews
                                            currentUser.is_host ?
                                                <li className="list-group-item p-3">
                                                    <h3 className="text-center">User Rating: {parseFloat(user.rating).toFixed(1)}</h3>
                                                    <div className="row justify-content-between p-0" id="profile-stars">
                                                        {
                                                            [1, 2, 3, 4, 5].map(rating => <ReviewStar key={rating} fill={rating <= parseInt(user.rating) ? "gold" : "gray"} />)
                                                        }
                                                    </div>
                                                </li> :
                                                null
                                        }
                                        {
                                            // only hosts have the option to leave reviews
                                            currentUser.is_host && currentUser.id !== user.id ?
                                                <li className="list-group-item p-3">
                                                    <ReviewForm
                                                        completed={reviewCompleted}
                                                        commentTo="user"
                                                        commentToId={user.id}
                                                        propertyRequest={null}
                                                        onSuccess={() => {setReviewCompleted(true); window.location.reload();} }
                                                        titleId={`reviewtitle-${user.id}`}
                                                        bodyId={`reviewbody-${user.id}`}
                                                    />
                                                </li> :
                                                null
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {
                            // only hosts can see reviews on this user
                            currentUser.is_host ?
                                <UserReviewContainer userId={user.id} /> :
                                null
                        }
                        <UserPropertyReviewContainer userId={user.id} />
                    </div>
                </div>
            </main>
        );
};