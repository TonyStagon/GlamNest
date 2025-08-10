module.exports = {
    env: {
        node: true,
        es2021: true,
        browser: false
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    },
    globals: {
        process: 'readonly',
    }
}