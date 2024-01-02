// a container that displays a user's property reviews, which is displayed on their profile
import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";

import placeholder from "../../assets/avatar.png";
import { ProfileReviewCard } from "../ProfileReviewCard";

const ContainerDiv = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    height: 70vh;
`;

export const UserPropertyReviewContainer = props => {
    const [propertyReviews, setPropertyReviews] = useState([]);
    const [canLoadMore, setCanLoadMore] = useState(true);

    let page = 1;
    let scrollDebounce = useRef(true);  // so it doesn't load multiple times in a single instant which happens sometimes for some reason

    // when scrolling to bottom of page, load more reviews
    const onScroll = useCallback(event => {
        if (Math.abs(event.target.scrollTop + event.target.clientHeight - event.target.scrollHeight) < 1 && canLoadMore && scrollDebounce.current) {
            scrollDebounce.current = false;
            setTimeout(() => scrollDebounce.current = true, 100);
            
            page++;

            fetch(`http://localhost:8000/accounts/${props.userId}/propertycomments/?page=${page}`, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0)
                        setPropertyReviews(p => [...p, ...data.results]);

                    setCanLoadMore(data.next !== null);
                });
        }
    }, [canLoadMore, page, props.userId, scrollDebounce]);

    // load the initial page of reviews
    useEffect(() => {
        fetch(`http://localhost:8000/accounts/${props.userId}/propertycomments/`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setPropertyReviews(data.results);
                setCanLoadMore(data.next !== null);
            });
    }, [props.userId]);

    return (
        <ContainerDiv className="col-md card pb-3 me-1" onScroll={onScroll}>
            {
                propertyReviews.length > 0 ?
                    <>
                        <h1 className="mx-3 my-2">This User's Property Reviews:</h1>
                        {propertyReviews.map(review => <ProfileReviewCard
                            key={`propertyreview-${review.id}`}
                            review={review} 
                            image={review.content_object.propertyimage_set.length > 0 ? review.content_object.propertyimage_set.length[0] : placeholder}
                            extraTitle={review.content_object.title}
                        />)}
                        {
                            !canLoadMore ?
                            <h4 className="mx-3 my-2">You've seen them all!</h4> :
                            null
                        }
                    </> :
                    <h1 className="m-4">This user hasn't reviewed any properties yet...</h1>
            }
        </ContainerDiv>
    );
};