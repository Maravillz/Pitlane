import { render, screen, fireEvent } from '@testing-library/react'
import DatePicker from '../components/ui/DatePicker/DatePicker'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'datepicker.months_full') {
                return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            }
            if (key === 'datepicker.months_short') {
                return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            }
            if (key === 'datepicker.days_of_week') {
                return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            }
            const translations: Record<string, string> = {
                'datepicker.select_date': 'Selecionar data',
                'datepicker.back': '‹ Voltar',
                'datepicker.confirm': 'Confirmar',
                'datepicker.hour': 'hora',
                'datepicker.minute': 'minuto'
            }
            return translations[key] ?? key
        }
    })
}))

describe('DatePicker', () => {

    /**
     * Verifica que o label é renderizado
     */
    it('renders the label', () => {
        render(<DatePicker granularity="year" label="Data" onChange={jest.fn()} />)
        expect(screen.getByText('Data')).toBeInTheDocument()
    })

    /**
     * Verifica que o placeholder é mostrado antes de seleccionar uma data
     */
    it('shows placeholder before date is selected', () => {
        render(<DatePicker granularity="year" label="Data" onChange={jest.fn()} />)
        expect(screen.getByText('Selecionar data')).toBeInTheDocument()
    })

    /**
     * Verifica que o picker abre ao clicar no botão
     */
    it('opens picker when button is clicked', () => {
        render(<DatePicker granularity="year" label="Data" onChange={jest.fn()} />)

        fireEvent.click(screen.getByText('Selecionar data'))

        // o YearPicker deve estar visível
        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12
        expect(screen.getByText(String(rangeStart))).toBeInTheDocument()
    })

    /**
     * Verifica que com granularidade year renderiza o YearPicker
     */
    it('renders YearPicker for year granularity', () => {
        render(<DatePicker granularity="year" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12
        expect(screen.getByText(`${rangeStart}–${rangeStart + 11}`)).toBeInTheDocument()
    })

    /**
     * Verifica que com granularidade month renderiza o MonthPicker
     */
    it('renders MonthPicker for month granularity', () => {
        render(<DatePicker granularity="month" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        expect(screen.getByText('Jan')).toBeInTheDocument()
        expect(screen.getByText('Dez')).toBeInTheDocument()
    })

    /**
     * Verifica que com granularidade day renderiza o DayPicker
     */
    it('renders DayPicker for day granularity', () => {
        render(<DatePicker granularity="day" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        expect(screen.getByText('Dom')).toBeInTheDocument()
        expect(screen.getByText('Sáb')).toBeInTheDocument()
    })

    /**
     * Verifica que com granularidade hour renderiza o HourPicker
     */
    it('renders HourPicker for hour granularity', () => {
        render(<DatePicker granularity="hour" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        expect(screen.getByText('Dom')).toBeInTheDocument()
    })

    /**
     * Verifica que seleccionar um ano fecha o picker e mostra o ano no display
     */
    it('closes picker and shows year in display after selection', () => {
        render(<DatePicker granularity="year" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12
        fireEvent.click(screen.getByText(String(rangeStart)))

        expect(screen.queryByText(`${rangeStart}–${rangeStart + 11}`)).not.toBeInTheDocument()
        expect(screen.getByText(String(rangeStart))).toBeInTheDocument()
    })

    /**
     * Verifica que seleccionar um mês mostra o nome do mês e ano no display
     */
    it('shows month name and year in display after month selection', () => {
        const onChange = jest.fn()
        render(<DatePicker granularity="month" label="Data" onChange={onChange} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        const now = new Date()
        fireEvent.click(screen.getByText('Jan'))

        expect(screen.getByText(`Janeiro ${now.getFullYear()}`)).toBeInTheDocument()
    })

    /**
     * Verifica que seleccionar um dia mostra a data formatada no display
     */
    it('shows formatted date in display after day selection', () => {
        render(<DatePicker granularity="day" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        const now = new Date()
        fireEvent.click(screen.getByText('1'))

        const expectedMonth = String(now.getMonth() + 1).padStart(2, '0')
        expect(screen.getByText(`01/${expectedMonth}/${now.getFullYear()}`)).toBeInTheDocument()
    })

    /**
     * Verifica que o onChange é chamado com o valor correcto
     */
    it('calls onChange with correct value when year is selected', () => {
        const onChange = jest.fn()
        render(<DatePicker granularity="year" label="Data" onChange={onChange} />)
        fireEvent.click(screen.getByText('Selecionar data'))

        const now = new Date().getFullYear()
        const rangeStart = Math.floor(now / 12) * 12
        fireEvent.click(screen.getByText(String(rangeStart)))

        expect(onChange).toHaveBeenCalledWith(String(rangeStart))
    })

    /**
     * Verifica que o picker com granularidade hour não fecha ao seleccionar o dia
     * — precisa de confirmação
     */
    it('does not close after day selection in hour granularity', () => {
        render(<DatePicker granularity="hour" label="Data" onChange={jest.fn()} />)
        fireEvent.click(screen.getByText('Selecionar data'))
        fireEvent.click(screen.getByText('1'))

        // deve mostrar a view de tempo, não fechar
        expect(screen.getByText('Confirmar')).toBeInTheDocument()
    })
})