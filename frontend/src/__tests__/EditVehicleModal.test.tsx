import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EditVehicleModal from '../components/layout/EditVehicleModal'
import { vehicleService } from '../services/vehicleService'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'updateVehicle.title': 'Editar veículo',
                'updateVehicle.brand': 'Marca',
                'updateVehicle.model': 'Modelo',
                'updateVehicle.year': 'Ano',
                'updateVehicle.plate': 'Matrícula',
                'updateVehicle.confirm': 'Guardar',
                'updateVehicle.error': 'Erro ao actualizar',
                'common.loading': 'A carregar...'
            }
            return translations[key] ?? key
        }
    })
}))

jest.mock('../services/vehicleService', () => ({
    vehicleService: {
        updateVehicle: jest.fn()
    }
}))

const defaultProps = {
    vehicleId: 'vehicle-123',
    brand: 'Honda',
    model: 'Civic',
    year: 1998,
    plate: 'AA-00-BB',
    onClose: jest.fn(),
    onSuccess: jest.fn()
}

describe('EditVehicleModal', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    /**
     * Verifica que o modal renderiza com os valores actuais pré-preenchidos
     */
    it('renders with current vehicle values pre-filled', () => {
        render(<EditVehicleModal {...defaultProps} />)

        expect(screen.getByDisplayValue('Honda')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Civic')).toBeInTheDocument()
        expect(screen.getByDisplayValue('1998')).toBeInTheDocument()
        expect(screen.getByDisplayValue('AA-00-BB')).toBeInTheDocument()
    })

    /**
     * Verifica que clicar no ✕ fecha o modal
     */
    it('calls onClose when clicking the close button', () => {
        render(<EditVehicleModal {...defaultProps} />)
        fireEvent.click(screen.getByText('✕'))
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    /**
     * Verifica que clicar fora do modal fecha o modal
     */
    it('calls onClose when clicking the backdrop', () => {
        render(<EditVehicleModal {...defaultProps} />)
        const backdrop = screen.getByText('Editar veículo').closest('.fixed')!
        fireEvent.click(backdrop)
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    /**
     * Verifica que o utilizador consegue editar a marca
     */
    it('allows editing the brand field', () => {
        render(<EditVehicleModal {...defaultProps} />)

        const brandInput = screen.getByDisplayValue('Honda')
        fireEvent.change(brandInput, { target: { value: 'Toyota' } })

        expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument()
    })

    /**
     * Verifica que submeter chama o serviço com os valores correctos
     */
    it('calls updateVehicle with correct values on submit', async () => {
        const mockUpdateVehicle = vehicleService.updateVehicle as jest.Mock
        mockUpdateVehicle.mockResolvedValue(undefined)

        render(<EditVehicleModal {...defaultProps} />)

        const brandInput = screen.getByDisplayValue('Honda')
        fireEvent.change(brandInput, { target: { value: 'Toyota' } })
        fireEvent.click(screen.getByText('Guardar'))

        await waitFor(() => {
            expect(vehicleService.updateVehicle).toHaveBeenCalledWith({
                vehicleId: 'vehicle-123',
                brand: 'Toyota',
                model: 'Civic',
                year: 1998,
                plate: 'AA-00-BB'
            })
        })
    })

    /**
     * Verifica que submeter com sucesso chama onSuccess e fecha o modal
     */
    it('calls onSuccess and onClose on successful submit', async () => {
        const mockUpdateVehicle = vehicleService.updateVehicle as jest.Mock
        mockUpdateVehicle.mockResolvedValue(undefined)

        render(<EditVehicleModal {...defaultProps} />)
        fireEvent.click(screen.getByText('Guardar'))

        await waitFor(() => {
            expect(defaultProps.onSuccess).toHaveBeenCalled()
            expect(defaultProps.onClose).toHaveBeenCalled()
        })
    })

    /**
     * Verifica que um erro do serviço mostra mensagem de erro
     */
    it('shows error message when service call fails', async () => {
        const mockUpdateVehicle = vehicleService.updateVehicle as jest.Mock
        mockUpdateVehicle.mockRejectedValue(new Error('Network error'))

        render(<EditVehicleModal {...defaultProps} />)
        fireEvent.click(screen.getByText('Guardar'))

        await waitFor(() => {
            expect(screen.getByText('Erro ao actualizar')).toBeInTheDocument()
        })
    })
})