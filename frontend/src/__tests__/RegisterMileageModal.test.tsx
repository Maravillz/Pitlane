import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterMileageModal from '../components/layout/RegisterMileageModal'
import { vehicleService } from '../services/vehicleService'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'registerMileage.title': 'Actualizar quilometragem',
                'registerMileage.current': 'Actual',
                'registerMileage.newMileage': 'Nova quilometragem',
                'registerMileage.confirm': 'Confirmar',
                'registerMileage.error': 'O valor tem de ser superior ao actual',
                'common.loading': 'A carregar...'
            }
            return translations[key] ?? key
        }
    })
}))

jest.mock('../services/vehicleService', () => ({
    vehicleService: {
        updateMileage: jest.fn()
    }
}))

const defaultProps = {
    vehicleId: 'vehicle-123',
    currentMileage: 100000,
    onClose: jest.fn(),
    onSuccess: jest.fn()
}

describe('RegisterMileageModal', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    /**
     * Verifica que o modal renderiza com a quilometragem actual
     */
    it('renders with current mileage displayed', () => {
        render(<RegisterMileageModal {...defaultProps} />)
        expect(screen.getByText('Actual: 100000 km')).toBeInTheDocument()
    })

    /**
     * Verifica que clicar no ✕ fecha o modal
     */
    it('calls onClose when clicking the close button', () => {
        render(<RegisterMileageModal {...defaultProps} />)
        fireEvent.click(screen.getByText('✕'))
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    /**
     * Verifica que clicar fora do modal fecha o modal
     */
    it('calls onClose when clicking the backdrop', () => {
        render(<RegisterMileageModal {...defaultProps} />)
        const backdrop = screen.getByText('Actualizar quilometragem').closest('.fixed')!
        fireEvent.click(backdrop)
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    /**
     * Verifica que submeter sem valor mostra erro
     */
    it('shows error when submitting without a value', async () => {
        render(<RegisterMileageModal {...defaultProps} />)
        fireEvent.click(screen.getByText('Confirmar'))
        expect(screen.getByText('O valor tem de ser superior ao actual')).toBeInTheDocument()
    })

    /**
     * Verifica que submeter com valor inferior ao actual mostra erro
     */
    it('shows error when new mileage is lower than current', async () => {
        render(<RegisterMileageModal {...defaultProps} />)

        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '90000' } })
        fireEvent.click(screen.getByText('Confirmar'))

        expect(screen.getByText('O valor tem de ser superior ao actual')).toBeInTheDocument()
        expect(vehicleService.updateMileage).not.toHaveBeenCalled()
    })

    /**
     * Verifica que submeter com valor válido chama o serviço e fecha o modal
     */
    it('calls updateMileage and onSuccess when valid mileage is submitted', async () => {
        const mockUpdateMileage = vehicleService.updateMileage as jest.Mock
        mockUpdateMileage.mockResolvedValue(undefined)

        render(<RegisterMileageModal {...defaultProps} />)

        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '110000' } })
        fireEvent.click(screen.getByText('Confirmar'))

        await waitFor(() => {
            expect(vehicleService.updateMileage).toHaveBeenCalledWith('vehicle-123', 110000)
            expect(defaultProps.onSuccess).toHaveBeenCalledWith(110000)
            expect(defaultProps.onClose).toHaveBeenCalled()
        })
    })

    /**
     * Verifica que um erro do serviço mostra mensagem de erro
     */
    it('shows error message when service call fails', async () => {
        const mockUpdateMileage = vehicleService.updateMileage as jest.Mock
        mockUpdateMileage.mockRejectedValue(new Error('Network error'))

        render(<RegisterMileageModal {...defaultProps} />)

        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '110000' } })
        fireEvent.click(screen.getByText('Confirmar'))

        await waitFor(() => {
            expect(screen.getByText('O valor tem de ser superior ao actual')).toBeInTheDocument()
        })
    })
})