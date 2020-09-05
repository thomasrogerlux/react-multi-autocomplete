import React, {
    useState,
    FormEvent,
    ChangeEvent,
    useRef,
    useEffect,
    useCallback,
    ReactElement,
    cloneElement,
    HTMLProps,
    forwardRef,
    CSSProperties,
} from "react";
import { useCombobox } from "downshift";

interface AutocompleteInputProps extends Omit<HTMLProps<HTMLInputElement>, "ref"> {
    component?: ReactElement | undefined;
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
    (props, ref) => {
        const childProps = { ...props };

        delete childProps.component;

        return props.component !== undefined ? (
            cloneElement(props.component, { ...childProps, ref })
        ) : (
            <input {...childProps} ref={ref} />
        );
    }
);

interface AutocompleteListProps extends Omit<HTMLProps<HTMLUListElement>, "ref"> {
    component?: ReactElement | undefined;
}

export const AutocompleteList = forwardRef<HTMLUListElement, AutocompleteListProps>(
    (props, ref) => {
        const childProps = { ...props };

        delete childProps.component;

        return props.component !== undefined ? (
            cloneElement(props.component, { ...childProps, ref })
        ) : (
            <ul {...childProps} ref={ref} />
        );
    }
);

interface AutocompleteListItemProps extends Omit<HTMLProps<HTMLLIElement>, "ref"> {
    component?: ReactElement | undefined;
    isHighlighted?: boolean | undefined;
    highlightedStyle?: CSSProperties;
}

export const AutocompleteListItem = forwardRef<HTMLLIElement, AutocompleteListItemProps>(
    (props, ref) => {
        const { isHighlighted, highlightedStyle, component } = props;
        const childProps = { ...props };

        delete childProps.isHighlighted;
        delete childProps.highlightedStyle;
        delete childProps.component;

        return component !== undefined ? (
            cloneElement(component, {
                ...childProps,
                style: isHighlighted ? highlightedStyle : props.style,
                ref,
            })
        ) : (
            <li {...childProps} style={isHighlighted ? highlightedStyle : props.style} ref={ref} />
        );
    }
);

export interface AutocompleteProps {
    autocompletions: { [_: string]: string[] };
    onSubmit: (_: string) => void;
    children?: ReactElement | ReactElement[] | undefined;
}

export const Autocomplete = (props: AutocompleteProps) => {
    const { autocompletions, onSubmit, children } = props;

    const inputEl = useRef<HTMLInputElement>(null);

    const [nextCaretPosition, setNextCaretPosition] = useState<number | undefined>(undefined);
    const [caretPosition, setCaretPosition] = useState<number>(0);
    const [formValue, setFormValue] = useState<string>("");
    const [inputItems, setInputItems] = useState<string[]>([]);

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        getComboboxProps,
        getItemProps,
        highlightedIndex,
    } = useCombobox({
        items: inputItems,
        // Triggered when an item is chose from the autocomplete menu
        onSelectedItemChange: ({ selectedItem }) => {
            const lastChar = formValue.slice(0, caretPosition).slice(-1);
            const item = selectedItem || "";

            // If the last char is a symbol then just concatenate the item with
            // the current form value
            if (autocompletions[lastChar] !== undefined) {
                setFormValue(
                    formValue.slice(0, caretPosition) + item + formValue.slice(caretPosition)
                );
                // Else you replace the value after the symbol with the item (that
                // way you override the item that was being written
            } else {
                setFormValue(
                    formValue.slice(0, caretPosition).replace(/\w+$/gm, item) +
                        formValue.slice(caretPosition)
                );
            }

            setNextCaretPosition(caretPosition + item.length);
        },
    });

    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormValue("");
        onSubmit(formValue);
    };

    // Listen for the special keys that will finish the current autocompletion
    const handleInputKeyDown = useCallback((event: KeyboardEvent) => {
        const { key } = event;

        if (key === " ") {
            setInputItems([]);
        }
    }, []);

    // Listen for updating caret postion
    const handleInputKeyUp = useCallback((event: KeyboardEvent) => {
        const { target } = event;

        setCaretPosition((target as any).selectionStart);
    }, []);

    // Link the listeners to the input
    useEffect(() => {
        const el = inputEl.current;

        if (el !== null && el !== undefined) {
            el.addEventListener("keydown", handleInputKeyDown);
            el.addEventListener("keyup", handleInputKeyUp);
        }
        return () => {
            if (el !== null && el !== undefined) {
                el.removeEventListener("keydown", handleInputKeyDown);
                el.removeEventListener("keyup", handleInputKeyUp);
            }
        };
    }, [handleInputKeyDown, handleInputKeyUp]);

    // Manually set caret in the input when nextCaretPosition get a value
    useEffect(() => {
        if (nextCaretPosition !== undefined) {
            if (inputEl.current !== null && inputEl.current !== undefined) {
                inputEl.current.setSelectionRange(nextCaretPosition, nextCaretPosition);
            }
            setCaretPosition(nextCaretPosition);
            setNextCaretPosition(undefined);
        }
    }, [nextCaretPosition]);

    // When the form value change, update the autocompletion accordingly
    useEffect(() => {
        if (formValue === "") {
            setInputItems([]);
        } else {
            const lastWordMatch = formValue.slice(0, caretPosition + 1).match(/(?<=\s*)([\S]+)$/gm);
            const lastWord = lastWordMatch ? lastWordMatch[0] : "";
            const currentCompletion = lastWord.slice(0, 1);

            if (autocompletions[currentCompletion] !== undefined) {
                setInputItems(
                    autocompletions[currentCompletion].filter(item =>
                        item.toLowerCase().startsWith(lastWord.slice(1).toLowerCase())
                    )
                );
            } else {
                setInputItems([]);
            }
        }
    }, [formValue, caretPosition, autocompletions]);

    const childrenList =
        children !== undefined ? (children instanceof Array ? children : [children]) : [];

    const inputChild = childrenList.find(child => child.type === AutocompleteInput) || (
        <AutocompleteInput />
    );
    const listChild = childrenList.find(child => child.type === AutocompleteList) || (
        <AutocompleteList />
    );
    const listItemChild = childrenList.find(child => child.type === AutocompleteListItem) || (
        <AutocompleteListItem />
    );

    const renderListItems = () => {
        return (
            <>
                {isOpen &&
                    inputItems.map((item, index) =>
                        cloneElement(
                            listItemChild,
                            {
                                isHighlighted: highlightedIndex === index,
                                key: `${index}-${item}`,
                                ...getItemProps({ item, index }),
                            },
                            item
                        )
                    )}
            </>
        );
    };

    return (
        <div style={{ position: "relative" }}>
            <form onSubmit={onFormSubmit} {...getComboboxProps()}>
                {cloneElement(
                    inputChild,
                    getInputProps({
                        ref: inputEl,
                        value: formValue,
                        onChange: (event: ChangeEvent<HTMLInputElement>) =>
                            setFormValue(event.target.value),
                    })
                )}
            </form>
            {cloneElement(
                listChild,
                { ...getMenuProps(), style: { position: "absolute" } },
                renderListItems()
            )}
        </div>
    );
};

Autocomplete.input = AutocompleteInput;
Autocomplete.list = AutocompleteList;
Autocomplete.listItem = AutocompleteListItem;

export default Autocomplete;
