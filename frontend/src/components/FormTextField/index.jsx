import styled from 'styled-components';

// props takes in id, label, type (text, email, password), classes, placeholder, whether its required
// error message and an onChange function

const ErrorMessageDiv = styled.div`
        position: absolute;
        z-index: 2;
        background: #e30b0b;
        color: white;
        border-radius: 0.2rem;
        padding: 0.2rem;
        filter: drop-shadow(0.1rem 0.1rem 0.1rem rgba(0, 0, 0, 0.4));
    `;

export const FormTextField = props => {
    return (
        <div className={props.divClass} id={props.divId}>
            <label className={props.labelClass} htmlFor={props.id}>{props.label}</label>
            <input onChange={props.onChange}
                   type={props.type}
                   id={props.id}
                   className={props.inputClass}
                   placeholder={props.placeholder}
                   required={props.required}
            />
            {
                props.error !== "" ?
                (<ErrorMessageDiv>{props.error}</ErrorMessageDiv>) :
                null
            }
        </div>
    );
};