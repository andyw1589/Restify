import styled from "styled-components";
import style from "./style.module.css"

const PlaceholderImgDiv = styled.div`
        background-color: #DDDDDD;
        width: 100%;
        aspect-ratio: 1.5;
    `;
export const FillerCard = (props) => {
    return (
        <div className={`card m-3 ${style["card-flex"]}`}>
            <PlaceholderImgDiv></PlaceholderImgDiv>
            <div className="card-body">
                <h5 className={`card-title ${props.static ? "" : "placeholder-glow"}`}>
                    <span className={`placeholder ${props.static ? style["cursor-default"] : ""} col-6 bg-secondary`}></span>
                </h5>
                <p className={`card-text ${props.static ? "" : "placeholder-glow"}`}>
                    <span className={`placeholder ${props.static ? style["cursor-default"] : ""} col-7 bg-secondary`}></span>
                    <span className={`placeholder ${props.static ? style["cursor-default"] : ""} col-4 bg-secondary`}></span>
                    <span className={`placeholder ${props.static ? style["cursor-default"] : ""} col-4 bg-secondary`}></span>
                    <span className={`placeholder ${props.static ? style["cursor-default"] : ""} col-6 bg-secondary`}></span>
                    <span className={`placeholder ${props.static ? style["cursor-default"] : ""} col-8 bg-secondary`}></span>
                </p>
            </div>
        </div>
    );
}