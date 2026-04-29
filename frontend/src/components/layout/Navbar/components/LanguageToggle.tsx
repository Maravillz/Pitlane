import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {useTranslation} from "react-i18next";
import AppButton from "../../../ui/AppButton.tsx";

interface LanguageDropdownInfo {
    name: string
    code: string
    flag: string
}

/**
 * Represents the button to change the app language with a popup menu with the two current available languages
 * @constructor
 */
const LanguageToggle = () => {

    const languagesDrop: LanguageDropdownInfo[] = [
        {
            name: "English",
            code: "en",
            flag: "/flags/en-gb.svg"
        },
        {
            name: "Português",
            code: "pt",
            flag: "/flags/pt-pt.svg"
        }
    ]

    const {i18n} = useTranslation('common');

    /** Uses the first language it can't find the one selected */
    const currentLang = languagesDrop.find(l => l.code === i18n.language) ?? languagesDrop[0]

    const handleLanguageChange = async (language: string) => {
        await i18n.changeLanguage(language);
    };

    return <Menu as="div" className="relative ml-3 pr-2">
            <MenuButton as="div" className="relative flex rounded-full">
                <AppButton
                    className="rounded-md px-2 py-1.5 leading-none font-medium flex flex-row items-center justify-center text-sm"
                    textColor={"#FFFFFF"}
                    onClick={() => {}}
                    startIcon={<img src={currentLang.flag}
                                    alt={currentLang.code}
                                    className="w-4 h-2 mr-2" />}
                    text={currentLang.code.split('-')[0].toUpperCase()}
                    type={"Tertiary"}/>
            </MenuButton>
                <MenuItems className="absolute z-10 mt-2 w-35 origin-top-right rounded-md py-1 bg-[#242424] outline-1 outline-[#767c7f]">
                        {languagesDrop.map((lang) => (
                            <MenuItem>
                                <button
                                key={lang.name}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={'flex justify-items-center items-center px-5 flex-row w-full font-medium py-1.5 text-sm text-white'}>
                                    <img src={lang.flag} alt={currentLang.code} className="w-4 h-2 mr-2" />
                                    <span>{lang.name}</span>
                                </button>
                            </MenuItem>
                        ))}
                </MenuItems>
            </Menu>
}

export default LanguageToggle;