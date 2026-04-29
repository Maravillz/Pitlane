import { render, screen, fireEvent } from '@testing-library/react'
import HourPicker from '../components/ui/DatePicker/HourPicker'

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
            const translations: Record<string, string> = {
                'datepicker.back': '‹ Voltar',
                'datepicker.confirm': 'Confirmar',
                'datepicker.hour': 'hora',
                'datepicker.minute': 'minuto'
            }
            return translations[key] ?? key
        }
    })
}))

describe('HourPicker', () => {

    /**
     * Verifica que começa na view de calendário
     */
    it('starts in calendar view', () => {
        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)
        expect(screen.getByText('Dom')).toBeInTheDocument()
        expect(screen.queryByText('hora')).not.toBeInTheDocument()
    })

    /**
     * Verifica que clicar num dia muda para a view de tempo
     */
    it('switches to time view when a day is selected', () => {
        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)

        fireEvent.click(screen.getByText('1'))

        expect(screen.getByText('hora')).toBeInTheDocument()
        expect(screen.getByText('minuto')).toBeInTheDocument()
        expect(screen.getByText('Confirmar')).toBeInTheDocument()
    })

    /**
     * Verifica que o botão Voltar regressa ao calendário
     */
    it('returns to calendar view when clicking back button', () => {
        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)

        fireEvent.click(screen.getByText('1'))
        expect(screen.getByText('hora')).toBeInTheDocument()

        fireEvent.click(screen.getByText('‹ Voltar'))
        expect(screen.getByText('Dom')).toBeInTheDocument()
        expect(screen.queryByText('hora')).not.toBeInTheDocument()
    })

    /**
     * Verifica que o botão ▲ da hora incrementa a hora
     */
    it('increments hour when clicking up arrow', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-06-15T10:00:00'))

        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)
        fireEvent.click(screen.getByText('1'))

        const upButtons = screen.getAllByText('▲')
        fireEvent.click(upButtons[0]) // primeiro ▲ é da hora

        expect(screen.getByText('11')).toBeInTheDocument()

        jest.useRealTimers()
    })

    /**
     * Verifica que a hora volta a 0 após as 23
     */
    it('wraps hour to 0 after 23', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-06-15T23:00:00'))

        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)
        fireEvent.click(screen.getByText('1'))

        const upButtons = screen.getAllByText('▲')
        fireEvent.click(upButtons[0])

        const horaLabel = screen.getByText('hora')
        const horaContainer = horaLabel.closest('div')!
        expect(horaContainer.querySelector('span.text-3xl')?.textContent).toBe('00')

        jest.useRealTimers()
    })

    /**
     * Verifica que o botão ▲ dos minutos incrementa 5 minutos
     */
    it('increments minutes by 5 when clicking up arrow', () => {
        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)
        fireEvent.click(screen.getByText('1'))

        const upButtons = screen.getAllByText('▲')
        fireEvent.click(upButtons[1]) // segundo ▲ é dos minutos

        expect(screen.getByText('05')).toBeInTheDocument()
    })

    /**
     * Verifica que o botão Confirmar chama onConfirm
     */
    it('calls onConfirm when clicking confirm button', () => {
        const onConfirm = jest.fn()
        render(<HourPicker onChange={jest.fn()} onConfirm={onConfirm} />)

        fireEvent.click(screen.getByText('1'))
        fireEvent.click(screen.getByText('Confirmar'))

        expect(onConfirm).toHaveBeenCalled()
    })

    /**
     * Verifica que a data seleccionada é mostrada no cabeçalho da view de tempo
     */
    it('shows selected date in time view header', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-06-15'))

        render(<HourPicker onChange={jest.fn()} onConfirm={jest.fn()} />)
        fireEvent.click(screen.getByText('1'))

        expect(screen.getByText('01/06/2024')).toBeInTheDocument()

        jest.useRealTimers()
    })
})