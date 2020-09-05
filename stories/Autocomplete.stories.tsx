import React from "react";
import { Autocomplete, AutocompleteProps } from "../src";

export default {
    title: "Autocomplete",
    component: Autocomplete,
};

const Template = (args: AutocompleteProps) => <Autocomplete {...args} />;

export const NoStyle = Template.bind({});

NoStyle.args = {
    autocompletions: {
        "@": ["Fouquet’s", "Dunkin' Donuts", "Walmart"],
        "#": ["DinnerWithFriends", "BreakfastAtWork", "Grosseries"],
    },
    onSubmit: () => {},
};
