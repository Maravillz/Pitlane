import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import pt from './assets/lang/pt-pt/common.json'
import en from './assets/lang/en-gb/common.json'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            pt: { common: pt },
            en: { common: en }
        },
        lng: 'pt',
        fallbackLng: 'pt',
        defaultNS: 'common'
    })

export default i18n