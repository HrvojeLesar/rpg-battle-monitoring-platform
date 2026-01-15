import { useState } from "react";
import { formatPredefinedItem, Item } from "../characters_stats/equipment";
import {
    CheckIcon,
    Combobox,
    Group,
    Pill,
    PillsInput,
    useCombobox,
} from "@mantine/core";
import { RpgTokenData } from "../tokens/rpg_token_data";

export type MultiSelectCreatableProps = {
    data: Item[];
    token: RpgTokenData;
    onChange: (value: Item[]) => void;
    value: Item[];
};

export const EquipmentMultiselect = ({
    token,
    onChange: onChangeCallback,
    data: initialData,
    value,
}: MultiSelectCreatableProps) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
    });

    const [search, setSearch] = useState("");
    const [data, setData] = useState(initialData);

    const findItem = (name: string) => value.find((item) => item.name === name);

    const exactOptionMatch = data.some((item) => item.name === search);

    const handleValueSelect = (val: string) => {
        setSearch("");

        if (val === "$create") {
            const newItem = { name: search };
            setData((current) => [...current, newItem]);
            onChangeCallback([...value, newItem]);
        } else {
            const selectedItem = data.find((item) => item.name === val);
            if (!selectedItem) return;

            onChangeCallback(
                value.includes(selectedItem)
                    ? value.filter((v) => v !== selectedItem)
                    : [...value, selectedItem],
            );
        }
    };

    const values = value.map((item) => (
        <Pill
            key={item.name}
            withRemoveButton
            onRemove={() => handleValueRemove(item)}
        >
            {item.name}
        </Pill>
    ));

    const handleValueRemove = (val: Item) => {
        onChangeCallback(value.filter((v) => v !== val));
    };

    const options = data
        .filter((item) =>
            item.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .map((item, idx) => (
            <Combobox.Option
                value={item.name}
                key={`${item.name}-${idx}`}
                active={value.includes(item)}
            >
                <Group gap="sm">
                    {findItem(item.name) ? <CheckIcon size={12} /> : null}
                    <span>{formatPredefinedItem(item, token)}</span>
                </Group>
            </Combobox.Option>
        ));

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={handleValueSelect}
            withinPortal={false}
        >
            <Combobox.DropdownTarget>
                <PillsInput onClick={() => combobox.openDropdown()}>
                    <Pill.Group>
                        {values}

                        <Combobox.EventsTarget>
                            <PillsInput.Field
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                                value={search}
                                placeholder="Search values"
                                onChange={(event) => {
                                    combobox.updateSelectedOptionIndex();
                                    setSearch(event.currentTarget.value);
                                }}
                            />
                        </Combobox.EventsTarget>
                    </Pill.Group>
                </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options}

                    {!exactOptionMatch && search.trim().length > 0 && (
                        <Combobox.Option value="$create">
                            + Create {search}
                        </Combobox.Option>
                    )}

                    {exactOptionMatch &&
                        search.trim().length > 0 &&
                        options.length === 0 && (
                            <Combobox.Empty>Nothing found</Combobox.Empty>
                        )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
