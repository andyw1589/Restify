import style from "./style.module.css";

export const NotificationPreview = props => {
    return (
        <div className={style.notifpreview}>
            <div
            className={`${style.notifbox} ${!props.read && !props.selected ? style.notifunread : null} ${props.selected ? style.notifselected : null}`}
            id={`notif-${props.id}`}
            onClick={props.onPreviewClick}
            >
                    <p className={`my-auto px-2 fw-light text-secondary ${style.notiftime}`}>{props.time}</p>
                    <p className={`my-auto ${style.notifheader}`}>{props.header}</p>
            </div>
            <button className= {`btn btn-secondary ${style.deletebtn}`} onClick={() => props.deleteNotif(props.id)}>Delete</button>
        </div>
    );
};