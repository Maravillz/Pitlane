import { render, screen } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { AuthContext } from '../context/AuthContextType'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'pt' }
    })
}))

/**
 * Componente auxiliar para testar o hook useAuth
 */
const TestComponent = () => {
    const { isAuthenticated, token } = useAuth()
    return (
        <div>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <span data-testid="token">{token ?? 'null'}</span>
        </div>
    )
}

describe('useAuth', () => {

    /**
     * Verifica que lançar useAuth fora do provider dá erro
     */
    it('throws error when used outside AuthProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => render(<TestComponent />)).toThrow('useAuth must be used within AuthProvider')

        consoleSpy.mockRestore()
    })

    /**
     * Verifica que o hook devolve isAuthenticated false quando não há token
     */
    it('returns isAuthenticated false when no token', () => {
        const mockContext = {
            token: null,
            user: null,
            isAuthenticated: false,
            login: jest.fn(),
            logout: jest.fn()
        }

        render(
            <AuthContext.Provider value={mockContext}>
                <TestComponent />
            </AuthContext.Provider>
        )

        expect(screen.getByTestId('authenticated').textContent).toBe('false')
        expect(screen.getByTestId('token').textContent).toBe('null')
    })

    /**
     * Verifica que o hook devolve isAuthenticated true quando há token
     */
    it('returns isAuthenticated true when token exists', () => {
        const mockContext = {
            token: 'jwt-token',
            user: null,
            isAuthenticated: true,
            login: jest.fn(),
            logout: jest.fn()
        }

        render(
            <AuthContext.Provider value={mockContext}>
                <TestComponent />
            </AuthContext.Provider>
        )

        expect(screen.getByTestId('authenticated').textContent).toBe('true')
        expect(screen.getByTestId('token').textContent).toBe('jwt-token')
    })
})