import { render, screen, fireEvent } from '@testing-library/react'
import DayPicker from '../components/ui/DatePicker/DayPicker'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'datepicker.months_full') {
                return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            }
            if (key === 'datepicker.days_of_week') {
                return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            }
            return key
        }
    })
}))

describe('DayPicker', () => {

    /**
     * Verifica que os dias da semana são renderizados
     */
    it('renders days of week headers', () => {
        render(<DayPicker onChange={jest.fn()} />)
        expect(screen.getByText('Dom')).toBeInTheDocument()
        expect(screen.getByText('Sáb')).toBeInTheDocument()
    })

    /**
     * Verifica que o mês e ano actuais são mostrados no cabeçalho
     */
    it('renders current month and year in header', () => {
        render(<DayPicker onChange={jest.fn()} />)
        const now = new Date()
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        expect(screen.getByText(`${months[now.getMonth()]} ${now.getFullYear()}`)).toBeInTheDocument()
    })

    /**
     * Verifica que clicar num dia chama onChange com o formato YYYY-MM-DD correcto
     */
    it('calls onChange with correct YYYY-MM-DD format when day is selected', () => {
        const onChange = jest.fn()
        render(<DayPicker onChange={onChange} />)

        const now = new Date()
        fireEvent.click(screen.getByText('1'))

        const expectedMonth = String(now.getMonth() + 1).padStart(2, '0')
        expect(onChange).toHaveBeenCalledWith(`${now.getFullYear()}-${expectedMonth}-01`)
    })

    /**
     * Verifica que o botão ‹ navega para o mês anterior
     */
    it('navigates to previous month when clicking back button', () => {
        render(<DayPicker onChange={jest.fn()} />)

        const now = new Date()
        fireEvent.click(screen.getByText('‹'))

        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const expectedYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
        expect(screen.getByText(`${months[prevMonth]} ${expectedYear}`)).toBeInTheDocument()
    })

    /**
     * Verifica que o botão › navega para o mês seguinte
     */
    it('navigates to next month when clicking forward button', () => {
        render(<DayPicker onChange={jest.fn()} />)

        const now = new Date()
        fireEvent.click(screen.getByText('›'))

        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1
        const expectedYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
        expect(screen.getByText(`${months[nextMonth]} ${expectedYear}`)).toBeInTheDocument()
    })

    /**
     * Verifica que navegar de Dezembro para o mês seguinte avança o ano
     */
    it('advances year when navigating forward from December', () => {
        const onChange = jest.fn()

        // mock da data para Dezembro
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-12-15'))

        render(<DayPicker onChange={onChange} />)
        fireEvent.click(screen.getByText('›'))

        expect(screen.getByText('Janeiro 2025')).toBeInTheDocument()

        jest.useRealTimers()
    })

    /**
     * Verifica que navegar de Janeiro para o mês anterior recua o ano
     */
    it('decrements year when navigating back from January', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-15'))

        render(<DayPicker onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('‹'))

        expect(screen.getByText('Dezembro 2023')).toBeInTheDocument()

        jest.useRealTimers()
    })

    /**
     * Verifica que o dia seleccionado fica visualmente marcado
     */
    it('marks the selected day visually', () => {
        render(<DayPicker onChange={jest.fn()} />)

        const dayButton = screen.getByText('1')
        fireEvent.click(dayButton)
        expect(dayButton.className).toContain('bg-brand')
    })
})