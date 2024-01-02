import styled from "styled-components";
import { useState } from "react";

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Star = styled.span`
    color: ${props => props.selected ? "gold" : "grey"};
    &:hover {
        cursor: pointer;
    }
`;

const ErrorMessage = styled.p`
    color: red;
`

export const ReviewForm = props => {
    const [errorMessage, setErrorMessage] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewBody, setReviewBody] = useState("");

    const sendReview = event => {
        event.preventDefault();

        // do some client-side validation
        if (reviewRating === 0) {
            setErrorMessage("Please leave a rating above 0.");
            return;
        } if (reviewTitle === "") {
            setErrorMessage("Please create a title.");
            return;
        } if (reviewBody === "") {
            setErrorMessage("Please make a review body.");
            return;
        }

        // send the post request
        fetch("http://localhost:8000/comments/create/", {
            method: "POST",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "comment_to": props.commentTo,
                "comment_to_id": props.commentToId,
                "property_request": props.propertyRequest,
                "rating": reviewRating,
                "title": reviewTitle,
                "body": reviewBody
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } return response.json().then(error => { throw new Error(JSON.stringify(error)); });
            })
            .then(() => {
                setErrorMessage("");
                props.onSuccess();
            })
            .catch(error => {
                console.log(error.message);
                setErrorMessage(JSON.parse(error.message).message)
            });
    };

    return (
        <StyledForm onSubmit={sendReview}>
            {
                props.completed ?
                <h6>You've already completed a review!</h6> :
                <h6>Leave a review!</h6>
            }
            <div>
                {
                    [1, 2, 3, 4, 5].map(rating => <Star
                        className="fa fa-star"
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        selected={rating <= reviewRating}
                    ></Star>)
                }
            </div>
            <label htmlFor={props.titleId}>Title {`(${reviewTitle.length}/100)`}</label>
            <input
                className="mb-2"
                id={props.titleId}
                type="text"
                name="title"
                placeholder="Title"
                style={{width:"75%"}}
                onChange={event => {
                    const trimmed = event.target.value.slice(0, 100);
                    event.target.value = trimmed;
                    setReviewTitle(trimmed);
                }}
            />
            <label htmlFor={props.bodyId}>Body {`(${reviewBody.length}/300)`}</label>
            <textarea
                id={props.bodyId}
                className="w-75"
                rows="4"
                placeholder="Any feedback?"
                name="body"
                onChange={event => {
                    const trimmed = event.target.value.slice(0, 300);
                    event.target.value = trimmed;
                    setReviewBody(trimmed);
                }}
            ></textarea>
            <input type="submit" className="btn custom-btn my-2" disabled={props.completed} />
            <ErrorMessage>{errorMessage}</ErrorMessage>
        </StyledForm>
    );
};