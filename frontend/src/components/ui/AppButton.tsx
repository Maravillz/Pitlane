import type {CSSProperties, MouseEventHandler, ReactNode} from "react";
import {Button} from "@headlessui/react";

interface PrimaryButtonConfig {
    buttonColor?: string
    endIcon?: ReactNode
    onClick: MouseEventHandler<HTMLButtonElement>
    startIcon?: ReactNode
    text: string
    textColor?: string
    type: "Primary" | "Secondary" | "Tertiary"
    className?: string
}

const primaryColor: string = "#f5a623"
const secondaryColor: string = "#242424"
const tertiaryColor: string = "#767c7f"

const AppButton = (cfg: PrimaryButtonConfig ) => {

    let buttonStyle: CSSProperties

    switch (cfg.type) {
        case "Primary":
            buttonStyle = {
                backgroundColor: cfg?.buttonColor ?? primaryColor,
                border: "solid 1px " + (cfg?.buttonColor ?? primaryColor),
                color: cfg?.textColor ?? secondaryColor
            }
            break

        case "Secondary":
            buttonStyle = {
                border: "solid 1px " + (cfg?.buttonColor ?? primaryColor),
                color: cfg?.textColor ?? primaryColor,
                backgroundColor: "transparent"
            }
            break

        case "Tertiary":
            buttonStyle = {
                backgroundColor: cfg?.buttonColor ?? secondaryColor,
                border: "solid 1px " + (cfg?.buttonColor ?? tertiaryColor),
                color: cfg?.textColor ?? tertiaryColor
            }
            break

        default:
            buttonStyle = {}
            break
    }


    return <Button className={cfg.className ?? `rounded-md px-2 py-1.5 leading-none font-semibold`} style={buttonStyle} onClick={cfg.onClick}>
        {cfg.startIcon != null ? cfg.startIcon : ""}
        <span className="heigh">{cfg.text != null ? cfg.text : ""}</span>
        {cfg.endIcon != null ? cfg.endIcon : ""}
    </Button>
}

export default AppButton;