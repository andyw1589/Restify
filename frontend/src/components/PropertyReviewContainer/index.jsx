import { useEffect, useState } from "react";

const ratingToDescriptor = {
    5: "Excellent",
    4: "Very Good",
    3: "Good",
    2: "Okay",
    1: "Not Good",
    0: "No Reviews Yet"
}

export const PropertyReviewContainer = ({ propertyInfo }) => {
    const [property, setProperty] = useState({});
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [canLoadMore, setCanLoadMore] = useState(true);

    useEffect(() => {
        if (propertyInfo !== undefined && propertyInfo.id !== undefined) {
            setProperty(propertyInfo);
            getComments(propertyInfo.id).then(d => {
                setComments(c => [...c, ...d.results]);
                setCanLoadMore(d.next !== null);
            });
        }
    }, [propertyInfo, page])

    const getComments = async (propId) => {
        let response = await fetch(`http://localhost:8000/properties/${propId}/comments/?page=${page}`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
            }
        })
        let data = await response.json()
        if (!response.ok) {
            return {}
        } else {
            console.log(data);
            return data;
        }
    }

    const loadMoreComments = () => {
        if (canLoadMore) setPage(page + 1);
    }

    return (
        <div className="py-4">
            <h3 id="reviews">{property.num_ratings} Reviews</h3>
            <div className="pb-3 border-bottom">
                <span>{parseFloat(property.rating).toFixed(2)}★ • {ratingToDescriptor[parseFloat(property.rating).toFixed()]}</span>
            </div>

            {
                comments.map((review) => {
                    let star = "★"
                    return (
                        <div className="py-3 border-bottom" key={review.id}>
                            <div className="fw-bold fs-5">{review.title}</div>
                            <div className="mb-2">{star.repeat(review.rating)} • ${review.user_name}</div>
                            <div className="mb-2">{review.body}</div>
                            <div className="fst-italic">Reviewed on {review.publish_date}</div>

                            {/* GET REPLY BY DOING review.replies[0] */}
                            {/*<div className="host-reply border-start">*/}
                            {/*    <p className="fw-bold">Host's reply</p>*/}
                            {/*    <p>cool review bro</p>*/}
                            {/*    <form className="reply">*/}
                            {/*        <label htmlFor="review-reply-${i}" className="fw-bold">Reply Here</label>*/}
                            {/*        <textarea id="review-reply-${i}" className="w-75" rows="4"*/}
                            {/*                  placeholder="You may only reply once"></textarea>*/}
                            {/*        <input type="submit" className="btn custom-btn my-2" />*/}
                            {/*    </form>*/}
                            {/*</div>*/}
                        </div>
                    )
                }
                )
            }
            {
                // load more button
                <button className="custom-btn mt-4" disabled={!canLoadMore} onClick={loadMoreComments}>Load More</button>
            }
        </div>
    )
}