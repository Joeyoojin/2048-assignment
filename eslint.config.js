import react from '@woohm402/eslint-config-react';

export default [
  { ignores: ['eslint.config.js', '.yarn'] },
  ...react({
    tsconfigRootDir: import.meta.dirname,
    rules: {
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['css'],
        },
      ],
    },
  }),
];
