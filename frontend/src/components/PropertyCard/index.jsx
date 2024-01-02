import {Link} from "react-router-dom";
import style from "./style.module.css"
import styled from "styled-components";

const PlaceholderImgDiv = styled.div`
        background-color: #DDDDDD;
        width: 100%;
        aspect-ratio: 1.5;
    `;

export const PropertyCard = (props) => {
    return (
        <div className={`card m-3 ${style["card-flex"]}`}>
            {
                props.imgsrc !== undefined ?
                <img src={props.imgsrc.image} className={`card-img-top object-fit-cover ${style["card-aspect-ratio"]}`}
                 alt="Rental property" /> :
                 <PlaceholderImgDiv></PlaceholderImgDiv>
            }
            <div className="card-body">
                <h5 className="card-title">{props.title}</h5>
                <div className="card-text">
                    {
                        parseFloat(props.rating) !== 0 ?
                            <div>{parseFloat(props.rating).toFixed(1)}★</div> :
                            <div>No ratings yet</div>
                    }
                    {
                        props.distance !== null ?
                            <div>{parseFloat(props.distance).toFixed(2)}km away</div> :
                            <div></div>
                    }
                    <div>${props.price}/night</div>
                </div>
                <Link to={`../properties/${props.id}/`} className="stretched-link" />
            </div>
        </div>
    );
}