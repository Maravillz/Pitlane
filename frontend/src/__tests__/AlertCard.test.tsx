import { render, screen, fireEvent } from '@testing-library/react'
import AlertCard from '../components/ui/AlertCard'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'carDetail.in': 'Em',
                'carDetail.next': 'próx.',
                'maintenanceTypes.OIL_CHANGE': 'Óleo + filtro',
                'maintenanceTypes.BRAKE_SERVICE': 'Travões',
                'maintenanceTypes.INSPECTION': 'Inspeção'
            }
            return translations[key] ?? key
        }
    })
}))

describe('AlertCard', () => {

    /**
     * Verifica que o tipo de manutenção é renderizado traduzido
     */
    it('renders translated maintenance type', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={null}
                intervalDays={null}
            />
        )
        expect(screen.getByText('Óleo + filtro')).toBeInTheDocument()
    })

    /**
     * Verifica que mostra só o intervalo em km quando só tem km
     */
    it('shows only km interval when only intervalKm is set', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={10000}
                intervalDays={null}
            />
        )
        expect(screen.getByText('Em 10000 km')).toBeInTheDocument()
    })

    /**
     * Verifica que mostra só o intervalo em dias quando só tem dias
     */
    it('shows only days interval when only intervalDays is set', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="INSPECTION"
                intervalKm={null}
                intervalDays={365}
            />
        )
        expect(screen.getByText('próx. 365')).toBeInTheDocument()
    })

    /**
     * Verifica que mostra ambos os intervalos separados por - quando tem km e dias
     */
    it('shows both intervals separated by dash when both are set', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={10000}
                intervalDays={365}
            />
        )
        expect(screen.getByText('Em 10000 km - próx. 365')).toBeInTheDocument()
    })

    /**
     * Verifica que não mostra texto de intervalo quando ambos são null
     */
    it('shows empty interval text when both intervals are null', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={null}
                intervalDays={null}
            />
        )
        // o span do intervalo existe mas está vazio
        const spans = screen.getAllByRole('generic', { hidden: true })
        const intervalSpan = spans.find(s => s.className?.includes('text-[#888]'))
        expect(intervalSpan?.textContent).toBe('')
    })

    /**
     * Verifica que a borderColor é aplicada correctamente
     */
    it('applies the correct border color', () => {
        const { container } = render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={null}
                intervalDays={null}
                borderColor="#be525d"
            />
        )
        const card = container.firstChild as HTMLElement
        expect(card.style.borderColor).toBe('rgb(190, 82, 93)')
    })

    /**
     * Verifica que usa verde como cor por defeito quando borderColor não é fornecida
     */
    it('uses default green border color when not provided', () => {
        const { container } = render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={null}
                intervalDays={null}
            />
        )
        const card = container.firstChild as HTMLElement
        expect(card.style.borderColor).toBe('rgb(16, 185, 129)')
    })

    /**
     * Verifica que os children são renderizados dentro do card
     */
    it('renders children inside the card', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={null}
                intervalDays={null}
            >
                <button>Resolver</button>
            </AlertCard>
        )
        expect(screen.getByText('Resolver')).toBeInTheDocument()
    })

    /**
     * Verifica que clicar nos children chama a função correcta
     */
    it('children click handler is called correctly', () => {
        const handleClick = jest.fn()
        render(
            <AlertCard
                id="1"
                maintenanceType="OIL_CHANGE"
                intervalKm={null}
                intervalDays={null}
            >
                <button onClick={handleClick}>Resolver</button>
            </AlertCard>
        )
        fireEvent.click(screen.getByText('Resolver'))
        expect(handleClick).toHaveBeenCalled()
    })

    /**
     * Verifica que o card sem children não tem elementos extra no lado direito
     */
    it('renders without children when none provided', () => {
        render(
            <AlertCard
                id="1"
                maintenanceType="BRAKE_SERVICE"
                intervalKm={50000}
                intervalDays={null}
            />
        )
        expect(screen.getByText('Travões')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})