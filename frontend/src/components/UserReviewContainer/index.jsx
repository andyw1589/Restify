// a container that displays a user's property reviews, which is displayed on their profile
import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";

import { ProfileReviewCard } from "../ProfileReviewCard";

const ContainerDiv = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    height: 70vh;
`;

export const UserReviewContainer = props => {
    const [userReviews, setUserReviews] = useState([]);
    const [canLoadMore, setCanLoadMore] = useState(true);

    let page = 1;
    let scrollDebounce = useRef(true);  // so it doesn't load multiple times in a single instant which happens sometimes for some reason

    // when scrolling to bottom of page, load more reviews
    const onScroll = useCallback(event => {
        if (Math.abs(event.target.scrollTop + event.target.clientHeight - event.target.scrollHeight) < 1 && canLoadMore && scrollDebounce.current) {
            scrollDebounce.current = false;
            setTimeout(() => scrollDebounce.current = true, 100);
            
            page++;

            fetch(`http://localhost:8000/accounts/${props.userId}/comments/?page=${page}`, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0)
                        setUserReviews(p => [...p, ...data.results]);

                    setCanLoadMore(data.next !== null);
                });
        }
    }, [canLoadMore, page, props.userId, scrollDebounce]);

    // load the initial page of reviews
    useEffect(() => {
        fetch(`http://localhost:8000/accounts/${props.userId}/comments/`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setUserReviews(data.results);
                setCanLoadMore(data.next !== null);
            });
    }, [props.userId]);

    return (
        <ContainerDiv className="col-md card pb-3 me-1" onScroll={onScroll}>
            {
                userReviews.length > 0 ?
                    <>
                        <h1 className="mx-3 my-2">Reviews for This User:</h1>
                        {userReviews.map(review => <ProfileReviewCard
                            key={`propertyreview-${review.id}`}
                            review={review} 
                            image={null}
                            extraTitle={`Reviewed by ${review.commenter.first_name} ${review.commenter.last_name}`}
                        />)}
                        {
                            !canLoadMore ?
                            <h4 className="mx-3 my-2">You've seen them all!</h4> :
                            null
                        }
                    </> :
                    <h1 className="m-4">This user hasn't received any reviews yet...</h1>
            }
        </ContainerDiv>
    );
};