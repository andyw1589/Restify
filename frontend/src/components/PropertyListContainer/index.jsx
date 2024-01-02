import {PropertyCard} from "../PropertyCard";
import {FillerCard} from "../FillerCard";
import {useCallback, useEffect, useRef, useState} from "react";
import _ from "lodash";

export const PropertyListContainer = ({query}) => {
    const [page, setPage] = useState(1);
    const [cleanedParams, setCleanedParams] = useState({});
    const paramsUpdated = useRef(false);
    const [numFiller, setNumFiller] = useState(5);
    const [nextPageExists, setNextPageExists] = useState(false);
    const [properties, setProperties] = useState([]);
    const [cardsPerRow, setCardsPerRow] = useState(0);
    const CARD_FLEX_BASIS = 300;
    const px_per_rem = useRef(parseFloat(getComputedStyle(document.documentElement).fontSize));

    /** Infinite Scrolling **/
    // Referenced https://medium.com/suyeonme/react-how-to-implement-an-infinite-scroll-749003e9896a
    const loader = useRef(null);
    const nextPageExistsRef = useRef(true);
    nextPageExistsRef.current = nextPageExists;

    const debouncedIncPage = _.debounce(()=>{setPage((prev) => prev + 1)})

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && nextPageExistsRef.current) {
            debouncedIncPage();
        }
    }, []);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) observer.observe(loader.current);
    }, [handleObserver]);

    useEffect(()=>{
        setNumFiller(2 * cardsPerRow-(properties.length % cardsPerRow));
    }, [properties, cardsPerRow])

    const updateFiller = () => {
        setCardsPerRow(Math.floor(window.innerWidth/(CARD_FLEX_BASIS+px_per_rem.current*2)));
    }

    useEffect(() => {
        document.title = "Home";
        window.addEventListener("resize", updateFiller)

        updateFiller();

        // Remove event listener on unload
        return ()=>{
            window.removeEventListener("resize", updateFiller)
        }
    }, []);

    const getProperties = async (cleanedParams)=>{
        let propertiesResponse = await fetch("http://localhost:8000/properties/all/?" + new URLSearchParams(cleanedParams), {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            }
        })
        let propertiesData = await propertiesResponse.json()
        if (!propertiesResponse.ok) {
            console.log(propertiesData)
            return []
        } else {
            setNextPageExists(propertiesData.next !== null);
            return propertiesData.results
        }
    }

    const getParams = async () => {
        if (paramsUpdated.current) {
            return cleanedParams
        }

        // Recompute the cleaned query params to send whenever query gets updated
        let _params = {}
        for (let key in query) {
            if (query[key] !== "" && key !== "location") {
                _params[key] = query[key]
            }
        }

        if (query.location !== "") {
            let locationResponse = await fetch("https://geocode.maps.co/search?q=" + query.location, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            let locationData = await locationResponse.json()
            _params.location = `${locationData[0].lat},${locationData[0].lon}`;
        }
        paramsUpdated.current = true;
        setCleanedParams(_params);
        return _params
    }

    const updateProperties = async (page, previousProperties) => {
        let cleanedParams = await getParams();
        cleanedParams["page"] = page;
        let res = await getProperties(cleanedParams);
        setProperties([...previousProperties, ...res]);
    }

    useEffect(() => {
        // first page is automatically loaded on query change
        if (page !== 1) {
            updateProperties(page, properties);
        }
        // eslint-disable-next-line
    },[page])

    useEffect(()=>{
        setPage(1);
        paramsUpdated.current = false;
        updateProperties(1, []);
        // eslint-disable-next-line
    }, [query])

    return (<div id="properties-container" className="row g-0 justify-content-around">
        {
            properties.map((property) => {
                return <PropertyCard
                    key={property.id}
                    id={property.id}
                    imgsrc={property.propertyimage_set[0]}
                    title={property.title}
                    rating={property.rating}
                    distance={property.distance}
                    price={property.base_price}
                />
            })
        }
        {
            Array.from({ length: numFiller }).map((_, index) => {
                return <FillerCard key={index} static={!nextPageExists}/>
            })
        }
        <div ref={loader} />
        {
            nextPageExists && <div className="d-flex justify-content-center m-3">
                <div className="spinner-border" role="status">
                    <span className="sr-only"></span>
                </div>
            </div>
        }
        {
            !nextPageExists && <h5 className={"text-center mb-3"}>You've reached the end. Check back later for new properties!</h5>
        }
    </div>
    )
}