import { getNotifContentFromData } from "../../utils/helpers";

export const NotificationData = props => {
    const {header, body} = getNotifContentFromData(props.notif);

    return (
        <div>
            <h3>{header}</h3>
            {body}
        </div>
    );
};