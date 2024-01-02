// Displays a review (either a property or user review) on a user's profile
import { ReviewStar } from "../ReviewStar";

export const ProfileReviewCard = props => {
    const review = props.review;

    return (
        <div className="card row p-3 mt-3 mx-3">
            <ul className="col list-group list-group-flush px-0">
                <li className="list-group-item container justify-content-between p-0">
                    <div className="row p-3 justify-content-center justify-content-md-between">
                        {
                            props.image ?
                                <img src={props.image} alt="review" className="col-12 col-md-5 mb-3 mt-0 my-md-auto mx-md-0 mx-auto" style={{ "width": "150px" }} /> :
                                null
                        }
                        <div className="row col-12 col-md-7 justify-content-between">
                            {
                                [1, 2, 3, 4, 5].map(rating => <ReviewStar key={rating} fill={rating <= parseInt(review.rating) ? "gold" : "gray"} />)
                            }
                        </div>
                    </div>
                    {
                        props.extraTitle ?
                            <h6 className="px-3 pb-3 fst-italic">{props.extraTitle}</h6> :
                            null
                    }
                    <div className="px-3 pb-3 fst-italic">Reviewed on {review.publish_date}</div>
                </li>
                <li className="list-group-item">
                    <section>
                        <h4>{review.title}</h4>
                        <p>{review.body}</p>
                    </section>
                </li>
            </ul>
        </div>
    );
};