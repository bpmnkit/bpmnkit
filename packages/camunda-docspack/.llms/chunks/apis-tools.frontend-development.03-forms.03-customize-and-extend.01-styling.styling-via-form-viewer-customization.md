# Styling — Styling via form viewer customization

The [form viewer](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer)  contains all [basic form components](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer/src/render/components/form-fields)  shipped in Camunda Forms. For full flexibility, fork the library and change the returned HTML of the individual components, or override existing components via [custom form components](https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/02-custom-components).

### Example

The following example demonstrates replacing the default rendering of the [text field component](https://github.com/bpmn-io/form-js/blob/develop/packages/form-js-viewer/src/render/components/form-fields/Textfield.js)  with [Material UI](https://mui.com/material-ui/react-text-field/).

```js title="packages/form-js-viewer/src/render/components/form-fields/Textfield.js"
import TextField from '@mui/material/TextField';

...

export default function Textfield(props) {
  const {
    ...
  } = props;

  ...

  const onInputBlur = () => {
    ...
  };

  return <div class={ formFieldClasses(type, { errors, disabled, readonly }) }>
    // using MUI TextField instead of default
    <TextField
        id={ domId }
        label={ label }
        value={ value }
        defaultValue={ defaultValue }
        onChange={(event) => {
            ...
        }}
    />

    <Description description={ description } />
    <Errors errors={ errors } id={ errorMessageId } />
  </div>;

  ...
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/01-styling
