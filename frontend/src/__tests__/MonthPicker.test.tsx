import { render, screen, fireEvent } from '@testing-library/react'
import MonthPicker from '../components/ui/DatePicker/MonthPicker'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'datepicker.months_short') {
                return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            }
            return key
        },
        i18n: { language: 'pt' }
    })
}))

describe('MonthPicker', () => {

    /**
     * Verifica que renderiza os 12 meses
     */
    it('renders all 12 months', () => {
        const onChange = jest.fn()
        render(<MonthPicker onChange={onChange} />)

        expect(screen.getByText('Jan')).toBeInTheDocument()
        expect(screen.getByText('Dez')).toBeInTheDocument()
    })

    /**
     * Verifica que clicar num mês chama onChange com o formato correcto YYYY-MM
     */
    it('calls onChange with correct format when month is selected', () => {
        const onChange = jest.fn()
        render(<MonthPicker onChange={onChange} />)

        const now = new Date()
        fireEvent.click(screen.getByText('Jan'))
        expect(onChange).toHaveBeenCalledWith(`${now.getFullYear()}-01`)
    })

    /**
     * Verifica que o botão ‹ decrementa o ano
     */
    it('decrements year when clicking back button', () => {
        const onChange = jest.fn()
        render(<MonthPicker onChange={onChange} />)

        const now = new Date()
        fireEvent.click(screen.getByText('‹'))
        expect(screen.getByText(String(now.getFullYear() - 1))).toBeInTheDocument()
    })

    /**
     * Verifica que o botão › incrementa o ano
     */
    it('increments year when clicking forward button', () => {
        const onChange = jest.fn()
        render(<MonthPicker onChange={onChange} />)

        const now = new Date()
        fireEvent.click(screen.getByText('›'))
        expect(screen.getByText(String(now.getFullYear() + 1))).toBeInTheDocument()
    })

    /**
     * Verifica que seleccionar Dezembro devolve o mês 12
     */
    it('calls onChange with month 12 when December is selected', () => {
        const onChange = jest.fn()
        render(<MonthPicker onChange={onChange} />)

        const now = new Date()
        fireEvent.click(screen.getByText('Dez'))
        expect(onChange).toHaveBeenCalledWith(`${now.getFullYear()}-12`)
    })
})