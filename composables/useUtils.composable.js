import { useQuasar } from 'quasar'

export const useUtils = () => {

  const $q = useQuasar()

  const showAlert = (message, type = 'positive', position = "top") => {
    $q.notify({
      type,
      message,
      position
    })
  }

  const limitarTexto = (texto, limite) => {
    if (texto.length > limite) {
      return texto.substring(0, limite) + "...";
    }
    return texto;
  }

  return {
    showAlert,
    limitarTexto
  }
}
