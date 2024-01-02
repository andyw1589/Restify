import style from "./style.module.css";

export const RequestPageNavigator = props => {
    return (
        <div id={style.pagenavigator}>
            <button
                id="page-prev"
                type="button"
                className="btn btn-link text-decoration-none"
                disabled={props.page === 1}
                onClick={() => props.setPage(props.page - 1)}
            >
                &lt;&lt;
            </button>
            <div id="page-num">{props.page}</div>
            <button
                id="page-next"
                type="button"
                className="btn btn-link text-decoration-none"
                disabled={!props.canLoadMore}
                onClick={() => props.setPage(props.page + 1)}
            >
                &gt;&gt;
            </button>
        </div>
    );
};