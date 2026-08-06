import colors from "colors";


export class ColoredLog {
    public static success(text: string) {
        return console.log(colors.bgGreen.white.bold(text));
    }

    public static error(text: string) {
        return console.log(colors.bgRed.white.bold(text));
    }

    public static info(text: string) {
        return console.log(colors.bgWhite.black.bold(text));
    }


    public static warn(text: string) {
        return console.log(colors.bgYellow.black.bold(text));
    }
}