# React Multi Autocomplete

[![CI Actions Status](https://github.com/thomasrogerlux/react-multi-autocomplete/workflows/CI/badge.svg)](https://github.com/thomasrogerlux/react-multi-autocomplete/actions)

## Installation

```bash
yarn add react-multi-autocomplete
```

or if you use npm

```bash
npm install --save react-multi-autocomplete
```

## Usage

```tsx
import React from "react";
import Autocomplete from "react-multi-autocomplete";

const Form = () => {
    const onSubmit = input => {
        // Logic
    };

    return (
        <Autocomplete
            onSubmit={onSubmit}
            autocompletions={{
                "@": ["John", "Lisa", "Matt"],
                "#": ["Outdoor", "Food", "Gaming"],
            }}
        >
            <Autocomplete.input placeholder="What did you do today?" />
            <Autocomplete.listItem
                highlightedStyle={{
                    backgroundColor: "#EEEEEE",
                }}
            />
        </Autocomplete>
    );
};
```

## Development

### Workflow

```bash
yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

### Storybook

```bash
yarn storybook
```

This loads the stories from `./stories`.

### Tests

Tests are setup with Jest

```bash
yarn test
```

### Build

```bash
yarn build
```

## License

MIT © [thomasrogerlux](https://github.com/thomasrogerlux)
