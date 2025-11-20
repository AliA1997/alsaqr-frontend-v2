import { useField, FieldHookConfig, FieldHelperProps } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type MyInputProps = {
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    prefix?: string;
} & FieldHookConfig<string>;

export function MyInput({ label, prefix, disabled, ...props }: MyInputProps) {
    const [field, meta] = useField(props.name);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={props.id || props.name} className="block mb-2 text-md font-medium dark:text-gray-50">
                    {label}
                </label>
            )}
            <div className='relative'>
                {prefix && ( 
                    <span className={`
                    absolute left-0 text-lg border-r-2 dark:border-r-0 w-10 h-full 
                    text-gray-900 bg-gray-100 dark:bg-transparent dark:text-gray-50 
                    px-3 py-1 dark:py-2
                    `}>{prefix}</span>
                )}
                <input
                    {...field}
                    type={props.type || 'text'}
                    placeholder={props.placeholder}
                    className={`
                        h-12 w-full text-lg outline-none placeholder:text-xl dark:bg-[#000000] dark:text-gray-50 ${prefix ? 'pl-12' : ''}
                        ${meta.touched && meta.error ? 'border-red-500 border' : ''} ${props.className || ''}`}
                    disabled={disabled ?? false}
                    data-testid={`${props.name.toLowerCase()}input`}
                />
                {meta.touched && meta.error ? (
                    <div className="text-red-500 text-sm mt-1">{meta.error}</div>
                ) : null}

            </div>
        </div>
    );
}

type FileUploadInputProps = {
    label?: string;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, helpers: FieldHelperProps<any>) => void;
} & FieldHookConfig<File | null>;

export function FileUploadInput({ label, ...props }: FileUploadInputProps) {
    const [field, meta, helpers] = useField(props);

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                type="file"
                onChange={e => props.handleFileChange(e, helpers)}
                onBlur={field.onBlur}
                data-testid={`${props.name.toLowerCase()}input`}
                className={`block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900 dark:file:text-blue-100
                    dark:hover:file:bg-blue-800
                    ${meta.touched && meta.error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {meta.touched && meta.error ? (
                <div className="text-red-500 text-xs mt-1">{meta.error}</div>
            ) : null}
        </div>
    );
}



type MyDatePickerProps = {
    label?: string;
    placeholder?: string;
    className?: string;
} & FieldHookConfig<Date>;

export function MyDatePicker({ label, ...props }: MyDatePickerProps) {
    const [field, meta, helpers] = useField(props.name);
    
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={props.id || props.name} className="block mb-2 text-md font-medium">
                    {label}
                </label>
            )}
            <DatePicker
                id={props.id || props.name}
                selected={field.value}
                onChange={(date) => helpers.setValue(date)}
                onBlur={() => helpers.setTouched(true)}
                placeholderText={props.placeholder}
                className={`h-12 w-full text-lg outline-none placeholder:text-xl dark:bg-[#000000] ${
                    meta.touched && meta.error ? 'border-red-500 border' : ''
                } ${props.className || ''}`}
                dateFormat="MM/dd/yyyy"
                showYearDropdown
                dropdownMode="select"
            />
            {meta.touched && meta.error ? (
                <div className="text-red-500 text-sm mt-1">{meta.error}</div>
            ) : null}
        </div>
    );
}