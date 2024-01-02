// props takes in id, label, type (text, email, password), classes, placeholder, whether its required
// error message and an onChange function

export const SelectField = props => {
    return (
        <div className={props.divClass} id={props.divId}>
            <label className={props.labelClass} htmlFor={props.id}>{props.label}</label>
            <select onChange={props.onChange}
                    value={props.value}
                    id={props.id}
                    className={props.selectClass}
                    placeholder={props.placeholder}
                    required={props.required}
                    defaultValue={props.defaultValue}
            >
                {props.options.map((opt) => {
                    return <option key={opt[0]} value={opt[0]}>{opt[1]}</option>
                })}
            </select>
        </div>
    );
};