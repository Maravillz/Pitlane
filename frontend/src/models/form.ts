export type BaseField<T> = {
    fieldName: keyof T
    label: string
    required?: boolean
}

type InputFieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'

/** The input field has a placeholder */
export type InputField<T> = BaseField<T> & {
    fieldType: InputFieldType
    placeholder?: string
}

/** The dropdown input has additional dropdown values and a function for value changes */
export type DropdownField<T> = BaseField<T> & {
    fieldType: 'dropdown'
    dropdownValues: { label: string, value: string }[]
    onChange?: (value: string) => void
}

/** The area field had additional placeholder and the number of rows displayed in the text field */
export type AreaField<T> = BaseField<T> & {
    fieldType: 'area'
    rowNr: number
    placeholder?: string
}

export type DateGranularity = "year" | "month" | "day" | "hour";

/** The date field has additional placeholder for the date and granularity to pick the most adequate datepicker custom */
export type DateField<T> = BaseField<T> & {
    fieldType: "date_custom";
    granularity: DateGranularity;
    placeholder?: string;
};


export type FormField<T> = InputField<T> | DropdownField<T> | AreaField<T> | DateField<T>