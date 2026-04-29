import { render, screen, fireEvent } from '@testing-library/react'
import YearPicker from '../components/ui/DatePicker/YearPicker'

// Mock do i18next — o YearPicker não usa traduções mas os imports do projecto podem precisar
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'pt' }
    })
}))

describe('YearPicker', () => {

    /**
     * Verifica que o picker renderiza uma grelha de 12 anos
     */
    it('renders 12 years in the current range', () => {
        const onChange = jest.fn()
        render(<YearPicker onChange={onChange} />)

        // deve haver 12 botões de ano (excluindo os de navegação)
        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12
        expect(screen.getByText(String(rangeStart))).toBeInTheDocument()
        expect(screen.getByText(String(rangeStart + 11))).toBeInTheDocument()
    })

    /**
     * Verifica que clicar num ano chama o onChange com o ano correcto
     */
    it('calls onChange with the selected year', () => {
        const onChange = jest.fn()
        render(<YearPicker onChange={onChange} />)

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12

        fireEvent.click(screen.getByText(String(rangeStart)))
        expect(onChange).toHaveBeenCalledWith(String(rangeStart))
    })

    /**
     * Verifica que o botão ‹ navega para o range anterior de 12 anos
     */
    it('navigates to previous range when clicking back button', () => {
        const onChange = jest.fn()
        render(<YearPicker onChange={onChange} />)

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12

        fireEvent.click(screen.getByText('‹'))
        expect(screen.getByText(String(rangeStart - 12))).toBeInTheDocument()
    })

    /**
     * Verifica que o botão › navega para o range seguinte de 12 anos
     */
    it('navigates to next range when clicking forward button', () => {
        const onChange = jest.fn()
        render(<YearPicker onChange={onChange} />)

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12

        fireEvent.click(screen.getByText('›'))
        expect(screen.getByText(String(rangeStart + 12))).toBeInTheDocument()
    })

    /**
     * Verifica que o ano seleccionado fica visualmente marcado
     */
    it('marks the selected year visually', () => {
        const onChange = jest.fn()
        render(<YearPicker onChange={onChange} />)

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12
        const yearButton = screen.getByText(String(rangeStart))

        fireEvent.click(yearButton)
        expect(yearButton.className).toContain('bg-[#f5a623]')
    })
})