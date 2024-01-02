import style from "./style.module.css";
import { useEffect, useState } from "react";

import { NotificationPreview } from "../../components/NotificationPreview";
import { NotificationData } from "../../components/NotificationData";
import { getNotifContentFromData } from "../../utils/helpers";

export const Notifications = () => {
    let currPage = 1;  //
    const [canLoadMore, setCanLoadMore] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);  // that notif that you clicked on

    // the initial load
    useEffect(() => {
        document.title = "Notifications"
        setTimeout(() => {
            fetch("http://localhost:8000/notifications/view/", {
                method: "GET",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                setNotifications(data.results);
                setCanLoadMore(data.next !== null);
            });
        }, 500);
    }, []);

    const loadMoreNotifs = () => {
        currPage++;
        fetch(`http://localhost:8000/notifications/view/?page=${currPage}`, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                setNotifications([...notifications, ...data.results]);
                setCanLoadMore(data.next !== null);
            });
    }

    const onNotifPreviewClick = notif => {
        // selecting a selected notif unselects it
        if (selectedNotification && selectedNotification.id === notif.id) {
            setSelectedNotification(null);
            return;
        }

        setSelectedNotification(notif);

        // send a request to set the notification as unread
        fetch(`http://localhost:8000/notifications/${notif.id}/`, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
        .then(() => notif.read_by_receiver = true);
        // setting read_by_receiver doesn't force a re-render, but it still re-renders because selectedNotification is
        // being updated
    };

    const markAllRead = () => {
        fetch(`http://localhost:8000/notifications/markallread/`, {
                method: "PATCH",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
        .then(() => setNotifications(notifications.map(notif => ({...notif, "read_by_receiver": true}))));
    };

    const deleteNotif = id => {
        fetch(`http://localhost:8000/notifications/${id}/delete/`, {
                method: "DELETE",
                mode: "cors",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("restify_access")}`
                }
            })
        .then(() => {
            const index = notifications.findIndex(notif => notif.id === id);
            notifications.splice(index, 1);
            setNotifications([...notifications]);

            if (id === selectedNotification.id) setSelectedNotification(null);
        });
    };

    return (
        <main>
            <h1 className="px-2">Notifications</h1>
            <div id={style.notifbuttons} className="mb-2 px-2">
                <button id="markallread" type="button" className="btn custom-btn" onClick={markAllRead}>Mark all as read</button>
            </div>
            <div id={style.notifssplitview}>
                <div id={style.notifscontainer} className="border-top border-bottom">
                    {
                        notifications.length !== 0 ?
                        notifications.map((notif) => {
                            const {header} = getNotifContentFromData(notif);
                            return <NotificationPreview
                                    key={notif.id}
                                    id={notif.id}
                                    header={header}
                                    time={notif.time_sent}
                                    read={notif.read_by_receiver}
                                    selected={selectedNotification ? selectedNotification.id === notif.id : false}
                                    onPreviewClick={() => onNotifPreviewClick(notif)}
                                    deleteNotif={deleteNotif}
                                    />
                        }) :
                        <p>You have no notifications</p>
                    }
                    {
                        canLoadMore && notifications.length !== 0 ?
                        /* can probably refactor this part to use infinite scroll instead */
                        <button id={style.loadmore} type="button" className="btn custom-btn my-3" onClick={loadMoreNotifs}>Load More</button> :
                        null
                    }
                </div>

                <div id={style.notifscontent} className="px-3 pt-2 border">
                    {
                        selectedNotification === null ?
                        <h3>Click on a notification to view it.</h3> :
                        <NotificationData notif={selectedNotification} />
                    }
                </div>
            </div>
        </main>
    );
};