import '@testing-library/jest-dom'

// Define import.meta.env para os testes
Object.defineProperty(globalThis, '__vite_import_meta_env__', {
    value: { VITE_API_URL: 'http://localhost:8081' },
    writable: true
})