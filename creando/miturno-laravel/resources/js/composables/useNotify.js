/**
 * ============================================
 * COMPOSABLE: useNotify
 * ============================================
 *
 * Provee métodos para mostrar notificaciones toast
 * y diálogos de confirmación usando PrimeVue.
 */

import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

export function useNotify() {
    const toast = useToast()
    const confirm = useConfirm()

    /**
     * Mostrar mensaje de éxito
     */
    const success = (message, title = 'Éxito') => {
        toast.add({
            severity: 'success',
            summary: title,
            detail: message,
            life: 3000
        })
    }

    /**
     * Mostrar mensaje de error
     */
    const error = (message, title = 'Error') => {
        toast.add({
            severity: 'error',
            summary: title,
            detail: message,
            life: 5000
        })
    }

    /**
     * Mostrar mensaje de advertencia
     */
    const warn = (message, title = 'Atención') => {
        toast.add({
            severity: 'warn',
            summary: title,
            detail: message,
            life: 4000
        })
    }

    /**
     * Mostrar mensaje informativo
     */
    const info = (message, title = 'Info') => {
        toast.add({
            severity: 'info',
            summary: title,
            detail: message,
            life: 3000
        })
    }

    /**
     * Mostrar diálogo de confirmación
     * @returns {Promise<boolean>}
     */
    const confirmAction = (message, header = 'Confirmar') => {
        return new Promise((resolve) => {
            confirm.require({
                message,
                header,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sí',
                rejectLabel: 'No',
                accept: () => resolve(true),
                reject: () => resolve(false)
            })
        })
    }

    /**
     * Mostrar diálogo de confirmación para eliminar
     */
    const confirmDelete = (itemName = 'este elemento') => {
        return confirmAction(
            `¿Estás seguro de que deseas eliminar ${itemName}?`,
            'Confirmar eliminación'
        )
    }

    /**
     * Mostrar diálogo de confirmación para cancelar
     */
    const confirmCancel = (itemName = 'esta acción') => {
        return confirmAction(
            `¿Estás seguro de que deseas cancelar ${itemName}?`,
            'Confirmar cancelación'
        )
    }

    return {
        success,
        error,
        warn,
        info,
        confirmAction,
        confirmDelete,
        confirmCancel
    }
}
