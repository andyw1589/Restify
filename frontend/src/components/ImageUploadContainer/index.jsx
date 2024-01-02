import {useState} from "react";
import style from "./style.module.css"

export const ImageUploadContainer = ({index, imageListSetter}) => {
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        imageListSetter((imgList) => {
            return {...imgList, [index]: file};
        })
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = (event) => {
            setPreviewImageUrl(event.target.result);
        };
    };

    const clearPhoto = (e) => {
        setPreviewImageUrl("");
        imageListSetter((imgList) => {
            let list = {...imgList}
            delete list[index];
            return list;
        })
        const fileInput = document.getElementById(`file-upload-${index}`);
        fileInput.value = '';
    }

    return (
        <div className="d-flex flex-column me-3 my-3 position-relative">
            <button onClick={clearPhoto} className={`${style["clear-img-btn"]}`}></button>
            {
                previewImageUrl !== "" ? <img src={previewImageUrl} alt="Upload preview" className={style["preview-image"]} /> : <div className={`${style["preview-placeholder"]}`}></div>
            }
            <input id={`file-upload-${index}`} type="file" name="photo" accept="image/*" onChange={handlePhotoChange} />
        </div>
    );
}