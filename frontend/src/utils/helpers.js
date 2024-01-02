// various helper and utility functions i guess

import { Link } from "react-router-dom";

// returns header and body for a notification
// header is a string, body is a JSX element
export const getNotifContentFromData = notifData => {
    let header, body;
    const data = notifData.data;  // miscellaneous data
    const sender_name = `${notifData.sender.first_name} ${notifData.sender.last_name}`;
    const sender_link = <Link to={`accounts/${notifData.sender.id}/`}>{sender_name}</Link>;

    let propertyLink = null;

    // oh no
    if (data.property)
        propertyLink = <Link to={`/properties/${data.property.id}/`}> {data.property.title}</Link>;
    if (data.request?.property)
        propertyLink = <Link to={`/properties/${data.request.property.id}/`}> {data.request.property.title}</Link>;
    if (data.request?.request?.property)
        propertyLink = <Link to={`/properties/${data.request.request.property.id}/`}> {data.request.request.property.title}</Link>;
    if (notifData.notif_type === "property-review-reply")
        propertyLink = <Link to={`/properties/${data.comment.content_object.property.id}/`}> {data.comment.content_object.property.title}</Link>;

    switch(notifData.notif_type) {
        case "request":
            header = `${sender_name} wants to make a reservation`;
            body = <>
                <p>{sender_name} wants to make a reservation for your property {propertyLink}.</p>
                <p>The requested time slot is {data.start_date} to {data.end_date}.</p>
                <p>You can view it <Link to={`/requests/`}>here</Link>.</p>
            </>;
            break;
        case "request-update":
            if (notifData.data.status === "expired") {
                header = `Your reservation request to ${data.request.property.title} has expired`;
                body = <p>The reservation that you made to {propertyLink} has expired. Its expiry date was {data.request.expiry_date}.</p>;
            } else {
                header = `Your reservation request to ${data.request.property.title} was ${data.request.status}`;
                body = <>
                    <p>The reservation that you made to {propertyLink} has been {data.request.status} by {sender_link}.</p>
                    <p>The requested time slot is {data.request.start_date} to {data.request.end_date}.</p>
                </>;
            }
            break;
        case "request-cancellation":
            header = `${sender_name} wants to cancel an approved request`;
            body = <>
                <p>{sender_name} wants to cancel an approved reservation for your property {propertyLink}.</p>
                <p>The originally requested time slot is {data.request.start_date} to {data.request.end_date}.</p>
            </>;
            break;
        case "request-cancellation-update":
            header = `Your cancellation request was ${data.request.status}`;
            body = <p>Your request to cancel an approved reservation for {propertyLink} was {data.request.status} by {sender_link}.</p>
            break;
        case "property-review":
            header = "Your property got a review!";
            body = <>
                <p>Your property {propertyLink} got a review by {sender_name}!</p>
                <p>Rating: {data.comment.rating} stars</p>
                <p>Title: {data.comment.title}</p>
                <p>Body: {data.comment.body}</p>
            </>
            break;
        case "property-review-reply":
            header = "Your review got a reply!";
            body = <>
                <p>Your review got a reply by {sender_name}!</p>
                <section>
                    <h6>Reply:</h6>
                    <p>Title: {data.comment.title}</p>
                    <p>Body: {data.comment.body}</p>
                </section>
                <section>
                    <h6>Original Review:</h6>
                    <p>Rating: {data.comment.content_object.rating} stars</p>
                    <p>Title: {data.comment.content_object.title}</p>
                    <p>Body: {data.comment.content_object.body}</p>
                </section>
                <p>From {propertyLink}</p>
            </>
            break;
        default:
            header = "this is a notification type that still needs handling: " + notifData.notif_type;
            body = <p>you shouldn't be seeing this!</p>;
    }

    // } else if (notifData.type === "reply") {
    //     header = `${notifData.data.replier} has replied to your review.`;
    //     body = `${notifData.data.replier} has replied to your review: "${notifData.data.reply}"`;
    // } else if (notifData.type === "request-reminder") {
    //     header = `Your reservation to ${notifData.data.host} is coming up soon.`;
    //     body = `Your reservation to ${notifData.data.host} is coming up on ${notifData.data["reservation-time"]}.`;
    // } else if (notifData.type === "rating") {
    //     header = `Your property #${notifData.data["property-id"]} got a ${notifData.data.rating}-star rating!`;
    //     body = `Your property #${notifData.data["property-id"]} got a ${notifData.data.rating}-star rating from ${notifData.data.rater}!`;
    // } else if (notifData.type === "comment") {
    //     header = `${notifData.data.commenter} has commented on your property #${notifData.data["property-id"]}`;
    //     body = `${notifData.data.commenter} has commented on your property #${notifData.data["property-id"]}: "${notifData.data.comment}"`;

    return {"header": header, "body": body};
};

export const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);